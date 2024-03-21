import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

export {
    shopifyProducts, getProductById, getProductsByCollectionId,
    getCustomCollections, getProductsByCollectionIdHttps, orderCreationWebhook,
    addCart,
} from "./shopify_apis";

export {
    sendOTP, registerNormalUser, verifyAccount, updateUserDoc,
    registerWithFirebase, getUserById, resendOTP,
    triggerWhenUserDeleted, subscribeWithSystem,
    getUserOrders, getQRCodesInPatch, getPatches,
    getFullStatistics,
} from "./user/user";

export {
    claimQRCode, getUserQrCodes,
    createBulkQRCode, createQRCodeRelatedToBulk,
    triggerOnDeleteBulk, getBatchById,
    getBatchAnalyticsById, getQRCodeById,
} from "./qr_codes/qr";

export { createWifiQRCode, updateWifiQRCode } from "./qr_codes/wifi";
export { createEmailQRCode, updateEmailQRCode } from "./qr_codes/email";
export { createSocialQRCode, updateSocialQRCode } from "./qr_codes/social";
export { createSMSQRCode, updateSMSQRCode } from "./qr_codes/sms";
export { createURLQRCode, updateURLQRCode } from "./qr_codes/url";
export { createWhatsappQRCode, updateWhatsappQRCode } from "./qr_codes/whatsapp";

export { checkPasswordOTP, updatePassword, sendPasswordOTP } from "./user/forget_password";

export { graphiQLAPI } from "./graphiql";

export {
    downloadQRCode, downloadWholeQRCode,
    zipTheBatch, generateQRCode,
} from "./file_manager/file_manager";

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });
