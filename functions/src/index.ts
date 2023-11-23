import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
export { shopifyProducts, getProductById, getProductsByCollectionId } from "./shopify_apis";
export { sendOTP, registerNormalUser, verifyAccount, updateUserDoc } from "./user/auth";

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });
