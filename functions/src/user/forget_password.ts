import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { sendOTPEmail, makeCode } from "../mailer";

export const sendPasswordOTP = onCall(async (request) => {
    var email = request.data.email;
    var code = makeCode(6);
    var uid = (await admin.auth().getUserByEmail(email)).uid;
    console.log("uid ==== "+uid);
    console.log("-------->");
    var user: any = await admin.firestore().collection("users").doc(uid).get();
    var isExists = (user).exists;
    console.log("isExists = " + isExists);
    if(isExists){
        await sendOTPEmail(email, code);
        await admin.firestore().collection("users").doc(uid).update({
            "last_password_otp": code
        });
        return {"id": user.id, "email": user.data()["email"]};
    } else {
        return "Email not found!";
    }
});

export const checkPasswordOTP = onCall(async (request) => {
    var otp = request.data.otp;
    var uid = request.data.uid;
    var message = "";
    await admin.firestore().collection("users").doc(uid).get().then((result: any) => {
        if(result.data()["last_password_otp"] === otp){
            message = "Correct!";
        } else {
            message = "Incorrect!";
        }
    });
    return message;
});

export const updatePassword = onCall(async (request) => {
    await admin.auth().updateUser(request.data.uid, {"password": request.data.password});
    await updateShopifyCustomerPasssword(request.data.uid, request.data.password);
});

const updateShopifyCustomerPasssword = async (uid: any, password: any) => {
    console.log("OOOOOOO SHOPIFY!");
    var message = "-";
    await admin.firestore().collection("users").doc(uid).get().then(async (result: any) => {
        var shopifyUID = result.data()["shopify_user_id"];


        try {
            const response = await fetch(`https://209c5e-2.myshopify.com/admin/api/2023-10/customers/${shopifyUID}.json`, { 
                method: 'PUT', 
                headers: {
                  'Content-type': 'application/json'
                }, 
                body: JSON.stringify({
                    "customer": {
                        "id": shopifyUID,
                        "password": password,
                        "password_confirmation": password,
                    }
                })
              });
              const resData = await response.json();
              console.log("response = " + resData);
              console.log("shopifyUID = " + shopifyUID);
              await admin.firestore().collection("users").doc(uid).update({
                "password": password
              });
              message = "Updated!";
              return resData; 
        } catch(e){
            console.log("exception = " + e);
        }
    });

    return message
}