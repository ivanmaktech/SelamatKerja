"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/selamatkerja';
const pool = new pg_1.Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});
const createTables = async () => {
    const client = await pool.connect();
    try {
        console.log('Beginning database initialization...');
        // 1. Create jobs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id VARCHAR(50) PRIMARY KEY,
                employer_name VARCHAR(100) NOT NULL,
                salary INTEGER NOT NULL,
                job_type VARCHAR(50) NOT NULL,
                rest_days INTEGER NOT NULL,
                accommodation VARCHAR(100) NOT NULL,
                deductions INTEGER NOT NULL,
                job_description TEXT NOT NULL,
                language_requirement VARCHAR(100) NOT NULL
            );
        `);
        // 2. Create candidates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS candidates (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                expected_salary VARCHAR(50) NOT NULL,
                job_type VARCHAR(50) NOT NULL,
                rest_days VARCHAR(50) NOT NULL,
                accommodation VARCHAR(100) NOT NULL,
                language VARCHAR(100)
            );
        `);
        // 3. Create interested_submissions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS interested_submissions (
                id VARCHAR(50) PRIMARY KEY,
                job_id VARCHAR(50) NOT NULL,
                kakak_name VARCHAR(100) NOT NULL,
                country VARCHAR(50) NOT NULL,
                match_percentage INTEGER NOT NULL,
                expected_salary VARCHAR(50) NOT NULL,
                job_type_pref VARCHAR(50) NOT NULL,
                rest_days_pref VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP NOT NULL
            );
        `);
        // 4. Create contracts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS contracts (
                id VARCHAR(50) PRIMARY KEY,
                job_id VARCHAR(50) NOT NULL,
                kakak_name VARCHAR(100) NOT NULL,
                employer_name VARCHAR(100) NOT NULL,
                salary VARCHAR(50) NOT NULL,
                job_type VARCHAR(100) NOT NULL,
                rest_days VARCHAR(50) NOT NULL,
                accommodation VARCHAR(100) NOT NULL,
                deductions VARCHAR(100) NOT NULL,
                duration VARCHAR(50) NOT NULL,
                overtime_policy VARCHAR(100) NOT NULL,
                passport_clause VARCHAR(100) NOT NULL,
                additional_notes TEXT,
                status VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP NOT NULL
            );
        `);
        console.log('Tables created successfully.');
        // Check if jobs table is empty
        const jobsCount = await client.query('SELECT COUNT(*) FROM jobs');
        if (parseInt(jobsCount.rows[0].count) === 0) {
            console.log('Seeding MVP mock data...');
            // Seed Jobs
            await client.query(`
                INSERT INTO jobs (id, employer_name, salary, job_type, rest_days, accommodation, deductions, job_description, language_requirement)
                VALUES 
                ('job-1', 'Ahmad Kassim', 2100, 'childcare', 4, 'Live-in', 0, 'Look after 2 school-going children.', 'Malay/Indonesian'),
                ('job-3', 'Grace Tan', 2300, 'elderly care', 4, 'Live-in', 50, 'Care for an elderly grandmother.', 'English / Malay')
            `);
            // Seed Candidates
            await client.query(`
                INSERT INTO candidates (id, name, expected_salary, job_type, rest_days, accommodation, language)
                VALUES 
                ('candidate-1', 'Siti Rahma', '1800-2200', 'childcare', 'weekly', 'Live-in', 'Malay/Indonesian'),
                ('candidate-2', 'Dewi Utami', '1500-1800', 'housekeeping', 'weekly', 'Live-in', 'English')
            `);
            // Seed Interests
            await client.query(`
                INSERT INTO interested_submissions (id, job_id, kakak_name, country, match_percentage, expected_salary, job_type_pref, rest_days_pref, timestamp)
                VALUES 
                ('interest-1', 'job-1', 'Siti Rahma', 'Indonesia', 91, '1800-2200', 'childcare', 'weekly', NOW()),
                ('interest-2', 'job-3', 'Dewi Utami', 'Indonesia', 85, '1500-1800', 'elderly care', 'weekly', NOW())
            `);
            // Seed Contracts
            await client.query(`
                INSERT INTO contracts (id, job_id, kakak_name, employer_name, salary, job_type, rest_days, accommodation, deductions, duration, overtime_policy, passport_clause, additional_notes, status, timestamp)
                VALUES 
                ('contract-1', 'job-1', 'Siti Rahma', 'Ahmad Kassim', '2100', 'Childcare', '4 days per month', 'Live-in', 'RM 100 for agency fee', '2 Years', 'RM 50 per off-day', 'Worker keeps passport', 'Must be okay with pets.', 'pending', NOW())
            `);
            console.log('Data seeding complete!');
        }
        else {
            console.log('Database already contains data, skipping seed.');
        }
    }
    catch (error) {
        console.error('Error initializing database:', error);
    }
    finally {
        client.release();
        await pool.end();
    }
};
createTables();
