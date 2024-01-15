import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createWifiQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const wifiPassword = data.data.wifiPassword;
    const wifiSSID = data.data.wifiSSID;
    const wifiType = data.data.wifiType;

    var createdId = "none";
    try {
        await admin
            .firestore()
            .collection("qr_codes").add({
                routing_url: `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Wifi",
                data: `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
                wifiPassword: wifiPassword,
                wifiSSID: wifiSSID,
                wifiType: wifiType,
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
        routing_url: `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
        "id": createdId, "message": "Created Successfully", "is_static": is_static,
        "password": "", // QR Password "No Need"
        "corporate_id": corporate_id,
        "type": "wifi",
        "data": `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
        "wifiPassword": wifiPassword,
        "wifiSSID": wifiSSID,
        "wifiType": wifiType,
        "uid": uid,
    };
});

export const updateWifiQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const wifiPassword = data.data.wifiPassword;
    const wifiSSID = data.data.wifiSSID;
    const wifiType = data.data.wifiType;
    const idForUpdate = data.data.idForUpdate;
    
    try {
        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate)
            .update({
                routing_url: `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Wifi",
                data: `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
                wifiPassword: wifiPassword,
                wifiSSID: wifiSSID,
                wifiType: wifiType,
                uid: uid,
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }
    return {
        routing_url: `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
        "id": idForUpdate, "message": "Updated Successfully", "is_static": is_static,
        "password": "", // QR Password "No Need"
        "corporate_id": corporate_id,
        "type": "wifi",
        "data": `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`,
        "wifiPassword": wifiPassword,
        "wifiSSID": wifiSSID,
        "wifiType": wifiType,
        "uid": uid,
    };
});