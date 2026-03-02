import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Meal {
  name: string;
  day: number;
  type: 'breakfast' | 'lunch' | 'dinner';
  ingredients: string[];
  recipe: string;
  nutrition: {
    carbs: string;
    fats: string;
    proteins: string;
  };
  estimatedCost: number;
}

export interface ShoppingItem {
  exactProductInfo: string;
  englishName: string;
}

export interface MealPlanResponse {
  meals: Meal[];
  shoppingList: ShoppingItem[];
  totalEstimatedCost: number;
  currency: string;
}

export async function generateMealPlan(budget: number, groceryUrl: string): Promise<MealPlanResponse> {
  const model = "gemini-3-flash-preview";
    const prompt = `
    I have a budget of ${budget} and I want to shop at this grocery store: ${groceryUrl}.
    
    CRITICAL INSTRUCTION FOR SHOPPING LIST:
    1. PRIORITY 1 (Exact Match): Search the provided URL for specific products. If you find a match, the "exactProductInfo" MUST be a verbatim copy-paste of the product name, weight/quantity, and price as it appears on the website. DOUBLE CHECK that the price matches the specific product name found.
    2. PRIORITY 2 (General Fallback): If a specific product or price is NOT found on the website, DO NOT make up a fake brand. Instead, provide a general name with a typical quantity and a reasonable average price in Taiwan (e.g., "蛋 10入/盒 NT80" or "香蕉 1000g NT115").
    3. For the "ingredients" list in each meal, display the PORTION used for that meal and its proportional cost (e.g., "國產去骨腿肉三連包 1入/400g NT$120").
    4. Ensure the currency symbol matches the website (usually NT$ or NTD).

    YOGURT RULE:
    - Exclusively use "Costco Nonfat Nonsweet Greek Yogurt" if available.
    - If Costco Greek Yogurt is not found, you MUST find a similar nonfat, nonsweet Greek yogurt with these approximate nutritional values per 170g: 100 kcal, 16g Protein, 0g Fat, 9g Carbs (5g Sugar).

    Please analyze the products and prices available at the provided URL.
    Then, suggest a FULL WEEKLY MEAL PLAN (21 distinct meals: 3 meals per day for 7 days) that can be made using ingredients found at that store (or general fallbacks), staying within the total budget of ${budget}.
    
    Constraints:
    - MEAL PORTIONS: Lunch MUST be the largest and most substantial meal of the day. Ensure it has the highest calorie and volume count compared to breakfast and dinner.
    - FOOD DIVERSITY: Ensure a wide variety of flavors, cuisines, and ingredients throughout the 21 meals. Avoid repeating the same meal or very similar flavor profiles too often.
    - Every Breakfast MUST be low-carb.
    - Every Dinner MUST be carb-heavy.
    - Prioritize using these staple foods: lentils, potato, sweet potato, eggs, steak, pork, chicken breast, mixed vegetables, Greek yogurt with fruit, and paocai.
    - COOKING STYLE (Delicious.com.au style): Recipes should be healthy, vibrant, and quick to prepare (ideally under 30 minutes). Focus on fresh flavors, simple but effective seasoning, and modern presentation.
    - RECIPE INSTRUCTIONS: For every meal, provide a detailed, step-by-step recipe. It must be clear, concise, and easy to follow. You MUST use NUMBERED STEPS in Markdown format (e.g., "1. Step one\n2. Step two").
    
    For each of the 21 meals, provide:
    1. A catchy name for the meal.
    2. The day number (1 to 7).
    3. The meal type (breakfast, lunch, or dinner).
    4. A list of ingredients showing the PORTION used for this meal and its proportional cost.
    5. Detailed step-by-step recipe instructions using NUMBERED STEPS in Markdown.
    6. Nutritional information: Carbohydrates, Fats, and Proteins (e.g., "15g").
    7. The estimated total cost for that specific meal based on the portioned prices.
    
    Also, generate a consolidated Shopping List of all items needed for these 21 meals.
    For each item in the shopping list, provide:
    - The "exactProductInfo": Either a verbatim match from the site (with verified price) OR a general name + quantity + average price if not found.
    - A brief English name for context.
    
    Ensure the total cost of all 21 meals combined is strictly within or very close to the ${budget} budget.
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  day: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["breakfast", "lunch", "dinner"] },
                  ingredients: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  recipe: { type: Type.STRING },
                  nutrition: {
                    type: Type.OBJECT,
                    properties: {
                      carbs: { type: Type.STRING },
                      fats: { type: Type.STRING },
                      proteins: { type: Type.STRING }
                    },
                    required: ["carbs", "fats", "proteins"]
                  },
                  estimatedCost: { type: Type.NUMBER }
                },
                required: ["name", "day", "type", "ingredients", "recipe", "nutrition", "estimatedCost"]
              }
            },
            shoppingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  exactProductInfo: { type: Type.STRING },
                  englishName: { type: Type.STRING }
                },
                required: ["exactProductInfo", "englishName"]
              }
            },
            totalEstimatedCost: { type: Type.NUMBER },
            currency: { type: Type.STRING }
          },
          required: ["meals", "shoppingList", "totalEstimatedCost", "currency"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as MealPlanResponse;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
}
