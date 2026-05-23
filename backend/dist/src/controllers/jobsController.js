"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKakakContracts = exports.submitContract = exports.getEmployerInterests = exports.submitInterest = exports.explainMatch = exports.calculateMatchScore = exports.getCandidates = exports.createJob = exports.getJobs = void 0;
const geminiService_1 = require("../services/geminiService");
const db_1 = __importDefault(require("../db"));
// In-memory databases REMOVED.
// We now rely entirely on PostgreSQL via db.ts
const getJobs = async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT * FROM jobs');
        // Map database snake_case to frontend camelCase
        const jobs = result.rows.map(r => ({
            id: r.id,
            employerName: r.employer_name,
            salary: r.salary,
            jobType: r.job_type,
            restDays: r.rest_days,
            accommodation: r.accommodation,
            deductions: r.deductions,
            jobDescription: r.job_description,
            languageRequirement: r.language_requirement
        }));
        res.json({ success: true, data: jobs });
    }
    catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.getJobs = getJobs;
const createJob = async (req, res) => {
    const jobData = req.body;
    if (!jobData.employerName || !jobData.jobType) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
    }
    const newJob = {
        id: `job-${Date.now()}`,
        ...jobData
    };
    try {
        await db_1.default.query(`
            INSERT INTO jobs (id, employer_name, salary, job_type, rest_days, accommodation, deductions, job_description, language_requirement)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            newJob.id,
            newJob.employerName,
            newJob.salary || 0,
            newJob.jobType,
            newJob.restDays || 0,
            newJob.accommodation || 'Live-in',
            newJob.deductions || 0,
            newJob.jobDescription || '',
            newJob.languageRequirement || 'Any'
        ]);
        res.status(201).json({ success: true, data: newJob });
    }
    catch (err) {
        console.error('Error creating job:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.createJob = createJob;
const getCandidates = async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT * FROM candidates');
        const candidates = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            expectedSalary: r.expected_salary,
            jobType: r.job_type,
            restDays: r.rest_days,
            accommodation: r.accommodation,
            language: r.language
        }));
        res.json({ success: true, data: candidates });
    }
    catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.getCandidates = getCandidates;
// Calculate match score using rule-based algorithm
const calculateMatchScore = (preferences, job) => {
    let score = 0;
    // 1. Job Type matches (30 points)
    if (job.jobType.toLowerCase() === preferences.jobType.toLowerCase()) {
        score += 30;
    }
    // 2. Salary within preferred range (25 points)
    let minExpectedSalary = 0;
    if (preferences.expectedSalary === '1500-1800') {
        minExpectedSalary = 1500;
    }
    else if (preferences.expectedSalary === '1800-2200') {
        minExpectedSalary = 1800;
    }
    else if (preferences.expectedSalary === '2200+') {
        minExpectedSalary = 2200;
    }
    if (job.salary >= minExpectedSalary) {
        score += 25;
    }
    // 3. Rest day matches (15 points)
    let preferredRestDaysNum = 0; // none
    if (preferences.restDays === 'weekly') {
        preferredRestDaysNum = 4;
    }
    else if (preferences.restDays === '2days') {
        preferredRestDaysNum = 2;
    }
    if (job.restDays >= preferredRestDaysNum) {
        score += 15;
    }
    // 4. Language match (15 points)
    if (preferences.language) {
        const prefLang = preferences.language.toLowerCase();
        const jobLang = job.languageRequirement.toLowerCase();
        if (jobLang.includes(prefLang) || prefLang.includes(jobLang)) {
            score += 15;
        }
    }
    else {
        // Language is optional; automatically grant 15 points if Kakak didn't specify language
        score += 15;
    }
    // 5. Accommodation match (15 points)
    if (job.accommodation.toLowerCase() === preferences.accommodation.toLowerCase()) {
        score += 15;
    }
    return score;
};
exports.calculateMatchScore = calculateMatchScore;
// Match jobs and explain
const explainMatch = async (req, res) => {
    try {
        const { preferences, job } = req.body;
        if (!preferences || !job) {
            res.status(400).json({ success: false, error: 'Please provide preferences and job data' });
            return;
        }
        const score = (0, exports.calculateMatchScore)(preferences, job);
        const explanation = await (0, geminiService_1.explainJobMatch)(preferences, job, score);
        res.json({
            success: true,
            score,
            explanation,
        });
    }
    catch (error) {
        console.error('Error explaining match:', error);
        res.status(500).json({ success: false, error: 'Failed to explain match' });
    }
};
exports.explainMatch = explainMatch;
const submitInterest = async (req, res) => {
    const { jobId, kakakName, country, matchPercentage, expectedSalary, jobTypePref, restDaysPref } = req.body;
    if (!jobId || !kakakName) {
        res.status(400).json({ error: 'Missing jobId or kakakName' });
        return;
    }
    const newInterest = {
        id: `interest-${Date.now()}`,
        jobId,
        kakakName,
        country: country || 'Unknown',
        matchPercentage: matchPercentage || 0,
        expectedSalary: expectedSalary || 'Unknown',
        jobTypePref: jobTypePref || 'Unknown',
        restDaysPref: restDaysPref || 'Unknown',
        timestamp: new Date().toISOString()
    };
    try {
        await db_1.default.query(`
            INSERT INTO interested_submissions (id, job_id, kakak_name, country, match_percentage, expected_salary, job_type_pref, rest_days_pref, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            newInterest.id, newInterest.jobId, newInterest.kakakName, newInterest.country,
            newInterest.matchPercentage, newInterest.expectedSalary, newInterest.jobTypePref,
            newInterest.restDaysPref, newInterest.timestamp
        ]);
        res.json({ success: true, interest: newInterest });
    }
    catch (err) {
        console.error('Error submitting interest:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.submitInterest = submitInterest;
const getEmployerInterests = async (req, res) => {
    try {
        const employerName = req.params.employerName;
        if (!employerName) {
            const result = await db_1.default.query('SELECT * FROM interested_submissions ORDER BY timestamp DESC');
            const interests = result.rows.map(r => ({
                id: r.id,
                jobId: r.job_id,
                kakakName: r.kakak_name,
                country: r.country,
                matchPercentage: r.match_percentage,
                expectedSalary: r.expected_salary,
                jobTypePref: r.job_type_pref,
                restDaysPref: r.rest_days_pref,
                timestamp: r.timestamp
            }));
            res.json({ interests });
            return;
        }
        const employerJobs = await db_1.default.query('SELECT id FROM jobs WHERE employer_name = $1', [employerName]);
        const jobIds = employerJobs.rows.map(row => row.id);
        const result = jobIds.length > 0
            ? await db_1.default.query('SELECT * FROM interested_submissions WHERE job_id = ANY($1::text[]) ORDER BY timestamp DESC', [jobIds])
            : await db_1.default.query('SELECT * FROM interested_submissions ORDER BY timestamp DESC');
        const interests = result.rows.map(r => ({
            id: r.id,
            jobId: r.job_id,
            kakakName: r.kakak_name,
            country: r.country,
            matchPercentage: r.match_percentage,
            expectedSalary: r.expected_salary,
            jobTypePref: r.job_type_pref,
            restDaysPref: r.rest_days_pref,
            timestamp: r.timestamp
        }));
        res.json({ interests });
    }
    catch (err) {
        console.error('Error fetching interests:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.getEmployerInterests = getEmployerInterests;
const submitContract = async (req, res) => {
    const contractData = req.body;
    if (!contractData.jobId || !contractData.kakakName || !contractData.employerName) {
        res.status(400).json({ error: 'Missing required contract fields' });
        return;
    }
    const newContract = {
        ...contractData,
        id: `contract-${Date.now()}`,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    try {
        await db_1.default.query(`
            INSERT INTO contracts (id, job_id, kakak_name, employer_name, salary, job_type, rest_days, accommodation, deductions, duration, overtime_policy, passport_clause, additional_notes, status, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
            newContract.id, newContract.jobId, newContract.kakakName, newContract.employerName,
            newContract.salary, newContract.jobType, newContract.restDays, newContract.accommodation,
            newContract.deductions, newContract.duration, newContract.overtimePolicy,
            newContract.passportClause, newContract.additionalNotes || '', newContract.status,
            newContract.timestamp
        ]);
        res.json({ success: true, contract: newContract });
    }
    catch (err) {
        console.error('Error submitting contract:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.submitContract = submitContract;
const getKakakContracts = async (req, res) => {
    try {
        // For hackathon MVP demo, return all contracts so the Kakak always sees the mock contract.
        const result = await db_1.default.query('SELECT * FROM contracts');
        const contracts = result.rows.map(r => ({
            id: r.id,
            jobId: r.job_id,
            kakakName: r.kakak_name,
            employerName: r.employer_name,
            salary: r.salary,
            jobType: r.job_type,
            restDays: r.rest_days,
            accommodation: r.accommodation,
            deductions: r.deductions,
            duration: r.duration,
            overtimePolicy: r.overtime_policy,
            passportClause: r.passport_clause,
            additionalNotes: r.additional_notes,
            status: r.status,
            timestamp: r.timestamp
        }));
        res.json({ contracts });
    }
    catch (err) {
        console.error('Error fetching contracts:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
exports.getKakakContracts = getKakakContracts;
