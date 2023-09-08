'use strict'

const Joi = require('joi')
const uniqid = require('uniqid')
const Boom = require('@hapi/boom')
const errorHelper = require('@utilities/error-helper')
const config = require('config')
const fs = require('fs')
const nodemailer = require('nodemailer')
const _ = require('lodash')
const moment = require('moment')

const generateUniqueCode = () => {
  return uniqid()
}

const apiHeaders = () => {
  return Joi.object({
    authorization: Joi.string()
  }).options({
    allowUnknown: true
  })
}


const getDefaultFilters = (model, newOptions) => {
  if (newOptions === undefined) {
    newOptions = {};
  }

  const searchableFields = filterFields(model, 'canSearch').join(', ');
  const sortableFields = filterFields(model, 'canSort').join(', ');
  const defaultOptions = {
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .description(
        'The maximum number of records to return. This is typically used in pagination.',
      ),
    page: Joi.number()
      .integer()
      .min(0)
      .default(1)
      .description(
        'The number of records to page in the database. This is typically used in pagination.',
      ),
  };

  if (searchableFields.length > 0) {
    defaultOptions.search = Joi.string().description(
      'A full text search parameter. Takes advantage of indexes for efficient searching. Also implements stemming with searches.  (' +
      searchableFields +
      ')',
    );
  }
  if (sortableFields.length > 0) {
    defaultOptions.sort = Joi.string().description(
      "A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending '-' indicates descending. The default sort direction is 'ascending' (lowest value to highest value). Listing multiplefields prioritizes the sort starting with the first field listed. (" +
      sortableFields +
      ')',
    );
  }

  return {
    ...defaultOptions,
    ...newOptions,
  };
};

const setCustomError = async (errorObj, type = null) => {
  let error;
  if (type !== null && type !== '' && type !== undefined) {
    if (type === 'login') {
      error = Boom.unauthorized('invalid password');
    }
  } else {
    error = Boom.badRequest('Invalid Credential');
  }
  error.output.payload.validation = {};
  error.output.payload.validation.errors = errorObj;
  errorHelper.handleError(error);
};

const generateQuery = async (model, queryParams, definedFiled = false) => {
  // TODO: Implement $select
  const query = {};
  let skip = 0;
  let hasMany = null;

  let params = Object.keys(queryParams);
  const filterOption = ['limit', 'skip', 'search', 'sort', 'page', 'populate'];
  params = params.filter((p) => filterOption.indexOf(p) === -1);

  params.forEach((param) => {
    query[param] = queryParams[param];
  });
  const countQuery = model.find(query);
  const mongooseQuery = model.find(query);

  const selectedFields = filterFields(model, 'canSelect');

  if (selectedFields && selectedFields.length !== 0) {
    mongooseQuery.select(selectedFields);
  }
  generatePopulate(mongooseQuery, model, queryParams);

  generateSort(mongooseQuery, model, queryParams);

  generateSearch(mongooseQuery, countQuery, model, queryParams, definedFiled);

  if (queryParams.limit === 'All') {
    queryParams.limit = '';
    hasMany = false;
  }

  if (queryParams.limit) {
    mongooseQuery.limit(parseInt(queryParams.limit));
  }
  if (queryParams.page) {
    skip = (parseInt(queryParams.page) - 1) * parseInt(queryParams.limit);
    mongooseQuery.skip(skip);
  }

  const result = await mongooseQuery.lean();
  const totalCountResult = await countQuery.count();

  if (queryParams.limit) {
    if (skip + result.length >= totalCountResult) {
      hasMany = false;
    } else {
      hasMany = true;
    }
  }

  return {
    list: result,
    count: result.length,
    total: totalCountResult,
    hasMany: hasMany,
    from: skip + 1,
    to: skip + result.length,
  };
};


const filterFields = (model, paramType) => {
  const schemas = model.schema.obj;
  const populateFields = Object.keys(model.schema.obj);
  const returnFields = [];
  populateFields.forEach((field) => {
    if (
      schemas[field].type &&
      schemas[field].type.schemaName !== undefined &&
      schemas[field][paramType] !== undefined &&
      schemas[field][paramType] === true
    ) {
      returnFields.push(field);
    } else if (schemas[field].type && schemas[field].type[0] !== undefined) {
      // array object subschema
      const subSchemas = schemas[field].type[0].obj;
      if (subSchemas) {
        const populateSubFields = Object.keys(schemas[field].type[0].obj);
        populateSubFields.forEach((subField) => {
          if (
            subSchemas[subField][paramType] !== undefined &&
            subSchemas[subField][paramType] === true
          ) {
            returnFields.push(`${field}.${subField}`);
          }
        });
      }
    } else if (schemas[field].type && schemas[field].type.obj !== undefined) {
      // object subschema
      const subSchemas = schemas[field].type.obj;
      const populateSubFields = Object.keys(schemas[field].type.obj);
      populateSubFields.forEach((subField) => {
        if (
          subSchemas[subField][paramType] !== undefined &&
          subSchemas[subField][paramType] === true
        ) {
          returnFields.push(`${field}.${subField}`);
        }
      });
    }
  });
  return returnFields;
};

const addLeadingZeros = (num, totalLength) => {
  return String(num).padStart(totalLength, '0');
}

const readFileLocal = path => {
  try {
    return new Promise(resolve => {
      fs.readFile(path, 'utf8', (error, data) => {
        if (error) {
          resolve({
            success: false,
            error,
            data: null
          })
        } else {
          resolve({
            success: true,
            error: null,
            data
          })
        }
      })
    })
  } catch (error) {
    errorHelper.handleError(error)
  }
}

const readFileS3 = path => {
  try {
  } catch (error) {
    errorHelper.handleError(error)
  }
}

const readSalaryFile = async path => {
  const type = 'local' // constant
  if (type === 'local') {
    const res = await readFileLocal(path)
    if (res && res.success) {
      res.data = JSON.parse(res.data)
    }
    return res
  }
  return await readFileS3(path)
}

const uploadLocalSalaryFile = (file, filePath) => {
  return new Promise((resolve, reject) => {
    const path = filePath.substring(0, filePath.length - filePath.split('/').pop().length - 1);
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }
    fs.writeFile(filePath, file, err => {
      if (err) {
        reject(err)
      }
      resolve({
        message: 'Uploaded successfully!',
        filePath
      })
    })
  })
}

// const mailGunSendMail = mailObj => {
//   return new Promise((resolve, reject) => {
//     var mailGun = require('mailgun-js')({
//       apiKey: config.constants.MAIL_GUN_API_KEY,
//       domain: config.constants.MAIL_GUN_DOMAIN
//     })

//     if (mailObj) {
//       const messageObj = {}
//       if (mailObj.message) {
//         messageObj.text = mailObj.message
//         delete mailObj.message
//       } else {
//         messageObj.html = mailObj.html
//         delete mailObj.html
//       }

//       var data = {
//         from: config.constants.MAIL_FROM,
//         ...mailObj,
//         ...messageObj
//       }

//       try {
//         mailGun.messages().send(data, function (error, body) {
//           if (error) {
//             reject(error)
//           }
//           resolve(body.message)
//         })
//       } catch (err) {
//         errorHelper.handleError(err)
//       }
//     } else {
//       errorHelper.handleError(Boom.badData('Mail Detail is invalid'))
//     }
//   })
// }


const loggerFiles = {
  cron: 'logs/cron.log',
  timer: 'logs/timer.log',
  leave: 'logs/leave.log',
  webhook: 'logs/webhook.log',
  textLogs: 'logs/textlogs.txt',
  chatLogs: 'logs/chatlogs.txt',

}

const log = (file, customLabel, log) => {
  console.log('file, customLabel, log: ', file, customLabel, log);
  const winston = require('winston')
  const { format } = require('winston')
  const { combine, timestamp, label } = format
  console.log('filename: ', loggerFiles[file]);
  const logConfiguration = {
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: loggerFiles[file],
        format: combine(
          label({ label: customLabel || 'NO_LABEL' }),
          timestamp(),
          winston.format.json()
        )
      })
    ]
  }
  const logger = winston.createLogger(logConfiguration)
  logger.info(log)
}
const mailgunSendMail = (mailObj) => {
  return new Promise((resolve, reject) => {
    var apiKey = 'key-de4582feecd40bce619439a152ce7d23';
    var domain = 'mailing.webfirminfotech.com';
    var mailgun = require('mailgun-js')({ apiKey: apiKey, domain: domain });

    if (mailObj) {
      let messageObj = {};
      if (mailObj.message) {
        messageObj.text = mailObj.message;
        delete mailObj.message;
      } else {
        messageObj.html = mailObj.html;
        delete mailObj.html;
      }

      var data = {
        from: process.env.MAIL_FROM,
        ...mailObj,
        ...messageObj,
      };

      try {
        mailgun.messages().send(data, function (error, body) {
          // console.log('body', body)
          if (error) {
            errorHelper.handleError(error);
            reject(error);
          }
          resolve(body);
          // return body.message
        });
      } catch (err) {
        errorHelper.handleError(err);
      }
    } else {
      errorHelper.handleError(Boom.badData('Mail Detail is invalid'));
    }
  });
};

const awsSendMail = async mailObj => {
  const ses = require('nodemailer-ses-transport')

  const transporter = nodemailer.createTransport(
    ses({
      accessKeyId: config.connections.aws.ses.key,
      secretAccessKey: config.connections.aws.ses.secret,
      region: config.connections.aws.ses.region
    })
  )

  if (mailObj) {
    console.log(' mailObj.to: ', mailObj.to)
    const response = await transporter.sendMail({
      from: config.constants.MAIL_FROM,
      to: mailObj.to,
      subject: mailObj.subject,
      text: mailObj.message,
      html: mailObj.html
    })
    return response
  } else {
    errorHelper.handleError(Boom.badData('Mail Detail is invalid'))
  }
}
const convertData = (csvRecordsArray, header) => {
  var dataArr = []
  var headersArray = csvRecordsArray[0]
  var startingRowToParseData = header ? 1 : 0
  for (var i = startingRowToParseData; i < csvRecordsArray.length; i++) {
    var data = csvRecordsArray[i]
    if (data.length === headersArray.length && header) {
      var csvRecord = {}
      for (var j = 0; j < data.length; j++) {
        if (data[j] === undefined || data[j] === null) {
          csvRecord[headersArray[j]] = ''
        } else {
          csvRecord[headersArray[j]] = data[j].trim()
        }
      }
      dataArr.push(csvRecord)
    } else {
      dataArr.push(data)
    }
  }
  return dataArr
}

const readCsvFile = (buf, header) => {
  const resRead = csvStringToArray(buf.toString().trim(), ',')
  return convertData(resRead, header)
}

const csvStringToArray = (csvDataString, delimiter) => {
  const regexPattern = new RegExp(
    `(\\${delimiter}|\\r?\\n|\\r|^)(?:\"((?:\\\\.|\"\"|[^\\\\\"])*)\"|([^\\${delimiter}\"\\r\\n]*))`,
    'gi'
  )
  let matchedPatternArray = regexPattern.exec(csvDataString)
  const resultCSV = [[]]
  while (matchedPatternArray) {
    if (matchedPatternArray[1].length && matchedPatternArray[1] !== delimiter) {
      resultCSV.push([])
    }
    const cleanValue = matchedPatternArray[2]
      ? matchedPatternArray[2].replace(new RegExp('[\\\\"](.)', 'g'), '$1')
      : matchedPatternArray[3]
    resultCSV[resultCSV.length - 1].push(cleanValue)
    matchedPatternArray = regexPattern.exec(csvDataString)
  }
  return resultCSV
}

// const sendEmail = async mailObj => {
//   let response
//   try {
//     if (config.constants.MAIL_SENDER === 'mailgun') {
//       response = await mailGunSendMail(mailObj).catch(e => console.log(e))
//     } else {
//       response = await awsSendMail(mailObj)
//     }
//     console.log('mail response', response)
//     return response
//   } catch (err) {
//     errorHelper.handleError(err)
//   }
// }


const sendEmail = async (mailObj) => {
  let response;
  try {
    response = await sendEmailSMTP(mailObj);
    console.log('mail response', response);
    return response;
  } catch (err) {
    errorHelper.handleError(err);
  }
};

const sendEmailSMTP = async (mailObj) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      },
    });
    return new Promise((resolve) => {
      transporter.sendMail({ ...mailObj, from: '"Techivies" <meet@techivies.com>' }, (err, info) => {
        if (err) {
          resolve({ success: false, data: err })
        } else {
          resolve({ success: true, data: info })
        }
      });
    })
  } catch (err) {
    errorHelper.handleError(err);
  }
};


const updateSalaryFile = async (file, path) => {
  const type = 'local' // constant
  if (type === 'local') {
    return await uploadLocalSalaryFile(file, path)
  }
  return { pending: true }
}

const encodeBase64 = string => {
  return Buffer.from(string).toString('base64')
}

const decodeBase64 = string => {
  return Buffer.from(string, 'base64').toString()
}


const toFindDuplicates = (array) => {
  console.log('array: ', array);
  let toMap = {};
  let duplicateIndexes = []
  for (let i = 0; i < array.length; i++) {
    if (toMap[array[i]] > -1) {
      // return true
      duplicateIndexes.push(toMap[array[i]])
    } else {
      toMap[array[i]] = i + 1;
    }
    console.log('toMap: ', toMap);
  }
  duplicateIndexes = _.uniq(duplicateIndexes)
  if (duplicateIndexes && duplicateIndexes.length) {
    return duplicateIndexes
  }
  return false
}

const salaryDetail = (ctc, pfAllow, user) => {
  console.log('ctc, pfAllow, user: ', ctc, pfAllow, user);
  const basic = ctc * 0.5
  const professionalTax =
    ctc > 12000
      ? 200
      : ctc > 9000
        ? 150
        : ctc > 6000
          ? 80
          : 0
  const esicEmployee =
    pfAllow
      ? ctc *
      (appSetting && appSetting.esicEmployee
        ? appSetting.esicEmployee
        : 0.0075)
      : 0
  const pfEmployee =
    pfAllow
      ? ctc *
      (appSetting && appSetting.pfEmployee
        ? appSetting.pfEmployee
        : 0.12)
      : 0
  const totalDeduction =
    professionalTax + esicEmployee + pfEmployee
  const hra = basic * 0.5 - totalDeduction
  const pfEmployer =
    pfAllow
      ? ctc *
      (appSetting && appSetting.pfEmployer
        ? appSetting.pfEmployer
        : 0.1361)
      : 0
  const esicEmployer =
    pfAllow
      ? ctc *
      (appSetting && appSetting.esicEmployer
        ? appSetting.esicEmployer
        : 0.0325)
      : 0
  const totalCompanyContribution = pfEmployer + esicEmployer
  const conveyanceAllowance =
    basic * 0.5 - totalCompanyContribution
  const takeHome = basic + hra + conveyanceAllowance
  let returnSalary = {}
  returnSalary.breakup = {
    earnings: {
      basic: basic,
      hra: hra,
      conveyanceAllowance: conveyanceAllowance,
    },
    deductions: {
      pfEmployee: pfEmployee,
      esicEmployee: esicEmployee,
      professionalTax: professionalTax,
      totalDeduction: totalDeduction,
      takeHome: takeHome.toFixed(2),
    },
    companyContribution: {
      pfEmployer: pfEmployer,
      esicEmployer: esicEmployer,
      totalCompanyContribution: totalCompanyContribution,
    },
    grossSalary: ctc,
    pfAllow: pfAllow
  }
  returnSalary.fromDate = moment('04/01/2022').format()
  returnSalary.toDate = moment('03/31/2023').format()
  returnSalary.empId = user
  returnSalary.pfAllow = pfAllow
  return returnSalary
}


const similarity = (s1, s2) => {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

const editDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}


const convertTimezone = (str, tz) => {
  return moment.tz(str, tz).format('YYYY-MM-DD hh:mm:ss')
}

module.exports = {
  apiHeaders,
  generateUniqueCode,
  getDefaultFilters,
  generateQuery,
  filterFields,
  setCustomError,
  addLeadingZeros,
  readSalaryFile,
  updateSalaryFile,
  sendEmail,
  readCsvFile,
  encodeBase64,
  decodeBase64,
  toFindDuplicates,
  salaryDetail,
  log,
  convertTimezone,
  similarity,
  editDistance
}
