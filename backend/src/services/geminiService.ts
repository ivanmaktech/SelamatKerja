import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
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

const geminiKeys = (process.env.GEMINI_API_KEY || 'fake-key').split(',').map(k => k.trim()).filter(k => k.length > 0);
let currentGeminiIndex = 0;
const model = 'gemini-2.5-flash';

// Groq (via OpenAI-compatible client)
const groqBaseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const groqApiKey = process.env.GROQ_API_KEY || 'fake-groq-key';
const groqClient = new OpenAI({ apiKey: groqApiKey, baseURL: groqBaseUrl });
const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const runGroqPrompt = async (prompt: string): Promise<string> => {
    const groqResp = await groqClient.chat.completions.create({
        model: groqModel,
        messages: [{ role: 'user', content: prompt }],
    });

    const choice = groqResp.choices?.[0];
    return choice?.message?.content ?? '';
};

const runWithFallback = async (
    label: string,
    prompt: string,
    fallback: () => string,
): Promise<string> => {
    let lastGeminiErr = null;

    // Try Gemini keys one by one
    for (let i = 0; i < geminiKeys.length; i++) {
        try {
            const ai = new GoogleGenAI({ apiKey: geminiKeys[currentGeminiIndex] });
            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text ?? fallback();
        } catch (geminiErr: any) {
            console.error(`Gemini Error (${label}, key index ${currentGeminiIndex}):`, geminiErr?.message || geminiErr);
            lastGeminiErr = geminiErr;
            // Rotate to next key
            currentGeminiIndex = (currentGeminiIndex + 1) % geminiKeys.length;
        }
    }

        try {
            if (!groqApiKey) {
                throw new Error('Missing GROQ_API_KEY');
            }

            const groqText = await runGroqPrompt(prompt);
            if (groqText) {
                return groqText;
            }

            console.warn(`Groq returned an empty response (${label}); using local fallback.`);
            return fallback();
        } catch (groqErr) {
            console.error(`Groq Error (${label}):`, groqErr);
            return fallback();
        }
};

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

    return runWithFallback(
        'generateContractExplanation',
        prompt,
        () => "I am sorry, there was an issue understanding the contract. Please try again.",
    );
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

    return runWithFallback('explainExtractedContract', prompt, () => buildContractFallbackSummary(fields));
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

    return runWithFallback('suggestContractRedFlags', prompt, () => buildContractSuggestionFallback(fields));
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

    return runWithFallback(
        'explainRawContract',
        prompt,
        () => 'I could not explain the contract right now. Please try a clearer image or paste the contract text.',
    );
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

    return runWithFallback(
        'checkRecruitmentFee',
        prompt,
        () => "I am sorry, I could not verify this fee right now.",
    );
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

    return runWithFallback('answerRightsQuestion', prompt, () => buildFallbackAnswer(ragContext));
};

export const processChatIntent = async (question: string): Promise<{ type: 'job_search' | 'qa', answer?: string, preferences?: any }> => {
    const prompt = `
You are an AI assistant for domestic workers. 
Analyze the user's input: "${question}"

Determine if the user is stating their job preferences to find a job (e.g. "I want childcare", "Looking for RM 1500") OR asking a general question.
Respond ONLY with a valid JSON object, no markdown blocks.

If it's a job search, output:
{
  "type": "job_search",
  "preferences": {
    "jobType": "extracted job type or empty",
    "minSalary": extracted number or 0
  }
}

If it's a general question or anything else, output:
{
  "type": "qa"
}
`;
    
    try {
        const rawJson = await runWithFallback('processChatIntent', prompt, () => '{"type":"qa"}');
        const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("Failed to parse intent JSON", e);
        return { type: 'qa' };
    }
};

export const explainJobMatch = async (
    preferences: { expectedSalary: string; jobType: string; restDays: string; accommodation: string; language?: string },
    job: { salary: number; jobType: string; restDays: number; accommodation: string; languageRequirement: string },
    score: number
): Promise<string> => {
    const prompt = `
You are helping a domestic worker (Kakak) evaluate how well a job aligns with their preferences.
Compare their preferences to the job details and write an extremely short, clear evaluation explaining the main reasons for this match (score: ${score}%).

Preferences:
- Expected Salary Range: ${preferences.expectedSalary}
- Job Type: ${preferences.jobType}
- Rest Days: ${preferences.restDays === 'weekly' ? 'Weekly (4 days/month)' : preferences.restDays === '2days' ? '2 days/month' : 'No preference'}
- Accommodation: ${preferences.accommodation}
- Preferred Language: ${preferences.language || 'Any'}

Job Details:
- Salary: RM ${job.salary}
- Job Type: ${job.jobType}
- Rest Days: ${job.restDays} days/month
- Accommodation: ${job.accommodation}
- Required Language: ${job.languageRequirement}

Rules:
1. Do NOT decide the matching score or explain the system's score generation. Focus purely on explaining how the job details align with what the worker wants.
2. Keep the output VERY SHORT (maximum 2 bullets, under 25 words total).
3. Do NOT provide any legal advice, legal assessments, or policy warnings.
4. Keep the tone warm, simple, and encouraging.
5. Use "✓" for preferences that are met or exceeded (e.g. ✓ Matches childcare preference).
6. Use "⚠" for preferences that are not met (e.g. ⚠ Lower salary than expected).
7. VERY IMPORTANT: Write the entire response in English to match the system UI language. Do not translate to other languages.

Format:
- Bullet 1
- Bullet 2

Do not write any introductory or concluding text. Write only the bullet points.
`;

    const localFallback = () => {
        const bullets: string[] = [];
        
        // Job Type comparison
        if (job.jobType.toLowerCase() === preferences.jobType.toLowerCase()) {
            bullets.push(`✓ Matches ${preferences.jobType} preference`);
        } else {
            bullets.push(`⚠ Different job type (${job.jobType})`);
        }

        // Salary comparison
        let minExpected = 0;
        if (preferences.expectedSalary === '1500-1800') minExpected = 1500;
        else if (preferences.expectedSalary === '1800-2200') minExpected = 1800;
        else if (preferences.expectedSalary === '2200+') minExpected = 2200;

        if (job.salary >= minExpected) {
            bullets.push(`✓ Salary within expected range`);
        } else {
            bullets.push(`⚠ Salary lower than expected`);
        }

        return bullets.slice(0, 2).join('\n');
    };

    return runWithFallback('explainJobMatch', prompt, localFallback);
};

export const evaluateContractFairness = async (
    contract: { salary: string, restDays: string, deductions: string, overtimePolicy: string, passportClause: string },
    preferences: { expectedSalary: string, restDays: string, language?: string }
): Promise<string> => {
    const prompt = `
You are helping a domestic worker evaluate if a contract aligns with their preferences and is fair.
Contract details:
- Salary: ${contract.salary}
- Rest Days: ${contract.restDays}
- Deductions: ${contract.deductions}
- Overtime Policy: ${contract.overtimePolicy}
- Passport Clause: ${contract.passportClause}

Worker Preferences:
- Expected Salary: ${preferences.expectedSalary}
- Preferred Rest Days: ${preferences.restDays}

Rules:
1. Write a maximum of 2 bullet points (under 20 words total).
2. Keep it extremely simple, no legal jargon.
3. Do not repeat the exact text from the contract, just summarize the fairness.
4. Use "✓" if it aligns well or is fair, use "⚠" if there is a concern (e.g. deductions, unclear overtime, lower salary).
5. VERY IMPORTANT: Write the entire response in English to match the system UI language. Do not translate to other languages.
`;

    return runWithFallback('evaluateContractFairness', prompt, () => "✓ Contract received.\n⚠ Please review terms carefully.");
};