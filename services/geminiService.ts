import { GoogleGenAI, Type } from "@google/genai";
import { createInitialFlashcard } from "./srsService";
import { Flashcard, Deck } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateFlashcards = async (
  content: string, 
  images: File[] = []
): Promise<Deck> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = 
    "You are an expert tutor. Create a set of flashcards from the provided text or images. " +
    "Focus on key terms, definitions, dates, and core concepts. " +
    "The 'front' should be a question, concept, or term. " +
    "The 'back' should be a concise definition, answer, or explanation.";

  const prompt = "Create comprehensive flashcards for the following content. Return a strictly valid JSON object.";

  // Prepare content parts
  const parts: any[] = [{ text: prompt }];

  // Add text content if provided
  if (content.trim()) {
    parts.push({ text: `Content: ${content}` });
  }

  // Process images
  for (const img of images) {
    const base64 = await fileToBase64(img);
    parts.push({
      inlineData: {
        mimeType: img.type,
        data: base64
      }
    });
  }

  // Define Schema
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      cards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
          },
          required: ["front", "back"],
        },
      },
    },
    required: ["cards"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const outputText = response.text;
    if (!outputText) throw new Error("No response from AI");

    const json = JSON.parse(outputText);
    
    if (!json.cards || !Array.isArray(json.cards)) {
        throw new Error("Invalid JSON structure returned");
    }

    const newCards: Flashcard[] = json.cards.map((c: any) => 
      createInitialFlashcard(generateId(), c.front, c.back)
    );

    return {
      id: generateId(),
      name: "Generated Deck " + new Date().toLocaleDateString(),
      cards: newCards,
      createdAt: Date.now()
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data URI prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};