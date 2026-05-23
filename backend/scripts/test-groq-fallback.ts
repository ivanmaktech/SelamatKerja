import dotenv from 'dotenv';

dotenv.config();

async function main() {
    process.env.GEMINI_API_KEY = 'force-gemini-to-fail';

    if (!process.env.GROQ_API_KEY) {
        throw new Error('Missing GROQ_API_KEY in backend/.env');
    }

    const { generateContractExplanation } = await import('../src/services/geminiService');

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

main().catch((error: unknown) => {
    console.error('Groq fallback test failed:', error);
    process.exitCode = 1;
});
