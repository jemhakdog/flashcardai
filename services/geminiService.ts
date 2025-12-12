import { GoogleGenAI, Type } from "@google/genai";
import { createInitialFlashcard } from "./srsService";
import { Flashcard, Deck } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateFlashcards = async (
  content: string, 
  files: File[] = []
): Promise<Deck> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = 
    "You are an expert tutor. Create a set of flashcards from the provided text, images, or documents. " +
    "Focus on key terms, definitions, dates, and core concepts. " +
    "The 'front' should be a question, concept, or term. " +
    "The 'back' should be a concise definition, answer, or explanation.";

  const prompt = "Create comprehensive flashcards for the following content. Return a strictly valid JSON object.";

  // Prepare content parts
  const parts: any[] = [{ text: prompt }];

  // Add text input if provided
  if (content.trim()) {
    parts.push({ text: `Context Note: ${content}` });
  }

  // Process files
  for (const file of files) {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const base64 = await fileToBase64(file);
        parts.push({
            inlineData: {
                mimeType: file.type,
                data: base64
            }
        });
    } else if (file.type.startsWith('text/')) {
        // For text files, we read them and append to prompt
        const textContent = await fileToText(file);
        parts.push({ text: `File Content (${file.name}):\n${textContent}` });
    }
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

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};