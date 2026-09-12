import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export interface DetectedIngredient {
  id: string;
  name: string;
  category: "Produce" | "Dairy" | "Protein" | "Condiments" | "Bakery & Grains" | "Pantry & Spices" | "Leftovers & Other";
  quantityEstimated: string;
  freshnessStatus: "Fresh" | "Use Soon" | "Expiring";
  notes?: string;
}

export interface MissingIngredient {
  name: string;
  amount: string;
  estimatedPrice: number;
  storeCategory: string;
  substituteOption: string;
}

export interface MealRecipe {
  id: string;
  title: string;
  tier: "ready_now" | "quick_trip" | "gourmet_upgrade";
  tierLabel: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  calories: number;
  nutrition: {
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
  };
  ingredientsHave: Array<{ name: string; amount: string }>;
  ingredientsMissing: MissingIngredient[];
  instructions: string[];
  chefTip: string;
  wasteReductionNote?: string;
}

export interface AnalysisResult {
  fridgeSummary: {
    totalItemsDetected: number;
    varietyScore: "Low" | "Balanced" | "Abundant";
    keyProteins: string[];
    perishableWarning: string[];
    generalObservation: string;
  };
  detectedIngredients: DetectedIngredient[];
  suggestedMeals: MealRecipe[];
}

export async function analyzeFridgeImage(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  preferences?: {
    dietary?: string;
    maxCookTime?: string;
    skillLevel?: string;
    cuisinePreference?: string;
    targetTier?: string;
  }
): Promise<AnalysisResult> {
  const ai = getAiClient();

  // Clean base64 string if data URL prefix was included
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

  const prompt = `You are an expert executive culinary chef and smart food waste reduction assistant.
Carefully analyze the image of the user's refrigerator / food pantry.
1. Identify all recognizable ingredients, containers, condiments, dairy, produce, meats, leftovers, and items visible.
2. Formulate realistic estimates of ingredient freshness ("Fresh", "Use Soon", or "Expiring").
3. Suggest 3 to 4 distinct meal ideas tailored to what is visible:
   - At least ONE "ready_now" meal: Can be cooked immediately using ONLY items visible in the fridge plus basic kitchen staples (water, salt, pepper, oil, basic flour/sugar).
   - At least ONE "quick_trip" meal: An easy, delicious meal requiring 1 to 3 missing ingredients that can be quickly ordered from a local grocery delivery service (like Instacart or Walmart).
   - ONE "gourmet_upgrade" meal: An elevated, inspiring dish requiring 3 to 5 missing grocery items.
4. For every missing ingredient, provide:
   - A reasonable estimated price in USD (e.g., 2.50, 3.99).
   - The grocery store department (e.g. "Produce", "Dairy", "Meat & Seafood", "Pantry").
   - A zero-cost smart kitchen substitute (e.g. if buttermilk is missing: "1 cup milk + 1 tbsp lemon juice or white vinegar").
5. User preferences to consider:
   - Dietary: ${preferences?.dietary || "Any / balanced"}
   - Max Cook Time: ${preferences?.maxCookTime || "Any"}
   - Cuisine preference: ${preferences?.cuisinePreference || "Diverse / global"}

Return strictly valid JSON matching the schema with detailed, culinary-grade instructions.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fridgeSummary: {
              type: Type.OBJECT,
              properties: {
                totalItemsDetected: { type: Type.INTEGER },
                varietyScore: { type: Type.STRING },
                keyProteins: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                perishableWarning: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                generalObservation: { type: Type.STRING },
              },
              required: ["totalItemsDetected", "varietyScore", "keyProteins", "perishableWarning", "generalObservation"],
            },
            detectedIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantityEstimated: { type: Type.STRING },
                  freshnessStatus: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ["id", "name", "category", "quantityEstimated", "freshnessStatus"],
              },
            },
            suggestedMeals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tier: { type: Type.STRING },
                  tierLabel: { type: Type.STRING },
                  description: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  cookTime: { type: Type.STRING },
                  totalTime: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  calories: { type: Type.INTEGER },
                  nutrition: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.STRING },
                      carbs: { type: Type.STRING },
                      fat: { type: Type.STRING },
                      fiber: { type: Type.STRING },
                    },
                    required: ["protein", "carbs", "fat"],
                  },
                  ingredientsHave: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                      },
                      required: ["name", "amount"],
                    },
                  },
                  ingredientsMissing: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        storeCategory: { type: Type.STRING },
                        substituteOption: { type: Type.STRING },
                      },
                      required: ["name", "amount", "estimatedPrice", "storeCategory", "substituteOption"],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  chefTip: { type: Type.STRING },
                  wasteReductionNote: { type: Type.STRING },
                },
                required: [
                  "id",
                  "title",
                  "tier",
                  "tierLabel",
                  "description",
                  "cuisine",
                  "prepTime",
                  "cookTime",
                  "totalTime",
                  "difficulty",
                  "calories",
                  "nutrition",
                  "ingredientsHave",
                  "ingredientsMissing",
                  "instructions",
                  "chefTip",
                ],
              },
            },
          },
          required: ["fridgeSummary", "detectedIngredients", "suggestedMeals"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No output text received from Gemini model");
    }

    const parsed: AnalysisResult = JSON.parse(text);
    return parsed;
  } catch (error: any) {
    console.error("Gemini Fridge Analysis Error:", error);
    throw error;
  }
}

export async function askChefAssistant(
  question: string,
  context?: {
    fridgeItems?: string[];
    currentMeal?: string;
    dietaryRestrictions?: string;
  }
): Promise<string> {
  const ai = getAiClient();

  const systemInstruction = `You are Chef Remy, a friendly, ultra-knowledgeable culinary coach and grocery planning assistant.
You help users make the most of their fridge contents, troubleshoot cooking techniques, calculate grocery costs, and suggest kitchen substitutes.
Keep responses practical, concise, encouraging, and easy to read with short bullet points when listing steps or items.`;

  const prompt = `Current fridge inventory: ${context?.fridgeItems?.join(", ") || "General fridge stock"}
Selected recipe/meal: ${context?.currentMeal || "None"}
Dietary notes: ${context?.dietaryRestrictions || "None"}

User Question: ${question}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text || "I couldn't generate a response. Please try asking again!";
}
