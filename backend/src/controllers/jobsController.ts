import { Request, Response } from 'express';
import { explainJobMatch } from '../services/geminiService';
import db from '../db';

export interface CandidateProfile {
    id: string;
    name: string;
    expectedSalary: string; // "1500-1800" | "1800-2200" | "2200+"
    jobType: string; // childcare / elderly care / housekeeping / cooking
    restDays: string; // weekly / 2days / none
    accommodation: string; // Live-in / Live-out
    language?: string;
}

export interface JobPosting {
    id: string;
    employerName: string;
    salary: number;
    jobType: string; // childcare / elderly care / housekeeping / cooking
    restDays: number; // rest days per month
    accommodation: string; // Live-in / Live-out
    deductions: number;
    jobDescription: string;
    languageRequirement: string;
}

export interface InterestSubmission {
    id: string;
    jobId: string;
    kakakName: string;
    country: string;
    matchPercentage: number;
    expectedSalary: string;
    jobTypePref: string;
    restDaysPref: string;
    timestamp: string;
}

export interface StructuredContract {
    id: string;
    jobId: string;
    kakakName: string;
    employerName: string;
    salary: string;
    jobType: string;
    restDays: string;
    accommodation: string;
    deductions: string;
    duration: string;
    overtimePolicy: string;
    passportClause: string;
    additionalNotes: string;
    status: 'pending' | 'accepted' | 'declined';
    timestamp: string;
}

export interface KakakPreferences {
    expectedSalary: string; // "1500-1800" | "1800-2200" | "2200+"
    jobType: string; // childcare / elderly care / housekeeping / cooking
    restDays: string; // weekly / 2days / none
    accommodation: string; // Live-in / Live-out
    language?: string; // e.g. Malay/Indonesian, English, Cantonese
}

// In-memory databases REMOVED.
// We now rely entirely on PostgreSQL via db.ts

export const getJobs = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM jobs');
        
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
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const createJob = async (req: Request, res: Response) => {
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
        await db.query(`
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
    } catch (err) {
        console.error('Error creating job:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const getCandidates = async (req: Request, res: Response) => {
    try {
        const result = await db.query('SELECT * FROM candidates');
        
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
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Calculate match score using rule-based algorithm
export const calculateMatchScore = (preferences: KakakPreferences, job: JobPosting): number => {
    let score = 0;

    // 1. Job Type matches (30 points)
    if (job.jobType.toLowerCase() === preferences.jobType.toLowerCase()) {
        score += 30;
    }

    // 2. Salary within preferred range (25 points)
    let minExpectedSalary = 0;
    if (preferences.expectedSalary === '1500-1800') {
        minExpectedSalary = 1500;
    } else if (preferences.expectedSalary === '1800-2200') {
        minExpectedSalary = 1800;
    } else if (preferences.expectedSalary === '2200+') {
        minExpectedSalary = 2200;
    }

    if (job.salary >= minExpectedSalary) {
        score += 25;
    }

    // 3. Rest day matches (15 points)
    let preferredRestDaysNum = 0; // none
    if (preferences.restDays === 'weekly') {
        preferredRestDaysNum = 4;
    } else if (preferences.restDays === '2days') {
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
    } else {
        // Language is optional; automatically grant 15 points if Kakak didn't specify language
        score += 15;
    }

    // 5. Accommodation match (15 points)
    if (job.accommodation.toLowerCase() === preferences.accommodation.toLowerCase()) {
        score += 15;
    }

    return score;
};

// Match jobs and explain
export const explainMatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { preferences, job } = req.body;
        
        if (!preferences || !job) {
            res.status(400).json({ success: false, error: 'Please provide preferences and job data' });
            return;
        }

        const score = calculateMatchScore(preferences as KakakPreferences, job as JobPosting);
        const explanation = await explainJobMatch(preferences as KakakPreferences, job as JobPosting, score);

        res.json({
            success: true,
            score,
            explanation,
        });
    } catch (error) {
        console.error('Error explaining match:', error);
        res.status(500).json({ success: false, error: 'Failed to explain match' });
    }
};

export const submitInterest = async (req: Request, res: Response) => {
    const { jobId, kakakName, country, matchPercentage, expectedSalary, jobTypePref, restDaysPref } = req.body;
    
    if (!jobId || !kakakName) {
        res.status(400).json({ error: 'Missing jobId or kakakName' });
        return;
    }

    const newInterest: InterestSubmission = {
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
        await db.query(`
            INSERT INTO interested_submissions (id, job_id, kakak_name, country, match_percentage, expected_salary, job_type_pref, rest_days_pref, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            newInterest.id, newInterest.jobId, newInterest.kakakName, newInterest.country,
            newInterest.matchPercentage, newInterest.expectedSalary, newInterest.jobTypePref,
            newInterest.restDaysPref, newInterest.timestamp
        ]);

        res.json({ success: true, interest: newInterest });
    } catch (err) {
        console.error('Error submitting interest:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const getEmployerInterests = async (req: Request, res: Response) => {
    try {
        // For the hackathon MVP demo, we want the employer to see ALL mock interested candidates
        // to ensure the demo works seamlessly regardless of login name.
        const result = await db.query('SELECT * FROM interested_submissions');
        
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
    } catch (err) {
        console.error('Error fetching interests:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const submitContract = async (req: Request, res: Response) => {
    const contractData = req.body;
    
    if (!contractData.jobId || !contractData.kakakName || !contractData.employerName) {
        res.status(400).json({ error: 'Missing required contract fields' });
        return;
    }

    const newContract: StructuredContract = {
        ...contractData,
        id: `contract-${Date.now()}`,
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    try {
        await db.query(`
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
    } catch (err) {
        console.error('Error submitting contract:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

export const getKakakContracts = async (req: Request, res: Response) => {
    try {
        // For hackathon MVP demo, return all contracts so the Kakak always sees the mock contract.
        const result = await db.query('SELECT * FROM contracts');
        
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
    } catch (err) {
        console.error('Error fetching contracts:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
