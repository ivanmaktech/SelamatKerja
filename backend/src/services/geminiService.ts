import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { queryKnowledgeBase } from './ragService';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'fake-key' });
const model = 'gemini-2.5-flash';

export const generateContractExplanation = async (contractText: string) => {
    const prompt = `
You are helping a domestic worker who may not understand complex legal terms or have high English literacy.
Extract the key points from the following contract text and explain them in very simple, reassuring human language.
Provide a structured output with:
- Salary
- Duration
- Working days
- Deductions (if mentioned)
- Important things to ask the agent/employer

Contract Text:
"""
${contractText}
"""
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "I am sorry, there was an issue understanding the contract. Please try again.";
    }
};

export const checkRecruitmentFee = async (fee: string) => {
    const prompt = `
A domestic worker coming to Malaysia was quoted a recruitment fee of ${fee}.
Compare this against typical expected benchmark ranges. 
Do NOT use the words "illegal, scam, fraud". 
Use phrases like "higher than typical", "may need clarification", "ask for breakdown".
Provide:
- Expected range (benchmark)
- Difference / Assessment
- Simple explanation of what they should ask next
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "I am sorry, I could not verify this fee right now.";
    }
};

export const answerRightsQuestion = async (question: string) => {
    // 1. Retrieve knowledge from RAG
    const ragContext = await queryKnowledgeBase(question);
    
    // 2. Generate simplified answer via Gemini
    const prompt = `
You are a trusted assistant for domestic workers.
Based on the following factual context, answer the user's question. 
Keep the answer short, calm, non-legal, and reassuring. Translate to simple English or Malay if requested.

Context:
${ragContext}

User Question: ${question}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "I am sorry, I cannot answer this right now.";
    }
};