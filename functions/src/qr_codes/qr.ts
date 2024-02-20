/* eslint-disable max-len */
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

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
                        .update({ "uid": userId });
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
<div class="myqrtopleft"><img src=${chartURL} loading="lazy" alt="" class="image-100"><div class="toolsdiv mobiletoolsdiv"></div>
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
