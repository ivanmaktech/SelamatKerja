"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    process.env.GEMINI_API_KEY = 'force-gemini-to-fail';
    if (!process.env.GROQ_API_KEY) {
        throw new Error('Missing GROQ_API_KEY in backend/.env');
    }
    const { generateContractExplanation } = await Promise.resolve().then(() => __importStar(require('../src/services/geminiService')));
    const sampleContract = [
        'Salary: RM1700 per month',
        'Working hours: 8:00 AM to 6:00 PM, 6 days per week',
        'Rest day: 1 rest day per week',
        'Passport: Employer may hold passport',
    ].join('\n');
    const output = await generateContractExplanation(sampleContract);
    console.log('\nGroq fallback test output:\n');
    console.log(output);
}
main().catch((error) => {
    console.error('Groq fallback test failed:', error);
    process.exitCode = 1;
});
