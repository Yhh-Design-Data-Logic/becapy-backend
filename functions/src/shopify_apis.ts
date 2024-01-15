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
                if(String(id) != "6935766663235"){ // for the QR Code product.
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
            map.set("variants", variants);
        });
        
        return map;
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
        switch(type.toLowerCase()){
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
