'use strict';
const fileUploadHelper = require('@utilities/uploadFile-helper');
const Joi = require('joi');
const config = require('config');
const Boom = require('@hapi/boom');
const Path = require('path');
const errorHelper = require('@utilities/error-helper');
const helper = require('@utilities/helper');
const Token = require('@utilities/create-token');
var mongoose = require('mongoose');
const fs = require('fs');
const createUserTemplate = require('@utilities/create-user-template');
const User = require('@models/user.model').schema;
Joi.objectId = require('joi-objectid')(Joi);
Joi.objectId = Joi.string;
const Bcrypt = require('bcrypt');
const moment = require('moment')


module.exports = {
  login: {
    validate: {
      payload: Joi.object().keys({
        username: Joi.string().required().trim().label('Username'),
        password: Joi.string().required().trim().label('Password'),
        isApp: Joi.boolean().label('check either login from App or not')
      }),
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          try {
            const { userService } = request.server.services();
            const username = request.payload.username;
            const password = request.payload.password;

            const user = await User.findByCredentials(username, password);
            if (user) {
              if (user.isAccountVerified) {
                user.permissions = await userService.getPermission()
                return user;
              } else {
                errorHelper.handleError(
                  Boom.badRequest(
                    'Please contact Admin, and verify your account',
                  ),
                );
              }
            } else {
              errorHelper.handleError(
                Boom.badRequest('Wrong username or password'),
              );
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
      {
        assign: 'accessToken',
        method: (request, h) => {
          if (request && request.payload && request.payload.isApp) {
            return Token(request.pre.user, '365d');
          } else {
            return Token(request.pre.user, config.constants.EXPIRATION_PERIOD);
          }
          // return Token(request.pre.user, config.constants.EXPIRATION_PERIOD);
        },
      },
      {
        assign: 'emailVerified',
        method: (request, h) => {
          // TODO: Create Email service to send emails
          return h.continue;
        },
      },
      {
        assign: 'lastLogin',
        method: async (request, h) => {
          try {
            const lastLogin = Date.now();
            await User.findByIdAndUpdate(request.pre.user._id, {
              lastLogin: lastLogin,
            });
            return lastLogin;
          } catch (err) {
            errorHelper.handleError(err);
          }

          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      const accessToken = request.pre.accessToken;
      let response = {};

      delete request.pre.user.password;

      response = {
        user: request.pre.user,
        accessToken,
      };
      return h.response(response).code(200);
    },
  },
  signup: {
    validate: {
      payload: Joi.object().keys({
        name: Joi.string().required().trim().label('Name'),
        companyEmail: Joi.string().email().required().trim().label('Email'),
        contact: Joi.number().allow('', null).label('Phone Number'),
        password: Joi.string().required().trim().label('Password'),
        cPassword: Joi.string()
          .required()
          .trim()
          .valid(Joi.ref('password'))
          .label('Compare Password'),
        isAdmin: Joi.boolean().allow('', null).label('isAdmin'),
        timezone: Joi.string().required().trim().label('timezone'),
      }),
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: async (request, h) => {
          try {
            const user = await User.findOne({
              companyEmail: request.payload.companyEmail,
            });
            if (user) {
              errorHelper.handleError(
                Boom.badRequest('Email address is already exist'),
              );
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
      {
        assign: 'uniquePhone',
        method: async (request, h) => {
          try {
            if(!request.payload.isAdmin){
            const user = await User.findOne({
              contact: request.payload.contact,
            });
            if (user) {
              errorHelper.handleError(
                Boom.badRequest('Mobile Number is already exist'),
              );
            }
          }
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
      {
        assign: 'generateUserId',
        method: async (request, h) => {
          try {
            const userCount = await User.find({}).count();
            const { userService } = request.server.services();
            const generatedUserName = await userService.getUserNameFromEmail(
              userCount,
            );
            if (generatedUserName && generatedUserName.userId) {
              request.payload.userId = generatedUserName.userId;
            } else {
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
      {
        assign: 'isAccountVerified',
        method: async (request, h) => {
          try {
            const { payload } = request;
            // if (request.auth.credentials.user.role === "ADMIN") {
            //   request.payload.isAccountVerified = true;
            // }
            if (payload.isAdmin === true) {
              payload.isAccountVerified = true;
            } else {
              payload.isAccountVerified = false;
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
      {
        assign: 'signup',
        method: async (request, h) => {
          delete request.payload.cPassword;
          const userPayload = request.payload;
          try {
            // userPayload.joiningDate = moment.tz(moment(), userPayload.timezone).format("YYYY-MM-DD hh:mm:ss");
            const createdUser = await User.create(userPayload);
            return createdUser;
            // if (createdUser) {
            //     let passW = request.payload.password;
            //       const mailObj = {
            //         from: 'webfirminfotech@gmail.com',
            //         to: createdUser.companyEmail,
            //         subject: `Welcome to Techivies Solution Pvt. Ltd.`,
            //         html: createUserTemplate.createUserTemplate(createdUser, passW)
            //       }
            //       return await helper.sendEmail(mailObj);
            //     }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup).code(201);
    },
  },
  me: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).options({
        allowUnknown: true,
      }),
    },
    pre: [],
    handler: async (request, h) => {
      const { userService } = request.server.services();

      let user = await userService.getUserById(
        request.auth.credentials.user._id,
      );
      const permissions = await userService.getPermission(request.auth.credentials.user._id)
      user = JSON.parse(JSON.stringify(user))
      if (permissions && permissions.length) {
        user['permissions'] = permissions;
      }
      return h.response(user);
    },
  },
  adminsignup: {
    validate: {
      payload: Joi.object().keys({
        name: Joi.string().trim().label('name'),
        role: Joi.string().label('Role'),
        companyEmail: Joi.string().email().required().trim().label('Email'),
        password: Joi.string().required().trim().label('Password'),
      }),
    },
    pre: [
      {
        assign: 'adminSignup',
        method: async (request, h) => {
          try {
            const { payload } = request;
            payload.isAccountVerified = true;
            delete payload.confirmPassword;
            const existUser = await User.getByEmail(payload.companyEmail);
            if (existUser) {
              return errorHelper.handleError({
                status: 400,
                code: 'bad_request',
                message: 'email already exist.',
              });
            } else {
              const user = await User.create(payload);
              await UserNotificationPreferences.create({
                user: users[index]._id
              })
              return user
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.adminSignup).code(201);
    },
  },
  updateProfile: {
    validate: {
      payload: Joi.object().keys({
        name: Joi.string().trim().required().label('name'),
        role: Joi.string().allow('', null),
        country: Joi.string().allow('', null),
        state: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        PIN: Joi.number().allow('', null),
        personalEmail: Joi.string()
        .allow('', null)
        .email()
        .label('Personal Email'),
        companyEmail: Joi.string()
        .allow('', null)
        .email()
        .label('Company Email'),
        dateOfBirth: Joi.string().allow('', null).label('Date of Birth'),
        joiningDate: Joi.string().allow('', null).label('Date of Joining'),
        contact: Joi.number().allow('', null).label('contact'),
        skype: Joi.string().allow('', null).label('Skype'),
        permanentAddress: Joi.string()
        .allow('', null)
        .label('Permanent Address'),
        currentAddress: Joi.string().allow('', null).label('current Address'),
        aadharNumber: Joi.number().allow('', null).label('Aadhar Number'),
        panNumber: Joi.string().uppercase().allow('', null).label('Pan Number'),
        permanentWorkFromHome: Joi.boolean().label('Permanent WorkFrom Home'),
        experience: Joi.number().allow('', null).label('Experience'),
        skills: Joi.string().allow('', null).label('Skills'),
        userId: Joi.string().allow('', null).label('userId'),
        timezone: Joi.string().required().trim().label('timezone'),
        linkedIn: Joi.string().allow('', null).trim().label('linkedIn'),
        gitHub: Joi.string().allow('', null).trim().label('gitHub'),
        facebook: Joi.string().allow('', null).trim().label('facebook'),
        stackOverflow: Joi.string().allow('', null).trim().label('stackOverflow'),
        instagram: Joi.string().allow('', null).trim().label('instagram'),
        twitter: Joi.string().allow('', null).trim().label('twitter'),
        position: Joi.string().allow('', null).label('position'),
        file: Joi.any().meta({swaggerType: 'file'}).optional().allow('', null).description('file'),
      }),
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: async (request, h) => {
          try {
            const { payload } = request;
            const oldUser = await User.findOne({
              _id: request.auth.credentials.user._id,
            });
            if (oldUser && oldUser.companyEmail !== payload.companyEmail) {
              const user = await User.findOne({
                companyEmail: payload.companyEmail,
              });
              if (user) {
                errorHelper.handleError({
                  status: 400,
                  code: 'bad_request',
                  message: 'Email already exists.',
                });
              }
              return oldUser;
            }
            return oldUser;
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'updateUser',
        method: async (request, h) => {
          try {
            const { payload, pre } = request;
            const user = pre.uniqueEmail;
            if (user && user._id) {
              const userIdExist = await User.findOne({ _id: { $ne: user._id }, userId: payload.userId })
              if (userIdExist) {
                errorHelper.handleError({
                  status: 404,
                  code: 'bad_request',
                  message: 'Employee Code already exist.',
                });
              }
              return await User.findByIdAndUpdate(user._id, payload);
            } else {
              errorHelper.handleError({
                status: 404,
                code: 'bad_request',
                message: 'User not Found.',
              });
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'uploadProfilePhoto',
        method: async (request, h) => {
          try {
            const { payload } = request;
            const user = await User.findById(request.auth.credentials.user._id)
            if(payload.file){
              const filePath = `${config.constants.s3Prefix}/user/${user._id}`
              const fileUpload = async (file) => {
                const upload = await fileUploadHelper.handleFileUpload(file.file, filePath)
                return upload
              }
              const res = await fileUpload(payload)
              payload.image = res.filePath;
            }
            // if(!payload.file){
            //   payload.image = null;
            //   await fileUploadHelper.deleteFile(`${config.constants.s3Prefix}/${user.image}`)
            // }
            delete payload.file
            const updatedUser = await User.findOneAndUpdate(
              { _id: request.auth.credentials.user._id },
              { $set: payload },
              { new: true })
            return updatedUser;
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.uploadProfilePhoto).code(201);
    },
  },
  updateProfileByAdmin: {
    validate: {
      params: Joi.object().keys({
        Id: Joi.objectId().required().label('adminId'),
      }),
      payload: Joi.object().keys({
        name: Joi.string().trim().required().label('name'),
        role: Joi.string().allow('', null),
        country: Joi.string().allow('', null),
        state: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        PIN: Joi.number().allow('', null),
        personalEmail: Joi.string()
          .allow('', null)
          .email()
          .label('Personal Email'),
        companyEmail: Joi.string()
          .required()
          .email()
          .label('Company Email'),
        dateOfBirth: Joi.string().allow('', null).label('Date of Birth'),
        joiningDate: Joi.string().allow('', null).label('Date of Birth'),
        contact: Joi.number().allow('', null).label('contact'),
        skype: Joi.string().allow('', null).label('Skype'),
        permanentAddress: Joi.string()
          .allow('', null)
          .label('Permanent Address'),
        currentAddress: Joi.string().allow('', null).label('current Address'),
        aadharNumber: Joi.number().allow('', null).label('Aadhar Number'),
        panNumber: Joi.string().uppercase().allow('', null).label('Pan Number'),
        experience: Joi.number().allow('', null).label('Experience'),
        skills: Joi.string().allow('', null).label('Skills'),
        position: Joi.string().allow('', null).label('position'),
        userId: Joi.string().allow('', null).label('userId'),
        permanentWorkFromHome: Joi.boolean().label('Permanent WorkFrom Home'),
        timezone: Joi.string().required().trim().label('timezone'),
        linkedIn: Joi.string().allow('', null).trim().label('linkedIn'),
        gitHub: Joi.string().allow('', null).trim().label('gitHub'),
        facebook: Joi.string().allow('', null).trim().label('facebook'),
        stackOverflow: Joi.string().allow('', null).trim().label('stackOverflow'),
        instagram: Joi.string().allow('', null).trim().label('instagram'),
        twitter: Joi.string().allow('', null).trim().label('twitter'),
        file: Joi.any().meta({ swaggerType: 'file' }).optional().allow('', null).description('file'),
      }),
    },
    pre: [
      {
        assign: 'uniqueEmailByAdmin',
        method: async (request, h) => {
          try {
            const { payload, params } = request;
            if (!payload.companyEmail) {
              errorHelper.handleError({
                status: 400,
                code: 'bad_request',
                message: 'Company Email is required',
              });
            }else{
            const oldUser = await User.findOne({
              _id: params.Id,
            });

            if (oldUser && oldUser.companyEmail !== payload.companyEmail) {
              const user = await User.findOne({
                companyEmail: payload.companyEmail,
              });

              if (user) {
                errorHelper.handleError({
                  status: 400,
                  code: 'bad_request',
                  message: 'Email already exists.',
                });
              }
              return oldUser;
            }
            return oldUser;
         } } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'updateUserByAdmin',
        method: async (request, h) => {
          try {
            const { payload, pre } = request;
            if (request.auth.credentials.user.role === 'ADMIN') {
              const user = pre.uniqueEmailByAdmin;
              if (user && user._id) {
                const userIdExist = await User.findOne({ _id: { $ne: user._id }, userId: payload.userId })
                if (userIdExist) {
                  errorHelper.handleError({
                    status: 404,
                    code: 'bad_request',
                    message: 'Employee Code already exist.',
                  });
                }
                return await User.findByIdAndUpdate(user._id, payload);
              } else {
                errorHelper.handleError({
                  status: 404,
                  code: 'bad_request',
                  message: 'User not Found.',
                });
              }
            } else {
              errorHelper.handleError(
                Boom.badRequest('Invalid User Access !!!'),
              );
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'uploadProfilePhotoByAdmin',
        method: async (request, h) => {
          try {
            const { payload, params } = request;
            const user = await User.findById(params.Id);
            if(user){
              if(payload.file){
                const filePath = `${config.constants.s3Prefix}/user/${user._id}`
                const fileUpload = async (file) => {
                  const upload = await fileUploadHelper.handleFileUpload(file.file, filePath);
                  return upload
                }
                const res = await fileUpload(payload)
                payload.image = res.filePath;
              }
              // if(!payload.file){
              //   payload.image = null;
              //   await fileUploadHelper.deleteFile(`${config.constants.s3Prefix}/${user.image}`)
              // }
            } else {
              Boom.badRequest('User Not Found !!!')
            }
            delete payload.file
            const updatedUser = await User.findOneAndUpdate(
              { _id: params.Id },
              { $set: payload },
              { new: true })
            return updatedUser;
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.uploadProfilePhotoByAdmin).code(201);
    },
  },
  users: {
    validate: {
      headers: helper.apiHeaders(),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const queryParams = request.query;
        if (request.query.inactiveAccounts) {
        } else {
          queryParams.isAccountVerified = true;
        }
        return await User.find(queryParams).select(
          'name contact bio companyEmail personalEmail position image isAccountVerified skills experience',
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  uploadProfilePhoto: {
    validate: {
      payload: Joi.object().keys({
        file: Joi.any()
          .meta({
            swaggerType: 'file',
          })
          .required()
          .description('file'),
      }),
    },

    pre: [
      {
        assign: 'uploadProfilePhoto',
        method: async (request, h) => {
          try {
            const { payload, params } = request;
            const user = request.auth.credentials.user;
            if (payload) {
              let filename = payload.file.hapi.filename
              const fileType = filename.replace(/^.*\./, '')

            if (payload.file && fileType === 'jpg' || fileType === 'png' || fileType ===  'jpeg') {

              const fileUpload = async (file) => {
                const filePath = `${config.constants.s3Prefix}/user/${user._id}/profile`
                const upload = await fileUploadHelper.handleFileUpload(file.file, filePath);
                if (user) {
                  user.image = upload.filePath;
                  await user.save();
                }
                return upload;
              };

              const res = await fileUpload(payload);
              if (res && res.filePath) {
                return res;
              }
            } else {
              errorHelper.handleError(Boom.badRequest('File type not supported'));
            }

            } else {
              errorHelper.handleError(Boom.badRequest('Something went wrong'));
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
        },
      },
    ],

    handler: async (request, h) => {
      return h.response(request.pre.uploadProfilePhoto);
    },
  },

  deleteProfilePhoto: {
    validate: {},
    pre: [
      {
        assign: 'deletePhoto',
        method: async (request, h) => {
          try {
            const user = request.auth.credentials.user;
            if (user) {
              const name = user.image;
              const filePath = Path.resolve(
                __dirname,
                './../../uploads/' + name,
              );
              user.image = null;
              await user.save();
              fs.unlink(filePath, function (err) {
                if (err) return console.log(err);
              });
              return {
                Message: 'Document deleted Successfully.',
              };
            } else {
              errorHelper.handleError(Boom.badRequest('Something Went Wrong!'));
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
        },
      },
    ],

    handler: async (request, h) => {
      return h.response(request.pre.deletePhoto);
    },
  },

  employeeRequest: {
    validate: {
      headers: helper.apiHeaders(),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const queryParams = { isAccountVerified: false };
        return await User.find(queryParams).select(
          '_id name contact bio  companyEmail personalEmail position image isAccountVerified',
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  employeeList: {
    validate: {
      headers: helper.apiHeaders(),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const queryParams = { isAccountVerified: true };
        return await User.find(queryParams).select(
          '_id name contact bio  companyEmail personalEmail position image isAccountVerified role',
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  activateEmpAcc: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        Id: Joi.objectId().required().label('Id'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        return await User.findOneAndUpdate(
          {
            _id: request.payload.Id,
          },
          {
            isAccountVerified: true,
          },
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  verifyAccount: {
    validate: {
      payload: Joi.object().keys({
        id: Joi.string().label('userId'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const { payload } = request;
        const user = await User.findOne({ _id: payload.id });
        if (user && user.isAccountVerified) {
          const device = await Device.findOne({ user: payload.id });
          if(device){
            errorHelper.handleError({
              status: 400,
              code: 'bad_request',
              message: `Inactivation failed, Device is assigned to user. Please collect company's devices from user..`,
            });
          }
          user.isAccountVerified = false
          user.save()
          return h
            .response({
              message: 'User is successfully inactive.',
            })
            .code(200);
        }
        if (user) {
          return await User.findOneAndUpdate(
            { _id: payload.id },
            { isAccountVerified: true },
          );
        } else {
          errorHelper.handleError({
            status: 400,
            code: 'user_not_found',
            message: 'User not found.',
          });
        }
      } catch (err) {
        errorHelper.handleError(err);
      }
    },
  },
  delete: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId().required().label('Id'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const Emp = await User.findOne({
          _id: request.params.Id,
        });
        if (Emp) {
          return await User.findOneAndRemove({
            _id: request.params.Id,
          });
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  viewEmployee: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId().required().label('Id'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        return await User.findOne({
          _id: request.params.Id,
        });
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  updateEmployee: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId().required().label('Id'),
      }),
      payload: Joi.object().keys({
        name: Joi.string().label('name'),
        role: Joi.string().valid(
          'EMPLOYEE',
          'OWNER',
          'ADMIN',
          'MANAGER',
          'TRAINEE',
        ),
        bio: Joi.string().label('bio').allow(null, ''),
        companyEmail: Joi.string().email().required().trim().label('Email'),
        birthDate: Joi.string().label('birthDate').allow(null, ''),
        joiningDate: Joi.string().label('joiningDate').allow(null, ''),
        contact: Joi.string().label('contact').allow(null, ''),
        userId: Joi.string().label('userId').allow(null, ''),
        aadharNumber: Joi.number().label('aadharNumber').allow(null, ''),
        panNumber: Joi.string().label('panNumber').allow(null, ''),
        position: Joi.string().label('position').allow(null, ''),
        timezone: Joi.string().required().trim().label('timezone'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        return await User.findOneAndUpdate(
          {
            _id: request.params.Id,
          },
          {
            name: request.payload.name,
            companyEmail: request.payload.companyEmail,

            bio: request.payload.bio,
            birthDate: request.payload.birthDate,
            joiningDate: request.payload.joiningDate,

            contact: request.payload.contact,
            userId: request.payload.userId,
            aadharNumber: request.payload.aadharNumber,

            panNumber: request.payload.panNumber,
            position: request.payload.position,
            role: request.payload.role,
          },
        );
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  changePassword: {
    validate: {
      headers: helper.apiHeaders(),
      payload: Joi.object().keys({
        currentPassword: Joi.string()
          .required()
          .trim()
          .label('Current Password'),
        newPassword: Joi.string().required().trim().label('New Password'),
        confirmPassword: Joi.string()
          .required()
          .trim()
          .label('Confirm Password'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const { payload } = request;
        const user = await User.findById(request.auth.credentials.user._id);
        if (user) {
          const isOldPasswordMatch = await Bcrypt.compare(
            payload.currentPassword,
            JSON.parse(JSON.stringify(user)).password,
          );
          if (!isOldPasswordMatch) {
            errorHelper.setValidationError({
              currentPassword: 'Current password is wrong',
            });
          } else {
            if (payload.newPassword !== payload.confirmPassword) {
              errorHelper.setValidationError({
                confirmPassword: 'Confirm Password did not match',
              });
            }

            const passHash = await User.generateHash(payload.newPassword);
            user.password = passHash.hash;
            await user.save();
            return {
              message: 'Password changed successfully',
            };
          }
        } else {
          errorHelper.setValidationError({
            password: 'User not found',
          });
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
  changeEmpPassword: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        id: Joi.objectId().required().label('Id'),
      }),
      payload: Joi.object().keys({
        password: Joi.string().required().trim().label('Password'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const { payload } = request;
        const user = await User.findById(request.params.id);
        if (user) {
          const passHash = await User.generateHash(payload.password);
          user.password = passHash.hash;
          await user.save();
          return {
            message: 'Password changed successfully',
          };
        } else {
          errorHelper.setValidationError({
            password: 'User not found',
          });
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  forgotpassword: {
    validate: {
      payload: Joi.object().keys({
        email: Joi.string().email().required().trim().label('Email'),
      }),
    },
    pre: [
      {
        assign: 'isExist',
        method: async (request, h) => {
          try {
            const user = await User.findOne({
              companyEmail: request.payload.email,
            });
            if (user) {
              return user;
            } else {
              const errorObj = {};
              errorObj.email = "We can't find your email.";
              await helper.setCustomError(errorObj);
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },

      {
        assign: 'genreateLink',
        method: async (request, h) => {
          try {
            const template = require('@utilities/reset-password-template');
            const userDetail = request.pre.isExist;
            const forgotPasswordToken = helper.generateUniqueCode(10);
            userDetail.forgotPasswordToken = forgotPasswordToken;
            await userDetail.save();
            const link = `${config.baseUrl}/reset-password?token=${forgotPasswordToken}`;
            const mailObj = {
              from: 'webfirminfotech@gmail.com',
              to: userDetail.companyEmail,
              subject: 'Reset Your Password',
              html: template.resetPasswordTemplate({
                userDetail: userDetail,
                link: link,
              }),
              // html: `Hello ${userDetail.name}!<br><br>
              //   Please click on below link to reset password<br>
              //   <a href="${link}" target=" _blank">Reset My Password</a><br><br>`,
            };
            await helper.sendEmail(mailObj);
            if (userDetail) {
              const response = {
                message: 'Your reset password email sent successfully.',
              };
              return response;
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.genreateLink).code(201);
    },
  },

  resetPassword: {
    validate: {
      payload: Joi.object().keys({
        token: Joi.string().required().trim().label('Token'),
        password: Joi.string().required().trim().label('Password'),
        cPassword: Joi.string()
          .required()
          .trim()
          .valid(Joi.ref('password'))
          .label('Compare Password'),
      }),
    },
    pre: [
      {
        assign: 'verifiedToken',
        method: async (request, h) => {
          try {
            const user = await User.findOne({
              forgotPasswordToken: request.payload.token,
            });
            if (!user) {
              errorHelper.handleError(
                Boom.badRequest(
                  'Link is invalid/expired Please try again!.',
                ),
              );
            }
            return user;
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'resetPassword',
        method: async (request, h) => {
          try {
            const { payload } = request;
            const user = request.pre.verifiedToken;
            if (user) {
              const passHash = await User.generateHash(payload.password);
              user.password = passHash.hash;
              user.forgotPasswordToken = null;
              await user.save();
              return {
                message: 'Password has been changed Succesfully',
              };
            } else {
              errorHelper.handleError(Boom.badRequest('User not found!'));
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (request, h) => {
      try {
        return h
          .response({
            message: 'Your password updated successfully.',
          })
          .code(201);
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  getAllUser: {
    validate: {},
    pre: [],
    handler: async (request, h) => {
      const { userService } = request.server.services();
      const userList = await userService.getAllUser();
      return userList;
    },
  },

  getMyAllUser: {
    validate: {
      headers: helper.apiHeaders(),
      query: Joi.object().keys({
        search: Joi.string().allow('', null),
        page: Joi.number().allow('', null),
        limit: Joi.number().allow('', null),
        employeeCodeFilter: Joi.boolean().allow('', null),
        status: Joi.string().allow('', null),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      const { userService } = request.server.services();
      const MyUserList = await userService.getMyAllUser(request);
      return MyUserList;
    },
  },

  changeEmpRole: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId().required().label('Id'),
      }),
      payload: Joi.object().keys({
        role: Joi.string().valid(
          'EMPLOYEE',
          'OWNER',
          'ADMIN',
          'MANAGER',
          'TRAINEE',
        ),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const { params, payload } = request;
        const loggedUser = request.auth.credentials.user;
        const user = await User.findById(params.Id);
        if (user) {
          if (user._id.toString() != loggedUser._id.toString()) {
            const updatedUser = await User.findByIdAndUpdate(
              params.Id,
              { role: payload.role },
              { new: true },
            );
            return updatedUser;
          } else {
            errorHelper.handleError(
              Boom.badRequest('You can not change your own role'),
            );
          }
        }
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  updateDevice: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        Id: Joi.objectId().required().label('Id'),
      }),
      payload: Joi.object().keys({
        appAction: Joi.boolean().allow('', null).label('App Action'),
        manageScreenShot: Joi.boolean().allow('', null).label('Manage Screenshot'),
        screenshotInterval: Joi.number().allow('', null),
        devices: Joi.string().label('label')
      }),
    },
    pre: [],
    handler: async (request, h) => {
      let appConfig = {}
      try {
        const { params, payload } = request;
        const deviceData = JSON.parse(payload.devices)
        // payload['devices'] = deviceData;
        appConfig = {
          appAction : payload.appAction,
          manageScreenShot: payload.manageScreenShot,
          screenshotInterval: payload.screenshotInterval,
          devices: deviceData
        }
        if(params.Id)
        {
          return await User.findOneAndUpdate(
         {
          _id: mongoose.Types.ObjectId(params.Id)
          },
          { $set: { appConfig: appConfig }},
          {
            new: true
          }
          )
        }else{
          errorHelper.handleError(
            Boom.badRequest('Please provide user Id'),
          );
        }
        // return payload
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  checkUuid: {
    validate: {
      headers: helper.apiHeaders(),
      query: Joi.object().keys({
        uuid: Joi.string().required().label('uuid'),
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        const { query } = request;

        if (!query.uuid) {
          errorHelper.handleError(
            Boom.badRequest('Please provide uuid'),
          );
        }

        const count = await User.countDocuments({
          'device.licenseKey': query.uuid
        });

        return count > 0;
      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },

  setJoiningDay: {
    validate: {
    },
    pre: [
      {
        assign: 'setJoiningDay',
        method: async (request, h) => {
          try {
            const { server } = request;
            const { userService } = server.services();
            userService.setJoiningDay();
            return true
          } catch (error) {
            errorHelper.handleError(error)
          }
        }
      }
    ],
    handler: async (request, h) => {
      return h.response(request.pre.setJoiningDay).code(200)
    }
  },

  verifyLicenceKey: {
    validate: {
      headers: helper.apiHeaders(),
      params: Joi.object().keys({
        userId: Joi.objectId()
          .required()
          .label('User Id')
    }),
      payload: Joi.object().keys({
        licenseKey: Joi.string().required().label('License Key')
      }),
    },
    pre: [],
    handler: async (request, h) => {
      try {
        let matchKey = false
        let findUser = await await User.findOne({ _id: request.params.userId });
        if (findUser) {
          if (findUser.appConfig && findUser.appConfig.devices && findUser.appConfig.devices.length > 0) {
            findUser.appConfig.devices.forEach(d => {
              if (d.licenseKey === request.payload.licenseKey) {
                console.log('Enter .licenseKey: ___________________________________');
                d.isActivate = true
                matchKey = true
              }
            });
            if(!matchKey) {
              errorHelper.handleError(
                Boom.badRequest('License Key Not Found'),
              );
            }
          }
          console.log("findUser.devie ___________________", findUser.appConfig);
          const userData = await User.findOneAndUpdate(
            {
              _id: request.params.userId,
            },
            {
              appConfig: { ...findUser.appConfig }
            }
          );
          return userData
        } else {
          errorHelper.handleError(
            Boom.badRequest('User Not Found'),
          );
        }

      } catch (e) {
        errorHelper.handleError(e);
      }
    },
  },
};
