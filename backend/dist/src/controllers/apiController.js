"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateFairness = exports.askQuestion = exports.checkFee = exports.explainContract = void 0;
const geminiService_1 = require("../services/geminiService");
const contractParsingService_1 = require("../services/contractParsingService");
const geminiService_2 = require("../services/geminiService");
const jobsController_1 = require("./jobsController");
const db_1 = __importDefault(require("../db"));
const explainContract = async (req, res) => {
    try {
        const uploadedText = await (0, contractParsingService_1.extractContractText)({
            text: req.body.text,
            file: req.file ? { path: req.file.path, mimetype: req.file.mimetype } : null,
        });
        if (!uploadedText) {
            res.status(400).json({ success: false, error: 'Could not read the contract. Please upload a clearer image or paste the text.' });
            return;
        }
        const extractedFields = (0, contractParsingService_1.extractContractFields)(uploadedText);
        const aiSuggestions = (0, contractParsingService_1.hasAnyExtractedField)(extractedFields)
            ? await (0, geminiService_1.suggestContractRedFlags)(extractedFields)
            : await (0, geminiService_1.explainRawContract)(uploadedText);
        res.json({ success: true, data: aiSuggestions, extracted: extractedFields });
    }
    catch (error) {
        console.error('Error explaining contract', error);
        res.status(500).json({ success: false, error: 'Failed to process contract' });
    }
};
exports.explainContract = explainContract;
const checkFee = async (req, res) => {
    try {
        const { fee } = req.body;
        const result = await (0, geminiService_1.checkRecruitmentFee)(fee);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error checking fee', error);
        res.status(500).json({ success: false, error: 'Failed to check fee' });
    }
};
exports.checkFee = checkFee;
const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        // Process intent
        const intent = await (0, geminiService_1.processChatIntent)(question);
        if (intent.type === 'job_search' && intent.preferences) {
            // Get all jobs and score them to avoid strict exact match failures
            const result = await db_1.default.query('SELECT * FROM jobs');
            const jobs = result.rows.map(r => {
                const job = {
                    id: r.id,
                    employerName: r.employer_name,
                    salary: r.salary,
                    jobType: r.job_type,
                    restDays: r.rest_days,
                    accommodation: r.accommodation,
                    deductions: r.deductions,
                    jobDescription: r.job_description,
                    languageRequirement: r.language_requirement
                };
                // Construct a fake KakakPreferences from intent for scoring
                const prefs = {
                    expectedSalary: intent.preferences.minSalary ? `${intent.preferences.minSalary}+` : '1500-1800',
                    jobType: intent.preferences.jobType || '',
                    restDays: 'flexible',
                    accommodation: 'no-preference',
                    wantsClearSalary: true,
                    prefersLowFees: true,
                    wantsWeeklyRest: false,
                    name: 'Kakak',
                    country: 'Unknown',
                    preferredLocation: 'Any',
                    language: 'English'
                };
                // We use our existing score logic, but add some fuzzy matching for jobType
                let score = (0, jobsController_1.calculateMatchScore)(prefs, job);
                // Extra fuzzy matching for jobType string similarities (e.g., "child care" vs "childcare")
                if (prefs.jobType && job.jobType.toLowerCase().replace(/\\s/g, '') === prefs.jobType.toLowerCase().replace(/\\s/g, '')) {
                    // Add back points if it was missed due to spacing
                    if (job.jobType.toLowerCase() !== prefs.jobType.toLowerCase()) {
                        score += 30;
                    }
                }
                return { ...job, matchPercentage: Math.min(score, 99) };
            });
            // Sort by match percentage and take top 3
            jobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
            const topJobs = jobs.filter(j => j.matchPercentage > 40).slice(0, 3);
            res.json({
                success: true,
                data: {
                    type: 'job_match',
                    message: topJobs.length > 0 ? "I found some jobs that match your preferences!" : "I couldn't find exact matches, but here are some suggestions.",
                    jobs: topJobs.length > 0 ? topJobs : jobs.slice(0, 3)
                }
            });
            return;
        }
        // Default QA
        const answer = await (0, geminiService_1.answerRightsQuestion)(question);
        res.json({ success: true, data: { type: 'qa', message: answer } });
    }
    catch (error) {
        console.error('Error answering question', error);
        res.status(500).json({ success: false, error: 'Failed to answer question' });
    }
};
exports.askQuestion = askQuestion;
const evaluateFairness = async (req, res) => {
    try {
        const { contract, preferences } = req.body;
        if (!contract || !preferences) {
            res.status(400).json({ error: 'Missing contract or preferences' });
            return;
        }
        const result = await (0, geminiService_2.evaluateContractFairness)(contract, preferences);
        res.json({ success: true, explanation: result });
    }
    catch (error) {
        console.error('Error evaluating fairness', error);
        res.status(500).json({ success: false, error: 'Failed to evaluate fairness' });
    }
};
exports.evaluateFairness = evaluateFairness;
