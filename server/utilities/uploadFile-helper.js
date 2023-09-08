const fs = require('fs')

const AWS = require('aws-sdk')

const config = require('config')
const { resolve } = require('path')
const { reject } = require('bluebird')
const Boom = require('@hapi/boom')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const uploadLocalFile = (file, filePath) => {
    return new Promise((resolve, reject) => {
      let filename = file.hapi.filename
      const fileType = file.hapi.filename.replace(/^.*\./, '')

      const data = file._data
      let fpath = 'uploads/'
      let path = './uploads'

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
      }

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
      }

      if (filePath) {
        path = `${path}/${filePath}`
        fpath = `${fpath}${filePath}/`
      }

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
      }

      fs.writeFile(`${path}/` + filename, data, err => {
        if (err) {
          reject(err)
        }
        resolve({
          message: 'Uploaded successfully!',
          success: true,
          filePath: `${fpath}${filename}`,
          fileName: filename,
          fileType: fileType
        })
      })
    })
  }

// const uploadLocalFileTest = (file, filePath, name) => {
//   return new Promise((resolve, reject) => {
//     const imagePath = 'uploads/'
//     const path = './uploads'

//     if (!fs.existsSync(path)) {
//       fs.mkdirSync(path, { recursive: true })
//     }

//     if (!fs.existsSync(filePath)) {
//       fs.mkdirSync(filePath, { recursive: true })
//     }

//     fs.writeFile(`${imagePath}/${filePath}/${name}`, file, err => {
//       if (err) {
//         reject(err)
//       }
//       resolve({
//         message: 'Uploaded successfully!',
//         success: true,
//         filePath: `${imagePath}/${filePath}/${name}`,
//         fileName: name
//       })
//     })
//   })
// }

const writeFileLocalDirectory = (processId, filesData) => {
  return new Promise(resolve => {
    const mainImagePath = 'temp/'
    const mainPath = './temp'
    const videoMainPath = `${mainPath}/${processId}/video`
    const videoPath = `${mainImagePath}${processId}/video`
    const imagesMainPath = `${mainPath}/${processId}/images`
    const imagesPath = `${mainImagePath}${processId}/images`

    if (!fs.existsSync(mainPath)) {
      fs.mkdirSync(mainPath, { recursive: true })
    }
    if (!fs.existsSync(videoMainPath)) {
      fs.mkdirSync(videoMainPath, { recursive: true })
    }
    if (!fs.existsSync(imagesMainPath)) {
      fs.mkdirSync(imagesMainPath, { recursive: true })
    }
    const writeVideoPath = `${videoPath}/${filesData.name}`
    fs.writeFile(writeVideoPath, filesData.data, err => {
      if (err) {
        resolve({
          error: err,
          success: false
        })
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${writeVideoPath}`,
        videoFolder: `${videoPath}`,
        imageFolder: `${imagesPath}`,
        fileName: filesData.name
      })
    })
  })
}

// const handleImageFileUpload = (file, filePath = null) => {
//   return uploadImageFileToBucket(file, filePath)
// }

// const uploadImageFileToBucket = (file, filePath) => {
//   return new Promise((resolve, reject) => {
//     const params = {
//       Bucket: 'ethicalcode-assets', // pass your bucket name
//       Key: filePath,
//       Body: file
//     }
//     s3.upload(params, (s3Err, data) => {
//       if (s3Err) {
//         resolve({
//           message: 'Upload Fail!',
//           success: false,
//           error: JSON.stringify(s3Err),
//         })
//         // throw s3Err
//       }
//       console.log(`File uploaded successfully at ${data.Location}`)
//       resolve({
//         message: 'Uploaded successfully!',
//         success: true,
//         filePath: filePath,
//       })
//     })
//   })
// }

const handleFileUpload = (file, filePath = null) => {
    // console.log('file', file)
    // console.log('file.hapi', file.hapi)
  //  return uploadLocalFile(file, filePath)
  return uploadFileToBucket(file, filePath)
}

const uploadFileToBucket = (file, filePath) => {
  return new Promise((resolve, reject) => {
    const data = file._data
    let filename = file.hapi.filename
    const fileType = filename.replace(/^.*\./, '')

    const uniqueNum = new Date().getMilliseconds()
    filename = uniqueNum + '_' + filename.replace(' ', '_')
    if (!filePath) {
      filePath = 'profile'
    }
    const params = {
      Bucket: config.constants.public_bucket, // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        })
        // throw s3Err
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })


  })
}


const uploadQrCodeToBucket = (fileBuffer, filePath, name) =>{
  return new Promise((resolve, reject)=>{
    let filename = name
    const fileType = filename.replace(/^.*\./, '')
    const uniqueNum = new Date().getMilliseconds()
    const val = filename.trim()
    const replaced = val
      .split(' ')
      .join('_')
      .split('(')
      .join('_')
      .split(')')
      .join('_')
    filename = uniqueNum + '_' + replaced+'.jpeg'

    const params = {
      Bucket: config.constants.public_bucket, // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: fileBuffer
    }

    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        })
        // throw s3Err
      }
      console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })


  })
}
const uploadProjectFileToBucket = (file, filePath, name) => {
  return new Promise((resolve, reject) => {
    const data = file._data
    let filename = name
    const fileType = filename.replace(/^.*\./, '')
    const uniqueNum = new Date().getMilliseconds()
    const val = filename.trim()
    const replaced = val
      .split(' ')
      .join('_')
      .split('(')
      .join('_')
      .split(')')
      .join('_')
    filename = uniqueNum + '_' + replaced
    const params = {
      Bucket: config.constants.private_bucket, // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        })
        // throw s3Err
      }
      console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })
  })
}

const uploadScreenshotToBucket = (file, filePath, name) => {
  return new Promise((resolve, reject) => {
    const data = file
    let filename = name
    const fileType = filename.replace(/^.*\./, '')
    const uniqueNum = new Date().getMilliseconds()
    const val = filename.trim()
    const replaced = val
      .split(' ')
      .join('_')
      .split('(')
      .join('_')
      .split(')')
      .join('_')
    // filename = uniqueNum + '_' + replaced
    const params = {
      Bucket: config.constants.private_bucket, // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        })
        // throw s3Err
      }
      // console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })
  })
}
const uploadScreenshotToPublicBucket = (file, filePath, name) => {
  return new Promise((resolve, reject) => {
    const data = file
    let filename = name
    const fileType = filename.replace(/^.*\./, '')
    const uniqueNum = new Date().getMilliseconds()
    const val = filename.trim()
    const replaced = val
      .split(' ')
      .join('_')
      .split('(')
      .join('_')
      .split(')')
      .join('_')
    // filename = uniqueNum + '_' + replaced
    const params = {
      Bucket: config.constants.public_bucket, // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        })
        // throw s3Err
      }
      // console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })
  })
}

const uploadJSONFileToBucket = (objectData, filePath, name) => {
  return new Promise((resolve, reject) => {
  //  const objectData = '{ "message" : "Hello World!" }';
    const params = {
      Bucket: config.constants.private_bucket, // pass your bucket name
      Key: `${filePath}/${name}`, // file will be saved as testBucket/contacts.csv
      Body: objectData,
      ContentType: "application/json",
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        })
        // throw s3Err
      }
      console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${name}`,
        fileName: name,
        fileType: "application/json"
      })
    })
  })
}

const deleteFile = (filePath, fileName = null) => {
  return new Promise((resolve, reject) => {
    if(!fileName){
      var params = {
        Bucket: config.constants.public_bucket, // pass your bucket name
        Key: `${filePath}` // file will be saved as testBucket/contacts.csv
      }
    }

    if(fileName){
      var params = {
        Bucket: config.constants.private_bucket, // pass your bucket name
        Key: `${filePath}/${fileName}` // file will be saved as testBucket/contacts.csv
      }
    }
    s3.deleteObject(params, (err, data) => {
      if (data) {
        console.log('Deleted!... ' + filePath + '=>' + data)
        resolve({
          message: 'Deleted successfully!',
          status: true
        })
      } else {
        resolve({
          message: 'Check if you have sufficient permissions!',
          status: false
        })
        console.log('Check if you have sufficient permissions : ' + err)
      }
    })
  })
}

const deletePublicFile = (filePath, fileName = null) => {
  return new Promise((resolve, reject) => {
    if(!fileName){
      var params = {
        Bucket: config.constants.public_bucket, // pass your bucket name
        Key: `${filePath}` // file will be saved as testBucket/contacts.csv
      }
    }

    if(fileName){
      var params = {
        Bucket: config.constants.public_bucket, // pass your bucket name
        Key: `${filePath}/${fileName}` // file will be saved as testBucket/contacts.csv
      }
    }
    s3.deleteObject(params, (err, data) => {
      if (data) {
        console.log('Deleted!... ' + filePath + '=>' + data)
        resolve({
          message: 'Deleted successfully!',
          status: true
        })
      } else {
        resolve({
          message: 'Check if you have sufficient permissions!',
          status: false
        })
        console.log('Check if you have sufficient permissions : ' + err)
      }
    })
  })
}

// const deleteModel = filePath => {
//   console.log('filePath: ', filePath);
//   return new Promise(async (resolve, reject) => {
//     var res = await s3
//       .listObjectsV2({
//         Bucket: `ec-server-stress`,
//         Prefix: filePath,
//       })
//       .promise()
//       .catch(e => console.log(e))
//     if (res && res.Contents) {
//       for (let index = 0; index < res.Contents.length; index++) {
//         const content = res.Contents[index];
//         console.log('content: ', content);
//         if (content && content.Key) {
//           var params = {
//             Bucket: 'ec-server-stress', // pass your bucket name
//             Key: content.Key // file will be saved as testBucket/contacts.csv
//           }
//           s3.deleteObject(params, (err, data) => {
//             console.log('err, data: ', err, data);
//             if (data) {
//               console.log('Deleted!... ' + filePath + '=>' + data)
//               resolve({
//                 message: 'Deleted successfully!',
//                 status: true
//               })
//             }
//           })
//         }
//       }
//     }
//   })
// }

// const uploadDataSet = (file, filePath) => {
//   return new Promise((resolve, reject) => {
//     const data = file
//     const params = {
//       Bucket: 'ec-server-stress', // pass your bucket name
//       Key: `${filePath}`, // file will be saved as testBucket/contacts.csv
//       Body: data
//     }
//     console.log('${filePath}: ', `${filePath}`)
//     s3.upload(params, (s3Err, data) => {
//       if (s3Err) {
//         resolve({
//           message: 'Upload Fail!',
//           success: false,
//           error: JSON.stringify(s3Err),
//         })
//         // throw s3Err
//       }
//       console.log(`File uploaded successfully at ${data.Location}`)
//       resolve({
//         message: 'Uploaded successfully!',
//         success: true,
//         filePath: `${filePath}`
//       })
//     })
//   })
// }

const deleteProjectFile = filePath => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: config.constants.private_bucket, // pass your bucket name
      Key: `${filePath}` // file will be saved as testBucket/contacts.csv
    }
    s3.deleteObject(params, (err, data) => {
      if (data) {
        console.log('Deleted!... ' + filePath + '=>' + data)
        resolve({
          message: 'Deleted successfully!',
          status: true
        })
      } else {
        resolve({
          message: 'Check if you have sufficient permissions!',
          status: false
        })
        console.log('Check if you have sufficient permissions : ' + err)
      }
    })
  })
}

// const deleteFileModels = filePath => {
//   return new Promise((resolve, reject) => {
//     var params = {
//       Bucket: 'ec-models-contents', // pass your bucket name
//       Key: `${filePath}` // file will be saved as testBucket/contacts.csv
//     }
//     s3.deleteObject(params, (err, data) => {
//       if (data) {
//         console.log('Deleted!... ' + filePath + '=>' + data)
//         resolve({
//           message: 'Deleted successfully!',
//           status: true
//         })
//       } else {
//         resolve({
//           message: 'Check if you have sufficient permissions!',
//           status: false
//         })
//         console.log('Check if you have sufficient permissions : ' + err)
//       }
//     })
//   })
// }

// const moveAndDeleteFile = async (inputPath, targetPath) => {
//   console.log('inputPath, targetPath: ', inputPath, targetPath);
//   return new Promise(async (resolve, reject) => {
//     var res = await s3
//       .listObjectsV2({
//         Bucket: `ec-server-stress`,
//         Prefix: inputPath,
//       })
//       .promise()
//       .catch(e => console.log(e))
//     if (res && res.Contents) {
//       for (let index = 0; index < res.Contents.length; index++) {
//         const content = res.Contents[index];
//         if (content && content.Key) {
//           s3.copyObject({
//             Bucket: 'ec-server-stress',
//             CopySource: `/ec-server-stress/${content.Key}`,
//             Key: `${targetPath}/${content.Key}`
//           }, (s3Err, data) => {
//             if (data) {
//               if (config.mode === 'default') {
//                 s3.deleteObject({
//                   Bucket: 'ec-server-stress',
//                   Key: content.Key
//                 }, (err, data) => {
//                   console.log('Deleted!... ' + content.Key + '=>' + data)
//                   if (err) {
//                     resolve({
//                       message: 'Unsuccessfull',
//                       success: false
//                     })
//                   }
//                 })
//               }
//             }
//           })

//         }
//       }
//     }
//     resolve({
//       message: 'Files moved successfully.',
//       success: true
//     })
//   })

// }

// const deleteFileOld = async file => {
//   return new Promise((resolve, reject) => {
//     fs.stat('./' + file, (err, exists) => {
//       if (exists) {
//         fs.unlinkSync('./' + file)
//         resolve({
//           message: 'Deleted successfully!'
//         })
//       } else {
//         if (err) {
//           reject(err)
//         }
//       }
//     })
//   })
// }

// const uploadNewsFileToBucket = (file, filePath, filename) => {
//   return new Promise((resolve, reject) => {
//     const params = {
//       Bucket: 'ethicalcode-assets', // pass your bucket name
//       Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
//       Body: file
//     }
//     s3.upload(params, (s3Err, data) => {
//       console.log('data: ', data)
//       if (s3Err) {
//         resolve({
//           message: 'Upload Fail!',
//           success: false,
//           error: JSON.stringify(s3Err),
//         })
//         // throw s3Err
//       }
//       resolve({
//         message: 'Uploaded successfully!',
//         success: true,
//         filePath: `${filePath}/${filename}`,
//         fileName: filename
//       })
//     })
//   })
// }

// const uploadModelsFileToBucket = (file, filePath, filename) => {
//   return new Promise((resolve, reject) => {
//     const params = {
//       Bucket: 'ec-models-contents', // pass your bucket name
//       Key: `${config.modelS3Prefix}/${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
//       Body: file
//     }
//     s3.upload(params, (s3Err, data) => {
//       console.log('data: ', data)
//       if (s3Err) {
//         resolve({
//           message: 'Upload Fail!',
//           success: false,
//           error: JSON.stringify(s3Err),
//         })
//         // throw s3Err
//       }
//       resolve({
//         message: 'Uploaded successfully!',
//         success: true,
//         path: data.key,
//         filePath: `${filePath}/${filename}`,
//         fileName: filename
//       })
//     })
//   })
// }

// const getFileObject = async _keys => {
//   return await Promise.all(
//     _keys.map(
//       _key =>
//         new Promise((resolve, reject) => {
//           s3.getObject({ Bucket: 'ethicalcode-assets', Key: _key }, function (
//             err,
//             _data
//           ) {
//             if (err) {
//               resolve({ success: false })
//             }
//             resolve({
//               success: true,
//               data: _data.Body,
//               name: `${_key.split('/').pop()}`
//             })
//           })
//         })
//     )
//   ).catch(_err => {
//     console.log({
//       message: 'Get File Fail!',
//       success: false,
//       error: JSON.stringify(_err),
//     })
//     // throw new Error(_err)
//   })
// }

// const getFileObjectModelContents = async _keys => {
//   return await Promise.all(
//     _keys.map(
//       _key =>
//         new Promise((resolve, reject) => {
//           s3.getObject({ Bucket: 'ec-models-contents', Key: _key }, function (
//             err,
//             _data
//           ) {
//             if (err) {
//               resolve({ success: false })
//             }
//             resolve({
//               success: true,
//               data: _data.Body,
//               name: `${_key.split('/').pop()}`
//             })
//           })
//         })
//     )
//   ).catch(_err => {
//     console.log({
//       message: 'Fail!',
//       success: false,
//       error: JSON.stringify(_err),
//     })
//     // throw new Error(_err)
//   })
// }

// const getObjectWithStreamModelFile = async _key => {
//   return new Promise(resolve => {
//     const params = {
//       Bucket: 'ec-models-contents',
//       Key: _key
//     }
//     const readStream = s3.getObject(params).createReadStream()
//     resolve({
//       data: readStream,
//       name: `${_key.split('/').pop()}`
//     })
//   })
// }

const downloadFile = async _key => {
  console.log('_key: ', _key);
  return new Promise(async (resolve, reject) => {
    var res = await s3
      .listObjectsV2({
        Bucket: config.constants.private_bucket,
        Prefix: _key,
      })
      .promise()
      .catch(e => console.log(e))
      console.log('res: ', res);
    if (res && res.Contents && res.Contents.length) {
      const params = {
        Bucket: config.constants.private_bucket,
        Key: _key
      }
      const readStream = s3.getObject(params).createReadStream()
      console.log('readStream: ', readStream);
      resolve({
        data: readStream,
        name: `${_key.split('/').pop()}`,
        contents: res.Contents,
        success: true
      })
    } else {
      resolve({
        data: null,
        name: null,
        success: false
      })
    }
  })
}

// const downloadDatasetCsvMultiple = async _keys => {
//   return await Promise.all(
//     _keys.map(
//       _key =>
//         new Promise(async (resolve, reject) => {
//           var res = await s3
//             .listObjectsV2({
//               Bucket: `ec-server-stress`,
//               Prefix: _key,
//             })
//             .promise()
//             .catch(e => console.log(e))
//           if (res && res.Contents && res.Contents.length) {
//             const params = {
//               Bucket: 'ec-server-stress',
//               Key: _key
//             }
//             const readStream = s3.getObject(params).createReadStream()
//             resolve({
//               data: readStream,
//               name: `${_key.split('/').pop()}`,
//               contents: res.Contents,
//               success: true
//             })
//           } else {
//             resolve({
//               data: null,
//               name: null,
//               success: false
//             })
//           }
//         })
//     )
//   ).catch(_err => {
//     console.log({
//       message: 'Download Fail!',
//       success: false,
//       error: JSON.stringify(_err),
//     })
//     // throw new Error(_err)
//   })
// }

// const uploadZipFile = _key => {
//   const stream = require('stream')
//   const _pass = new stream.PassThrough()
//   s3.upload(
//     {
//       Bucket: 'ethicalcode-assets',
//       Key: _key,
//       Body: _pass
//     },
//     (err, data) => {
//       console.log('err: ', err)
//       console.log('data: ', data)
//     }
//   )
//   return _pass
// }

// const getFileObjectModels = async _key => {
//   return new Promise(resolve => {
//     s3.getObject({ Bucket: 'ec-models-contents', Key: _key }, (err, _data) => {
//       if (err) {
//         resolve({ success: false, message: err.message ? err.message : err })
//       }
//       resolve({
//         success: true,
//         data: _data ? _data.Body : null,
//         filePath: _key,
//         fileName: _key.split('/').pop()
//       })
//     })
//   })
// }

const getBase64 = async _key => {
  return new Promise(resolve => {
    s3.getObject({ Bucket: config.constants.private_bucket, Key: _key }, (err, _data) => {
      if (err) {
        resolve({ success: false, message: err.message ? err.message : err })
      }
      resolve({
        success: true,
        data: _data ? _data.Body.toString('base64') : null,
        filePath: _key,
        fileName: _key.split('/').pop()
      })
    })
  })
}

const readJson = async _key => {
  return new Promise((resolve) => {
    s3.getObject({ Bucket: config.constants.private_bucket, Key: _key }, (err, _data) => {
      if (err) {
        resolve({ success: false, message: err.message ? err.message : err })
      }
      resolve({
        success: true,
        data: _data ?  jsonFromBuffer(_data.Body): null,
        filePath: _key,
        fileName: _key.split('/').pop()
      })
    })
  })
}

const jsonFromBuffer = (buf) => {
  if(buf){
    return JSON.parse(Buffer.from(buf.toString('base64'), 'base64').toString())
  }
  return {}
}


const removeDir = path => {
  fs.rmdirSync(path, { recursive: true })
}

const uploadFile = (file) => {
    file => {
      return new Promise((resolve, reject) => {
        fs.writeFile('upload', file, err => {
           if (err) {
            reject(err)
           }
           resolve({
            message: 'Upload successfully!'
          })
        })
      })
    }
  }

module.exports = {
  getBase64,
  handleFileUpload,
  deleteFile,
  deletePublicFile,
  // deleteFileModels,
  // uploadNewsFileToBucket,
  // getFileObject,
  // uploadZipFile,
 // uploadLocalFileTest,
  writeFileLocalDirectory,
  // uploadModelsFileToBucket,
  uploadProjectFileToBucket,
  uploadScreenshotToBucket,
  deleteProjectFile,
  // getFileObjectModelContents,
  // getObjectWithStreamModelFile,
  // getFileObjectModels,
  removeDir,
  // deleteDatasetFile,
  // uploadDataSet,
  // downloadDatasetCsv,
  // downloadDatasetCsvMultiple,
  // handleImageFileUpload,
  // moveAndDeleteFile,
  // deleteModel,
  uploadFile,
  downloadFile,
  readJson,
  uploadQrCodeToBucket,
  // uploadQrCodeToBucket,
  uploadJSONFileToBucket,
  uploadScreenshotToPublicBucket
}
