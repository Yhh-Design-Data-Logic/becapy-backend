/* eslint-disable max-len */
import * as admin from "firebase-admin";

import { onCall, onRequest } from "firebase-functions/v2/https";
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

export const shopifyProducts = onCall(async (request) => {
    try {
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products.json`;
        var fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            var prods = await result.json();
            result = prods;
            for (var i = 0; i < prods["products"].length; i++) {
                var id = prods["products"][i].id;
                if (String(id) != "6935766663235") { // for the QR Code product.
                    fData.push({
                        "id": id,
                        "product": prods["products"][i]
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
        var map: Map<String, any> = new Map();
        var fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {

            var prods = await result.json();
            var id = prods["product"].id;
            fData.push({
                "id": id,
                "product": prods["product"]
            });
            console.log("id = " + id);
            console.log("prods[product].id = " + prods["product"].id);
            console.log("fData = " + fData);
        });
        map.set("data", fData);

        /// For fetching the prices for all variants of this product.
        await fetch(variantsUrl, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            var variants = await result.json();
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
        var id = "";
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
        var fData: any = [];

        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            var prods = await result.json();
            for (var i = 0; i < prods["products"].length; i++) {
                var id = prods["products"][i].id;
                fData.push({
                    "id": id,
                    "product": prods["products"][i]
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
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/collections/${collectionId}/products.json`;
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
        response.status(200).send(fData);
    } catch (error) {
        response.status(400).send("Error!");
    }
});

export const orderCreationWebhook = onRequest(async (request, response) => {
    // Maybe the Webhook will run it self several times ...
    const oldOrders = await admin.firestore().collection("orders").where("shopify_order_id", "==", request.body.id).get();
    if (oldOrders.empty) {
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products/${request.body.line_items[0].product_id}.json`;
        await fetch(url, {
            headers: {
                Authorization: authHeader,
            },
        }).then(async (result: any) => {
            const product = await result.json();
            await admin.firestore().collection("orders").doc().set({
                shopify_order_id: request.body.id,
                shopify_json_body: JSON.stringify(request.body),
                shopify_customer_id: request.body.customer.id,
                first_order_product: JSON.stringify(product),
            });
        });
        response.status(200).send("DONE");
    } else {
        response.status(200).send("ADDED BEFORE!");
    }
});
