import fs from "fs";
import path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import mime from "mime-types"; // ✅ Use mime-types instead
import * as serviceAccount from "./serviceAccountKey.json";

initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: "cooking-app-3ff5f.firebasestorage.app",
});

const db = getFirestore();
const bucket = getStorage().bucket();

const localFolderPath = path.join(__dirname, "../assets/dishes");

const uploadAndLinkImages = async () => {
    const files = fs.readdirSync(localFolderPath).filter(file => file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png"));

    for (const file of files) {
        const id = path.parse(file).name;
        const localPath = path.join(localFolderPath, file);
        const remotePath = `dishes/${file}`;
        const contentType = mime.lookup(file) || "image/jpeg"; // ✅ fixed

        console.log(`⏫ Uploading ${file}...`);

        await bucket.upload(localPath, {
            destination: remotePath,
            metadata: { contentType: contentType as string },
        });

        const fileRef = bucket.file(remotePath);
        await fileRef.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
        console.log(`✅ Public URL: ${publicUrl}`);

        await db.collection("classicDishes").doc(id).update({ imageUrl: publicUrl });
        console.log(`📝 Updated Firestore document: ${id}`);
    }

    console.log("🎉 All dishes processed!");
};

uploadAndLinkImages().catch(console.error);
