const errors = {
    general: {
      defaultSettingNotFound: {
        status: 400,
        code: 'setting_not_found',
        message: 'default settings not found'
      },
      contactSupport: {
        status: 400,
        code: 'contact_support',
        message: 'contact support'
      },
      invalidRequest: {
        status: 400,
        code: 'invalid_request',
        message: 'invalid request parameters'
      },
      emailNotFound: {
        status: 404,
        code: 'email_not_found',
        message: 'email not found'
      }
    },
    authorization: {
      unauthorized: {
        status: 401,
        code: 'unauthorized',
        message: 'trying to access unauthorized resource'
      },
      invalidCredentials: {
        status: 401,
        code: 'invalid_credentials',
        message: 'invalide credentials'
      }
    },
  
    user: {
      invalidCredentials: {
        status: 401,
        code: 'invalid_credentials',
        message: 'wrong username or password'
      },
      deleted: {
        status: 400,
        code: 'user_deleted',
        message: 'user is deleted'
      },
      verificationPending: {
        status: 401,
        code: 'email_verification_pending',
        message: 'email verification pending'
      },
      emailAlreadyExist: {
        status: 400,
        code: 'email_exist',
        message: 'email address already exists'
      },
      phoneAlreadyExist: {
        status: 400,
        code: 'phone_exist',
        message: 'phone number already exists'
      },
      wrongPassword: {
        status: 400,
        code: 'invalid_credentials',
        message: 'Wrong Password'
      },
      newPasswordWrong: {
        status: 400,
        code: 'invalid_credentials',
        message: 'new password should not same as old'
      },
      wrongEmail: {
        status: 400,
        code: 'invalid_credentials',
        message: 'Wrong email address'
      },
      wrongMobile: {
        status: 400,
        code: 'invalid_credentials',
        message: 'Wrong mobile number'
      },
      otp: {
        status: 400,
        code: 'invalid_credentials',
        message: 'Wrong Otp'
      },
      oldPasswordWrong: {
        status: 400,
        code: 'invalid_credentials',
        message: 'Old Password not match'
      },
      emailNotFound: {
        status: 400,
        code: 'email_not_found',
        message: "We can't find your email."
      }
    },
  
    session: {
      notFound: {
        status: 404,
        code: 'session_not_found',
        message: 'session is not found'
      },
      notDeletable: {
        status: 400,
        code: 'session_not_deletable',
        message: 'session not deletable'
      },
      expired: {
        status: 401,
        code: 'session_expired',
        message: 'session is already expired'
      }
    }
}
  

rolePermissions = {
  tasks: [
    { name: 'Add', value: 'ADD_TASK' },
    { name: 'Edit', value: 'EDIT_TASK' },
    { name: 'Delete', value: 'DELETE_TASK' },
    { name: 'View', value: 'VIEW_TASK' }
  ],

  employees: [
    { name: 'Add', value: 'ADD_EMPLOYEE' },
    { name: 'Edit', value: 'EDIT_EMPLOYEE' },
    { name: 'Delete', value: 'DELETE_EMPLOYEE' },
    { name: 'View', value: 'VIEW_EMPLOYEE' }
  ],

  dailyUpdates: [
    // { name: 'Add', value: 'ADD_UPDATE' },
    // { name: 'Edit', value: 'EDIT_UPDATE' },
    // { name: 'Delete', value: 'DELETE_UPDATE' },
    { name: 'View', value: 'VIEW_UPDATE' },
    { name: 'E-mail', value: 'RECIEVE_MAIL'}
  ],

  devices: [
    { name: 'Add', value: 'ADD_DEVICE' },
    { name: 'Edit', value: 'EDIT_DEVICE' },
    { name: 'Delete', value: 'DELETE_DEVICE' },
    { name: 'View', value: 'VIEW_DEVICE' }
  ],

  clients: [
    { name: 'Add', value: 'ADD_CLIENT' },
    { name: 'Edit', value: 'EDIT_CLIENT' },
    { name: 'Delete', value: 'DELETE_CLIENT' },
    { name: 'View', value: 'VIEW_CLIENT' }
  ],

  projects: [
    { name: 'Add', value: 'ADD_PROJECT' },
    { name: 'Edit', value: 'EDIT_PROJECT' },
    { name: 'Delete', value: 'DELETE_PROJECT' },
    { name: 'View', value: 'VIEW_PROJECT' }
  ],
  technologies: [
    { name: 'Add ', value: 'ADD_TECHNOLOGY' },
    { name: 'Edit ', value: 'EDIT_TECHNOLOGY' },
    { name: 'Delete ', value: 'DELETE_TECHNOLOGY' },
    { name: 'View ', value: 'VIEW_TECHNOLOGY' }
  ],


  requests: [
    { name: 'Add', value: 'ADD_REQUEST' },
    { name: 'Edit', value: 'EDIT_REQUEST' },
    { name: 'Delete', value: 'DELETE_REQUEST' },
    { name: 'View', value: 'VIEW_REQUEST' }
  ],


}

  
  module.exports = {
    errors,
    rolePermissions
  }
  