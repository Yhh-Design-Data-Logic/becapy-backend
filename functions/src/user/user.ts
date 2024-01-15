import { onCall, onRequest } from "firebase-functions/v2/https";
import { sendOTPEmail, makeCode } from "../mailer";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
// import * as auth from "firebase-auth";
import "../index";

const shopifyApiKey = "d331707162e8c5ec410ff2138e427c2e";
const shopifyPassword = "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";
const shopifyShopName = "209c5e-2.myshopify.com";
const apiVersion = "2023-10";

export const sendOTP = onCall(async (request) => {
    const email = request.data.email;
    sendOTPEmail(email, "000000");
});

export const registerNormalUser = functions.auth.user().onCreate(async (user, context) => {
    var code = makeCode(6);
    await admin
        .firestore()
        .collection("users")
        .doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            is_verify: false,
            is_corporate: false,
            last_verification_code: code,
        });
    sendOTPEmail(user.email ?? "", code);
});

export const updateUserDoc = onCall(async (request) => {
    var password = request.data.password;
    var firstName = request.data.first_name;
    var lastName = request.data.last_name;
    var mobilePhone = request.data.mobile_phone ?? "";
    var uid = request.data.uid;
    var email = request.data.email;
    console.log("ffff = " + firstName);
    console.log("llll = " + lastName);
    console.log("emai = " + email);
    console.log("mobilePhone = " + mobilePhone);
    console.log("uid = " + uid);
    await registerWithShopify(email, firstName, lastName, password).then(async (result) => {
        console.log("result = " + result);
        await admin
            .firestore()
            .collection("users").doc(uid).update({
                password: password,
                first_name: firstName,
                last_name: lastName,
                mobile_phone: mobilePhone,
                shopify_user_id: result
            });
    });
});

export const verifyAccount = onCall(async (request) => {
    var code = request.data.code;
    var uid = request.data.uid;

    var isCorrect = false;
    await admin
        .firestore()
        .collection("users")
        .doc(uid).get().then(async (result: any) => {
            if (result.data()["last_verification_code"] === code) {
                isCorrect = true;
                await admin
                    .firestore()
                    .collection("users")
                    .doc(uid).update({
                        is_verify: true,
                    });
            }
        });
    return isCorrect ? "Account Has Been Verified!" : "Code Is Not Correct!";
});

const registerWithShopify = async (email: String, firstName: String, lastName: String, password: String) => {
    const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
    const url = `https://${shopifyShopName}/admin/api/${apiVersion}/customers.json`;
    var id = "NULL";
    await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "customer": {
                "email": email,
                "password": password,
                "password_confirmation": password,
                "first_name": firstName,
                "last_name": lastName
            }
        })
    }).then(async (result: any) => {
        var data = await result.json();
        console.log("rrrrr = " + data);
        id = data["customer"].id;
        console.log("id = " + id);
    });
    return id;
};

export const registerWithFirebase = onRequest(async (request, response) => {
    console.log("request.body = " + JSON.stringify(request.body));
    console.log("request.body.email = " + request.body.email);

    await admin.auth().createUser({
        "email": request.body.email,
        "password": "123456789$$",
    }).then(async (result) => {
        var code = makeCode(6);
        await admin
            .firestore()
            .collection("users")
            .doc(result.uid).set({
                uid: result.uid,
                email: request.body.email,
                is_verify: false,
                is_corporate: false,
                last_verification_code: code,
                password: "123456789$$",
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                mobile_phone: "000",
                shopify_user_id: request.body.id
            });
        await sendOTPEmail(request.body.email ?? "", code);

    });
});

export const getUserById = onCall(async (request) => {
    var uid = request.data.uid;
    var data = new Map();
    await admin
        .firestore()
        .collection("users")
        .doc(uid).get().then((result: any) => {
            data = result.data();
        });
    return data;
});

export const updateUserInformation = onCall(async (request) => {
    var uid = request.data.uid;
    var firstName = request.data.first_name;
    var lastName = request.data.last_name;
    var profileUrl = request.data.profile_url ?? "";

    await admin
        .firestore()
        .collection("users")
        .doc(uid).update({
            "first_name": firstName,
            "last_name": lastName,
            "profile_url": profileUrl
        });
});

export const resendOTP = onCall(async (request) => {
    var code = makeCode(6);
    var email = request.data.email;
    var uid = request.data.uid;
    var message = "NULL";

    await admin.firestore().collection("users").doc(uid).get().then(async (result: any) => {
        var lastTimeStamp = result.data()["last_send_otp_timestamp"] ?? 0;
        console.log("lastTimeStamp = " + lastTimeStamp);

        if (lastTimeStamp === 0) {
            console.log("==== 0");
            var last_code = await sendOTPEmail(email, code);
            await admin.firestore().collection("users").doc(uid).update({
                "last_send_otp_timestamp": Date.now(),
                "last_verification_code": last_code
            });
            message = "SENT!";
        } else {
            console.log("mins1 = " + lastTimeStamp);
            console.log("mins2 Date.now() = " + Date.now());
            var mins = (lastTimeStamp - Date.now()) / 60;
            console.log("mins = " + mins);
            if (mins > 30) {
                console.log("mins > 30");
                var last_code = await sendOTPEmail(email, code);
                await admin.firestore().collection("users").doc(uid).update({
                    "last_send_otp_timestamp": Date.now(),
                    "last_verification_code": last_code
                });
                message = "SENT!";
            } else {
                console.log("NONO");
                message = "SENT, LESS 30!";
            }
        }

    });
    return message;
});

export const triggerWhenUserDeleted = functions.auth.user().onDelete(async (user, context) => {
    const snapshot = await admin.firestore().collection("qr_codes").where("uid", "==", user.uid).get();
    await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
});