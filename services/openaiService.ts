//openaiService.ts
import OpenAI from "openai";
import {mockedResponses, mockImageUrl} from "../data/responseMock";
import {gptApiKey} from "../data/secrets";
import {incrementNonSignedInRequests, incrementRequest} from "../helpers/incrementRequest";
import {sanitizeAndParseRecipe} from "../helpers/recipeHelpers";

const openai = new OpenAI({
    apiKey: gptApiKey
});

const testing = true; // Set to `false` for production

const getLocalizedPromptPrefix = (language: string) => {
    const prefixMap = {
        en: "Please provide the recipe in English.",
        de: "Bitte geben Sie das Rezept auf Deutsch an.",
        ua: "Будь ласка, надайте рецепт українською мовою.",
        ru: "Пожалуйста, предоставьте рецепт на русском языке.",
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
            "Prewords": "string",
            "Title": "string",
            "Description": "string",
            "Ingredients": "string",
            "Calories": "string",
            "Steps": "string"
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
            console.warn("Daily limit reached:", error);
            return { error: "Error: Daily request limit reached." };
        }

        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
            image = mockImageUrl;
            console.log('image', image)
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
            image = await generateRecipeImage(parsedRecipe.Title, parsedRecipe.Description);
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
            "Prewords": "string",
            "Title": "string",
            "Description": "string",
            "Ingredients": "string",
            "Calories": "string",
            "Steps": "string"
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
            console.warn("Daily limit reached:", error);
            return { error: "Error: Daily request limit reached." };
        }

        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
            image = mockImageUrl;
            console.log('image', image)
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
            image = await generateRecipeImage(parsedRecipe.Title, parsedRecipe.Description);
        }
        return { recipe, image };
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return { error: error.toString() };
    }
};


export const fetchRecipeScenario3 = async ({ classicDishName, user, language }) => {
    try {
        const languagePrefix = getLocalizedPromptPrefix(language);
        const prompt = `${languagePrefix}\nPlease provide a detailed recipe for the classic dish "${classicDishName}". 

        The recipe should include ingredients, quantities, and step-by-step instructions. Ensure the recipe is clear and easy to follow.

        Please format your response strictly as a JSON object in the following structure:
        {
            "Prewords": "string",
            "Title": "string",
            "Description": "string",
            "Ingredients": "string",
            "Calories": "string",
            "Steps": "string"
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
            console.warn("Daily limit reached:", error);
            return { error: "Error: Daily request limit reached." }; // Properly return error
        }

        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
            image = mockImageUrl;
            console.log('image', image)
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
            image = await generateRecipeImage(parsedRecipe.Title, parsedRecipe.Description);
        }

        return { recipe, image };
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return { error: error.toString() };
    }
};

export const generateRecipeImage = async (title: string, description: string) => {
    try {
        const origPrompt = `A realistic, photorealistic, appetizing image of the dish "${title}", which is described as: ${description}.
        The image should be photorealistic and should not include any text, watermarks, or letters.`;
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
