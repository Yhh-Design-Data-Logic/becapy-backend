/* eslint-disable max-len */
import { onRequest } from "firebase-functions/v2/https";
// import { createStorefrontApiClient } from "@shopify/storefront-api-client";

export const graphiQLAPI = onRequest(async (request, response) => {
    return await fetch("https://netlify-myshopify.com/api/2023-10/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "1dba4d16bdf57a57f61e90de5a60175d",
        },
        body: JSON.stringify({
            "query": `
                mutation cartCreate {
                cartCreate {
                    cart {
                    id
                    checkoutUrl
                    }
                    userErrors {
                    field
                    message
                    }
                }
             }`,
        }),
    }).then(async (res: any) => {
        const r = await res.json();
        console.log("DONE!");
        console.log("DONE! = " + r);
        response.status(200).send(r);
    }).catch((e) => {
        console.log("error = " + e.toString());
        response.status(400).send("Error!");
    });
});

// export const addToCart = onCall(async (request) => {
//     const client = createStorefrontApiClient({
//         storeDomain: "https://209c5e-2.myshopify.com",
//         apiVersion: "2024-01",
//         publicAccessToken: "5adb4164b44b050e0c8adad04b9dfa32",
//     });

//     console.log("request.data = " + request.data);
//     const cartQuery = `
//   mutation cartCreate {
//                 cartCreate {
//                     cart {
//                     id
//                     checkoutUrl
//                     }
//                     userErrors {
//                     field
//                     message
//                     }
//                 }
//              }
// `;
//     await client.request(cartQuery, { variables: {} }).then(async (result) => {
//         // console.log("data = " + data);
//         // console.log("errors = " + errors);
//         // console.log("extensions = " + extensions);
//         console.log("result = " + result);
//         console.log("result.data = " + result.data);
//         console.log("result.data.cartCreate.cart.id = " + result.data?.cartCreate.cart.id);
//     });
// });