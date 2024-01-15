import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createSMSQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const number = data.data.number;
    const message = data.data.message;

    var createdId = "none";
    try {
        await admin
            .firestore()
            .collection("qr_codes").add({
                routing_url: `SMSTO:${number}:${message}`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "SMS",
                number: number,
                message: message,
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
        id: createdId,
        routing_url: `SMSTO:${number}:${message}`,
        is_static: is_static,
        password: "", // QR Password "No Need"
        corporate_id: corporate_id,
        type: "SMS",
        number: number,
        message: message,
        uid: uid,
    };
});

export const updateSMSQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const number = data.data.number;
    const message = data.data.message;
    const idForUpdate = data.data.idForUpdate;

    try {
        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate).update({
                routing_url: `SMSTO:${number}:${message}`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "SMS",
                number: number,
                message: message,
                uid: uid,
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }
    return {
        routing_url: `SMSTO:${number}:${message}`,
        is_static: is_static,
        password: "", // QR Password "No Need"
        corporate_id: corporate_id,
        type: "SMS",
        number: number,
        message: message,
        uid: uid,
    };
});