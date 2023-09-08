'use strict'
const config = require('config')

const commonTemplate = configObj => {
  return `
    <body>
    <div style="background-color="#000a03",
                color= "#fff";
                padding= "20px";
                max-width= "500px";
                margin= "0px auto";">
        <table style="width= 100%;" >
            <tbody>
                <tr>
                    <td>
                        Hello, Sir
                    </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                    <td>
                        ${configObj.message}
                    </td>
                </tr>
                <tr><td style="height: 20px;"></td></tr>
                <tr>
                    <td>
                        <table style="width= 100%;">
                            <tbody>
                                <tr>
                                    <td style="padding: 10px 0px 10px 10px;">
                                        <a style="padding= "10px";
                                        background-color= "#1ed760";
                                        color= "#fff";
                                        white-space= "nowrap";
                                        border-radius= "36px";
                                        width= "150px";
                                        display= "flex";
                                        align-items= "center";
                                        justify-content= "center";
                                        text-decoration="none";" href="${config.console_url}/over-time/${configObj.id}" style="margin-left: auto;">View details</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table style="width= 100%;">
                            <tbody>
                                <tr>
                                    <td style="padding: 10px 10px 10px 0px;">
                                        <span style="display: block; max-width: 250px; margin: 0px auto;"><img src="https://www.techivies.com/images/best-ecommerce-development-company.gif?auto=format&fit=max&w=1920"/ style="max-width: 100%;"></span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
    `
}

const linkStyle = `font-weight: 500; font-size: 16px; text-decoration: underline; color: #0079CF; cursor: pointer;`

module.exports = {
  commonTemplate,
  linkStyle
}
