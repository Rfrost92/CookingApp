//openaiService.ts
import OpenAI from "openai";
import {mockedResponses} from "../data/responseMock";
import {gptApiKey} from "../data/secrets";

const openai = new OpenAI({
    apiKey: gptApiKey
});

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

        console.log(prompt);

  /*      const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use the appropriate model
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });
*/
        // for testing:
        const recipe = mockedResponses[0].choices[0].message.content;
        // const recipe = response.choices[0].message.content;
        return recipe;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        throw error;
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

        console.log(prompt);

        /* Uncomment to use actual API
        const response = await openai.chat.completions.create({
            model: "gpt-4", // Use the appropriate model
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });
        const recipe = response.choices[0].message.content;
        */

        // For testing purposes
        const recipe = mockedResponses[0].choices[0].message.content;
        return recipe;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        throw error;
    }

};

export const fetchRecipeScenario3 = async (classicDishName) => {
    try {
        const prompt = `Please provide a detailed recipe for the classic dish "${classicDishName}". The recipe should include ingredients, quantities, and step-by-step instructions. Ensure the recipe is clear and easy to follow.`;

        console.log(prompt);

        /* Uncomment the following block to use the actual GPT API
        const response = await openai.chat.completions.create({
            model: "gpt-4", // Use the appropriate model
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });
        const recipe = response.choices[0].message.content;
        */

        // For testing purposes
        const recipe = mockedResponses[0].choices[0].message.content;

        return recipe;
    } catch (error) {
        console.error("Error fetching recipe for classic dish:", error);
        throw error;
    }
};
