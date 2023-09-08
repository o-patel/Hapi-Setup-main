'use strict'
const image = `./techivies-logo.png`
const commonTemplate = configObj => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        @font-face {
            font-family: "HKGrotesk-Regular";
            src: url("./fonts/HKGrotesk-Regular.eot");
            src: url("./fonts/HKGrotesk-Regular.eot?#iefix") format("embedded-opentype"),
                url("./fonts/HKGrotesk-Regular.woff2") format("woff2"),
                url("./fonts/HKGrotesk-Regular.woff") format("woff"),
                url("./fonts/HKGrotesk-Regular.ttf") format("truetype"),
        }

        @font-face {
            font-family: "HKGrotesk-Medium";
            src: url("./fonts/HKGrotesk-Medium.eot");
            src: url("./fonts/HKGrotesk-Medium.eot?#iefix") format("embedded-opentype"),
                url("./fonts/HKGrotesk-Medium.woff2") format("woff2"),
                url("./fonts/HKGrotesk-Medium.woff") format("woff"),
                url("./fonts/HKGrotesk-Medium.ttf") format("truetype"),
        }

        @font-face {
            font-family: 'HKGrotesk-Bold';
            src: url("./fonts/HKGrotesk-Bold.eot");
            src: url("./fonts/HKGrotesk-Bold.eot?#iefix") format("embedded-opentype"),
                url("./fonts/HKGrotesk-Bold.woff2") format("woff2"),
                url("./fonts/HKGrotesk-Bold.woff") format("woff"),
                url("./fonts/HKGrotesk-Bold.ttf") format("truetype"),
        }

        @font-face {
            font-family: "HKGrotesk-SemiBold";
            src: url("./fonts/HKGrotesk-SemiBold.eot");
            src: url("./fonts/HKGrotesk-SemiBold.eot?#iefix") format("embedded-opentype"),
                url("./fonts/HKGrotesk-SemiBold.woff2") format("woff2"),
                url("./fonts/HKGrotesk-SemiBold.woff") format("woff"),
                url("./fonts/HKGrotesk-SemiBold.ttf") format("truetype"),
        }

        @font-face {
            font-family: "Roboto-Regular";
            src: url("./fonts/Roboto-Regular.ttf") format("truetype"),
        }

        @font-face {
            font-family: "Roboto-Medium";
            src: url("./fonts/Roboto-Medium.ttf") format("truetype"),
        }

        @font-face {
            font-family: "Roboto-Black";
            src: url("./fonts/Roboto-Black.ttf") format("truetype"),
        }

        @font-face {
            font-family: "Roboto-Bold";
            src: url("./fonts/Roboto-Bold.ttf") format("truetype"),
        }

        * {
            padding: 0px;
            margin: 0px;
            box-sizing: border-box;
        }

        body {
            margin: 20px;
        }
    </style>
</head>

<body>
    <div
        style="max-width: 850px; background-color: #fff; margin: 0px auto; box-shadow: 1px 1px 15px #1ed7604d; border-radius: 4px; overflow: hidden; padding: 15px;">
        <table style="width: 100%; padding-bottom: 30px;">
            <tbody>
                <tr>
                    <td>
                        <div style="max-width: 200px;">
                            <img  src="https://ethicalcode-assets.s3-us-west-2.amazonaws.com/profile/729_techivies-logo.png" alt="techivies_logo" style="width: 100%;" />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%; text-align: center;">
            <tbody>
                <tr>
                    <td
                        style="font-size: 28px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding-bottom: 5px;">
                        Techivies Solutions Pvt. Ltd.</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding-bottom: 20px;">
                        601, Solitaire Sky, Nr. Hyaat Regency Hotel, Ashram road, Usmanpura Ahmedabad-380014</td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%; border-spacing: 0px; margin-bottom: 20px;" border="1">
            <tbody>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 150px;">
                        Employee Name</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px;">
                        ${configObj.emplooyeeName}</td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%; border-spacing: 0px; margin-bottom: 20px;" border="1">
            <tbody>
                <tr>
                    <td
                        style="font-size: 18px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; text-align: center; background: #d9d9d9;">
                        Payslip Of ${configObj.month}</td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%; border-spacing: 0px; margin-bottom: 20px;" border="1">
            <tbody>
                <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; text-align: center; background: #d9d9d9;"
                        colspan="2">Leave Summary</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Leave Taken</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; text-align: center;">
                        ${configObj.leaveTaken}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        OverTime</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; text-align: center;">
                        ${configObj.overtime}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Monthly Balance</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; text-align: center;">
                        ${configObj.monthlyBalance}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Salary Deduct Days</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; text-align: center;">
                        ${configObj.salaryDeductedDays}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        End Balance</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; text-align: center;">
                        ${configObj.endBalance}</td>
                </tr>
            </tbody>
        </table>

        <table style="width: 100%; border-spacing: 0px;" border="1">
            <tbody>
                <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; text-align: center; background: #d9d9d9;"
                        colspan="3">Salary Summary</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 15px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; background: #d9d9d9;">
                        Discription</td>
                    <td
                        style="font-size: 15px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center; background: #d9d9d9;">
                        Earning</td>
                    <td
                        style="font-size: 15px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center; background: #d9d9d9;">
                        Deduction</td>
                </tr>
            </tbody>
            <tbody>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Basic</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.bacic).toFixed(2)}</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Professional Tax</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.professionalTax).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Esic Employee</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.esicEmployee).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        PF Employee</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.pfEmployee).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Total Deduction</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.totalDeduction).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        HRA</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.hra).toFixed(2)}</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                       -</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        PF Employer</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.pfEmployer).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Esic Employer</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.esicEmployer).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Total Company Contribution</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.totalCompanyContribution).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 14px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%;">
                        Conveyance Allowance</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        ${(configObj.conveyanceAllowace).toFixed(2)}</td>
                    <td
                        style="font-size: 14px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: center;">
                        -</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 16px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; background: #d9d9d9;">
                        Gross Salary</td>
                    <td style="font-size: 16px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: right; font-weight: bold; background: #d9d9d9;"
                        colspan="2">${(configObj.grossSalary).toFixed(2)}</td>
                </tr>
                <tr>
                    <td
                        style="font-size: 16px; font-weight: bold; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 50%; background: #d9d9d9;">
                        Take Home Salary</td>
                    <td style="font-size: 16px; color: #2e2e2e;font-family: 'HKGrotesk-Bold', sans-serif; padding: 5px 10px; width: 25%; text-align: right; font-weight: bold; background: #d9d9d9;"
                        colspan="2">${(configObj.takeHomeSalary).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>

</html>`

}


module.exports = {
    commonTemplate,
}
