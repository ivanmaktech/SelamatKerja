import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { queryKnowledgeBase } from './ragService';

dotenv.config();

type ContractFields = {
    salary: string | null;
    recruitment_fee: string | null;
    deductions: string | null;
    working_hours: string | null;
    rest_day: string | null;
    employment_duration: string | null;
    termination_clause: string | null;
    passport_clause: string | null;
    accommodation: string | null;
    penalties: string | null;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'fake-key' });
const model = 'gemini-2.5-flash';

const buildFallbackAnswer = (context: string) => {
    return `I can't reach the AI model right now, but based on the available guidance: ${context}`;
};

const buildContractFallbackSummary = (fields: ContractFields) => {
    const bullets: string[] = [];

    if (fields.salary) bullets.push(`Salary: ${fields.salary}`);
    if (fields.recruitment_fee) bullets.push(`Recruitment fee: ${fields.recruitment_fee}`);
    if (fields.deductions) bullets.push(`Deductions: ${fields.deductions}`);
    if (fields.working_hours) bullets.push(`Working hours: ${fields.working_hours}`);
    if (fields.rest_day) bullets.push(`Rest day or leave: ${fields.rest_day}`);
    if (fields.employment_duration) bullets.push(`Employment duration: ${fields.employment_duration}`);
    if (fields.termination_clause) bullets.push(`Termination: ${fields.termination_clause}`);
    if (fields.passport_clause) bullets.push(`Passport: ${fields.passport_clause}`);
    if (fields.accommodation) bullets.push(`Accommodation or food: ${fields.accommodation}`);
    if (fields.penalties) bullets.push(`Penalties: ${fields.penalties}`);

    if (!bullets.length) {
        return 'No clear contract terms were extracted. Please upload a clearer image or paste the text again.';
    }

    return bullets.slice(0, 5).map((bullet) => `- ${bullet}`).join('\n');
};

const buildContractSuggestionFallback = (fields: ContractFields) => {
    const missingFields = Object.entries(fields)
        .filter(([, value]) => !value)
        .map(([key]) => key.replace(/_/g, ' '));

    const suggestions: string[] = [];

    if (fields.passport_clause && /keep|retain|hold/i.test(fields.passport_clause)) {
        suggestions.push('Red flag: passport handling should be clarified before signing.');
    }

    if (fields.recruitment_fee) {
        suggestions.push(`Check whether the recruitment fee is broken down clearly: ${fields.recruitment_fee}.`);
    }

    if (missingFields.length > 4) {
        suggestions.push('Too many important terms are missing. Ask for a clearer contract copy.');
    }

    if (!suggestions.length) {
        suggestions.push('No major red flags found in the extracted fields. Still confirm any missing terms before signing.');
    }

    return suggestions.slice(0, 5).map((line) => `- ${line}`).join('\n');
};

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

export const explainExtractedContract = async (fields: ContractFields) => {
    const prompt = `
You explain contract data for migrant domestic workers.
Use only the extracted JSON below.
Rules:
- max 5 bullet points
- simple English
- calm and reassuring
- no legal advice wording
- mention what the worker should clarify if something looks unusual

Extracted JSON:
${JSON.stringify(fields, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Gemini Contract Summary Error:', error);
        return buildContractFallbackSummary(fields);
    }
};

export const suggestContractRedFlags = async (fields: ContractFields) => {
    const prompt = `
You help migrant domestic workers spot problems in a contract.
Use only the extracted JSON below.
Return:
- one short verdict: good to go, needs clarification, or red flags found
- up to 4 short bullet points
- simple English
- no legal advice wording
- focus on unusual terms, missing terms, passport handling, deductions, fees, and working hours

Extracted JSON:
${JSON.stringify(fields, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Gemini Contract Suggestions Error:', error);
        return buildContractSuggestionFallback(fields);
    }
};

export const explainRawContract = async (contractText: string) => {
    const prompt = `
You explain a contract to a migrant domestic worker.
The structured extraction failed, so use this raw text only to identify the most important employment terms.
Rules:
- max 5 bullet points
- simple English
- calm and reassuring
- no legal advice wording
- mention what the worker should clarify if something looks unusual

Contract text:
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
        console.error('Gemini Raw Contract Error:', error);
        return 'I could not explain the contract right now. Please try a clearer image or paste the contract text.';
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
        return buildFallbackAnswer(ragContext);
    }
};