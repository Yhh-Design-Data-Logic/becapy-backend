/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { onCall, onRequest } from "firebase-functions/v2/https";
import { sendOTPEmail, makeCode, sendSubscribeCode } from "../mailer";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
// import * as auth from "firebase-auth";
import "../index";

// const shopifyApiKey = "d331707162e8c5ec410ff2138e427c2e";
// const shopifyPassword = "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";

const shopifyApiKey = "c0c79b8a5ab85c3588827e799cb7594c";
const shopifyPassword = "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";

const shopifyShopName = "209c5e-2.myshopify.com";
const apiVersion = "2023-10";
const subscribePriceRuleId = 1123431841859;
const subscribeDiscountCode = "2W9GVDVJM3MJ";

export const sendOTP = onCall(async (request) => {
    const email = request.data.email;
    sendOTPEmail(email, "000000");
});

export const registerNormalUser = functions.auth
    .user()
    .onCreate(async (user, context) => {
        const code = makeCode(6);
        await admin.firestore().collection("users").doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            is_verify: false,
            is_corporate: false,
            last_verification_code: code,
        });
        sendOTPEmail(user.email ?? "", code);
    });

export const updateUserDoc = onCall(async (request) => {
    const password = request.data.password;
    const firstName = request.data.first_name;
    const lastName = request.data.last_name;
    const mobilePhone = request.data.mobile_phone ?? "";
    const uid = request.data.uid;
    const email = request.data.email;
    console.log("ffff = " + firstName);
    console.log("llll = " + lastName);
    console.log("emai = " + email);
    console.log("mobilePhone = " + mobilePhone);
    console.log("uid = " + uid);
    await registerWithShopify(email, firstName, lastName, password).then(
        async (result) => {
            console.log("result = " + result);
            await admin.firestore().collection("users").doc(uid).update({
                password: password,
                first_name: firstName,
                last_name: lastName,
                mobile_phone: mobilePhone,
                shopify_user_id: result,
            });
        }
    );
});

export const verifyAccount = onCall(async (request) => {
    const code = request.data.code;
    const uid = request.data.uid;

    let isCorrect = false;
    await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then(async (result: any) => {
            if (result.data()["last_verification_code"] === code) {
                isCorrect = true;
                await admin.firestore().collection("users").doc(uid).update({
                    is_verify: true,
                });
            }
        });
    return isCorrect ? "Account Has Been Verified!" : "Code Is Not Correct!";
});

const registerWithShopify = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string
) => {
    console.log("shopifyApiKey = " + shopifyApiKey);
    console.log("shopifyPassword = " + shopifyPassword);
    const authHeader = `Basic ${Buffer.from(
        `${shopifyApiKey}:${shopifyPassword}`
    ).toString("base64")}`;
    const url = `https://${shopifyShopName}/admin/api/${apiVersion}/customers.json`;
    let id = "NULL";
    await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": authHeader,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            customer: {
                email: email,
                password: password,
                password_confirmation: password,
                first_name: firstName,
                last_name: lastName,
            },
        }),
    }).then(async (result: any) => {
        const data = await result.json();
        console.log("rrrrr = " + data);
        console.log("data_ccccc = " + data["customer"]);
        id = data["customer"].id;
        console.log("id = " + id);
    });
    return id;
};

export const registerWithFirebase = onRequest(async (request, response) => {
    console.log("request.body = " + JSON.stringify(request.body));
    console.log("request.body.email = " + request.body.email);

    await admin
        .auth()
        .createUser({
            email: request.body.email,
            password: "123456789$$",
        })
        .then(async (result) => {
            const code = makeCode(6);
            await admin.firestore().collection("users").doc(result.uid).set({
                uid: result.uid,
                email: request.body.email,
                is_verify: false,
                is_corporate: false,
                last_verification_code: code,
                password: "123456789$$",
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                mobile_phone: "000",
                shopify_user_id: request.body.id,
            });
            await sendOTPEmail(request.body.email ?? "", code);
        });
});

export const getUserById = onCall(async (request) => {
    const uid = request.data.uid;
    let data = new Map();
    await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then((result: any) => {
            data = result.data();
        });
    return data;
});

export const updateUserInformation = onCall(async (request) => {
    const uid = request.data.uid;
    const firstName = request.data.first_name;
    const lastName = request.data.last_name;
    const profileUrl = request.data.profile_url ?? "";

    await admin.firestore().collection("users").doc(uid).update({
        first_name: firstName,
        last_name: lastName,
        profile_url: profileUrl,
    });
});

export const resendOTP = onCall(async (request) => {
    const code = makeCode(6);
    const email = request.data.email;
    const uid = request.data.uid;
    let message = "NULL";

    await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then(async (result: any) => {
            const lastTimeStamp = result.data()["last_send_otp_timestamp"] ?? 0;
            console.log("lastTimeStamp = " + lastTimeStamp);

            if (lastTimeStamp === 0) {
                console.log("==== 0");
                var last_code = await sendOTPEmail(email, code);
                await admin.firestore().collection("users").doc(uid).update({
                    last_send_otp_timestamp: Date.now(),
                    last_verification_code: last_code,
                });
                message = "SENT!";
            } else {
                console.log("mins1 = " + lastTimeStamp);
                console.log("mins2 Date.now() = " + Date.now());
                const mins = (lastTimeStamp - Date.now()) / 60;
                console.log("mins = " + mins);
                if (mins > 30) {
                    console.log("mins > 30");
                    var last_code = await sendOTPEmail(email, code);
                    await admin.firestore().collection("users").doc(uid).update({
                        last_send_otp_timestamp: Date.now(),
                        last_verification_code: last_code,
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

export const triggerWhenUserDeleted = functions.auth
    .user()
    .onDelete(async (user, context) => {
        const snapshot = await admin
            .firestore()
            .collection("qr_codes")
            .where("uid", "==", user.uid)
            .get();
        await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
    });


// FOR DISCOUNTS
export const subscribeWithSystem = onCall(async (request) => {
    const previousIDs = await getPrerequisiteCustomerIDs();
    // const shopifyUID = request.query.shopify_uid;
    const shopifyUID: any = await getShopifyUIDFromEmail(request.data.email ?? "");
    console.log("shopifyUID = " + shopifyUID);
    console.log("previousIDs = " + previousIDs);
    if (shopifyUID.length == 0) {
        return "User not found!";
    } else if (previousIDs.includes(Number(shopifyUID[0]["shopify_user_id"]))) {
        console.log("shopifyUID[0] = " + shopifyUID[0]["shopify_user_id"]);
        return "This email already subscribed!";
    } else {
        console.log("shopifyUID[0].-- = " + shopifyUID["shopify_user_id"]);
        previousIDs.push(Number(shopifyUID[0]["shopify_user_id"]));
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/price_rules/${subscribePriceRuleId}.json`;
        console.log("previousIDs = " + previousIDs);
        await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": authHeader,
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                price_rule: {
                    prerequisite_customer_ids: previousIDs,
                },
            }),
        }).then(async (result: any) => {
            console.log("SUCCESS");
            console.log("result = " + result);
            sendSubscribeCode(subscribeDiscountCode, shopifyUID[0]["email"]);
            await admin.firestore().collection("subscribers").doc().set({
                "subscriber_id": shopifyUID[0]["shopify_user_id"],
            });
            return "Alright!";
        }).catch((e) => {
            console.log("EEERRRROR = " + e);
            return "Error!";
            return e;
        });
        return "END!";
    }
});

const getPrerequisiteCustomerIDs = async () => {
    const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
    const url = `https://${shopifyShopName}/admin/api/${apiVersion}/price_rules/${subscribePriceRuleId}.json`;
    let ids: number[] = [];
    await fetch(url, {
        headers: {
            Authorization: authHeader,
        },
        method: "GET",
    }).then(async (result: any) => {
        const object = await result.json();
        ids = object.price_rule.prerequisite_customer_ids;
    });
    return ids;
};

const getShopifyUIDFromEmail = async (email: any) => {
    const r: any = [];
    await admin.firestore()
        .collection("users").where("email", "==", email.toLowerCase()).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                r.push({
                    "shopify_user_id": doc.data()["shopify_user_id"],
                    "email": doc.data()["email"],
                });
                console.log(doc.id, " => ", doc.data());
            });
        });
    // users.docs.forEach((doc) => {
    //     if (doc.data()["email"] === email) {
    //         return doc.data()["shopify_user_id"];
    //     } else {
    //         return 0;
    //     }
    // });
    return r;
};

// For Orders
export const getUserOrders = onCall(async (request) => {
    const uid = request.data.uid;
    const fData: any = [];
    console.log("uid = " + uid);
    await admin.firestore().collection("users").doc(uid).get().then(async (userR: any) => {
        console.log("userR.data()[shopify_user_id] = " + userR.data()["shopify_user_id"]);


        await admin.firestore().collection("orders").where("shopify_customer_id", "==", userR.data()["shopify_user_id"]).get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const order = JSON.parse(doc.data()["shopify_json_body"]);
                    const product = JSON.parse(doc.data()["first_order_product"]);

                    fData.push({
                        "id": doc.data()["shopify_order_id"],
                        "total_amount": order.current_total_price_set.shop_money.amount,
                        "product_image": product.product.images[0].src,
                        "product_title": product.product.title,
                        "created_at": order.created_at,
                    });
                    console.log(doc.id, " => ", doc.data());
                });
            });


        // await admin.firestore().collection("orders")
        //     .where("shopify_customer_id", "==", Number(userR.data()["shopify_user_id"]))
        //     .get().then((result: any) => {
        //         console.log("ddddd = " + result.docs.length);
        //         console.log("result = " + result);
        //         result.docs.forEach((doc: any) => {
        //             const order = JSON.parse(doc.data()["shopify_json_body"]);
        //             const product = JSON.parse(doc.data()["first_order_product"]);
        //             console.log("iddd = " + doc.data()["shopify_order_id"]);

        //             fData.push({
        //                 "id": doc.data()["shopify_order_id"],
        //                 "total_amount": order.current_total_price_set.shop_money.amount,
        //                 "product_image": product.images[0].src,
        //                 "product_title": product.title,
        //                 "created_at": order.created_at,
        //             });
        //         });
        //     });
    });
    console.log("DONE");
    return fData;
});
export const getPatches = onCall(async (request) => {
    const uid = request.data.uid;
    const fData: any = [];

    await admin.firestore().collection("users").doc(uid).get().then(async (user: any) => {
        if (user.data()["is_admin"] === true) {
            await admin.firestore().collection("bulk_qr_codes").get()
                .then((result: any) => {
                    result.forEach((doc: any) => {
                        fData.push({
                            "id": doc.id,
                            "count": doc.data()["count"],
                            "title": doc.data()["title"],
                            "image": doc.data()["image"],
                        });
                    });
                });
        }
    });
    return fData;
});

export const getQRCodesInPatch = onCall(async (request) => {
    const patchId = request.data.patchId;
    const fData: any = [];
    let counter = 0;

    await admin.firestore().collection("qr_codes").where("bulk_id", "==", patchId).get()
        .then(async (querySnapshot: any) => {
            querySnapshot.forEach((doc: any) => {
                counter = counter + 1;
                fData.push({ "code": doc.data(), "component": getQRCodeMobileComponent(doc, counter) });
                console.log(doc.id, " => ", doc.data());
            });
        });
    return fData;
});

const getQRCodeMobileComponent = (doc: any, counter: number) => {
    var type = doc.data()["is_static"] ? "Static" : "Dynamic";
    var routing_url = doc.data()["routing_url"];
    var serial = doc.id;
    var chartURL = "https://chart.googleapis.com/chart?cht=qr&amp;choe=UTF-8&amp;chs=300x300&amp;chl=" + routing_url;
    var qrCodeType = doc.data()["type"] ?? "-";
    var UIDEmail = doc.data()["uid_email"] ?? "-";
    const date = doc.data().claimed_timestamp ? new Date(doc.data()["claimed_timestamp"]) : "-";
    const expiry = date === "-" ? "-" : date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();

    return `
<div class="qrcodecard"><div class="myqrserial-2">${counter}.</div>
<div class="myqrinnercard-2"><div class="myqrcardtop">
<div class="myqrtopleft"><img src=${chartURL} loading="lazy" alt="" class="image-100"><div class="toolsdiv mobiletoolsdiv"></div>
<div class="settingsbtn" id="settingsbtn${serial}"><div class="text-block-52">${UIDEmail === "-" ? "Reprogram" : "Renew"}</div></div></div><div class="myqrtopright"><div class="griditemspecheader mobileviewgridheaderfont">Serial</div><div class="griditemspecdiv">
<div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${serial}</div></div><div class="griditemspecheader mobileviewgridheaderfont">QR Type</div><div class="griditemspecdiv topmargin">
<div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${type}</div></div><div class="griditemspecheader mobileviewgridheaderfont">QR Code Type</div>
<div class="griditemspecdiv topmargin"><div id="type-id${serial}" class="griditemspecvalue mobileviewserial">${qrCodeType}</div></div>
<p style="font-size: 10px; margin: 0px; padding: 0px">${UIDEmail === "-" ? "-" : ("Owner: " + UIDEmail)}</p>
<p style="font-size: 10px; margin: 0px; padding: 0px">${expiry === "-" ? "-" : ("Expiry: " + expiry)}</p>

</div></div></div></div>
`;
};
