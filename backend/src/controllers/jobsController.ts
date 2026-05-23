import { Request, Response } from 'express';
import { explainJobMatch } from '../services/geminiService';

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

export interface KakakPreferences {
    expectedSalary: string; // "1500-1800" | "1800-2200" | "2200+"
    jobType: string; // childcare / elderly care / housekeeping / cooking
    restDays: string; // weekly / 2days / none
    accommodation: string; // Live-in / Live-out
    language?: string; // e.g. Malay/Indonesian, English, Cantonese
}

// In-memory databases
const candidatesDatabase: CandidateProfile[] = [
    {
        id: 'candidate-1',
        name: 'Siti Rahma',
        expectedSalary: '1800-2200',
        jobType: 'childcare',
        restDays: 'weekly',
        accommodation: 'Live-in',
        language: 'Malay/Indonesian',
    },
    {
        id: 'candidate-2',
        name: 'Dewi Utami',
        expectedSalary: '1500-1800',
        jobType: 'housekeeping',
        restDays: 'weekly',
        accommodation: 'Live-in',
        language: 'English',
    },
    {
        id: 'candidate-3',
        name: 'Ratna Sari',
        expectedSalary: '2200+',
        jobType: 'cooking',
        restDays: '2days',
        accommodation: 'Live-out',
        language: 'Malay',
    },
];

let jobsDatabase: JobPosting[] = [
    {
        id: 'job-1',
        employerName: 'Ahmad Kassim',
        salary: 2100,
        jobType: 'childcare',
        restDays: 4, // Weekly
        accommodation: 'Live-in',
        deductions: 0,
        jobDescription: 'Look after 2 school-going children (aged 6 and 8). Prepare daily meals and perform light housekeeping duties.',
        languageRequirement: 'Malay/Indonesian',
    },
    {
        id: 'job-2',
        employerName: 'Ahmad Kassim',
        salary: 2000,
        jobType: 'childcare',
        restDays: 2, // 2 days/month
        accommodation: 'Live-in',
        deductions: 100, // agency fee
        jobDescription: 'Support mother with a newborn child. Duties include baby care, washing baby clothes, sanitizing bottles, and light cooking.',
        languageRequirement: 'Malay/Indonesian',
    },
    {
        id: 'job-3',
        employerName: 'Grace Tan',
        salary: 2300,
        jobType: 'elderly care',
        restDays: 4, // Weekly
        accommodation: 'Live-in',
        deductions: 50, // insurance
        jobDescription: 'Care for an elderly grandmother who can walk with assistance. Prepare soft meals and manage medication schedule.',
        languageRequirement: 'English / Malay',
    },
    {
        id: 'job-4',
        employerName: 'Ahmad Kassim',
        salary: 1900,
        jobType: 'cooking',
        restDays: 4, // Weekly
        accommodation: 'Live-out',
        deductions: 0,
        jobDescription: 'Prepare family dinner, buy groceries, and maintain clean kitchen. This is a live-out position; work hours are 9 AM to 7 PM.',
        languageRequirement: 'Malay',
    },
    {
        id: 'job-5',
        employerName: 'Grace Tan',
        salary: 1700,
        jobType: 'housekeeping',
        restDays: 2, // 2 days/month
        accommodation: 'Live-in',
        deductions: 0,
        jobDescription: 'General cleaning of double-storey house. Ironing, laundry, and assisting with food preparation.',
        languageRequirement: 'English / Cantonese',
    },
];

// Get all candidates
export const getCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        res.json({ success: true, data: candidatesDatabase });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve candidates' });
    }
};

// Get all jobs
export const getJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        res.json({ success: true, data: jobsDatabase });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve jobs' });
    }
};

// Post a new job
export const createJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employerName, salary, jobType, restDays, accommodation, deductions, jobDescription, languageRequirement } = req.body;
        
        if (!employerName || !salary || !jobType || !restDays || !accommodation || !jobDescription || !languageRequirement) {
            res.status(400).json({ success: false, error: 'Please provide all required fields' });
            return;
        }

        const newJob: JobPosting = {
            id: `job-${Date.now()}`,
            employerName,
            salary: Number(salary),
            jobType: String(jobType).toLowerCase(),
            restDays: Number(restDays),
            accommodation: String(accommodation),
            deductions: Number(deductions || 0),
            jobDescription: String(jobDescription),
            languageRequirement: String(languageRequirement),
        };

        jobsDatabase.push(newJob);
        res.json({ success: true, data: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, error: 'Failed to post job' });
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
