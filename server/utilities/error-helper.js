'use strict'
const Boom = require('@hapi/boom')

function handleError(err, customMessage = null) {
  if (err.isBoom) {
    throw err
  } else if (
    !(err instanceof Error) &&
    typeof err === 'object' &&
    err.message
  ) {
    if (customMessage) {
      err.message = customMessage
    }
    const error = Boom.badRequest(err.message)
    error.output.payload.errorCode = err.code
    error.output.statusCode = err.status || 400
    error.reformat()
    throw error
  } else {
    console.error(err)
    throw Boom.badImplementation(err)
  }
}

const setValidationError = (errorObj, type = null) => {
  let error = Boom.badRequest('Validation Error')
  error.output.payload.validation = {}
  error.output.payload.validation.errors = errorObj
  handleError(error)
}

module.exports = {
  handleError,
  setValidationError
}
