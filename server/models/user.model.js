'use strict';
const mongoose = require('mongoose');
const generalHelper = require('@utilities/helper');
const Joi = require('joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const { v4: Uuidv4 } = require('uuid');


const Types = Schema.Types;

const modelName = 'user';

const errorHelper = require('@utilities/error-helper');

const dbConn = require('@plugins/mongoose.plugin').plugin.dbConn();

const { errors } = require('@utilities/constants');
const UserSchema = new Schema(
  {
    personalEmail: {
      type: Types.String,
      default: null,
    },
    userId: {
      type: Types.String,
      default: null,
    },
    companyEmail: {
      type: Types.String,
      default: null,
    },
    appConfig : {
      appAction: {
        type: Types.Boolean,
        default: false
      },
      manageScreenShot: {
        type: Types.Boolean,
        default: true
      },
      devices: [
        {
          deviceName: {
            type: Types.String,
            default: null,
          },
          isActivate: {
            type: Types.Boolean,
            default: false,
          },
          licenseKey: {
            type: Types.String,
            default: null,
          },
          expiryDate: {
            type: Types.Date,
            default: null,
          },
        },
      ],
      screenshotInterval: {
        type: Types.Number,
        default: null,
      },
    },
    contact: {
      type: Types.Number,
      default: 0,
    },
    permanentAddress: {
      type: Types.String,
      default: null,
    },
    currentAddress: {
      type: Types.String,
      default: null,
    },
    state: {
      type: Types.String,
      default: null,
    },
    city: {
      type: Types.String,
      default: null,
    },
    country: {
      type: Types.String,
      default: null,
    },
    skype: {
      type: Types.String,
      default: null,
    },
    companyPosition: {
      type: [Types.Mixed],
      default: [],
    },
    joiningDate: {
      type: Types.Date,
      default: null,
    },
    dateOfBirth: {
      type: Types.Date,
      default: null,
    },
    image: {
      type: Types.String,
      default: null,
    },
    pfAllow: {
      type: Types.Boolean,
      default: false,
    },
    documents: [
      {
        name: {
          type: Types.String,
          required: true,
        },
        date: {
          type: Types.Date,
          required: true,
        },
        slug: {
          type: Types.String,
          required: true,
        },
      },
    ],
    name: {
      type: Types.String,
      required: true,
    },
    password: {
      type: Types.String,
      default: null,
    },
    forgotPasswordToken: {
      type: Types.String,
      default: null,
    },
    role: {
      type: Types.String,
      enum: ['EMPLOYEE', 'OWNER', 'ADMIN', 'MANAGER', 'TRAINEE'],
      default: 'EMPLOYEE',
    },
    aadharNumber: {
      type: Types.Number,
      default: null,
    },
    panNumber: {
      type: Types.String,
      default: null,
    },
    experience: {
      type: Types.Number,
      default: 0,
    },
    skills: {
      type: Types.String,
      default: null,
    },

    position: {
      type: Types.String,
      default: 'Jr. Full Stack developer',
    },
    bio: {
      type: Types.String,
      default: null,
    },
    isAccountVerified: {
      type: Types.Boolean,
      default: false,
    },
    PIN: {
      type: Types.Number,
      default: null,
    },
    timezone: {
      type: Types.String,
      default: null,
    },
    createdAt: {
      type: Types.Date,
      default: null,
    },
    hasLeftCompany: {
      type: Types.Boolean,
      default: false,
    },
    updatedAt: {
      type: Types.Date,
      default: null,
    },
    isDeleted: {
      type: Types.Boolean,
      default: false,
    },
    linkedIn: {
      type: Types.String,
      default: null,
    },
    gitHub: {
      type: Types.String,
      default: null,
    },
    facebook: {
      type: Types.String,
      default: null,
    },
    stackOverflow: {
      type: Types.String,
      default: null,
    },
    instagram: {
      type: Types.String,
      default: null,
    },
    twitter: {
      type: Types.String,
      default: null,
    },
    permanentWorkFromHome: {
      type: Types.Boolean,
      default: false
    }
  },
  {
    collection: modelName,
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isNew) {
    // Set Password & hash before save it
    const passHash = await user.generateHash(user.password);
    user.password = passHash.hash;
    const emailHash = await user.generateHash();
    user.emailHash = emailHash.hash;
    user.wasNew = true;
  }
  next();
});

UserSchema.methods = {
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4();
      }
      const salt = await Bcrypt.genSalt(10);
      const hash = await Bcrypt.hash(key, salt);
      return {
        key,
        hash,
      };
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
};

UserSchema.statics = {
  findByCredentials: async function (email, password) {
    try {
      const self = this;

      const query = {
        companyEmail: email,
      };

      const mongooseQuery = self.findOne(query);

      const user = await mongooseQuery.lean();

      if (!user) {
        const errorObj = {};
        errorObj.email = errors.user.wrongEmail.message;
        await generalHelper.setCustomError(errorObj);
      }

      const source = user.password;

      const passwordMatch = await Bcrypt.compare(password, source);
      if (passwordMatch) {
        return user;
      } else {
        const errorObj = {};
        errorObj.password = errors.user.wrongPassword.message;
        await generalHelper.setCustomError(errorObj);
      }
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4();
      }
      const salt = await Bcrypt.genSalt(10);
      const hash = await Bcrypt.hash(key, salt);
      return {
        key,
        hash,
      };
    } catch (err) {
      errorHelper.handleError(err);
    }
  },

  getByEmail: async function (email) {
    try {
      const self = this;
      const query = { companyEmail: email };
      const userData = await self.findOne(query);
      return userData;
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
};

exports.schema = dbConn.model(modelName, UserSchema);
