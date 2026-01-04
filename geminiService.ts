
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { db } from "./NeuralDB";

// Professional initialization with hardcoded fallback for local environment stability
const getAI = () => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY || "AIzaSyBtGFBxBpvZRj7r-di4zSoqOg4BwUtpfl8";
  return new GoogleGenAI({ apiKey });
};

const THERAPIST_SYSTEM_PROMPT = `
YOU ARE A LICENSED AI MENTAL HEALTH THERAPIST FOR MINDCORE OS.
- Tone: Empathetic, calm, validating, and professional.
- Methodology: Use Cognitive Behavioral Therapy (CBT) and Mindfulness techniques.
- Goal: Help users manage stress, anxiety, and daily struggles.
- Language: Simple human words (No complex medical jargon).
- Boundary: Never claim to be a replacement for emergency psychiatric services or a real human doctor.
- Culture: Be aware of Nepali values and context.
`;

export const testConnection = async () => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
      config: { maxOutputTokens: 10, thinkingConfig: { thinkingBudget: 0 } }
    });
    return { success: !!response.text };
  } catch (e: any) {
    console.error("Gemini API Test Failed:", e);
    return { success: false, error: e.message || 'Check your internet connection.' };
  }
};

export const getTherapyResponse = async (history: any[], userMessage: string) => {
  const ai = getAI();
  
  // Log message to database internally
  db.insert('activities', { message: userMessage, type: 'CHAT_INPUT' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
      config: { 
        systemInstruction: THERAPIST_SYSTEM_PROMPT, 
        temperature: 0.7,
      },
    });
    const botResponse = response.text || "Kernel busy, retrying sync...";
    db.insert('activities', { message: botResponse, type: 'CHAT_OUTPUT' });
    return botResponse;
  } catch (error: any) { 
    console.error("Gemini API Error:", error);
    return `Neural Bridge Error: ${error.message || "Unknown Failure"}. Please check your connection.`; 
  }
};

export const detectCrisis = async (text: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Is this a self-harm emergency? Respond ONLY YES or NO: "${text}"` }] }]
    });
    return response.text?.toUpperCase().includes('YES') || false;
  } catch { return false; }
};

export const analyzeFaceEmotion = async (base64Image: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze facial micro-expressions. Respond ONLY JSON: { 'emotion': 'Happy/Sad/Angry/Neutral/Stressed', 'confidence': 0.XX }" },
        ],
      },
    });
    return response.text || "{}";
  } catch (e) { 
    console.error("Vision Analysis Error:", e);
    return "{}"; 
  }
};

export const getMeditationScript = async (situation: string) => {
  const ai = getAI();
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Generate a short guided meditation for ${situation}.` }] }]
    });
    return res.text || "Breathe deeply.";
  } catch { return "Focus on your breath."; }
};

export const getMoodInsight = async (data: any[]) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Analyze mood trends: ${JSON.stringify(data)}. Give 1 supportive sentence.` }] }]
    });
    return response.text || "Neural trends stable.";
  } catch { return "Cognitive stability within normal parameters."; }
};

export const getSleepRoutine = async (issue: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Sleep hygiene for: ${issue}.` }] }]
    });
    return response.text || "Sleep protocol unavailable.";
  } catch { return "Error generating sleep routine."; }
};

export const generateMoodArt = async (mood: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Abstract therapeutic art for: ${mood}` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch { return null; }
};

export const getNutritionTips = async (mood: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Brain foods for: ${mood}.` }] }]
    });
    return response.text || "Dietary insight unavailable.";
  } catch { return "Unable to sync with Nutrition AI."; }
};

export const generateRoadmap = async (goal: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `Generate a detailed professional mental wellness roadmap for the following goal: ${goal}. Use markdown formatting with clear steps.` }] }]
    });
    return response.text || "No roadmap generated.";
  } catch (e) {
    console.error("Roadmap Generation Error:", e);
    return "Error generating roadmap.";
  }
};
