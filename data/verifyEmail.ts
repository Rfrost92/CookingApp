// verifyEmail.ts
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uid = "hOQX0BhN3hZztc74dSo7chLvrNt1";

admin
    .auth()
    .updateUser(uid, { emailVerified: true })
    .then((userRecord) => {
        console.log(`✅ Email verified for user: ${userRecord.email}`);
    })
    .catch((error) => {
        console.error("❌ Error verifying email:", error);
    });
