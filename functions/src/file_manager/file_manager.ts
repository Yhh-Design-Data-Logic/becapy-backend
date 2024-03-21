/* eslint-disable max-len */
import { onRequest } from "firebase-functions/v2/https";
import { toString } from "qrcode";
import * as admin from "firebase-admin";
import JSZip = require("jszip");
import FileSaver = require("file-saver");

const generateQRCodeString = (qrId: string, request: any) =>
    toString(
        // `https://qrcode.yhh.ae/redirect?id=${qrId}`,
        "https://becapy-new.webflow.io/" + qrId,
        {
            type: "svg",
            scale: request.query?.scale ? Number(request.query.scale) : 20,
            margin: request.query?.margin ? Number(request.query.margin) : 0,
            color: {
                dark: request.query?.dark_color
                    ? `#${request.query?.dark_color}`
                    : "#000000",
                light: request.query?.light_color
                    ? `#${request.query?.light_color}`
                    : "#FFFFFFFF",
            },
        });
const getQRRouting = async (qrId: string) => {
    if (!qrId) {
        return {
            status: 400,
            message: "Missing id parameter",
        };
    }
    const qrCodeData = await admin
        .firestore()
        .collection("qr_codes")
        .doc(qrId)
        .get();
    // Check if the QR code exists
    if (!qrCodeData.exists) {
        return {
            status: 404,
            message: "QR code not found",
        };
    }
    const routingUrl = qrCodeData.data()?.routing_url;
    const qrPassword = qrCodeData.data()?.password;
    if (!routingUrl) {
        return {
            status: 500,
            message: "Routing url not found",
        };
    }
    return {
        status: 200,
        message: routingUrl,
        password: qrPassword,
        qrId: qrId,
    };
};

export const downloadQRCode = onRequest(async (request, response) => {
    const qrId = request.query.id as string;
    const nameSlug = request.query.name_slug as string;
    console.log("TEST: " + nameSlug);
    const result = await getQRRouting(request.query.id as string);
    if (result.status !== 200) {
        response.status(result.status).send(result.message);
        return;
    }

    try {
        const qrString = await generateQRCodeString(qrId, request);
        response.set("Access-Control-Allow-Origin", "*");
        response.setHeader("Content-Type", "image/svg+xml");
        if (nameSlug !== null) {
            response.setHeader(
                "Content-Disposition",
                `attachment; filename="${nameSlug}_${qrId}.svg"`
            );
        } else {
            response.setHeader(
                "Content-Disposition",
                `attachment; filename="${qrId}.svg"`
            );
        }
        response.write(qrString);

        response.set("Access-Control-Allow-Origin", "*");
        response.setHeader("Content-Type", "file/txt");

        response.setHeader(
            "Content-Disposition",
            `attachment; filename="${qrId}_password.txt"`
        );
        response.write(result.password);

        response.end(qrString);
        response.end(result.password);

        response.send(qrString);
        response.send(result.password);

    } catch (err) {
        response.status(500).send("Failed to generate QR code");
    }
});

export const downloadPasswordFileQRCode = onRequest(async (request, response) => {
    const qrId = request.query.id as string;
    const nameSlug = request.query.name_slug as string;
    console.log("TEST: " + nameSlug);
    try {
        const result = await getQRRouting(request.query.id as string);

        response.set("Access-Control-Allow-Origin", "*");
        response.setHeader("Content-Type", "file/txt");

        response.setHeader(
            "Content-Disposition",
            `attachment; filename="${qrId}_password.txt"`
        );

        response.send(result.password);
    } catch (err) {
        response.status(500).send("Failed to generate QR code");
    }
});

export const downloadWholeQRCode = onRequest(async (request, fR) => {
    downloadQRCode(request, fR);
    downloadPasswordFileQRCode(request, fR);
    fR.send();
});


export const zipTheBatch = onRequest(async (request, response) => {
    const batchId = request.query.id as string;
    const zip = new JSZip();

    zip.file("Hello.txt", "Hello World\n");
    // await admin.firestore().collection("qr_codes").where("bulk_id", "==", batchId).get().then((result) => {
    //     result.docs.forEach((doc) => {
    //         zip.file(`${doc.id}_password.txt`, doc.data()["password"]);
    //     });
    // });

    console.log("zzz = " + zip.files.length);
    console.log("zzz = " + zip.length);

    await zip.generateAsync({ type: "blob" }).then((content) => {
        // location.href = "data:application/zip;base64," + content;
        FileSaver.saveAs(content, "download.zip");
        response.set("Access-Control-Allow-Origin", "*");
        response.setHeader("Content-Type", "application/zip");

        response.setHeader(
            "Content-Disposition",
            `attachment; filename="${batchId}.zip"`
        );

        response.send(content);
    });
});


export const generateQRCode = onRequest(async (request, response) => {
    const qrId = request.query.id as string;
    const result = await getQRRouting(request.query.id as string);
    if (result.status !== 200) {
        response.status(result.status).send(result.message);
        return;
    }
    try {
        const qrString = await generateQRCodeString(qrId, request);
        response.setHeader("Content-Type", "image/svg+xml");
        response.setHeader("Content-Disposition", `inline; filename="${qrId}.svg"`);
        response.end(qrString);
    } catch (err) {
        response.status(500).send("Failed to generate QR code");
    }
});
