import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
export { shopifyProducts } from "./shopify_apis";
export { registerUser } from "./user/auth";

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });
