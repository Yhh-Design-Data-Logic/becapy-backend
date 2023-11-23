import * as nodemailer from "nodemailer";

export const sendOTPEmail = async (email: string) =>  {
    var transporter = nodemailer.createTransport({
        host: "live.smtp.mailtrap.io",
        port: 587,
        auth: {
            user: "api",
            pass: "d49a6ab87b5f046d4b6ee432cca9244c"
        }
    });
    await transporter.sendMail({
        from: "bacappy@da2ova.com",
        to: email,
        subject: "BeCapy account OTP Verification Code", // Subject line
        text: "BeCapy account OTP Verification Code", // plain text body
        html: `<b>BeCapy account OTP Verification Code is: ${makeCode(6)}</b>`, // html body
    });
};

function makeCode(length: number) {
    let result = '';
    const characters = '6213831738399302021937136317383981283183837313910440987654224128363531317339484739092730624110384';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}