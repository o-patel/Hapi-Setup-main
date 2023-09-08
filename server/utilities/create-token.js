'use strict'

const Jwt = require('jsonwebtoken')
const config = require('config')
const errorHelper = require('./error-helper')

function createToken(user, expirationPeriod) {
  try {
    let token = {}

    const tokenUser = {
      name: user.name,
      companyEmail: user.companyEmail,
      _id: user._id
    }

    token = Jwt.sign(
      {
        user: tokenUser
      },
      config.constants.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: expirationPeriod
      }
    )

    return token
  } catch (err) {
    errorHelper.handleError(err)
  }
}

module.exports = createToken
