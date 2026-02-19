
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, AIInsight } from "../types";

export const analyzeHabits = async (habits: Habit[]): Promise<AIInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Format data for the prompt
  const habitDataSummary = habits.map(h => ({
    name: h.name,
    category: h.category,
    completionDates: h.entries.filter(e => e.completed).map(e => e.date),
    target: h.targetPerWeek
  }));

  const prompt = `
    Analyze these user habits and provide productivity coaching. 
    Current Habits Data: ${JSON.stringify(habitDataSummary)}
    
    The analysis should be constructive and encouraging. 
    Focus on trends, suggest new habits that complement existing ones, and identify potential burnout or friction points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A professional summary of the user's progress.",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 actionable steps to improve habits.",
            },
            motivationalQuote: {
              type: Type.STRING,
              description: "A tailored motivational quote.",
            },
            predictedSuccess: {
              type: Type.NUMBER,
              description: "A predicted score of reaching their goals based on current trends (0-100).",
            }
          },
          required: ["summary", "suggestions", "motivationalQuote", "predictedSuccess"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as AIInsight;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze habits. Please try again later.");
  }
};
