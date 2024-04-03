/* eslint-disable no-var */
/* eslint-disable max-len */
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
// import * as functions from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { getCustomDateShape } from "../utils/custom_date_formatter";
import { sendSharingMessageToEmail } from "../mailer";

export const claimQRCode = onCall(async (request) => {
    var serial = request.data.serial;
    var password = request.data.password;
    var userId = request.data.user_id;

    var message = "NULL";

    try {
        await admin.firestore().collection("qr_codes").doc(serial).get().then(async (doc: any) => {
            // Case for sharing QR Code with User not exists in the DB.
            if (doc.exists && doc.data()["shared_to_uid"] === "00000000") {
                const emailFromUID = await getEmailFromUID(userId);
                if (doc.data()["password"] === password && doc.data()["shared_to_email_uid"] === emailFromUID) {
                    await admin.firestore().collection("qr_codes").doc(serial)
                        .update({
                            "shared_to_uid": userId,
                            "uid": userId,
                            "uid_email": emailFromUID,
                        });
                    message = "Congratulations";
                    return "Congratulations!";
                } else {
                    message = "Password not correct!";
                    return "Password not correct!";
                }
            }
            // Case for sharing QR Code with User exists in the DB.
            else if (doc.exists && doc.data()["shared_to_uid"] === userId) {
                if (doc.data()["password"] === password) {
                    const emailFromUID = await getEmailFromUID(userId);
                    await admin.firestore().collection("qr_codes").doc(serial)
                        .update({
                            "uid": userId,
                            "uid_email": emailFromUID,
                        });
                    message = "Congratulations";
                    return "Congratulations!";
                } else {
                    message = "Password not correct!";
                    return "Password not correct!";
                }
            }
            // Case for normal claiming QR Code.
            else if (doc.exists && doc.data()["uid"] === userId) {
                if (doc.data()["password"] === password) {
                    await admin.firestore().collection("qr_codes").doc(serial)
                        .update({
                            "uid": userId,
                            "claimed_timestamp": Date.now(),
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
    let cleaing24Hours = false;

    var userId = request.data.user_id;
    var isWeb = request.data.is_web;
    var counter = 0;
    var myCreatedQRCodes: any = [];
    var myCreatedQRCodesByBulk: any = [];
    var qrCodesRef = admin.firestore().collection("qr_codes");
    await qrCodesRef.where("uid", "==", userId).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log("doc.id = " + doc.id);
                cleaing24Hours = false;
                if (doc.data()["shared_timestamp"] && checkIfTimeStampMore24Hours(doc.data()["shared_timestamp"])) {
                    cleaing24Hours = true;
                    console.log("24 hours condition   -->   doc.id = " + doc.id);
                    qrCodesRef.doc(doc.id).update({
                        shared_to_uid: admin.firestore.FieldValue.delete(),
                        shared_to_email_uid: admin.firestore.FieldValue.delete(),
                        shared_timestamp: admin.firestore.FieldValue.delete(),
                        is_shared: admin.firestore.FieldValue.delete(),
                    });
                }
                if (doc.data()["shared_to_uid"] && (doc.data()["shared_to_uid"] !== doc.data()["uid"])) {
                    console.log("SHARING PENDING!   -->   doc.id = " + doc.id);
                }
                if (
                    (doc.data()["shared_to_uid"] && (doc.data()["shared_to_uid"] === doc.data()["uid"])) ||
                    (doc.data()["shared_to_uid"] && (doc.data()["shared_to_uid"] !== doc.data()["uid"]) && cleaing24Hours) ||
                    !doc.data()["shared_to_uid"]
                ) {
                    console.log("NORMAL   -->   doc.id = " + doc.id);
                    counter = counter + 1;
                    var component = isWeb ? getQRCodeMobileComponent(doc, counter) : getQRCodeMobileComponent(doc, counter);
                    myCreatedQRCodes.push({
                        "component": component,
                        "serial": doc.id,
                        "type": doc.data()["type"],
                    });
                }
            });
        });

    // await qrCodesRef.where("corporate_id", "==", userId).get()
    //     .then((querySnapshot) => {
    //         querySnapshot.forEach((doc) => {
    //             counter = counter + 1;
    //             var component = isWeb ? getQRCodeMobileComponent(doc, counter) : getQRCodeMobileComponent(doc, counter);
    //             myCreatedQRCodesByBulk.push({
    //                 "component": component,
    //                 "serial": doc.id,
    //                 "type": doc.data()["type"],
    //                 "claimed_timestamp": doc.data()["claimed_timestamp"],
    //                 "purchased_timestamp": doc.data()["purchased_timestamp"],
    //             });
    //             console.log(doc.id, " => ", doc.data());
    //         });
    //     });
    return { "created": myCreatedQRCodes, "created_by_bulk": myCreatedQRCodesByBulk, "user_id": userId, "is_web": isWeb, "count": counter };
});

const getQRCodeMobileComponent = (doc: any, counter: number) => {
    // var type = doc.data()["is_static"] ? "Static" : "Dynamic";
    const routingUrl = doc.data()["routing_url"];
    const serial = doc.id;
    const purchasedDate = new Date(doc.data()["purchased_timestamp"]);
    const fixedPurchasedDate = doc.data()["fixed_purchased_timestamp"] ? new Date(doc.data()["fixed_purchased_timestamp"]) : "-";
    const claimedDate = new Date(doc.data()["claimed_timestamp"]);
    const chartURL = "https://chart.googleapis.com/chart?cht=qr&amp;choe=UTF-8&amp;chs=300x300&amp;chl=" + routingUrl;
    const qrCodeType = doc.data()["type"] ?? "-";
    const expiryDate = new Date(`${purchasedDate.getFullYear() + 1}-${purchasedDate.getMonth() + 1}-${purchasedDate.getDate()}`);

    return `



<div id="card-id_${serial}" class="myqrcodediv w-node-dd614b2a-841a-967e-9641-4abacefde7f2-cefde7f2">
    <div class="text-block-102 myqrcode">${counter}.</div>
    <div class="div-block-156"><img
            src=${chartURL}
            loading="lazy" alt="" class="image-130">
        <div class="qrsettingsdiv">
            <div id="status-circle-id" class="statusdiv" style="background-color:${getColorOnStatus(doc.data())}"></div>
            <div class="div-block-157">
                <div id="new-download-id_${serial}" class="settingdiv"><img
                        src="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/65f41157e2c98166eb802475_download_white.svg"
                        loading="lazy" alt="" class="image-139"></div>
                <div id="new-edit-id_${serial}" class="settingdiv bg-red-100"><img
                        src="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/65f411c3fcfa3b80fe10fe39_edit_white.svg"
                        loading="lazy" alt="" class="image-139 edit"></div>
            </div>
            <div class="div-block-157">
               <div id="new-renew-id_${serial}" class="settingdiv renew"><img 
                src="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/6601d357c09775247396ad9d_renewable-energy%20(1).png"
                loading="lazy" sizes="(max-width: 767px) 15px, (max-width: 991px) 2vw, (max-width: 1279px) 15px, 1vw" 
                srcset="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/6601d357c09775247396ad9d_renewable-energy%20(1)-p-500.png 500w, https://assets-global.website-files.com/659d238ef90eb981ff6482dd/6601d357c09775247396ad9d_renewable-energy%20(1).png 512w" alt="" class="image-139 edit">
                </div>
                <div id="new-share-id_${serial}" class="settingdiv bg-red-100 share"><img
                        src="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/65fbfa5c260243154c1287cb_share.png"
                        loading="lazy"
                        sizes="(max-width: 767px) 15px, (max-width: 991px) 2vw, (max-width: 1279px) 15px, 1vw"
                        srcset="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/65fbfa5c260243154c1287cb_share-p-500.png 500w, https://assets-global.website-files.com/659d238ef90eb981ff6482dd/65fbfa5c260243154c1287cb_share.png 512w"
                        alt="" class="image-139 edit"></div>
            </div>
            <div id="renew-id" class="renewdiv"><img
                    src="https://assets-global.website-files.com/659d238ef90eb981ff6482dd/65f412bd41ce2357f0fb7b17_carbon_renew.svg"
                    loading="lazy" alt="" class="image-140">
                <div class="text-block-113">Renew</div>
            </div>
        </div>
    </div>
  <div class="batchdetailsdiv">
        <div class="text-block-100">Date: <span class="text-span-2">${fixedPurchasedDate === "-" ? "-" : getCustomDateShape(fixedPurchasedDate)}</span></div>
        <div class="text-block-100">QR Code Type: <span id="type-id${serial}" class="text-span-2">${qrCodeType}</span></div>
        <div class="text-block-100">QR Type: <span class="text-span-2">Dynamic</span></div>
        <div class="text-block-100">Serial NO: <span class="text-span-2">${serial}</span></div>
        <div class="text-block-100">Details: <span class="text-span-3">Scan 3412</span></div>
        <div class="text-block-100">Activated: ${doc.data()["claimed_timestamp"] ? getCustomDateShape(claimedDate) : "-"}</div>
        <div class="text-block-100">Expire: ${doc.data()["life_time_plan"] ? "Life Time" : (doc.data()["purchased_timestamp"] ? (getCustomDateShape(expiryDate)) : "-")}</div>
    </div>
    <div class="w-layout-grid grid-41"><a id="w-node-dd614b2a-841a-967e-9641-4abacefde819-cefde7f2" href="#"
            class="btn-primary myqrcodeedit w-button">Edit</a><a
            id="w-node-dd614b2a-841a-967e-9641-4abacefde81b-cefde7f2" href="#"
            class="btn-primary myqrcodedownload w-button">Download</a><a
            id="w-node-dd614b2a-841a-967e-9641-4abacefde81d-cefde7f2" href="#"
            class="btn-primary myqrcoderenew w-button">Renew</a></div>
<div class="qrcodestatusdiv" style="background-color:${getColorOnStatus(doc.data())}">
        <div id="status-text-id" class="text-block-114">${getQRStatus(doc.data())}</div>
    </div>
</div>

`;

    //     return `
    // <div class="qrcodecard"><div class="myqrserial-2">${counter}.</div>
    // <div class="myqrinnercard-2"><div class="myqrcardtop">
    // <div class="myqrtopleft"><img src=${chartURL} loading="lazy" alt="" class="image-100" id="img_${serial}"><div class="toolsdiv mobiletoolsdiv"></div>
    // <div class="settingsbtn" id="settingsbtn${serial}"><div class="text-block-52">Reprogram</div></div></div><div class="myqrtopright"><div class="griditemspecheader mobileviewgridheaderfont">Serial</div><div class="griditemspecdiv">
    // <div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${serial}</div></div><div class="griditemspecheader mobileviewgridheaderfont">QR Type</div><div class="griditemspecdiv topmargin">
    // <div id="grid-item-type-id" class="griditemspecvalue mobileviewserial">${type}</div></div><div class="griditemspecheader mobileviewgridheaderfont">QR Code Type</div>
    // <div class="griditemspecdiv topmargin"><div id="type-id${serial}" class="griditemspecvalue mobileviewserial">${qrCodeType}</div></div></div></div></div></div>
    // `;
};

const getQRStatus = (data: any) => {
    if (data["claimed_timestamp"] && getDifferenceDays(data["purchased_timestamp"]) > 30) {
        return "Activated";
    } else if (data["claimed_timestamp"] && getDifferenceDays(data["purchased_timestamp"]) < 30 && getDifferenceDays(data["purchased_timestamp"]) > 0) {
        return `${getDifferenceDays(data["purchased_timestamp"])} day left`;
    } else if (data["claimed_timestamp"] && getDifferenceDays(data["purchased_timestamp"]) < 0) {
        return "Expired";
    } else if (!data["claimed_timestamp"]) {
        return "Not Activated";
    } else {
        return "NaN";
    }
};

const getColorOnStatus = (data: any) => {
    if (data["claimed_timestamp"] && getDifferenceDays(data["purchased_timestamp"]) > 30) {
        return "#43A047";
    } else if (data["claimed_timestamp"] && getDifferenceDays(data["purchased_timestamp"]) < 30 && getDifferenceDays(data["purchased_timestamp"]) > 0) {
        return "#F88C29";
    } else if (data["claimed_timestamp"] && getDifferenceDays(data["purchased_timestamp"]) < 0) {
        return "#DA0101";
    } else if (!data["claimed_timestamp"]) {
        return "#ADADAD";
    } else {
        return "#FFFFFF";
    }
};

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
    return id === "" ? "NOT ADMIN" : { "id": id, "image": rImage };
});

export const createQRCodeRelatedToBulk = onCall(async (request) => {
    const bulkId = request.data.bulk_id;
    const uid = request.data.uid;
    const itemsCount = request.data.items_count;
    const resData: string[] = [];
    let errorMsg = "";
    await admin.firestore().collection("users").doc(uid).get().then(async (user: any) => {
        if (user.data()["is_admin"] === true) {
            for (let i = 0; i < itemsCount; i++) {
                await admin.firestore().collection("qr_codes").add({
                    "is_static": false,
                    "password": makePassword(6),
                    "qr_code_url": "https://qrcode.yhh.ae/redirect?id=",
                    "routing_url": "https://becapy-new.webflow.io/",
                    "timestamp": Date.now(),
                    "bulk_id": bulkId,
                    "corporate_id": uid,
                    "uid": "",
                }).then(async (doc: any) => {
                    await admin.firestore().collection("qr_codes").doc(doc.id).update({
                        "qr_code_url": "https://qrcode.yhh.ae/redirect?id=" + doc.id,
                        "routing_url": "https://becapy-new.webflow.io/",
                    });
                    resData.push(doc.id);
                });
            }
        } else {
            errorMsg = "NOT ADMIN";
        }
    });

    return errorMsg === "" ? resData : errorMsg;
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
                    && (getDifferenceDays(data["claimed_timestamp"]) < 30)) {
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
    const date1 = new Date(`${new Date(timestamp).getMonth() + 1}/${new Date(timestamp).getDate()}/${new Date(timestamp).getFullYear() + 1}`);
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

export const getQRCodeById = onCall(async (request) => {
    const uid = request.data.uid;
    const serialId = request.data.serial_id;
    return await admin.firestore().collection("qr_codes").doc(serialId).get().then(async (doc: any) => {
        if (doc.data()["uid"] === uid) {
            const serial = doc.id;
            const purchasedDate = new Date(doc.data()["purchased_timestamp"]);
            const claimedDate = new Date(doc.data()["claimed_timestamp"]);
            const expiryDate = new Date(`${purchasedDate.getFullYear() + 1}-${purchasedDate.getMonth() + 1}-${purchasedDate.getDate()}`);

            return {
                "id": serial,
                "date": doc.data()["purchased_timestamp"] ? (getCustomDateShape(purchasedDate)) : "-",
                "activated": doc.data()["claimed_timestamp"] ? (getCustomDateShape(claimedDate)) : "-",
                "type": doc.data()["type"],
                "expiry": doc.data()["purchased_timestamp"] ? (getCustomDateShape(expiryDate)) : "-",
            };
        } else {
            return "NOT THE OWNER!";
        }
    });
});


const makePassword = (length: number) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export const shareQR = onCall(async (request) => {
    const email = request.data.shareTo.toLowerCase();
    const uid = request.data.uid;
    const qrId = request.data.qr_id;

    return await getUIDFromEmail(email).then(async (result) => {
        if (result === "Email Not Found!") {
            return await admin.firestore().collection("qr_codes").doc(qrId).get().then(async (qrR: any) => {
                if (qrR.exists) {
                    if (qrR.data()["shared_timestamp"] || qrR.data()["is_shared"]) {
                        return "This QR Code has been shared before!";
                    } else if (qrR.data()["uid"] === uid) {
                        await admin.firestore().collection("qr_codes").doc(qrR.id).update({
                            shared_to_email_uid: email,
                            shared_to_uid: "00000000",
                            shared_timestamp: Date.now(),
                            is_shared: true,
                        });
                        sendSharingMessageToEmail(email, qrR.id, qrR.data()["password"], qrR.data()["uid_email"], true);
                        return "The Ownership is moved!, QR Code will be back to you if the he dosen't claim it in 24 hours!";
                    } else {
                        return "NOT THE OWNER";
                    }
                } else {
                    return "QR NOT EXISTS";
                }
            });
        } else {
            const uidFromEmail = result;
            return await admin.firestore().collection("qr_codes").doc(qrId).get().then(async (qrR: any) => {
                if (qrR.exists) {
                    if (qrR.data()["uid"] === uidFromEmail) {
                        return "Ambiguity sharing!";
                    } else if (qrR.data()["shared_timestamp"] || qrR.data()["is_shared"]) {
                        return "This QR Code has been shared before!";
                    } else if (qrR.data()["uid"] === uid) {
                        await admin.firestore().collection("qr_codes").doc(qrR.id).update({
                            // uid_email: email,
                            // uid: uidFromEmail,
                            shared_to_email_uid: email,
                            shared_to_uid: uidFromEmail,
                            shared_timestamp: Date.now(),
                            is_shared: true,
                        });
                        sendSharingMessageToEmail(email, qrR.id, qrR.data()["password"], qrR.data()["uid_email"], false);
                        return "The Ownership is moved!, QR Code will be back to you if the he dosen't claim it in 24 hours!";
                    } else {
                        return "NOT THE OWNER";
                    }
                } else {
                    return "QR NOT EXISTS";
                }
            });
        }
    });
});

const getUIDFromEmail = async (email: string) => {
    return await admin.firestore().collection("users").where("email", "==", email).get().then((result) => {
        if (result.docs.length === 0) {
            return "Email Not Found!";
        } else {
            return result.docs[0].id;
        }
    });
};

const getEmailFromUID = async (uid: string) => {
    return await admin.firestore().collection("users").doc(uid).get().then((result: any) => {
        return result.data()["email"];
    });
};

const checkIfTimeStampMore24Hours = (timestamp: number) => {
    const yourDateMilliseconds = new Date(timestamp).getTime();
    const actualTimeMilliseconds = new Date().getTime();
    if ((actualTimeMilliseconds - yourDateMilliseconds) > 86400000) {
        return true;
    } else {
        return false;
    }
};
