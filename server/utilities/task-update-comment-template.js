'use strict'
const moment = require('moment')


const taskUpdateCommentTemplate = configObj => {
    let header = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style type="text/css">
            a:hover {
                text-decoration: underline !important;
            }
        </style>
    </head>
    <body marginheight="0" topmargin="0" marginwidth="0" leftmargin="0" style="margin: 0px; background-color: #f2f3f8;">
        <table cellspacing="0" border="0" cellpadding="0" width="100%"
            style="font-family: 'Open Sans', sans-serif; background-color: #f2f3f8;">
            <tbody>
                <tr>
                    <td style="height:80px"></td>
                </tr>
                <tr>
                    <td style="height:20px"></td>
                </tr>
                <tr>
                    <td>
                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                            style="max-width:670px; background:#fff; border-radius:3px; text-align:center">
                            <tbody>
                                <tr>
                                    <td style="text-align:left; padding:35px 35px; background-color:#fff">
                                        <a href="">
                                            <img style="width: 200px; 
                                            padding: 10px; background-image: url(https://i.stack.imgur.com/NTooR.png)"
                                                src="https://ethicalcode-assets.s3-us-west-2.amazonaws.com/profile/796_178_techivies-logo.png"
                                                alt="logo">
                                        </a>
                                    </td>
                                </tr>
                                  `



    let centerText = ` <tr>
<td style="padding: 0px 35px">
    <p style="font-size: 22px; margin: 0px 0px 18px"> <b> Comments on Task Update. <span
                style="color:#1ed760"></span></b></p>
    <span style="text-align: left">`

    let centerText1 = ''
        
    if (configObj && configObj.comments && configObj.comments.length) {
        for (let index = 0; index < configObj.comments.length; index++) {
            const element = configObj.comments[index];
            const comment = `<p style="margin: 5px 0px;"> <b> ${element.commentedBy.name}</b> : ${element.comment} <br> </p>`
            let replyComment = ''
            if (element.commentReply && element.commentReply.length) {
                for (let i = 0; i < element.commentReply.length; i++) {
                    const reply = element.commentReply[i];
                    const commentReply = `<p style="margin-left: 35px;"> <b> ${reply.repliedBy.name}</b> : ${reply.repliedText} <br> </p>`
                    replyComment = replyComment.concat(commentReply)
                }
            }
            centerText1 = centerText1.concat(comment)
            centerText1 = centerText1.concat(replyComment)

        }
            
        }
        
     let text =   `</span>
    <ul style="text-align: left;padding-left: 26px;
    margin-top: 5px;">`

    
    let centerText3 = ` </ul>
                    </td>
                    </tr>`


    let footer = `<tr>
    <td style="height: 40px"></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    <tr>
    <td style="height: 20px"></td>
    </tr>
    <tr>
    <td style="text-align:center">
    <p style="font-size:14px;color:rgba(69,80,86,0.7411764705882353);line-height:18px; margin:0 0 0">
    &copy; <strong><a href="http://www.techivies.com" target="_blank">www.techivies.com</a></strong>
    </p>
    </td>
    </tr>
    <tr>
    <td style="height: 80px"></td>
    </tr>
    </tbody>
    </table>
    </body>
    </html>`


    return header + centerText + centerText1 + text + centerText3 + footer;

}

module.exports = {
    taskUpdateCommentTemplate,
}
