//openaiService.ts
import OpenAI from "openai";
import {mockedResponses} from "../data/responseMock";
import {gptApiKey} from "../data/secrets";

const openai = new OpenAI({
    apiKey: gptApiKey
});

export const fetchRecipe = async (selectedIngredients) => {
    try {
        const prompt = `I have the following ingredients: ${selectedIngredients.join(
            ", "
        )}. Can you suggest a recipe using these ingredients?`;

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

