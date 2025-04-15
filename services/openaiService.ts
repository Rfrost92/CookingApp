//openaiService.ts
import OpenAI from "openai";
import {mockedResponses, mockImageUrl} from "../data/responseMock";
import {incrementNonSignedInRequests, incrementRequest} from "../helpers/testUserAndRequestsHelpers";
import {sanitizeAndParseRecipe} from "../helpers/recipeHelpers";
import uuid from 'react-native-uuid';
import {logGptErrorResponse} from "../helpers/validator";

const openai = new OpenAI({
    apiKey: process.env.gptApiKey
});

const testing = true; // Set to `false` for production

const getLocalizedPromptPrefix = (language: string) => {
    const prefixMap = {
        en: "Please provide the recipe in English language. The whole response should be in English language",
        de: "Bitte geben Sie das Rezept auf Deutsch an. Die ganze Antwort muss auf Deutsch sein.",
        ua: "Будь ласка, надайте рецепт українською мовою. Вся відповідь має бути українською мовою",
        ru: "Пожалуйста, предоставьте рецепт на русском языке. Весь ответ должен быть на русском языке",
    };
    return prefixMap[language] || prefixMap.en;
};

export const fetchRecipeScenario1 = async (requestData) => {
    try {
        const languagePrefix = getLocalizedPromptPrefix(requestData.language);

        const prompt = `${languagePrefix}\n
        I have the following ingredients: ${requestData.selectedIngredients.join(", ")}. 
        I would be ready to cook using the following appliances: ${requestData.selectedAppliances.join(", ")}. 
        This should be a ${requestData.mealType} ${requestData.dishType} for ${requestData.portions} portions. 
        I would be able to spend cooking up to ${requestData.maxCookingTime} minutes. 
        ${
            requestData.openness > 0
                ? `On a scale of 3, I have a level ${requestData.openness} openness to additional ingredients (except the ones mentioned above). `
                : ""
        }
        ${
            requestData.isVegan ? "The dish should be vegan. " : ""
        }${requestData.isVegetarian ? "The dish should be vegetarian. " : ""}
        Can you suggest a healthy recipe for a human, using only edible ingredients?

        Please format your response strictly as a JSON object in the following structure:
        {
            "Prewords": "string", // should be in the requested before language
            "Title": "string", // should be in the requested before language
            "Description": "string", // should be in the requested before language
            "Ingredients": "string", // should be in the requested before language
            "Calories": "string", // per serving, in format: (n-m kcal) e.g. "500-600 kcal"
            "isVegan": "boolean" // true or false
            "isVegeterian": "boolean" // true or false
            "cookingTime": "number" // number of minutes to cook a dish in format: (n), e.g. "60"
            "Steps": "string", // should be in the requested before language
            "TitleEng": "string", // should be the Title of the dish in English
            "DescriptionEng": "string" // should be the Description of the dish in English
        }
        All ingredients and all steps should start with a new line. All steps should be numerated. New line should be marked as always with one backslash followed by letter n. 
        No other additional formatting characters should be present.
        Do not include any other text or explanations outside of this JSON object.`;

        let recipe: string | null = "";
        let image: string | null = "";

        try {
            if (requestData.user?.uid) {
                await incrementRequest(requestData.user.uid);
            } else {
                await incrementNonSignedInRequests();
            }
        } catch (error) {
            console.warn("Weekly limit reached:", error);
            return { error: "Error: Weekly request limit reached." };
        }

        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
            image = mockImageUrl;
            console.log('image', image)
            if (!recipe || recipe.includes("I'm sorry") || recipe.includes("I am sorry") || recipe.includes("I can't") || recipe.includes("I can not")) {
                console.warn("Blocked content detected. Showing user-friendly message.");
                logGptErrorResponse('UnknownUser', 'Sorry Error', recipe?.substring(0,100), prompt);
                return { error: "Error: Your input might be inappropriate or invalid. Try a different request." };
            }
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
            });
            recipe = response.choices[0].message.content;
            const parsedRecipe = sanitizeAndParseRecipe(recipe);
            if (!recipe || recipe.includes("I'm sorry") || recipe.includes("I am sorry") || recipe.includes("I can't") || recipe.includes("I can not")) {
                console.warn("Blocked content detected. Showing user-friendly message.");
                logGptErrorResponse('UnknownUser', 'Sorry Error', recipe?.substring(0,100), prompt);
                return { error: "Error: Your input might be inappropriate or invalid. Try a different request." };
            }
            image = await generateRecipeFluxImage(parsedRecipe.TitleEng, parsedRecipe.DescriptionEng);
        }
        return { recipe, image };
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return { error: error.toString() };
    }
};


export const fetchRecipeScenario2 = async (requestData) => {
    try {
        const languagePrefix = getLocalizedPromptPrefix(requestData.language);

        let prompt = `${languagePrefix}\n`;

        if (requestData.cuisine.toLowerCase() !== "any") {
            prompt += `The cuisine is ${requestData.cuisine}. `;
        }
        if (requestData.thematic.toLowerCase() !== "any") {
            prompt += `The thematic is ${requestData.thematic}. `;
        }
        if (requestData.starIngredient.toLowerCase() !== "any") {
            prompt += `The star ingredient is ${requestData.starIngredient}. `;
        }
        if (requestData.selectedAppliances[0].toLowerCase() !== "any") {
            prompt += `I would be ready to cook using the following appliances: ${requestData.selectedAppliances.join(", ")}. `;
        }

        prompt += `This should be a ${requestData.mealType} ${requestData.dishType} for ${requestData.portions} portions. `;
        prompt += `I would be able to spend cooking up to ${requestData.maxCookingTime} minutes. `;

        if (requestData.openness > 0) {
            prompt += `On a scale of 3, I have a level ${requestData.openness} openness to additional ingredients (except the ones mentioned above). `;
        }

        if (requestData.isVegan) {
            prompt += `The dish should be vegan. `;
        }

        if (requestData.isVegetarian) {
            prompt += `The dish should be vegetarian. `;
        }

        prompt += `Can you suggest a healthy recipe for a human, using only edible ingredients?

        Please format your response strictly as a JSON object in the following structure:
        {
            "Prewords": "string", // should be in the requested before language
            "Title": "string", // should be in the requested before language
            "Description": "string", // should be in the requested before language
            "Ingredients": "string", // should be in the requested before language
            "Calories": "string", // per serving, in format: (n-m kcal) e.g. "500-600 kcal"
            "isVegan": "boolean" // true or false
            "isVegeterian": "boolean" // true or false
            "cookingTime": "number" // number of minutes to cook a dish in format: (n), e.g. "60"
            "Steps": "string", // should be in the requested before language
            "TitleEng": "string", // should be the Title of the dish in English
            "DescriptionEng": "string" // should be the Description of the dish in English
        }
        All ingredients and all steps should start with a new line. All steps should be numerated. New line should be marked as always with one backslash followed by letter n. 
        No other additional formatting characters should be present.
        Do not include any other text or explanations outside of this JSON object.`;

        let recipe: string | null = "";
        let image: string | null = "";

        try {
            if (requestData.user?.uid) {
                await incrementRequest(requestData.user.uid);
            } else {
                await incrementNonSignedInRequests();
            }
        } catch (error) {
            console.warn("Weekly limit reached:", error);
            return { error: "Error: Weekly request limit reached." };
        }

        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
            image = mockImageUrl;
            console.log('image', image)
            if (!recipe || recipe.includes("I'm sorry") || recipe.includes("I am sorry") || recipe.includes("I can't") || recipe.includes("I can not")) {
                console.warn("Blocked content detected. Showing user-friendly message.");
                logGptErrorResponse('UnknownUser', 'Sorry Error', recipe?.substring(0,100), prompt);
                return { error: "Error: Your input might be inappropriate or invalid. Try a different request." };
            }
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
            });
            recipe = response.choices[0].message.content;
            if (!recipe || recipe.includes("I'm sorry") || recipe.includes("I am sorry") || recipe.includes("I can't") || recipe.includes("I can not")) {
                console.warn("Blocked content detected. Showing user-friendly message.");
                logGptErrorResponse('UnknownUser', 'Sorry Error', recipe?.substring(0,100), prompt);
                return { error: "Error: Your input might be inappropriate or invalid. Try a different request." };
            }
            const parsedRecipe = sanitizeAndParseRecipe(recipe);
            image = await generateRecipeFluxImage(parsedRecipe.TitleEng, parsedRecipe.DescriptionEng);
        }
        return { recipe, image };
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return { error: error.toString() };
    }
};


export const fetchRecipeScenario3 = async ({ classicDishName, user, language, description }) => {
    try {
        const languagePrefix = getLocalizedPromptPrefix(language);
        const descriptionIncluded = description ? 'Description of the dish: ' + description : '';
        const prompt = `${languagePrefix}\nPlease provide a detailed recipe for the classic dish "${classicDishName}". ${descriptionIncluded}

        The recipe should include ingredients, quantities, and step-by-step instructions. Ensure the recipe is clear and easy to follow.

        Please format your response strictly as a JSON object in the following structure:
        {
            "Prewords": "string", // should be in the requested before language
            "Title": "string", // should be in the requested before language
            "Description": "string", // should be in the requested before language
            "Ingredients": "string", // should be in the requested before language
            "Calories": "string", // per serving, in format: (n-m kcal) e.g. "500-600 kcal"
            "isVegan": "boolean" // true or false
            "isVegeterian": "boolean" // true or false
            "cookingTime": "number" // number of minutes to cook a dish in format: (n), e.g. "60"
            "Steps": "string", // should be in the requested before language
            "TitleEng": "string", // should be the Title of the dish in English
            "DescriptionEng": "string" // should be the Description of the dish in English
            "Portions": "number" // should be the number of servings in format (n), e.g. "2"
        }
        All ingredients and all steps should start with a new line. All steps should be numerated. New line should be marked as always with one backslash followed by letter n. 
        No other additional formatting characters should be present.
        Do not include any other text or explanations outside of this JSON object.`;

        let recipe: string | null = "";
        let image: string | null = "";

        try {
            if (user?.uid) {
                await incrementRequest(user.uid);
            } else {
                await incrementNonSignedInRequests();
            }
        } catch (error) {
            console.warn("Weekly limit reached:", error);
            return { error: "Error: Weekly request limit reached." }; // Properly return error
        }

        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
            image = mockImageUrl;
            console.log('image', image);
            if (!recipe || recipe.includes("I'm sorry") || recipe.includes("I am sorry") || recipe.includes("I can't") || recipe.includes("I can not")) {
                console.warn("Blocked content detected. Showing user-friendly message.");
                logGptErrorResponse('UnknownUser', 'Sorry Error', recipe?.substring(0,100), prompt);
                return { error: "Error: Your input might be inappropriate or invalid. Try a different request." };
            }
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
            });
            recipe = response.choices[0].message.content;
            if (!recipe || recipe.includes("I'm sorry") || recipe.includes("I am sorry") || recipe.includes("I can't") || recipe.includes("I can not")) {
                console.warn("Blocked content detected. Showing user-friendly message.");
                logGptErrorResponse('UnknownUser', 'Sorry Error', recipe?.substring(0,100), prompt);
                return { error: "Error: Your input might be inappropriate or invalid. Try a different request." };
            }
            const parsedRecipe = sanitizeAndParseRecipe(recipe);
            image = await generateRecipeFluxImage(parsedRecipe.TitleEng, parsedRecipe.DescriptionEng);
        }

        return { recipe, image };
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return { error: error.toString() };
    }
};

export const generateRecipeImage = async (title: string, description: string) => {
    try {
        const origPrompt = `A high-quality, ultra-realistic food photograph of "${title}".
        - The dish is described as: ${description}.
        - The image should be highly detailed and photorealistic.
        - It should resemble professional food photography.
        - No artificial elements, no cartoonish styles.
        - The background should be blurred to create a depth effect.
        - NO text, NO labels, NO watermarks, NO letters.
        - The dish should be plated on a natural setting with soft lighting.`;
        const maxLength = 980;
        let prompt = origPrompt.length > maxLength ? origPrompt.slice(0, maxLength) : origPrompt;
        if (prompt.length == 980) {
            prompt += '. etc...'
        }
        console.log(prompt);
        const response = await openai.images.generate({
            prompt,
            n: 1, // Number of images to generate
            size: "512x512", // Specify the size of the image
        });

        if (response?.data?.[0]?.url) {
            return response.data[0].url;
        } else {
            throw new Error("Image generation failed");
        }
    } catch (error) {
        console.error("Error generating recipe image:", error);
        return null; // Fallback to null if image generation fails
    }
};

const generateRecipeFluxImage = async (title, description) => {
    try {
        const apiKey = process.env.runwareApiKey
        const taskUUID = uuid.v4();
        const requestBody = [
            {
                "taskType": "authentication",
                "apiKey": apiKey
            },
            {
                "taskType": "imageInference",
                "taskUUID": taskUUID, // Generate a unique task ID
                "positivePrompt": `A high-quality, ultra-realistic food photograph of "${title}".
                                    - The dish is described as: ${description}.
                                    - The image should be highly detailed and photorealistic.
                                    - It should resemble professional food photography.
                                    - No artificial elements, no cartoonish styles.
                                    - The background should be blurred to create a depth effect.
                                    - NO text, NO labels, NO watermarks, NO letters.
                                    - The dish should be plated on a natural setting with soft lighting.`,
                "width": 512,
                "height": 512,
                "model": "runware:100@1", // Flux Schnell
               // "model": "runware:101@1", // Flux Dev
                "numberResults": 1
            }
        ];
        const response = await fetch("https://api.runware.ai/v1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (data?.data?.length > 0 && data.data[0].imageURL) {
            const imageResult = data.data[0].imageURL;
            console.log('imageResult:', imageResult);
            return imageResult; //Return the image URL
        }
        throw new Error("Image URL not found in response.");
    } catch (error) {
        console.error("Error generating recipe image:", error);
        return null;
    }
};

export const fetchIngredientsFromImage = async (base64Image: string, language: string) => {
    const localizedInstruction = {
        en: `You're an ingredient detector AI. I will send you a photo of ingredients.
Your task is to return a JSON list of the visible ingredients (no quantities or units). The ingredient names must be in English.
The JSON key must be "ingredients".`,
        de: `Du bist eine Zutatenerkennungs-KI. Ich sende dir ein Foto von Zutaten.
Gib bitte eine JSON-Liste der erkannten Zutaten zurück (keine Mengenangaben oder Einheiten). Die Zutaten sollen auf Deutsch sein.
Aber der Schlüssel muss auf Englisch bleiben: "ingredients".`,
        ua: `Ти — ШІ для розпізнавання інгредієнтів. Я надішлю фото інгредієнтів.
Поверни JSON-список інгредієнтів (без кількостей і одиниць). Інгредієнти мають бути українською.
Але ключ повинен залишитися англійською — "ingredients".`,
        ru: `Ты — ИИ для распознавания ингредиентов. Я пришлю фото ингредиентов.
Верни JSON-список ингредиентов (без количеств и единиц). Названия должны быть на русском.
НО ключ должен остаться английским — "ingredients".`,
    };

    const prompt = `${localizedInstruction[language] || localizedInstruction.en}

Return response strictly in this format:
{ "ingredients": ["Ingredient1", "Ingredient2", "Ingredient3", ...] }
Again: "ingredients" key should stay in English, the ingredients list ("Ingredient1", "Ingredient2") should be in the language that I asked you before: ${language}.
Only return that JSON. Do not include explanations or anything else.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const raw = response.choices?.[0]?.message?.content;

        if (!raw || typeof raw !== "string") {
            console.warn("Unexpected vision response format:", response);
            return null;
        }

        const match = raw.match(/\{[\s\S]*?\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (err) {
                console.error("❌ JSON parsing failed from AI vision result:", match[0]);
                return null;
            }
        } else {
            console.warn("No JSON object found in response:", raw);
            return null;
        }
    } catch (err) {
        console.error("OpenAI vision error:", err);
        return null;
    }
};
