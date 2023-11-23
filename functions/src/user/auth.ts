import { onCall } from "firebase-functions/v2/https";
import { sendOTPEmail } from "../mailer";


export const registerUser = onCall(async (request) => {
    const email = request.data.email;
    sendOTPEmail(email);
});