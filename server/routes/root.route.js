'use strict'
// Never take constants here
const Joi = require('joi').extend(require('@joi/date'))

module.exports = {
  plugin: {
    async register(server, options) {
      server.route([
        {
          method: 'GET',
          path: '/',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            handler: async (request, h) => {
              const moment = require('moment')
              return h.response({
                up: new Date().getTime() - request.server.info.started,
            //     time: Intl.DateTimeFormat().resolvedOptions().timeZone,
            //     offset: new Date().getTimezoneOffset(),
            //     date: new Date(),
            //     format: moment().format("YYYY-MM-DD h:mm:ss a"),
            //     ist : moment.tz(moment(),'Asia/Kolkata')
              })
            }
          }
        },
        {
          method: 'GET',
          path: '/stop-timer',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            handler: async (request, h) => {
              const updateLogs = async () => {
                const helper = require('@utilities/helper')
                helper.log('cron', 'stop-timer', new Date())
                const EmployeeLogModel = require('@models/employee-log.model').schema
                const User = require('@models/user.model').schema
                let uniqueTimeZone = await User.aggregate([
                  {
                    $group: {
                      _id: { timezone: '$timezone' },
                      usersUniqueArray: {
                        $addToSet: '$_id'
                      }
                    }
                  }
                ])
                console.log('uniqueTimeZone: ', uniqueTimeZone);
                const moment = require('moment-timezone')
                if (uniqueTimeZone.length) {
                  let timeZones = uniqueTimeZone.map(a => a._id.timezone)
                  for (let index = 0; index < timeZones.length; index++) {
                    if (timeZones[index]) {
                      const currentTimeZoneTime = moment.tz(moment(), timeZones[index])
                      let currentTime = currentTimeZoneTime.format()
                      helper.log('timer', 'Stop timer', currentTime)
                      if (moment(currentTimeZoneTime).hour() === 0 && (moment(currentTimeZoneTime).minute() >= 0 || moment(currentTimeZoneTime).minute() < 59)) {
                        let notLoggedOutUsersLogs = await EmployeeLogModel.find({
                          user: { $in: uniqueTimeZone[index].usersUniqueArray },
                          status: 'IN'
                        })
                        console.log('notLoggedOutUsersLogs: ', notLoggedOutUsersLogs);
                        helper.log('timer', 'Stop timer', { notLoggedOutUsersLogs: notLoggedOutUsersLogs })
                        for (let index = 0; index < notLoggedOutUsersLogs.length; index++) {
                          var duration = moment.duration(moment.tz(moment(), timeZones[index]).diff(notLoggedOutUsersLogs[index].inAt));
                          let finalDuration = duration.asHours();
                          helper.log('timer', 'Stop timer', { finalDuration: finalDuration })
                          await EmployeeLogModel.findOneAndUpdate(
                            {
                              _id: notLoggedOutUsersLogs[index]._id
                            },
                            {
                              outAt: moment.tz(moment(), timeZones[index]).format(),
                              status: 'OUT',
                              hours: finalDuration,
                              hoursWithMin: moment.utc(finalDuration * 3600 * 1000).format('HH:mm')
                            }
                          )
                        }
                      }
                    }
                  }
                }
              }
              updateLogs()
              return { success: true }
            }
          }
        },
        {
          method: 'GET',
          path: '/logs/{file*}',
          handler: {
            directory: {
              path: 'logs',
              listing: true
            }
          }
        },
        {
          method: 'GET',
          path: '/push-notification',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            handler: async (request, h) => {
              const helper = require('@utilities/helper')
              helper.log('cron', 'push-notification', new Date())
              const moment = require('moment')
              const currentDateTime = moment().isoWeekday()
              if (currentDateTime !== 6 && currentDateTime !== 7) {
                const HolidayModel = require('@models/holiday.model').schema
                const holidayExist = await HolidayModel.findOne({
                  date: new Date(
                    moment(moment.utc(moment().format('MM-DD-YYYY')))
                      .startOf('day')
                      .toISOString()
                  )
                })
                if (!holidayExist) {
                  var request = require('request');
                  const config = require('config')
                  var options = {
                    'method': 'POST',
                    'url': 'https://fcm.googleapis.com/fcm/send',
                    'headers': {
                      'Authorization': `key=${config.constants.FCM_SERVER_KEY}`,
                      'Content-Type': 'application/json'
                    },
                    body: null
                  };
                  const UserNotificationDevices = require('@models/user-notification-devices.model').schema
                  const UserNotificationPreferences = require('@models/user-notification-preferences.model').schema
                  const sendNotificationTo = await UserNotificationPreferences.find({ 'pushNotification.alert': true }).select('user')
                  if (sendNotificationTo.length) {
                    const users = sendNotificationTo.map(a => a.user)
                    const userAllDevices = await UserNotificationDevices.find({ user: { $in: users } })
                    console.log('userAllDevices: ', userAllDevices);
                    helper.log('cron', 'push-notification', { userAllDevices: userAllDevices })
                    for (let index = 0; index < userAllDevices.length; index++) {
                      options.body = JSON.stringify({
                        "notification": {
                          "title": "Alert",
                          "body": "Please Check In At The Movement.",
                          "icon": "https://cmt.techivies.com/assets/images/logo.png"
                        },
                        "data": {
                          "url": config.baseUrl + '/dashboard'
                        },
                        "to": userAllDevices[index].deviceId
                      })
                      request(options, async function (error, response) {
                        let res = JSON.parse(response.body)
                        console.log('res: ', res);
                        if (!res.success && res.failure) {
                          await UserNotificationDevices.findOneAndRemove({ deviceId: userAllDevices[index].deviceId })
                        }
                      });
                    }
                  } else {
                    helper.log('cron', 'push-notification', 'No user to send.')
                  }
                } else {
                  console.log('Holiday found :', holidayExist)
                  helper.log('cron', 'push-notification', holidayExist)
                }
              } else {
                console.log('Script time has gone or holiday')
                helper.log('cron', 'push-notification', 'Script time has gone or holiday')
              }
              return { success: true }
            }
          }
        },
        {
          method: 'GET',
          path: '/send-notification-for-task-update',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            handler: async (request, h) => {
              const helper = require('@utilities/helper')
              helper.log('cron', 'push-notification', new Date())
              const moment = require('moment')
              const User = require('@models/user.model').schema
              const DailyUpdate = require('@models/task-update.model').schema
              let query = {
                status: 'SENT'
              }
              query['taskDate'] = {
                $gte: new Date(
                  moment(
                    moment.utc((moment().subtract(1, 'day')).format('MM-DD-YYYY'))
                  )
                    .startOf('day')
                    .toISOString()
                ),
                $lte: new Date(
                  moment(
                    moment.utc((moment().subtract(1, 'day')).format('MM-DD-YYYY'))
                  )
                    .endOf('day')
                    .toISOString()
                )
              }
              const config = require('config')
              var request = require('request');
              const notSendedUpdate = await DailyUpdate.find(query).distinct('createdBy')
              const user = await User.find({ isDeleted: false, _id: { $nin: notSendedUpdate } }).distinct('_id')
              const UserNotificationDevices = require('@models/user-notification-devices.model').schema
              const UserNotificationPreferences = require('@models/user-notification-preferences.model').schema
              const sendNotificationTo = await UserNotificationPreferences.find({ 'pushNotification.alert': true, user: { $in: user } }).select('user')
              if (sendNotificationTo.length) {
                const users = sendNotificationTo.map(a => a.user)
                const userAllDevices = await UserNotificationDevices.find({ user: { $in: users } })
                helper.log('cron', 'push-notification', { userAllDevices: userAllDevices })
                var options = {
                  'method': 'POST',
                  'url': 'https://fcm.googleapis.com/fcm/send',
                  'headers': {
                    'Authorization': `key=${config.constants.FCM_SERVER_KEY}`,
                    'Content-Type': 'application/json'
                  },
                  body: null
                };
                for (let index = 0; index < userAllDevices.length; index++) {
                  options.body = JSON.stringify({
                    "notification": {
                      "title": "Alert",
                      "body": "You were forgot to send update.",
                      "icon": "https://cmt.techivies.com/assets/images/logo.png"
                    },
                    "data": {
                      "url": config.baseUrl + '/dashboard'
                    },
                    "to": userAllDevices[index].deviceId
                  })
                  request(options, async function (error, response) {
                    let res = JSON.parse(response.body)
                    if (!res.success && res.failure) {
                      await UserNotificationDevices.findOneAndRemove({ deviceId: userAllDevices[index].deviceId })
                    }
                  });
                }
              } else {
                helper.log('cron', 'push-notification', 'No user to send.')
              }
              return { success: true }
            }
          }
        },
        {
          method: 'GET',
          path: '/update-notification',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            handler: async (request, h) => {
              const helper = require('@utilities/helper')
              helper.log('cron', 'update-notification', new Date())
              const moment = require('moment')
              const currentDateTime = moment().isoWeekday()
              if (currentDateTime !== 6 && currentDateTime !== 7) {
                const HolidayModel = require('@models/holiday.model').schema
                const holidayExist = await HolidayModel.findOne({
                  date: new Date(
                    moment(moment.utc(moment().format('MM-DD-YYYY')))
                      .startOf('day')
                      .toISOString()
                  )
                })
                if (!holidayExist) {
                  var request = require('request');
                  const config = require('config')
                  var options = {
                    'method': 'POST',
                    'url': 'https://fcm.googleapis.com/fcm/send',
                    'headers': {
                      'Authorization': `key=${config.constants.FCM_SERVER_KEY}`,
                      'Content-Type': 'application/json'
                    },
                    body: null
                  };
                  const UserNotificationDevices = require('@models/user-notification-devices.model').schema
                  const UserNotificationPreferences = require('@models/user-notification-preferences.model').schema
                  const sendNotificationTo = await UserNotificationPreferences.find({ 'pushNotification.alert': true }).select('user')
                  if (sendNotificationTo.length) {
                    const users = sendNotificationTo.map(a => a.user)
                    const userAllDevices = await UserNotificationDevices.find({ user: { $in: users } })
                    helper.log('cron', 'push-notification', { userAllDevices: userAllDevices })
                    for (let index = 0; index < userAllDevices.length; index++) {
                      options.body = JSON.stringify({
                        "notification": {
                          "title": "Alert",
                          "body": "Please do not forget to send update and check out.",
                          "icon": "https://cmt.techivies.com/assets/images/logo.png"
                        },
                        "data": {
                          "url": config.baseUrl + '/daily-update'
                        },
                        "to": userAllDevices[index].deviceId
                      })
                      request(options, async function (error, response) {
                        let res = JSON.parse(response.body)
                        console.log('res: ', res);
                        if (!res.success && res.failure) {
                          await UserNotificationDevices.findOneAndRemove({ deviceId: userAllDevices[index].deviceId })
                        }
                      });
                    }
                  } else {
                    helper.log('cron', 'push-notification', 'No one to send')
                  }
                } else {
                  helper.log('cron', 'push-notification', holidayExist)
                }
              } else {
                helper.log('cron', 'push-notification', 'Script time has gone or holiday')
              }
              return { success: true }
            }
          }
        },
        {
          method: 'GET',
          path: '/assets/images/svg/date-check-in.svg',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            handler: async (request, h) => {
              const Fs = require('fs')
              const Path = require('path');
              const dir = Path.resolve(__dirname, '..', 'assets');
              const filePath = Path.resolve(dir, 'datepicker_icon.svg')
              const file = await new Promise(resolve => {
                Fs.readFile(filePath, (err, contents) => {
                  console.log('err: ', err)
                  resolve(contents)
                })
              })
              if (file) {
                return h.response(file)
              } else {
                return h.response('file not find')
              }
            }
          }
        },
        {
          method: 'POST',
          path: '/add-delete-field',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            validate: {
              payload: Joi.object().keys({
                modelName: Joi.string()
                  .required()
                  .label('Model Name'),
                field: Joi.string()
                  .required()
                  .label('Field'),
                toDelete: Joi.boolean()
                  .required()
                  .label('To Delete')
              })
            },
            pre: [
            ],
            handler: async (request, h) => {
              try {
                let query = {}
                if (request.payload.toDelete) {
                  let obj = {}
                  obj[request.payload.field] = 1
                  query['$unset'] = obj
                } else {
                  query[request.payload.field] = false
                }
                console.log('query: ', query);
                await Dataset.updateMany({}, query)
                return { success: true }
              } catch (err) {
                errorHelper.handleError(err)
              }
              return h.response({ success: true }).code(200)
            }
          }
        },
        {

          method: 'GET',
          path: '/update-user-work-from-home',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: [],
            validate: {},
            pre: [],
            handler: async (request, h) => {
              try {
                const User = require('@models/user.model').schema
                let query = { "permanentWorkFromHome": false };
                await User.updateMany({}, { $set: query })
                return { success: true }
              } catch (err) {
                errorHelper.handleError(err)
              }
            }
          }
        },
        {
          method: 'GET',
          path: '/upload-file',
          options: {
            auth: null,
            plugins: {
              policies: [],
            },
            tags: [],
            handler: async (request, h) => {
              const Question = require('@models/question.model').schema;
              const Answer = require('@models/answer.model').schema;
              const questions = [
                {
                  question: 'How are you?',
                  answers: [
                    { title: 'Hola' },
                    { title: 'hello' },
                    { title: 'I\'m good how are you ?' },
                    { title: 'Fine!  what about you?' },
                    { title: 'Great! How are you feeling?' }
                  ],
                },
                {
                  question: 'What does SOLO Homes do?',
                  answers: [
                    { title: "Hi there! My name is Soli. As an AI-powered home-buying technology developed by Solo Homes, I can help you save thousands of dollars on your home purchase by using a tech-enabled real estate agent. With Solo Homes, you'll have access to a powerful AI system that can help you navigate every step of the home-buying process, from understanding the market to negotiating the best price and closing the deal. We make the home-buying process much more streamlined and efficient. \n" },
                  ],
                },
                {
                  question: 'How does SOLO Homes work?',
                  answers: [
                    { title: "Solo Homes is an AI system that uses advanced algorithms and machine learning techniques to analyze vast amounts of data, including market trends, home values, and buyer behavior, to help you negotiate the right price for your dream home. With our AI-powered platform, you can complete many of the steps involved in buying a home online, including scheduling showings, submitting offers & negotiating contracts. This not only saves you time, but also ensures that you don't miss out on any opportunities in a fast-moving market. Solo Homes' AI-powered technology can help you navigate the complex closing process by providing you with personalized guidance and support. From securing financing to negotiating with sellers and closing the deal, our AI system is designed to make the process as smooth and stress-free as possible.So, in summary, Solo Homes works by using the power of AI to help you successfully purchase a house. We're excited to help you find your dream home and save money in the process!\n" },
                  ],
                },
                {
                  question: 'How much does Solo Homes Cost?',
                  answers: [
                    { title: "Thanks for your question! We charge a commission of just 1.5%, which is significantly lower than the industry average of 3% for traditional real estate agents. This means that by using Solo Homes, you can save thousands of dollars on your home purchase.To give you an example, if you were to buy a home for $300,000, a traditional agent would charge a commission of $9,000 (3% of the purchase price). However, with Solo Homes, our commission would be just $4,500 (1.5% of the purchase price), saving you $4,500 on the transaction.We're able to offer this lower commission rate by using advanced AI technology to streamline the home-buying process and eliminate many of the inefficiencies and overhead costs associated with traditional agents. I am excited to save you all that extra money! Now the real question is, what will you spend it on?\n" },
                  ],
                },
                {
                  question: "I've never bought a house, how does it work?",
                  answers: [
                    { title: "Great Question! Below is a general overview of the steps involved: 1. Determine your budget: Before you start looking for homes, it's important to determine how much you can afford to spend. You'll need to consider your income, debts, credit score, and other financial factors to determine your budget.2. Get pre-approved for a mortgage: Once you have a budget in mind, it's a good idea to get pre-approved for a mortgage. This will give you an idea of how much you can borrow and what your monthly payments will be.3. Search for homes: With your budget and preferences in mind, you can start looking for homes that meet your criteria. You can search for homes online on platforms like Zillow.com and Realtor.com. 4. Use Solo-Homes to make an offer: Once you find a home you like, you'll need to make an offer. We can help you draft an offer letter, which will include details such as the purchase price, contingencies, and closing date.5. Conduct a home inspection: Before finalizing the purchase, it's important to have a home inspection to identify any potential issues with the property. This can help you negotiate repairs or ask for a lower price if there are significant issues.6. Close the deal: Once you and the seller agree to the terms of the sale, you'll need to finalize the purchase. This will involve signing a lot of paperwork, including the mortgage agreement and other closing documents.This is a general overview of the home buying process, but keep in mind that every home purchase is unique and the process can vary depending on a variety of factors. We can help you with the process and connect you with mortgage lenders, and a home inspector to ensure a successful and smooth home buying experience. Good luck!\n" },
                  ],
                },
                {
                  question: 'What are the steps involved in getting a mortgage and how long does the process take?',
                  answers: [
                    { title: "This is an excellent question. Working with lenders and securing a mortgage is a pivotal part of the home-buying process. Below are the basic steps involved: 1. Pre-approval: The first step in getting a mortgage is getting pre-approved by a lender. This involves submitting an application and providing documentation about your income, assets, and debts. The lender will review your application and determine how much you can borrow and what interest rate you'll qualify for. You will typically hear back from lenders and recieve a pre-approval letter wtihin three days following the submittal of the requested documentation. 2. House hunting: Once you're pre-approved, you can start shopping for a home that fits within your budget. Your lender will provide you with a pre-approval letter that you can upload to Solo-Homes. We will include it in any offer package we deliver to sellers so they know you are a serious and qualified buyer.  3. Applying for the mortgage: Once you've found a home you want to buy, you'll need to apply for the mortgage. This involves submitting a full application and providing more detailed information about your finances and the property you want to buy. 4. Underwriting: After you've submitted your application, the lender will review it to make sure you meet their eligibility criteria. This process is called underwriting, and it can take several days to several weeks, depending on the lender and the complexity of your application. 5. Approval and closing: If your application is approved, you'll need to close on the loan. This involves signing a lot of paperwork, paying closing costs, and officially taking ownership of the property. The closing process typically takes a few hours, but it can take longer if there are any issues that need to be resolved. Overall, the process of getting a mortgage can take several weeks to several months, depending on a variety of factors. It's important to work with a reputable lender and to provide all of the necessary documentation in a timely manner to help speed up the process.\n" },
                  ],
                },
                {
                  question: 'How much can i afford to spend on a home?',
                  answers: [
                    { title: "The amount that you can afford to spend on a home depends on a variety of factors, including your income, debts, credit score, and the current interest rates for mortgages. A general rule of thumb is that your mortgage payment (including principal, interest, taxes, and insurance) should not exceed 28% of your monthly gross income. However, this is just a guideline, and there are many other factors to consider when determining how much you can afford to spend on a home. Here are a couple of populat websites that can help you determine how much you can spend on a home: https:\/\/www.nerdwallet.com\/mortgages\/how-much-house-can-i-afford\/calculate-affordability It is important to note that these calculators provide estimates only, and the actual amount that you can afford may vary depending on your individual financial situation. It is always a good idea to speak with a mortgage lender or financial advisor for a more accurate estimate of how much you can afford to spend on a home.\n" },
                  ],
                },
                {
                  question: 'How can I negotiate a the best price?',
                  answers: [
                    { title: "You deserve a great deal. Here are some negotiation tips to consider: Research the market: Before you make an offer on a home, it's important to do your research and understand the local real estate market. Look at recent home sales in the area, as well as the current inventory of homes on the market. This will give you a better idea of what a reasonable price range is for the home you're interested in. Utilize Solo Homes: We can help you navigate the negotiation process and provide guidance on what a fair price is for the home you're interested in. We analysis millions of datapoints to determine the fair price and then provide guidance on what price will give you best chance of successfully buying your dream home. Moreover, using Solo-Homes reduces the sellers commissions, thus making your offer more compelling than those from your competition.  Be willing to walk away: One of the most powerful negotiating tactics is being willing to walk away from the deal if you can't get the price you want. This can be a difficult decision, but it can also give you more bargaining power if the seller knows you're serious about finding a good deal. Make a reasonable offer: When you make an offer on a home, it's important to make a reasonable offer based on the current market conditions and the value of the property. Making an offer that's too low may offend the seller and make it difficult to negotiate further. Consider contingencies: Contingencies are conditions that must be met before the sale can be completed, such as a home inspection or the ability to secure financing. Including contingencies in your offer can give you more negotiating power if issues are discovered during the inspection or if you encounter problems with financing. Be flexible: Finally, it's important to be flexible and open to compromise during the negotiation process. The seller may be willing to make concessions on the price or other terms of the sale if they feel like they're working with a reasonable and flexible buyer. By using these strategies, you can improve your chances of negotiating the best price for a home and finding a deal that works for your budget and your needs. You can do it!\n" },
                  ],
                }
              ]

              for (let index = 0; index < questions.length; index++) {
                const element = questions[index];
                const answers = await Answer.insertMany(element.answers)
                await Question.create({ title: element.question, answers: answers.map(a => a._id) })
              }
              return { success: true }
            },
          },
        },

      ])
    },
    version: require('../../package.json').version,
    name: 'root-routes'
  }
}
