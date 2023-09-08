'use strict'

const db = require('mongoose')
const Glob = require('glob')
const config = require('config')
const Config = JSON.parse(JSON.stringify(config))
db.Promise = require('bluebird')

let dbConn = null

exports.plugin = {
  async register(server, options) {
    try {
      console.log('options.connections.db')
      console.log(options.connections.db)
      dbConn = await db.createConnection(options.connections.db)

      // When the connection is connected
      dbConn.on('connected', () => {
        server.log(['mongoose', 'info'], 'dbConn Mongo Database connected')
      })

      // When the connection is disconnected
      dbConn.on('disconnected', () => {
        server.log(['mongoose', 'info'], 'dbConn Mongo Database disconnected')
      })

      server.decorate('server', 'db', dbConn)

      // If the node process ends, close the mongoose connection
      process.on('SIGINT', async () => {
        await dbConn.close()
        server.log(
          ['mongoose', 'info'],
          'Mongo Database disconnected through app termination'
        )
        process.exit(0)
      })

      // Load models
      const models = Glob.sync('server/models/*.js')
      models.forEach(model => {
        require(`${process.cwd()}/${model}`)
      })


      /**
       * Insert Default Admin
       */
      const User = require('@models/user.model').schema
      const moment = require('moment')
      const users = await User.find({})
      if (users.length === 0) {
        const DEFAULT = 'default'
        const ENV = config.util.getEnv('NODE_ENV').trim()
        if (ENV !== DEFAULT) {
          const Amit = await User.create({
            name: 'Amit Patel',
            companyEmail: 'patel.amit.ce@gmail.com',
            userId: 'TSPL001',
            password: 'Admin@123',
            role: 'ADMIN',
            isAccountVerified: true
          })
          let payload = { ctc: 1000000, pfAllow: false }
          payload.empId = Amit._id
          const basic = payload.ctc * 0.5
          const professionalTax =
            payload.ctc > 12000
              ? 200
              : payload.ctc > 9000
                ? 150
                : payload.ctc > 6000
                  ? 80
                  : 0
          const esicEmployee =
            payload.pfAllow
              ? payload.ctc *
              (appSetting && appSetting.esicEmployee
                ? appSetting.esicEmployee
                : 0.0075)
              : 0
          const pfEmployee =
            payload.pfAllow
              ? payload.ctc *
              (appSetting && appSetting.pfEmployee
                ? appSetting.pfEmployee
                : 0.12)
              : 0
          const totalDeduction =
            professionalTax + esicEmployee + pfEmployee
          const hra = basic * 0.5 - totalDeduction
          const pfEmployer =
            payload.pfAllow
              ? payload.ctc *
              (appSetting && appSetting.pfEmployer
                ? appSetting.pfEmployer
                : 0.1361)
              : 0
          const esicEmployer =
            payload.pfAllow
              ? payload.ctc *
              (appSetting && appSetting.esicEmployer
                ? appSetting.esicEmployer
                : 0.0325)
              : 0
          const totalCompanyContribution = pfEmployer + esicEmployer
          const conveyanceAllowance =
            basic * 0.5 - totalCompanyContribution
          const takeHome = basic + hra + conveyanceAllowance
          payload.breakup = {
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
            grossSalary: payload.ctc,
            pfAllow: payload.pfAllow
          }
          payload.fromDate = moment('04/01/2022').format()
          payload.toDate = moment('03/31/2023').format()
          await SalaryMasterModel.create(
            payload
          )
          const Ashish = await User.create({
            name: 'Ashish Gonadliya',
            companyEmail: 'ashish.gondaliya@techivies.com',
            userId: 'TSPL002',
            password: 'Admin@123',
            role: 'ADMIN',
            isAccountVerified: true
          })
          payload.empId = Ashish._id
          await SalaryMasterModel.create(
            payload
          )
          const Sumit = await User.create({
            name: 'Sumit Patel',
            companyEmail: 'sumit.patel@techivies.com',
            password: 'Admin@123',
            userId: 'TSPL004',
            role: 'ADMIN',
            isAccountVerified: true
          })
          payload.empId = Sumit._id
          await SalaryMasterModel.create(
            payload
          )
          const Nirav = await User.create({
            name: 'Nirav Patel',
            companyEmail: 'nirav.patel@techivies.com',
            password: 'Admin@123',
            userId: 'TSPL005',
            isAccountVerified: true,
            role: 'ADMIN',
          })
          payload.empId = Nirav._id
          await SalaryMasterModel.create(
            payload
          )
        } else {
          await User.create({
            name: 'Nirav Patel',
            companyEmail: 'nirav.patel+local@techivies.com',
            userId: 'TSPL001',
            password: 'Admin@123',
            role: 'ADMIN',
            isAccountVerified: true
          })
        }
      }

    } catch (err) {
      console.log(err)
      throw err
    }
  },
  dbConn() {
    return dbConn
  },
  name: 'mongoose_connector',
  version: require('../../package.json').version
}
