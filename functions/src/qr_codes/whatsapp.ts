import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createWhatsappQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const number = data.data.number;
    const message = data.data.message;
    var replacedMessage = message.replace(/ /g, '%2B');

    var createdId = "none";
    try {
        await admin
            .firestore()
            .collection("qr_codes").add({
                routing_url: `https%3A%2F%2Fwa.me%2F${number}%3Ftext%3D${replacedMessage}`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "whatsapp",
                number: number,
                message: replacedMessage,
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
        routing_url: `https%3A%2F%2Fwa.me%2F${number}%3Ftext%3D${replacedMessage}`,
        is_static: is_static,
        password: "", // QR Password "No Need"
        corporate_id: corporate_id,
        type: "whatsapp",
        number: number,
        message: replacedMessage,
        uid: uid,
    };
});

export const updateWhatsappQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const number = data.data.number;
    const message = data.data.message ?? "";
    const idForUpdate = data.data.idForUpdate;
    var replacedMessage = message.replace(/ /g, '%2B');

    try {
        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate).update({
                routing_url: `https%3A%2F%2Fwa.me%2F${number}%3Ftext%3D${replacedMessage}`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Whatsapp",
                number: number,
                message: replacedMessage,
                uid: uid,
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }

    return {
        routing_url: `whatsapp%3A%2F%2Fsend%3Fphone%3D${number}%26text%3D${replacedMessage}`,
        is_static: is_static,
        password: "", // QR Password "No Need"
        corporate_id: corporate_id,
        type: "Whatsapp",
        number: number,
        message: replacedMessage,
        uid: uid,
    };
});