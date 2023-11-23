import { onCall } from "firebase-functions/v2/https";

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

const shopifyApiKey = "d331707162e8c5ec410ff2138e427c2e";
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

export const getProductById = onCall(async (request) => {
    try {
        const id = request.data.id;
        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/products/${id}.json`;
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
            console.log("fData = " + fData);
        });
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

        const id = request.data.id;

        const authHeader = `Basic ${Buffer.from(`${shopifyApiKey}:${shopifyPassword}`).toString("base64")}`;
        const url = `https://${shopifyShopName}/admin/api/${apiVersion}/collections/${id}/products.json`;
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



