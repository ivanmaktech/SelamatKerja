"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryKnowledgeBase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// A simple local JSON-based knowledge retrieval for MVP
const queryKnowledgeBase = async (query) => {
    try {
        const knowledgePath = path_1.default.join(__dirname, '../data/knowledge.json');
        const data = fs_1.default.readFileSync(knowledgePath, 'utf8');
        const database = JSON.parse(data);
        // Simple keyword-based extraction or return all relevant blocks
        let context = '';
        const lowercaseQuery = query.toLowerCase();
        for (const item of database) {
            if (item.keywords.some((kw) => lowercaseQuery.includes(kw))) {
                context += item.content + '\n';
            }
        }
        // If no specific match, return a general baseline to not hallucinate
        if (!context) {
            context = "General baseline for domestic workers: You have a right to keep your own passport, be paid on time, and have rest days. Contract terms should be clear.";
        }
        return context;
    }
    catch (error) {
        console.error("RAG Error:", error);
        return "You have the right to a safe working environment and regular pay.";
    }
};
exports.queryKnowledgeBase = queryKnowledgeBase;
