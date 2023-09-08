'use strict'
const config = require('config')
const taskUpdateTemplate = configObj => {
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

    let mailHtml = ` <p style="margin:5px 0;font-size: 22px; margin: 0px 0px 18px"> <b> Task update from <span style="color: #1ED760">${configObj.name}</span> </b>  </p><span style="text-align : left"> 
    <p style="text-align:start;style="margin:18px 0""> Hello Sir,  <br></p>
 <p style="margin:5px 0">    My Task detail are below. <br></p>
  <p style="margin:5px 0"> <b> Title</b> : ${configObj.task} <br> </p>
  ${configObj.description ? `<p style="margin:5px 0"> <b>Description </b>: ${configObj.description} <br> </p>` : ''} 
  <p style="margin:5px 0 10px"> <b> Tasks</b> : </p>
  </span>
              <table style="width: 100%; border-spacing: 0px; border-collapse: collapse;" border="1">
              <tr>
                <th style="padding: 6px;">Project</th>
                <th style="padding: 6px;">Task</th>
                <th style="padding: 6px;">Status</th>
                <th style="padding: 6px;">Time</th>
            </tr>
              `

    let totalHrs = 0
    if (configObj.taskData && configObj.taskData.length) {
        for (let index = 0; index < configObj.taskData.length; index++) {
            const element = configObj.taskData[index];
            if (element.task && element.taskStatus) { 
                totalHrs += element.hours ? element.hours : 0
                const text2 = `                  
                <tr>
              <td style="padding: 6px; white-space: nowrap;">${element.project}</td>
              <td style="text-align: center : pointer; padding: 6px;"><a href=${link}?id=${element.taskId} target="_blank">${element.task}</a></td>
              <td style="padding: 6px;">${element.taskStatus.split('_')
                        .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
                        .join(' ')}</td>
              <td  style="padding: 6px; white-space: nowrap;">${element.hours ? element.hours : 0} Hr</td>

              </tr>
             
              `
                mailHtml = mailHtml.concat(text2)
            }
        }
    } else {
        mailHtml = mailHtml.concat(`<tr><td   style="text-align :center;font-size: 16px; color: #000c; font-family: Rubik,sans-serif; padding: 10px; font-weight: 600;padding: 10px; white-space: nowrap;" colspan=4> No task Found </td> </tr>`)
    }

    mailHtml = mailHtml.concat(`
    <tr>                                                                                                                    
    <td colspan="3" style="font-size: 16px; color: #000c; font-family: Rubik,sans-serif; padding: 6px; font-weight: 600; text-align: left;">Total Hours</td>
    <td style="font-size: 16px; color: #000c; font-family: Rubik,sans-serif; padding: 6px; font-weight: 600;white-space: nowrap;">${totalHrs ? parseFloat(totalHrs).toFixed(2) : 0}  Hr</td>
    </tr></table>`)
    mailHtml = mailHtml.concat(`<span style="text-align : left"> 
     <p style="margin:20px 0 7px 0">Best Regard,</p>

    <p>${configObj.name}</p> </span>`)
    return header + mailHtml + footer;

}

module.exports = {
    taskUpdateTemplate,
}
