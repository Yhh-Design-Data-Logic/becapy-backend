/* eslint-disable max-len */
/* eslint-disable no-var */
import * as nodemailer from "nodemailer";

export const sendOTPEmail = async (email: string, code: string) => {
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
        html: `<b>BeCapy account OTP Verification Code is: ${code}</b>`, // html body
    });
    return code;
};

export const sendSubscribeCode = async (code: string, email: string) => {
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
        subject: "BeCapy discount code", // Subject line
        text: "10% OFF Discount code is in your hand!.", // plain text body
        html: `<b>BeCapy 10% OFF Discount Code is: ${code}</b>`, // html body
    });
    return code;
}


export const sendQRCodeCreds = async (serial: string, password: string, email: string) => {
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
        subject: "BeCapy QR Code creds:", // Subject line
        text: "Just enter the creds in Claim QR Code page to own it!", // plain text body
        html: `<br><b>Serial: ${serial}</b></br> <br><b>Password: ${password}</b></br>`, // html body
    });
    return serial;
}

export const sendSharingMessageToEmail = async (
    sharedEmail: string,
    serial: string,
    password: string,
    email: string,
    withRegisterLink: boolean) => {
    var transporter = nodemailer.createTransport({
        host: "live.smtp.mailtrap.io",
        port: 587,
        auth: {
            user: "api",
            pass: "d49a6ab87b5f046d4b6ee432cca9244c"
        }
    });
    if (withRegisterLink) {
        await transporter.sendMail({
            from: "bacappy@da2ova.com",
            to: sharedEmail,
            subject: `Congratulations!, New QR Code Added To Your Library`, // Subject line
            text: "Just enter the creds in Claim QR Code page to own it!", // plain text body
            html: `<h1>User with this email ${email} shared a QR Code with you!\n</h1><br><h2>Serial: ${serial}</h2></br> <br><h2>Password: ${password}</h2></br><h3>Register Here: https://becapy-new.webflow.io/authentication/register</h3>`, // html body
        });
    } else {
        await transporter.sendMail({
            from: "bacappy@da2ova.com",
            to: sharedEmail,
            subject: `Congratulations!, New QR Code Added To Your Library`, // Subject line
            text: "Just enter the creds in Claim QR Code page to own it!", // plain text body
            html: `<h2>User with this email ${email} shared a QR Code with you!\n</h2><br><h3>Serial: ${serial}</h3> <h3>\nPassword: ${password} </h3></br>`, // html body
        });
    }

    return serial;
}


export const makeCode = (length: number) => {
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