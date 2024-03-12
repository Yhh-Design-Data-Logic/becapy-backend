/* eslint-disable max-len */
import * as admin from "firebase-admin";

import { onCall, onRequest } from "firebase-functions/v2/https";
import { sendQRCodeCreds } from "./mailer";
// export const shopifyProducts = onCall(async (data) => {
//     try {
//         const shopifyApiKey = "eee58d1b00b3eef5c9073b72d3a8dba7";
//         const shopifyPassword = "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";
//         const shopifyShopName = "0f7134-3.myshopify.com";
//         const apiVersion = "2023-10";


//         const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;

//         const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products.json`;

//         const axiosResponse = await axios.get(url, {
//             headers: {
//                 Authorization: authHeader,
//             },
//         });

//         const jsonData = axiosResponse.data();
//         return jsonData;
//     } catch (error) {
//         return error;
//     }
// });

// const shopifyApiKey = "d331707162e8c5ec410ff2138e427c2e";
// const shopifyPassword = "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";

const shopifyApiKey = "c0c79b8a5ab85c3588827e799cb7594c";
const shopifyPassword = "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";

const shopifyShopName = "209c5e-2.myshopify.com";
const apiVersion = "2023-10";

const superAdminFirebaseUID = "md731qxjpCRhSGTSAIcoKLXDQKA3";

export const shopifyProducts = onCall(async (request) => {
    try {
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products.json`;
        const fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const prods = await result.json();
            result = prods;
            for (let i = 0; i < prods["products"].length; i++) {
                const id = prods["products"][i].id;
                if (String(id) != "6935766663235") { // for the QR Code product.
                    fData.push({
                        "id": id,
                        "product": prods["products"][i],
                    });
                }
            }
        });

        return fData;
    } catch (error) {
        return error;
    }
});

export const getProductById = onCall(async (request) => {
    try {
        const id = request.data.id;
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products/${id}.json`;
        const variantsUrl = `https://${shopifyShopName}/admin/api/${apiVersion}/products/${id}/variants.json`;
        const map: Map<string, any> = new Map();
        const fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const prods = await result.json();
            const id = prods["product"].id;
            fData.push({
                "id": id,
                "product": prods["product"],
            });
            console.log("id = " + id);
            console.log("prods[product].id = " + prods["product"].id);
            console.log("fData = " + fData);
        });
        map.set("data", fData);

        // / For fetching the prices for all variants of this product.
        await fetch(variantsUrl, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const variants = await result.json();
            console.log("variants = " + variants);
            map.set("variants", variants);
        });

        console.log("map = " + map);

        return fData;
    } catch (error) {
        return error;
    }
});

export const getProductsByCollectionId = onCall(async (request) => {
    try {
        // const topProductsCollectionId = "277396226115";
        // const tShirtsProductsCollectionId = "277268529219";
        // const bagProductsCollectionId = "277396160579";

        const type = request.data.type;
        let id = "";
        switch (type.toLowerCase()) {
            case "t-shirt-collections":
                id = "277268529219";
                break;
            case "bag-collections":
                id = "277396160579";
                break;
            default:
                id = "277396226115";
        }

        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/collections/${id}/products.json`;
        const fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const prods = await result.json();
            for (let i = 0; i < prods["products"].length; i++) {
                const id = prods["products"][i].id;
                fData.push({
                    "id": id,
                    "product": prods["products"][i],
                });
            }
        });

        return fData;
    } catch (error) {
        return error;
    }
});

export const getCustomCollections = onRequest({ cors: true }, async (request, response) => {
    try {
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/custom_collections.json`;
        let collections = {};
        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            collections = await result.json();
        });

        response.status(200).send(collections);
    } catch (error) {
        response.status(400).send("Error!");
    }
});


export const getProductsByCollectionIdHttps = onRequest({ cors: true }, async (request, response) => {
    try {
        const collectionId = request.query.collectionId;
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/collections/${collectionId}/products.json?fields=id`;
        let fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const ids: number[] = [];
            const prods = await result.json();
            for (let i = 0; i < prods["products"].length; i++) {
                ids.push(prods["products"][i].id);
            }
            fData = await getCollectionProductsByIDs(ids);
            // const id = prods["products"][i].id;
            // fData.push({
            //     "id": id,
            //     "product": prods["products"][i],
            // });
        });
        response.status(200).send(fData);
    } catch (error) {
        response.status(400).send("Error!");
    }
});

const getCollectionProductsByIDs = async (ids: number[]) => {
    try {
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        console.log("ids = " + ids);
        console.log("ids.toString() = " + ids.toString());
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products.json?ids=${ids.toString()}`;
        const fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const prods = await result.json();
            result = prods;
            for (let i = 0; i < prods["products"].length; i++) {
                const id = prods["products"][i].id;
                fData.push({
                    "id": id,
                    "product": prods["products"][i],
                });
            }
            // const prods = await result.json();
            // console.log("prods[products].length = " + prods["products"].length);
            // console.log("prods = " + prods);
            // console.log("prods[pp] = " + prods["products"]);
            // console.log("prods[pp]0 = " + prods["products"][0]);
            // console.log("prods[pp]0 = " + prods["products"][0].id);
            // console.log("prods[pp]1 = " + prods["products"][1]);
            // console.log("prods[pp]1 = " + prods["products"][1].id);

            // for (let i = 0; i < prods["products"].length; i++) {
            //     console.log("i = " + i);

            //     const id = prods["products"][i].id;
            //     console.log("id = " + id);
            //     fData.push({
            //         "id": id,
            //         "product": prods["products"][i],
            //     });
            // }
        });
        return fData;
    } catch (error) {
        return [];
    }
};

export const orderCreationWebhook = onRequest(async (request, response) => {
    // Maybe the Webhook will run it self several times ...
    let quantityOfQRCodes = 0;
    let isQRCode = false;
    let messageOfAssigning = "";

    for (let i = 0; i < request.body.line_items.length; i++) {
        if (request.body.line_items[i].product_id === 6935766663235) {
            isQRCode = true;
            quantityOfQRCodes = request.body.line_items[i].quantity;
        }
    }
    console.log("isQRCode = " + isQRCode);
    console.log("quantityOfQRCodes = " + quantityOfQRCodes);
    const oldOrders = await admin.firestore().collection("orders").where("shopify_order_id", "==", request.body.id).get();
    if (oldOrders.empty) {
        console.log("HERE 01");
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products/${request.body.line_items[0].product_id}.json`;
        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const product = await result.json();
            console.log("HERE 02");
            await admin.firestore().collection("orders").doc().set({
                shopify_order_id: request.body.id,
                shopify_json_body: JSON.stringify(request.body),
                shopify_customer_id: request.body.customer.id,
                first_order_product: JSON.stringify(product),
            });
            console.log("HERE 03");
            // For assigning qr codes from the inventory into the user inside the database
            if (isQRCode) {
                console.log("HERE 04");
                await admin.firestore().collection("users").where("shopify_user_id", "==", request.body.customer.id)
                    .get().then(async (result: any) => {
                        console.log("HERE 05");
                        messageOfAssigning = await assignQRCode(result.docs[0], quantityOfQRCodes);
                    });
            }
        });
        response.status(200).send("DONE - " + messageOfAssigning);
    } else {
        response.status(200).send("ADDED BEFORE!");
    }
});

const assignQRCode = async (doc: any, quantityOfQRCodes: number) => {
    let message = "";
    console.log("HERE 06");
    await admin.firestore().collection("qr_codes").where("uid", "==", "").where("corporate_id", "==", superAdminFirebaseUID)
        .get().then(async (result) => {
            console.log("HERE 07");
            if (quantityOfQRCodes > result.docs.length) {
                console.log("HERE 08");
                message = "Out of stock!";
            } else {
                console.log("HERE 09");
                for (let i = 0; i <= quantityOfQRCodes; i++) {
                    console.log("HERE 10 - I = " + i);

                    await admin.firestore().collection("qr_codes").doc(result.docs[i].id).update({
                        "uid": doc.id,
                        "uid_email": doc.data()["email"],
                    });
                    console.log("HERE 11 - I = " + i);
                    console.log(result.docs[i].id);
                    console.log(result.docs[i].data()["password"]);

                    sendQRCodeCreds(result.docs[i].id, result.docs[i].data()["password"], doc.data()["email"]);
                }
                console.log("HERE 11");
                message = "Assigned";
            }
        });
    return message;
};

export const addCart = onCall(async (request) => {
    console.log("request " + request.data);
    const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;

    const formData = {
        "line_items": [{
            "id": 40759589765187,
            "quantity": 2,
        }],
    };
    try {
        console.log("AA 01");
        await fetch("https://209c5e-2.myshopify.com/admin/api/2023-10/checkouts.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,

            },
            body: JSON.stringify(formData),
        })
            .then(async (response) => {
                console.log("AA 01");
                const res = await response.json();
                console.log("response.items.count = " + res.items.count);
                console.log("response.items[0].id = " + res.items[0].id);
                console.log("response.items[0].title = " + res.items[0].title);

                return response.json();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        return "--";
    } catch (error) {
        console.log("error = " + error);
        return error;
    }
});

