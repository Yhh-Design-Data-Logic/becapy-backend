import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createURLQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const url = data.data.url;
    if (isValidUrl(url)) {
        var createdId = "none";
        try {
            await admin
                .firestore()
                .collection("qr_codes").add({
                    routing_url: url,
                    is_static: is_static,
                    password: "", // QR Password "No Need"
                    corporate_id: corporate_id,
                    type: "URL",
                    url: url,
                    uid: uid,
                }).then(async (result) => {
                    createdId = result.id;
                    return "Done";
                });
        } catch (e) {
            return {
                "message": "Error While Creating!",
            };
        }
        return {
            routing_url: url,
            is_static: is_static,
            password: "", // QR Password "No Need"
            corporate_id: corporate_id,
            type: "URL",
            url: url,
            uid: uid,
            id: createdId
        };
    } else {
        return { "message": "invalid url!" };
    }


});

export const updateURLQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const url = data.data.url;
    const idForUpdate = data.data.idForUpdate;

    try {
        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate)
            .update({
                routing_url: url,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "URL",
                url: url,
                uid: uid,
                idForUpdate: idForUpdate
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }
    return {
        routing_url: url,
        is_static: is_static,
        password: "", // QR Password "No Need"
        corporate_id: corporate_id,
        type: "Wifi",
        url: url,
        uid: uid,
        idForUpdate: idForUpdate
    };
});

const isValidUrl = (urlString: string) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}