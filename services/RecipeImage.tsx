//Recipeimage.tsx
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ActivityIndicator } from "react-native";
import axios from "axios";

export default function RecipeImage({ imageUrl, onImageFetched }) {
    const [base64Image, setBase64Image] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await axios.get(imageUrl, {
                    responseType: "arraybuffer",
                });

                const base64 = `data:image/png;base64,${Buffer.from(response.data, "binary").toString("base64")}`;
                setBase64Image(base64);

                // Pass Base64 image to parent
                if (onImageFetched) {
                    onImageFetched(base64);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching image:", error);
                setLoading(false);
            }
        };

        fetchImage();
    }, [imageUrl, onImageFetched]);

    if (loading) {
        return <ActivityIndicator size="large" color="#4caf50" />;
    }

    return base64Image ? (
        <Image source={{ uri: base64Image }} style={styles.recipeImage} />
    ) : null;
}

const styles = StyleSheet.create({
    recipeImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
});
