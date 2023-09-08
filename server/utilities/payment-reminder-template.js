'use strict'
const config = require('config')
const moment = require('moment')



const commonTemplate = configObj => {
    const currency = [{
        name: "₹ Indian Rupee (INR)",
        sortName: "Indian Rupee",
        symbol: "₹",
        value: "INR"
      },
      {
        name: "€ Euro (EUR)",
        sortName: "Euro",
        symbol: "€",
        value: "EUR"
      },
      {
        name: "$ Canadian Dollar (CAD)",
        sortName: "Canadian Dollar",
        symbol: "$",
        value: "CAD"
      },
      {
        name: "$ US Dollar (USD)",
        sortName: "US Dollar",
        symbol: "$",
        value: "USD"
      },{
        name: "$ Australian Dollar (AUD)",
        sortName: "Australian Dollar",
        symbol: "$",
        value: "AUD"
      }]
    function convert(str, tz) {
        return moment.tz(str, tz).format('DD/MM/YYYY')
    }

    function getSymbol(value){
        if(value){
            const obj = currency.filter(r=>r.value === value)
            if(obj && obj.length){
                return obj[0].symbol
            }
            return ''
        } else {
            return ''
        }
    }

    const link = `${config.baseUrl}/admin/tasks`
    let header = `
  <!doctype html>
  <html lang="en-US">
  
  <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <title>Reset Password Email Template</title>
      <meta name="description" content="Reset Password Email Template.">
      <style type="text/css">
          a:hover {
              text-decoration: underline !important;
          }
      </style>
  </head>
  
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
      <!--100% body table-->
      <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
          style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
          <tr>
              <td>
                  <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                      align="center" cellpadding="0" cellspacing="0">
                      <tr>
                          <td style="height:80px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td style="height:20px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td>
                              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                  style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                  <tr>
                                      <td style="text-align:left; padding: 35px 35px;background-color: white">
                                          <a href="">
                                              <img style="width: 200px; 
                                              padding: 10px;background-image: url(https://i.stack.imgur.com/NTooR.png)" src="https://ethicalcode-assets.s3-us-west-2.amazonaws.com/profile/796_178_techivies-logo.png" alt="logo">
                                          </a>
                                      </td>
                                  </tr>
                                  <tr> 
                                  <td style="padding:0 35px;">
                                  `
    //   <h1
    //       style="color:#1e1e2d; font-weight:500; margin:0;font-size:22px;font-family:'Rubik',sans-serif;">
    //   Task Update from ${configObj.name} </h1>

    let footer = `
      </td>
      </tr>
      <tr>
          <td style="height:40px;">&nbsp;</td>
      </tr>
      </table>
      </td>
      <tr>
      <td style="height:20px;">&nbsp;</td>
      </tr>
      <tr>
      <td style="text-align:center;">
      <p
      style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
      &copy; <strong>www.techivies.com</strong></p>
      </td>
      </tr>
      <tr>
      <td style="height:80px;">&nbsp;</td>
      </tr>
      </table>
      </td>
      </tr>
      </table>
      <!--/100% body table-->
      </body>

      </html>`
      const date = convert(configObj.date,config.constants.DEFAULT_TIMEZONE)
    let mailHtml = ` <p style="margin:5px 0;font-size: 22px; margin: 0px 0px 18px"> <b> Payment Reminder For  <span
    style="color:#1ed760">${date}</span> </b>  </p><span style="text-align : left"> 
    <p style="text-align:start;style="margin:18px 0""> <br></p>
    <p style="margin:5px 0 10px"> <b> details </b> : </p>
    </span>
              <table style="width: 100%; border-spacing: 0px; border-collapse: collapse;" border="1">
              <tr>
                <th style="padding: 6px;">Project</th>
                <th style="padding: 6px;">Client</th>
                <th style="padding: 6px;">Amount</th>
            </tr>
              `

    if (configObj.data && configObj.data.length) {
        for (let index = 0; index < configObj.data.length; index++) {
            const element = configObj.data[index];
            const symbol = getSymbol(element.symbol)
                const text2 = `                  
                <tr>
              <td style="padding: 6px; white-space: nowrap;">${element.projectName}</td>
              <td style="padding: 6px; white-space: nowrap;">${element.clientName}</td>
              <td style="padding: 6px; white-space: nowrap;"> ${symbol} ${element.amount}</td>
              </tr>
             
              `
                mailHtml = mailHtml.concat(text2)
        }
    } else {
        mailHtml = mailHtml.concat(`<tr><td   style="text-align :center;font-size: 16px; color: #000c; font-family: Rubik,sans-serif; padding: 10px; font-weight: 600;padding: 10px; white-space: nowrap;" colspan=4> No task Found </td> </tr>`)
    }
    return header + mailHtml + footer;

}

module.exports = {
  commonTemplate,
}
