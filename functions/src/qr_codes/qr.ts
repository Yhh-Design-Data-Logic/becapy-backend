/* eslint-disable max-len */
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
// import * as functions from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";

export const claimQRCode = onCall(async (request) => {
    var serial = request.data.serial;
    var password = request.data.password;
    var userId = request.data.user_id;

    var message = "NULL";

    try {
        await admin.firestore().collection("qr_codes").doc(serial).get().then(async (doc: any) => {
            if (doc.exists && (doc.data()["uid"] === "" || doc.data()["uid"] === null)) {
                if (doc.data()["password"] == password) {
                    await admin.firestore().collection("qr_codes").doc(serial)
                        .update({
                            "uid": userId, "claimed_timestamp": Date.now(),
                        });
                    message = "Congratulations";
                    return "Congratulations!";
                } else {
                    message = "Password not correct!";
                    return "Password not correct!";
                }
            } else {
                message = "Not exist";
                return "Not exist";
            }
        });
        return message;
    } catch (error) {
        return error;
    }
});

export const getUserQrCodes = onCall(async (request) => {
    var userId = request.data.user_id;
    var isWeb = request.data.is_web;
    var counter = 0;
    var myCreatedQRCodes: any = [];
    var myCreatedQRCodesByBulk: any = [];
    var qrCodesRef = admin.firestore().collection("qr_codes");
    await qrCodesRef.where("uid", "==", userId).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                counter = counter + 1;
                var component = isWeb ? getQRCodeMobileComponent(doc, counter) : getQRCodeMobileComponent(doc, counter);
                myCreatedQRCodes.push({
                    "component": component,
                    "serial": doc.id,
                    "type": doc.data()["type"]
                });
                console.log(doc.id, " => ", doc.data());
            });
        });

    await qrCodesRef.where("corporate_id", "==", userId).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                counter = counter + 1;
                var component = isWeb ? getQRCodeMobileComponent(doc, counter) : getQRCodeMobileComponent(doc, counter);
                myCreatedQRCodesByBulk.push({
                    "component": component,
                    "serial": doc.id,
                    "type": doc.data()["type"]
                });
                console.log(doc.id, " => ", doc.data());
            });
        });
    return { "created": myCreatedQRCodes, "created_by_bulk": myCreatedQRCodesByBulk, "user_id": userId, "is_web": isWeb, "count": counter };
});

const getQRCodeMobileComponent = (doc: any, counter: number) => {
    var type = doc.data()["is_static"] ? "Static" : "Dynamic";
    var routing_url = doc.data()["routing_url"];
    var serial = doc.id;
    // var password = doc.data()["password"];
    // const date = new Date(doc.data()["timestamp"]);
    var chartURL = "https://chart.googleapis.com/chart?cht=qr&amp;choe=UTF-8&amp;chs=300x300&amp;chl=" + routing_url;
    // var creation = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    // var expiry = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    var qrCodeType = doc.data()["type"] ?? "-";
    return `
<div class="qrcodecard"><div class="myqrserial-2">${counter}.</div>
<div class="myqrinnercard-2"><div class="myqrcardtop">
<div class="myqrtopleft"><img src=${chartURL} loading="lazy" alt="" class="image-100" id="img_${serial}"><div class="toolsdiv mobiletoolsdiv"></div>
<div class="settingsbtn" id="settingsbtn${serial}"><div class="text-block-52">Reprogram</div></div></div><div class="myqrtopright"><div class="griditemspecheader mobileviewgridheaderfont">Serial</div><div class="griditemspecdiv">
<div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${serial}</div></div><div class="griditemspecheader mobileviewgridheaderfont">QR Type</div><div class="griditemspecdiv topmargin">
<div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${type}</div></div><div class="griditemspecheader mobileviewgridheaderfont">QR Code Type</div>
<div class="griditemspecdiv topmargin"><div id="type-id${serial}" class="griditemspecvalue mobileviewserial">${qrCodeType}</div></div></div></div></div></div>
`;
    //     return `
    //    <div class="qrcodediv"><div class="myqrserial">${counter}.</div>
    //    <div class="myqrinnercard"><div class="myqrcardtop">
    //    <div class="myqrtopleft"><h1 class="heading-31 myqrtoplhead">${password}</h1>
    //    <img src=${chartURL} loading="lazy" alt=""><div class="toolsdiv mobiletoolsdiv">
    //    <div id="download-id${serial}" class="tool mobiletool"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/65153a6fbd56064332082848_download.svg" loading="lazy" alt="" class="toolimg mobiletoolimg"></div>
    //    <div id="analytics-id${serial}" class="tool mobiletool"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/65153aadc5d12ff4b9f71a46_carbon_analytics.svg" loading="lazy" alt="" class="toolimg mobiletoolimg"></div>
    //    <div id="view-id${serial}" class="tool mobiletool"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/65153ab76b64d09f3e1fa194_fa6-solid_eye.svg" loading="lazy" alt="" class="toolimg mobiletoolimg"></div>
    //    <div id="key-id${serial}" class="tool mobiletool"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/65153ac09b5557cebed7c6ec_key.svg" loading="lazy" width="13" alt="" class="toolimg mobiletoolimg"></div></div></div><div class="myqrtopright"><div class="griditemspecheader mobileviewgridheaderfont">Type</div><div class="griditemspecdiv">
    //    <div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${type}</div></div>
    //    <div class="griditemspecheader mobileviewgridheaderfont">Serial No</div><div class="griditemspecdiv">
    //    <div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${serial}</div></div>
    //    <div class="griditemspecheader mobileviewgridheaderfont">Creation Date</div><div class="griditemspecdiv">
    //    <div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${creation}</div></div>
    //    <div class="griditemspecheader mobileviewgridheaderfont">Expiry Date</div><div class="griditemspecdiv">
    //    <div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${expiry}</div></div></div></div>
    //    <div class="myqrcardbtm"><div class="div-block-97 myqrbtmleft"><div class="text-block-41">Program:</div>
    //    <div class="myqrbtmbtns"><a id="type-id${serial}" href="#" class="myqrbtn1 w-button">${qrCodeType}</a><a id="reprogram-id${serial}" href="#" class="myqrbtn2 w-button">Reprogram</a></div></div>
    //    <div class="div-block-98 myqrbtmright"><div id="switch-id" class="text-block-41 myqrtoggle">Offline</div></div></div></div></div>`;
}

export const createBulkQRCode = onCall(async (request) => {
    const uid = request.data.uid;
    let id = "";
    const rImage = getRandomImageURL();
    await admin.firestore().collection("users").doc(uid).get().then(async (user: any) => {
        if (user.data()["is_admin"] === true) {
            await admin.firestore().collection("bulk_qr_codes").add({
                "count": request.data.count,
                "title": request.data.title,
                "timestamp": Date.now(),
                "image": rImage,
            }).then(async (doc) => {
                id = doc.id;
            });
        }
    });
    return { "id": id, "image": rImage };
});

export const createQRCodeRelatedToBulk = onCall(async (requet) => {
    const bulkId = requet.data.bulk_id;
    let docId = "";
    await admin.firestore().collection("qr_codes").add({
        "is_static": requet.data.is_static,
        "password": requet.data.password,
        "qr_code_url": "https://qrcode.yhh.ae/redirect?id=",
        "routing_url": "https://becapy-new.webflow.io/",
        "timestamp": Date.now(),
        "bulk_id": bulkId,
    }).then(async (doc: any) => {
        await admin.firestore().collection("qr_codes").doc(doc.id).update({
            "qr_code_url": "https://qrcode.yhh.ae/redirect?id=" + doc.id,
            "routing_url": "https://becapy-new.webflow.io/",
        });
        docId = doc.id;
    });
    return docId;
});

export const getBatchById = onCall(async (request) => {
    return await admin.firestore().collection("bulk_qr_codes").doc(request.data.batch_id).get().then((res) => {
        return res.data();
    });
});

// For deleting the qr codes under the bulk when it's deleted!.
export const triggerOnDeleteBulk = onDocumentDeleted("bulk_qr_codes/{bulkId}", async (event) => {
    console.log("bulkId = " + event.params.bulkId);
    await admin.firestore().collection("qr_codes").where("bulk_id", "==", event.params.bulkId).get().then(function (querySnapshot) {
        querySnapshot.forEach((doc) => {
            doc.ref.delete();
        });
    });
});


export const getBatchAnalyticsById = onCall(async (request) => {
    let soldItems = 0;
    let expirySoonItems = 0;
    let expiredItems = 0;
    let notActivatedItems = 0;
    let activatedItems = 0;

    return await admin.firestore().collection("qr_codes")
        .where("bulk_id", "==", request.data.batch_id).get().then((result: any) => {
            for (let i = 0; i < result.docs.length; i++) {
                const data = result.docs[i].data();
                if (result.docs[i].data()["uid_email"]) {
                    soldItems += 1;
                }
                if (data["uid_email"] && data["claimed_timestamp"]) {
                    activatedItems += 1;
                }
                if (data["uid_email"] && !data["claimed_timestamp"]) {
                    notActivatedItems += 1;
                }
                if (data["uid_email"]
                    && data["claimed_timestamp"]
                    && (getDifferenceDays(data["claimed_timestamp"]) < 90)) {
                    console.log("sdsdsd = " + getDifferenceDays(data["claimed_timestamp"]));
                    expirySoonItems += 1;
                }
                if (data["uid_email"]
                    && data["claimed_timestamp"]
                    && (getDifferenceDays(data["claimed_timestamp"]) < 0)) {
                    expiredItems += 1;
                }
            }
            return {
                "inventory": (result.docs.length - soldItems),
                "sold": soldItems,
                "expirySoon": expirySoonItems,
                "expired": expiredItems,
                "notActivated": notActivatedItems,
                "activated": activatedItems,
            };
        });
});

export const getDifferenceDays = (timestamp: number): number => {
    const date1 = new Date(`${new Date(timestamp).getMonth()}/${new Date(timestamp).getDay()}/${new Date(timestamp).getFullYear() + 1}`);
    const date2 = new Date(Date.now());
    const DifferenceInTime = date1.getTime() - date2.getTime();
    console.log("DifferenceInTime = " + DifferenceInTime);
    const DifferenceInDays = Math.round(DifferenceInTime / (1000 * 3600 * 24));
    console.log("DifferenceInDays = " + DifferenceInDays);

    return DifferenceInDays;
};

const getRandomImageURL = () => {
    const arr = [
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F58e8ff68eb97430e819064d0.png?alt=media&token=c8857bc0-5e20-4552-b45e-bcc73111ba9a",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F58e8ff10eb97430e819064cc.png?alt=media&token=f686c632-52b5-4d52-88f6-d8e7a6d9374b",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F417.png?alt=media&token=878900a8-cbd9-4dd3-81d8-a31206c085c8",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F418.png?alt=media&token=7b1285f0-597a-4538-9ee3-34454c5f8924",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F419.png?alt=media&token=12a47587-71c0-46e5-9ad5-8f7735e5dc38",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F420.png?alt=media&token=78d56c4a-7e64-4132-910c-7a6ce3fbba6d",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F421.png?alt=media&token=fd76ea40-0586-4614-9814-46a232f9c89f",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F422.png?alt=media&token=135fb391-7ad3-4a62-8a6f-3c6f97cd50d6",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F423.png?alt=media&token=9b2e3f82-7663-487a-b02d-165f042b8eb3",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F424.png?alt=media&token=5fac5a28-09a5-4e26-b6cf-da95c70b18c5",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F425.png?alt=media&token=9e5294f5-002c-40d6-a10c-4ec9676fc4d3",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F426.png?alt=media&token=afe7837e-44c4-4041-8e0c-8132889a92bb",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F427.png?alt=media&token=ca5b9a39-cb9c-4ed2-b5f6-cf5f21b19f7f",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F428.png?alt=media&token=cad25bfd-4c5f-4340-a889-5ac269b64c32",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F429.png?alt=media&token=20099d66-90cc-4a17-bdd0-9a618679a6d5",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F430.png?alt=media&token=80fcc823-a6af-4c77-9576-f5f0286fd528",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F431.png?alt=media&token=ed4ace35-7654-4655-882e-1162d15aac1c",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F18.png?alt=media&token=a5cee33c-e135-4fed-bbfc-0d6ce5a67dcc",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F411.png?alt=media&token=4555b59b-00d5-43cd-b47b-470450894093",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F412.png?alt=media&token=510a9e75-d2c6-4b1a-9667-14af7df4508b",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F413.png?alt=media&token=4ce913b7-974e-458c-bd11-a7085fa22140",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F414.png?alt=media&token=c997a5ff-757c-44f6-aeaa-06e6aa109cf9",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F415.png?alt=media&token=e8c106fc-c112-4f15-894e-12ddfafb084a",
        "https://firebasestorage.googleapis.com/v0/b/becapy-41703.appspot.com/o/emojis%2F416.png?alt=media&token=bc7843f1-8c08-4265-a87e-7647f2126c3c",
    ];
    const ind: number =
        Math.floor(Math.random() * arr.length);
    const result: string = arr[ind];
    return result;
};
