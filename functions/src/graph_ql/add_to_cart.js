/* eslint-disable max-len */
import {createStorefrontApiClient} from "@shopify/storefront-api-client";
import { onCall } from "firebase-functions/v1/https";

const client = createStorefrontApiClient({
  storeDomain: "https://209c5e-2.myshopify.com",
  apiVersion: "2024-01",
  publicAccessToken: "",
});


export const addToCart = onCall(async (request) => {
console.log("request.data = " + request.data);
const cartQuery = `
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
             }
`;
    const {data, errors, extensions} = await client.request(cartQuery, {variables: {}}).then( async (result) => {
        console.log("data = " + data);
        console.log("errors = " + errors);
        console.log("extensions = " + extensions);
        console.log("result = " + result);
        console.log("result.stringify = " + JSON.stringify(result));
        console.log("result.stringify.data = " + JSON.stringify(result).data);
        console.log("result.stringify.data.cartCreate = " + JSON.stringify(result).data.cartCreate);
        console.log("result.stringify.data.cartCreate.cart = " + JSON.stringify(result).data.cartCreate.cart);
        console.log("result.stringify.data.cartCreate.cart.id = " + JSON.stringify(result).data.cartCreate.cart.id);
        console.log("result.stringify.data.cartCreate.cart.checkoutUrl = " + JSON.stringify(result).data.cartCreate.cart.checkoutUrl);
    });
});
