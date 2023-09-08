'use strict'
const Joi = require('joi');
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('@api/auth.api')
      server.route([
        {
          method: 'POST',
          path: '/login',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Login',
            notes: 'Login',
            validate: API.login.validate,
            pre: API.login.pre,
            handler: API.login.handler
          }
        },
        {
          method: 'POST',
          path: '/signup',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Signup',
            notes: 'Signup',
            validate: API.signup.validate,
            pre: API.signup.pre,
            handler: API.signup.handler
          }
        },
        {
          method: 'GET',
          path: '/me',
          config: {
            auth: 'auth',
            plugins: {
              policies: [],
              'hapi-swaggered': {
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'me',
            notes: 'me',
            validate: API.me.validate,
            pre: API.me.pre,
            handler: API.me.handler
          }
        },
        // {
        //   method: 'POST',
        //   path: '/admin-signup',
        //   config: {
        //     auth: null,
        //     plugins: {
        //       policies: ['log.policy']
        //     },
        //     tags: ['api', 'Authentication'],
        //     description: 'Signup User',
        //     notes: 'Signup User',
        //     validate: API.adminsignup.validate,
        //     pre: API.adminsignup.pre,
        //     handler: API.adminsignup.handler
        //   }
        // },
        {
          method: 'POST',
          path: '/update-profile',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                payloadType: 'form',
                security: [
                  {
                    jwt: []
                  }
                ]
              }
            },
            payload: {
              maxBytes: 1024 * 1024 * 5,
              multipart: {
                output: 'stream'
              },
              parse: true,
              allow: 'multipart/form-data',
              timeout: false
            },
            tags: ['api', 'Authentication'],
            description: 'Update Profile',
            notes: 'Update Profile',
            validate: API.updateProfile.validate,
            pre: API.updateProfile.pre,
            handler: API.updateProfile.handler
          }
        },
        {
          method: 'POST',
          path: '/update-profile-by-admin/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                payloadType: 'form',
                security: [
                  {
                    jwt: []
                  }
                ]
              }
            },
            payload: {
              maxBytes: 1024 * 1024 * 5,
              multipart: {
                output: 'stream'
              },
              parse: true,
              allow: 'multipart/form-data',
              timeout: false
            },
            tags: ['api', 'Authentication'],
            description: 'Update Profile By Admin',
            notes: 'Update Profile By Admin',
            validate: API.updateProfileByAdmin.validate,
            pre: API.updateProfileByAdmin.pre,
            handler: API.updateProfileByAdmin.handler
          }
        },
        {
          method: 'PUT',
          path: '/profilePhoto',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                payloadType: 'form',
              }
            },
            payload: {
              maxBytes: 1024 * 1024 * 5,
              multipart: {
                output: 'stream'
              },
              parse: true,
              allow: 'multipart/form-data',
              timeout: false
            },
            tags: ['api', 'Authentication'],
            description: 'Add Profile Photo',
            notes: 'Add Profile Photo',
            validate: API.uploadProfilePhoto.validate,
            pre: API.uploadProfilePhoto.pre,
            handler: API.uploadProfilePhoto.handler
          }
        },
        {
          method: 'PUT',
          path: '/device/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                payloadType: 'form',
              }
            },
            payload: {
              maxBytes: 1024 * 1024 * 5,
              multipart: {
                output: 'stream'
              },
              parse: true,
              allow: 'multipart/form-data',
              timeout: false
            },
            tags: ['api', 'Authentication'],
            description: 'update Device',
            notes: 'update Device',
            validate: API.updateDevice.validate,
            pre: API.updateDevice.pre,
            handler: API.updateDevice.handler
          }
        },
        {
          method: 'PUT',
          path: '/deleteProfilePhoto',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Delete Profile Photo',
            notes: 'Delete Profile Photo',
            validate: API.deleteProfilePhoto.validate,
            pre: API.deleteProfilePhoto.pre,
            handler: API.deleteProfilePhoto.handler
          }
        },
        {
          method: 'GET',
          path: '/check-uuid',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'checkUuid',
            notes: 'checkUuid',
            validate: API.checkUuid.validate,
            pre: API.checkUuid.pre,
            handler: API.checkUuid.handler
          }
        },
        {
          method: 'GET',
          path: '/users',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Get User',
            notes: 'Get User',
            validate: API.users.validate,
            pre: API.users.pre,
            handler: API.users.handler
          }
        },
        {
          method: 'GET',
          path: '/employee-request',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Get Employee-Request',
            notes: 'Get Employee-Request',
            validate: API.employeeRequest.validate,
            pre: API.employeeRequest.pre,
            handler: API.employeeRequest.handler
          }
        },
        {
          method: 'GET',
          path: '/employee-list',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Get Employee Request',
            notes: 'Get Employee-Request',
            validate: API.employeeList.validate,
            pre: API.employeeList.pre,
            handler: API.employeeList.handler
          }
        },
        {
          method: 'PUT',
          path: '/activate-account',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: ' Activate Employee Acc',
            notes: 'Activate Employee Acc',
            validate: API.activateEmpAcc.validate,
            pre: API.activateEmpAcc.pre,
            handler: API.activateEmpAcc.handler
          }
        },
        {
          method: 'POST',
          path: '/verify-account',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Verify Account',
            notes: 'Verify Account',
            validate: API.verifyAccount.validate,
            pre: API.verifyAccount.pre,
            handler: API.verifyAccount.handler
          }
        },
        {
          method: 'DELETE',
          path: '/employee/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Remove Employee',
            notes: 'Remove Employee',
            validate: API.delete.validate,
            pre: API.delete.pre,
            handler: API.delete.handler
          }
        },
        {
          method: 'GET',
          path: '/employee/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'View Employee',
            notes: 'View Employee',
            validate: API.viewEmployee.validate,
            pre: API.viewEmployee.pre,
            handler: API.viewEmployee.handler
          }
        },
        {
          method: 'PUT',
          path: '/employee/{Id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Update Employee',
            notes: 'Update Employee',
            validate: API.updateEmployee.validate,
            pre: API.updateEmployee.pre,
            handler: API.updateEmployee.handler
          }
        },
        {
          method: 'PUT',
          path: '/change-password',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Change Password',
            notes: 'Change Password',
            validate: API.changePassword.validate,
            pre: API.changePassword.pre,
            handler: API.changePassword.handler
          }
        },
        {
          method: 'PUT',
          path: '/employee-psw-change/{id}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Change Employee Password',
            notes: 'Change  Employee Password',
            validate: API.changeEmpPassword.validate,
            pre: API.changeEmpPassword.pre,
            handler: API.changeEmpPassword.handler
          }
        },

        {
          method: 'POST',
          path: '/forgotpassword',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Forgot Password',
            notes: 'Forgot Password',
            validate: API.forgotpassword.validate,
            pre: API.forgotpassword.pre,
            handler: API.forgotpassword.handler,
          },
        },

        {
          method: 'PUT',
          path: '/reset-password',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'ResetPassword',
            notes: 'ResetPassword',
            validate: API.resetPassword.validate,
            pre: API.resetPassword.pre,
            handler: API.resetPassword.handler,
          },
        },


        {
          method: 'GET',
          path: '/dropdwon-users',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Get User for the dropDown',
            notes: 'Get User for the dropDown',
            validate: API.getAllUser.validate,
            pre: API.getAllUser.pre,
            handler: API.getAllUser.handler,
          },
        },

        {
          method: 'GET',
          path: '/all-employees',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Get All User ',
            notes: 'Get All User',
            validate: API.getMyAllUser.validate,
            pre: API.getMyAllUser.pre,
            handler: API.getMyAllUser.handler,
          },
        },
        {
          method: 'PUT',
          path: '/employee-role-change/{Id}',
          config: {
            auth: 'admin',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Change Employee Role',
            notes: 'Change  Employee Role',
            validate: API.changeEmpRole.validate,
            pre: API.changeEmpRole.pre,
            handler: API.changeEmpRole.handler
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
          path: '/sendMail',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'Send Mail for test',
            notes: 'Send Mail for test',
            validate: {
              query: Joi.object().keys({
                email: Joi.string().label('Email'),
                subject: Joi.string().label('Subject')
              }),
            },
            pre: [],
            handler: async (request, h) => {
              const { query } = request;
              const helper = require('@utilities/helper')
              const mailObj = {
                from: 'webfirminfotech@gmail.com',
                to: query.email,
                subject: query.subject,
                html: '<h1>Test Email</h1>' + query.email
              }
              return await helper.sendEmail(mailObj);
            }
          }
        },
        {
          method: 'GET',
          path: '/set-joining-day',
          config: {
              auth: null,
              plugins: {
                  policies: ['log.policy']
              },
              tags: ['api', 'Script'],
              description: 'Set Joining Day',
              notes: 'Set Joining Day',
              validate: API.setJoiningDay.validate,
              pre: API.setJoiningDay.pre,
              handler: API.setJoiningDay.handler
          }
        },
        {
          method: 'GET',
          path: '/get-time',
          config: {
            auth: null,
            plugins: {
              policies: []
            },
            tags: ['api', 'Authentication'],
            validate: {},
            pre: [],
            handler: async (request, h) => {
              try {
                var callRequest = require('request')
                const getTime = () => {
                  return new Promise((resolve) => {
                    callRequest({
                      url: "https://worldtimeapi.org/api/timezone/" + (request.query.timezone ? request.query.timezone : "Asia/Kolkata"),
                      method: 'get',
                      json: true
                    }, (error, response, body) => {
                      if (error) {
                        resolve({ ...error, success: false })
                      } else {
                        resolve({ ...body, success: true })
                      }
                    })
                  })
                }
                return await getTime();
              } catch (err) {
                return { err }
              }
            }
          }
        },
        {
          method: 'PUT',
          path: '/verify-licence-key/{userId}',
          config: {
            auth: 'auth',
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'verify-licence-key',
            notes: 'verify-licence-key',
            validate: API.verifyLicenceKey.validate,
            pre: API.verifyLicenceKey.pre,
            handler: API.verifyLicenceKey.handler
          }
        }
      ])
    },
    version: require('../../package.json').version,
    name: 'auth-routes'
  }
}
