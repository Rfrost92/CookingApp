//openaiService.ts
import OpenAI from "openai";
import {mockedResponses} from "../data/responseMock";
import {gptApiKey} from "../data/secrets";
import {incrementNonSignedInRequests, incrementRequest} from "../helpers/incrementRequest";

const openai = new OpenAI({
    apiKey: gptApiKey
});
const testing = true; // to test

export const fetchRecipeScenario1 = async (requestData) => {

    try {
        let prompt = `I have the following ingredients: ${requestData.selectedIngredients.join(", ")}. 
        I would be ready to cook using following appliances: ${requestData.selectedAppliances.join(", ")}. 
        This should be a ${requestData.mealType} ${requestData.dishType} for ${requestData.portions} portions.
        I would be able to spend cooking up to ${requestData.maxCookingTime} minutes. 
        Can you suggest a healthy recipe for a human?`;

        if (requestData.openness > 0) {
            prompt += `On a scale of 3 I have the level ${requestData.openness} openness for additional (except mentioned above ingredients. `;
        }

        if (requestData.isVegan) {
            prompt += `The dish should be vegan. `;
        }

        if (requestData.isVegetarian) {
            prompt += `The dish should be vegeterian. `;
        }

        let recipe: string | null = '';
        if (requestData.user?.uid) {
            await incrementRequest(requestData.user.uid);
        } else if (!requestData.user?.uid) {
            await incrementNonSignedInRequests();
        }
        if (testing) {
            console.log(prompt);
            recipe = mockedResponses[0].choices[0].message.content;
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {role: "system", content: "You are a helpful assistant."},
                    {role: "user", content: prompt},
                ],
            });
            recipe = response.choices[0].message.content;
        }
        return recipe;
    } catch (error) {
        return { error: error.toString() };
    }
};

export const fetchRecipeScenario2 = async (requestData) => {
    try {
        let prompt = "";

        // Include cuisine if not "any"
        if (requestData.cuisine.toLowerCase() !== "any") {
            prompt += `The cuisine is ${requestData.cuisine}. `;
        }

        // Include thematic if not "any"
        if (requestData.thematic.toLowerCase() !== "any") {
            prompt += `The thematic is ${requestData.thematic}. `;
        }

        // Include star ingredient if not "any"
        if (requestData.starIngredient.toLowerCase() !== "any") {
            prompt += `The star ingredient is ${requestData.starIngredient}. `;
        }

        // Include appliances
        if (requestData.selectedAppliances[0].toLowerCase() !== "any") {
            prompt += `I would be ready to cook using the following appliances: ${requestData.selectedAppliances.join(", ")}. `;        }

        // Include meal type, dish type, portions, and cooking time
        prompt += `This should be a ${requestData.mealType} ${requestData.dishType} for ${requestData.portions} portions. `;
        prompt += `I would be able to spend cooking up to ${requestData.maxCookingTime} minutes. `;

        // Include openness to additional ingredients
        if (requestData.openness > 0) {
            prompt += `On a scale of 3, I have a level ${requestData.openness} openness to additional ingredients (except the ones mentioned above). `;
        }

        // Include dietary preferences
        if (requestData.isVegan) {
            prompt += `The dish should be vegan. `;
        }

        if (requestData.isVegetarian) {
            prompt += `The dish should be vegetarian. `;
        }

        prompt += "Can you suggest a healthy recipe for a human?";

        let recipe: string | null = '';

        if (requestData.user?.uid) {
            await incrementRequest(requestData.user.uid);
        } else if (!requestData.user?.uid) {
            await incrementNonSignedInRequests();
        }

        if (testing) {
            recipe = mockedResponses[0].choices[0].message.content;
            console.log(prompt);
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
            });
            recipe = response.choices[0].message.content;
        }

        return recipe;
    } catch (error) {
        if (error.message.includes("Daily request limit reached")) {
            return { error: error.toString() };
        }
        throw new Error("Unexpected error occurred");
    }

};

export const fetchRecipeScenario3 = async ({classicDishName, user}) => {
    try {
        const prompt = `Please provide a detailed recipe for the classic dish "${classicDishName}". The recipe should include ingredients, quantities, and step-by-step instructions. Ensure the recipe is clear and easy to follow.`;

        let recipe: string | null = '';
        if (user?.uid) {
            await incrementRequest(user.uid);
        } else if (!user?.uid) {
            await incrementNonSignedInRequests();
        }
        if (testing) {
            recipe = mockedResponses[0].choices[0].message.content;
            console.log(prompt);
        } else {
            const response = await openai.chat.completions.create({
                model: "gpt-4o", // Use the appropriate model
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
            });
            recipe = response.choices[0].message.content;
        }

        return recipe;
    } catch (error) {
        return { error: error.toString() };
    }
};
