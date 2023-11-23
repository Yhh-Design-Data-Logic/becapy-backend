import { onCall } from "firebase-functions/v2/https";
import { sendOTPEmail, makeCode } from "../mailer";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import "../index";

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
    var fullName = request.data.full_name;
    var mobilePhone = request.data.mobile_phone;
    var uid = request.data.uid;

    await admin
        .firestore()
        .collection("users").doc(uid).update({
            password: password,
            full_name: fullName,
            mobile_phone: mobilePhone
        });
});

// export const registerCorporateUser = functions.auth.user().onCreate((user, context) => {
//     admin
//         .firestore()
//         .collection("users")
//         .doc(user.uid).set({
//             uid: user.uid,
//             email: user.email,
//             password: context.params.password,
//             full_name: context.params.firstName,
//             is_verify: false,
//             is_corporate: false,
//             last_verification_code: "000000",
//             mobile_phone: context.params.mobile_phone
//         });
// });

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

