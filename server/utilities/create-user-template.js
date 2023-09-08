'use strict'
const createUserTemplate = (user, b) =>{
  let mailHtml = `<p>Hello ${user.name}, Welcome to you Techivies Solution Pvt. Ltd.</p>
                  <p>your Login detail are mention in below</p>
                  <p> Email : ${user.companyEmail} </p>
                  <p> Password : ${b} </p>
                  <p>Thank</p>
                  <p>Regard</p>
                  <p>Admin</p>`
  return mailHtml;
}

module.exports = {
  createUserTemplate,
}
