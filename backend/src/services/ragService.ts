import fs from 'fs';
import path from 'path';

// A simple local JSON-based knowledge retrieval for MVP
export const queryKnowledgeBase = async (query: string): Promise<string> => {
    try {
        const knowledgePath = path.join(__dirname, '../data/knowledge.json');
        const data = fs.readFileSync(knowledgePath, 'utf8');
        const database = JSON.parse(data);

        // Simple keyword-based extraction or return all relevant blocks
        let context = '';
        const lowercaseQuery = query.toLowerCase();

        for (const item of database) {
            if (item.keywords.some((kw: string) => lowercaseQuery.includes(kw))) {
                context += item.content + '\n';
            }
        }

        // If no specific match, return a general baseline to not hallucinate
        if (!context) {
            context = "General baseline for domestic workers: You have a right to keep your own passport, be paid on time, and have rest days. Contract terms should be clear.";
        }

        return context;
    } catch (error) {
        console.error("RAG Error:", error);
        return "You have the right to a safe working environment and regular pay.";
    }
};