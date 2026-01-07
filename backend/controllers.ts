
import { db } from './database';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');

// ... (rest of the controllers are unchanged)

export const ChatController = {
  async sendMessage(body: any) {
    const { message } = body;
    const { userId } = message;

    // 1. Save user message
    db.insert('chats', message);

    // 2. Get chat history
    const history = db.find('chats', { userId }).map((chat: any) => ({
        role: chat.role,
        parts: [{ text: chat.content }],
    }));

    // 3. Call Gemini API
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 100,
            },
        });
        const result = await chat.sendMessage(message.content);
        const response = await result.response;
        const text = response.text();

        // 4. Save AI response
        const aiMessage = {
            id: Date.now().toString(),
            role: 'model',
            content: text,
            timestamp: Date.now(),
            userId: userId
        };
        db.insert('chats', aiMessage);

        return { status: 200, data: { reply: text } };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { status: 500, data: { error: "Failed to get response from AI" } };
    }
  },
  getHistory: (userId: string) => {
    const history = db.find('chats', { userId });
    return { status: 200, data: history };
  }
};
