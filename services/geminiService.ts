import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { CHAT_MODEL, IMAGE_GEN_MODEL, SWING_ANALYSIS_PROMPT, COACH_SYSTEM_INSTRUCTION, INSTRUCTIONAL_SYSTEM_INSTRUCTION } from '../constants';
import { GolfCourse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let coachChat: Chat | null = null;
let instructionalChat: Chat | null = null;


// Coach Chat
export function createCoachChatSession(): Chat {
  if (coachChat) {
    return coachChat;
  }
  coachChat = ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: COACH_SYSTEM_INSTRUCTION,
    },
  });
  return coachChat;
}

export async function sendCoachMessage(message: string): Promise<AsyncGenerator<GenerateContentResponse>> {
  const chatInstance = createCoachChatSession();
  return chatInstance.sendMessageStream({ message });
}

// Instructional Chat
export function createInstructionalChatSession(): Chat {
    if (instructionalChat) {
        return instructionalChat;
    }
    instructionalChat = ai.chats.create({
        model: CHAT_MODEL,
        config: {
            systemInstruction: INSTRUCTIONAL_SYSTEM_INSTRUCTION,
        },
    });
    return instructionalChat;
}

export async function sendInstructionalMessage(message: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    const chatInstance = createInstructionalChatSession();
    return chatInstance.sendMessageStream({ message });
}


export async function analyzeSwingImage(base64Image: string, mimeType: string): Promise<string> {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = { text: SWING_ANALYSIS_PROMPT };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: { parts: [imagePart, textPart] },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error analyzing swing image:", error);
        return "Sorry, I encountered an error analyzing the image. Please try again.";
    }
}

export async function findGolfCourses(location: string): Promise<GolfCourse[]> {
    try {
        const prompt = `List 5 popular and highly-rated golf courses near ${location}.`;
        
        const response = await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        courses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The full name of the golf course." },
                                    description: { type: Type.STRING, description: "A brief, engaging description of the course." },
                                    features: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "A list of 3-4 key features, like 'links-style', 'fast greens', or 'designed by Jack Nicklaus'."
                                    }
                                },
                                required: ["name", "description", "features"]
                            }
                        }
                    },
                    required: ["courses"]
                }
            }
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) {
            return [];
        }
        const result = JSON.parse(jsonStr);
        return result.courses || [];
    } catch (error) {
        console.error("Error finding golf courses:", error);
        throw new Error("Sorry, I couldn't find courses for that location. Please try another search.");
    }
}


export async function generateHoleImage(prompt: string): Promise<string> {
    try {
        const fullPrompt = `A photorealistic image of a beautiful golf hole. ${prompt}. Professional golf course photography, golden hour lighting, vibrant colors.`;
        const response = await ai.models.generateImages({
            model: IMAGE_GEN_MODEL,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return "";
    } catch (error) {
        console.error("Error generating hole image:", error);
        throw new Error("Failed to generate the image. Please check the prompt and try again.");
    }
}
