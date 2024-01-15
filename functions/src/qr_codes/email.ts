import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createEmailQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const email = data.data.email;
    const subject = data.data.email;
    const body = data.data.email;

    var createdId = "none";
    try {
        await admin
            .firestore()
            .collection("qr_codes").add({
                routing_url: `mailto: ${email}?subject=${subject}&body=${body}`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Email",
                email: email,
                subject: subject,
                body: body,
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
        routing_url: `mailto: ${email}?subject=${subject}&body=${body}`,
        "id": createdId, "message": "Created Successfully", "is_static": is_static,
        "password": "", // QR Password "No Need"
        "corporate_id": corporate_id,
        "type": "wifi",
        "email": email,
        "subject": subject,
        "body": body,
        "uid": uid,
    };
});

export const updateEmailQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const email = data.data.email;
    const subject = data.data.email;
    const body = data.data.email;
    const idForUpdate = data.data.idForUpdate;

    var createdId = "none";
    try {
        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate)
            .update({
                routing_url: `mailto: ${email}?subject=${subject}&body=${body}`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Email",
                email: email,
                subject: subject,
                body: body,
                uid: uid,
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }
    return {
        routing_url: `mailto: ${email}?subject=${subject}&body=${body}`,
        "id": createdId, "message": "Updated Successfully", "is_static": is_static,
        "password": "", // QR Password "No Need"
        "corporate_id": corporate_id,
        "type": "wifi",
        "email": email,
        "subject": subject,
        "body": body,
        "uid": uid,
    };
});