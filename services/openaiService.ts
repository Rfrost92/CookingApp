//openaiService.ts
import OpenAI from "openai";
import {mockedResponses} from "../data/responseMock";
import {gptApiKey} from "../data/secrets";

const openai = new OpenAI({
    apiKey: gptApiKey
});

export const fetchRecipe = async (requestData) => {

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

