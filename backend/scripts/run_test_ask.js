const gemini = require('../dist/src/services/geminiService.js');
const db = require('../dist/src/db.js');
const jobsController = require('../dist/src/controllers/jobsController.js');

(async () => {
  const question = 'I want childcare RM1500';
  try {
    console.log('Calling processChatIntent...');
    const intent = await gemini.processChatIntent(question);
    console.log('Intent result:', intent);

    if (intent.type === 'job_search' && intent.preferences) {
      try {
        console.log('Querying DB for jobs...');
        const result = await db.query('SELECT * FROM jobs');
        console.log('DB returned rows:', (result.rows || []).length);
        const jobs = (result.rows || []).map(r => {
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

          const prefs = {
            expectedSalary: intent.preferences.minSalary ? `${intent.preferences.minSalary}+` : '1500-1800',
            jobType: intent.preferences.jobType || '',
            restDays: 'flexible',
            accommodation: 'no-preference'
          };

          const score = jobsController.calculateMatchScore(prefs, job);
          return { ...job, matchPercentage: Math.min(score, 99) };
        });
        console.log('Processed jobs count:', jobs.length);
      } catch (dbErr) {
        console.error('DB error in test script:', dbErr && dbErr.stack ? dbErr.stack : dbErr);
      }
    }
  } catch (e) {
    console.error('Top-level error in test script:', e && e.stack ? e.stack : e);
  }
})();
