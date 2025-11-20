import { GoogleGenAI } from "@google/genai";
import { Task, TASK_TYPE_LABELS } from "../types";

export const analyzeProductivity = async (tasks: Task[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare data context for Gemini
  const taskSummary = tasks.map(t => ({
    date: t.date,
    type: TASK_TYPE_LABELS[t.type],
    description: t.description,
    duration: `${t.durationMinutes} mins`
  }));

  const prompt = `
    Analyze the following activity log for a professional.
    Provide 3 key insights about their productivity and time allocation.
    Identify if there is too much time spent on Administrative work versus Creative or Learning.
    Keep the tone encouraging but analytical.
    
    Data: ${JSON.stringify(taskSummary)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to generate analysis at this time. Please check your API key and internet connection.";
  }
};