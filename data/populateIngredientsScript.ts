// scripts/populateDishImages.ts
import fs from "fs";
import path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import mime from "mime";
import * as serviceAccount from "./serviceAccountKey.json"; // ✅ Your service account key

// 🔧 Initialize Firebase Admin with service account
initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: "your-project-id.appspot.com", // ❗ Replace with your actual bucket name
});

const db = getFirestore();
const bucket = getStorage().bucket();

const localFolderPath = path.join(__dirname, "../assets/dishes");

const uploadAndLinkImages = async () => {
    const files = fs.readdirSync(localFolderPath);

    for (const file of files) {
        const id = path.parse(file).name; // 'spaghetti_carbonara' from 'spaghetti_carbonara.jpg'
        const localPath = path.join(localFolderPath, file);
        const remotePath = `dishes/${file}`;
        const contentType = mime.getType(file) || "image/jpeg";

        console.log(`⏫ Uploading ${file}...`);

        // Upload to Firebase Storage
        await bucket.upload(localPath, {
            destination: remotePath,
            metadata: { contentType },
        });

        // Make image publicly accessible
        const fileRef = bucket.file(remotePath);
        await fileRef.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
        console.log(`✅ Public URL: ${publicUrl}`);

        // Update Firestore with image URL
        await db.collection("classicDishes").doc(id).update({ imageUrl: publicUrl });
        console.log(`📝 Updated Firestore document: ${id}`);
    }

    console.log("🎉 All dishes processed!");
};

uploadAndLinkImages().catch(console.error);
