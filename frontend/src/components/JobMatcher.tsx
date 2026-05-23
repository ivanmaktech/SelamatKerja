import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  User, 
  MapPin, 
  X, 
  PlusCircle
} from 'lucide-react';

// Interfaces matching backend types
export interface KakakPreferences {
  expectedSalary: string; // "1500-1800" | "1800-2200" | "2200+"
  jobType: string; // childcare | elderly care | housekeeping | cooking
  restDays: string; // weekly | 2days | none
  accommodation: string; // Live-in | Live-out
  language?: string; // Malay/Indonesian, English, Cantonese
}

export interface JobPosting {
  id: string;
  employerName: string;
  salary: number;
  jobType: string;
  restDays: number;
  accommodation: string;
  deductions: number;
  jobDescription: string;
  languageRequirement: string;
}

// Initial Demo Job postings (synced with backend or used directly for client-side state)
const INITIAL_DEMO_JOBS: JobPosting[] = [
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
    deductions: 100,
    jobDescription: 'Support mother with a newborn child. Duties include baby care, washing baby clothes, sanitizing baby bottles, and light cooking.',
    languageRequirement: 'Malay/Indonesian',
  },
  {
    id: 'job-3',
    employerName: 'Grace Tan',
    salary: 2300,
    jobType: 'elderly care',
    restDays: 4, // Weekly
    accommodation: 'Live-in',
    deductions: 50,
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

const DEMO_PREFERENCES_SITI: KakakPreferences = {
  expectedSalary: '1800-2200',
  jobType: 'childcare',
  restDays: 'weekly',
  accommodation: 'Live-in',
  language: 'Malay/Indonesian',
};

const JobMatcher: React.FC = () => {
  // Navigation & Role state
  const [role, setRole] = useState<'kakak' | 'employer'>('kakak');
  
  // Data State
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_DEMO_JOBS);
  const [preferences, setPreferences] = useState<KakakPreferences | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  
  // Active Employer State
  const [activeEmployer, setActiveEmployer] = useState<string>('Ahmad Kassim');

  // Job Matching Details Modal State
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);

  // New Job Posting Form State
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [newJobEmployer, setNewJobEmployer] = useState<string>('Ahmad Kassim');
  const [newJobType, setNewJobType] = useState<string>('childcare');
  const [newJobSalary, setNewJobSalary] = useState<string>('');
  const [newJobRestDays, setNewJobRestDays] = useState<string>('4');
  const [newJobAccommodation, setNewJobAccommodation] = useState<string>('Live-in');
  const [newJobDeductions, setNewJobDeductions] = useState<string>('0');
  const [newJobLang, setNewJobLang] = useState<string>('Malay/Indonesian');
  const [newJobDesc, setNewJobDesc] = useState<string>('');

  // Form Preferences state (temporary state during onboarding)
  const [prefJobType, setPrefJobType] = useState<string>('childcare');
  const [prefSalary, setPrefSalary] = useState<string>('1800-2200');
  const [prefRestDays, setPrefRestDays] = useState<string>('weekly');
  const [prefAccom, setPrefAccom] = useState<string>('Live-in');
  const [prefLang, setPrefLang] = useState<string>('Malay/Indonesian');

  // Fetch jobs on mount & handle synchronization
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/jobs');
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.warn('Backend offline or unreachable, using local mock jobs.', error);
      // Fallback is already loaded in `jobs` state
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefs: KakakPreferences = {
      jobType: prefJobType,
      expectedSalary: prefSalary,
      restDays: prefRestDays,
      accommodation: prefAccom,
      language: prefLang
    };
    setPreferences(prefs);
    setIsOnboarding(false);
  };

  const loadDemoSiti = () => {
    setPreferences(DEMO_PREFERENCES_SITI);
    setPrefJobType(DEMO_PREFERENCES_SITI.jobType);
    setPrefSalary(DEMO_PREFERENCES_SITI.expectedSalary);
    setPrefRestDays(DEMO_PREFERENCES_SITI.restDays);
    setPrefAccom(DEMO_PREFERENCES_SITI.accommodation);
    setPrefLang(DEMO_PREFERENCES_SITI.language || 'Malay/Indonesian');
    setIsOnboarding(false);
  };

  // Rule-Based Matching calculation
  const calculateMatch = (prefs: KakakPreferences, job: JobPosting): number => {
    let score = 0;

    // 1. Job Type matches (30 points)
    if (job.jobType.toLowerCase() === prefs.jobType.toLowerCase()) {
      score += 30;
    }

    // 2. Salary within preferred range (25 points)
    let minExpectedSalary = 0;
    if (prefs.expectedSalary === '1500-1800') {
      minExpectedSalary = 1500;
    } else if (prefs.expectedSalary === '1800-2200') {
      minExpectedSalary = 1800;
    } else if (prefs.expectedSalary === '2200+') {
      minExpectedSalary = 2200;
    }

    if (job.salary >= minExpectedSalary) {
      score += 25;
    }

    // 3. Rest day matches (15 points)
    let preferredRestDaysNum = 0;
    if (prefs.restDays === 'weekly') {
      preferredRestDaysNum = 4;
    } else if (prefs.restDays === '2days') {
      preferredRestDaysNum = 2;
    }

    if (job.restDays >= preferredRestDaysNum) {
      score += 15;
    }

    // 4. Language match (15 points)
    if (prefs.language) {
      const prefLangLower = prefs.language.toLowerCase();
      const jobLangLower = job.languageRequirement.toLowerCase();
      if (jobLangLower.includes(prefLangLower) || prefLangLower.includes(jobLangLower)) {
        score += 15;
      }
    } else {
      score += 15;
    }

    // 5. Accommodation match (15 points)
    if (job.accommodation.toLowerCase() === prefs.accommodation.toLowerCase()) {
      score += 15;
    }

    return score;
  };

  // Sort and match jobs for active worker
  const getMatchedJobs = () => {
    if (!preferences) return [];
    
    return jobs
      .map(job => ({
        job,
        score: calculateMatch(preferences, job)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // top 5
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobSalary || !newJobDesc) return;

    const payload = {
      employerName: newJobEmployer,
      salary: Number(newJobSalary),
      jobType: newJobType,
      restDays: Number(newJobRestDays),
      accommodation: newJobAccommodation,
      deductions: Number(newJobDeductions || 0),
      jobDescription: newJobDesc,
      languageRequirement: newJobLang
    };

    try {
      const response = await axios.post('http://localhost:3001/api/jobs', payload);
      if (response.data.success) {
        setJobs(prev => [...prev, response.data.data]);
      } else {
        throw new Error('Failed to create job on server');
      }
    } catch (error) {
      console.warn('Backend server offline or error, creating job locally in frontend state.', error);
      const localJob: JobPosting = {
        id: `job-${Date.now()}`,
        employerName: newJobEmployer,
        salary: Number(newJobSalary),
        jobType: newJobType,
        restDays: Number(newJobRestDays),
        accommodation: newJobAccommodation,
        deductions: Number(newJobDeductions || 0),
        jobDescription: newJobDesc,
        languageRequirement: newJobLang
      };
      setJobs(prev => [...prev, localJob]);
    }

    // Reset Form
    setNewJobSalary('');
    setNewJobDesc('');
    setShowAddJobModal(false);
  };

  // Generate Explanation via AI or local fallback rules
  const generateExplanation = async (job: JobPosting, score: number) => {
    setSelectedJob(job);
    setMatchScore(score);
    setExplanation('');
    setLoadingExplanation(true);

    if (!preferences) return;

    try {
      const response = await axios.post('http://localhost:3001/api/explain-match', {
        preferences,
        job
      });
      if (response.data.success) {
        setExplanation(response.data.explanation);
      } else {
        throw new Error('Failed explanation');
      }
    } catch (err) {
      console.warn('Backend explain API error. Utilizing highly restricted local explanation rules.', err);
      // Local fallback rules (VERY SHORT, max 2 bullets, under 25 words total, with ✓ and ⚠)
      const bullets: string[] = [];
      
      // Check Job Type
      if (job.jobType.toLowerCase() === preferences.jobType.toLowerCase()) {
        bullets.push(`✓ Matches ${preferences.jobType} preference`);
      } else {
        bullets.push(`⚠ Different job type (${job.jobType})`);
      }

      // Check Salary
      let minExpected = 0;
      if (preferences.expectedSalary === '1500-1800') minExpected = 1500;
      else if (preferences.expectedSalary === '1800-2200') minExpected = 1800;
      else if (preferences.expectedSalary === '2200+') minExpected = 2200;

      if (job.salary >= minExpected) {
        bullets.push(`✓ Salary within expected range`);
      } else {
        bullets.push(`⚠ Lower salary than expected`);
      }

      setExplanation(bullets.join('\n'));
    } finally {
      setLoadingExplanation(false);
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'childcare': return '🍼 Childcare';
      case 'elderly care': return '👵 Elderly Care';
      case 'housekeeping': return '🧹 Housekeeping';
      case 'cooking': return '🍳 Cooking';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col space-y-5 w-full max-w-lg mx-auto">
      {/* Decision Support Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 text-blue-900 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <span className="font-bold block mb-0.5 text-blue-950">Decision Support System Notice</span>
          SelamatKerja helps domestic workers evaluate how employment terms match their preferences. We do not operate as an agency or hiring platform, nor do we replacement legal channels.
        </div>
      </div>

      {/* Role Switcher */}
      <div className="bg-gray-100 p-1.5 rounded-full flex w-full shadow-inner">
        <button
          onClick={() => setRole('kakak')}
          className={`flex-1 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 ${
            role === 'kakak' 
              ? 'bg-white text-blue-700 shadow-sm transform scale-102 font-bold' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>I am Kakak (Worker)</span>
        </button>
        <button
          onClick={() => setRole('employer')}
          className={`flex-1 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 ${
            role === 'employer' 
              ? 'bg-white text-purple-700 shadow-sm transform scale-102 font-bold' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>I am Employer/Agency</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. KAKAK HUB                                                  */}
      {/* ============================================================== */}
      {role === 'kakak' && (
        <div className="space-y-4">
          {!preferences && !isOnboarding && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-lg">Find Your Ideal Match</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Compare available jobs against your salary, duties, rest days, and housing preferences.
                </p>
              </div>
              <div className="flex flex-col space-y-2.5 pt-2">
                <button
                  onClick={() => setIsOnboarding(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
                >
                  Set My Preferences
                </button>
                <button
                  onClick={loadDemoSiti}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition-colors"
                >
                  Use Demo Profile (Siti Rahma)
                </button>
              </div>
            </div>
          )}

          {/* Onboarding Preference setup */}
          {isOnboarding && (
            <form onSubmit={handleOnboardingSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-1">
                <h3 className="font-bold text-gray-900 text-base">Setup Job Preferences</h3>
                <button 
                  type="button" 
                  onClick={() => setIsOnboarding(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Job Type Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">What job duties do you prefer?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'childcare', label: '🍼 Childcare' },
                    { id: 'elderly care', label: '👵 Elderly Care' },
                    { id: 'housekeeping', label: '🧹 Housekeeping' },
                    { id: 'cooking', label: '🍳 Cooking' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPrefJobType(option.id)}
                      className={`p-3 text-left rounded-xl border text-sm font-medium transition-all ${
                        prefJobType === option.id 
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' 
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Salary Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Expected Salary Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1500-1800', label: 'RM 1.5k-1.8k' },
                    { id: '1800-2200', label: 'RM 1.8k-2.2k' },
                    { id: '2200+', label: 'RM 2.2k+' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPrefSalary(option.id)}
                      className={`py-2.5 px-1.5 text-center rounded-xl border text-xs font-medium transition-all ${
                        prefSalary === option.id 
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' 
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rest Day Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Preferred Rest Days</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'weekly', label: 'Weekly (4 days)' },
                    { id: '2days', label: '2 days/month' },
                    { id: 'none', label: 'No preference' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPrefRestDays(option.id)}
                      className={`py-2.5 px-1.5 text-center rounded-xl border text-xs font-medium transition-all ${
                        prefRestDays === option.id 
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' 
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accommodation Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Accommodation Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Live-in', label: '🏠 Live-in (Stay inside)' },
                    { id: 'Live-out', label: '🚶 Live-out (Stay outside)' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPrefAccom(option.id)}
                      className={`p-3 text-left rounded-xl border text-sm font-medium transition-all ${
                        prefAccom === option.id 
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' 
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Preferred Language</label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Malay/Indonesian">Malay / Indonesian</option>
                  <option value="English">English</option>
                  <option value="Cantonese">Cantonese</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition-colors mt-2"
              >
                Find Jobs for Me
              </button>
            </form>
          )}

          {/* Preferences active view */}
          {preferences && !isOnboarding && (
            <div className="space-y-4">
              {/* Active Preferences Panel */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Search Profile</span>
                  </div>
                  <div className="text-xs text-gray-700 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">{getJobTypeLabel(preferences.jobType)}</span>
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">Min RM {preferences.expectedSalary.split('-')[0]}</span>
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">{preferences.restDays === 'weekly' ? 'Weekly rest' : preferences.restDays === '2days' ? '2 days rest' : 'No rest req'}</span>
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">{preferences.accommodation}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOnboarding(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors"
                >
                  Edit
                </button>
              </div>

              {/* Matched jobs list */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-gray-900 text-sm px-1 flex items-center justify-between">
                  <span>Matched Jobs ({getMatchedJobs().length})</span>
                  <span className="text-xs font-medium text-gray-500">Sorted by score</span>
                </h4>

                {getMatchedJobs().length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No matched jobs found. Try adjusting preferences.</p>
                ) : (
                  getMatchedJobs().map(({ job, score }) => {
                    const isHighMatch = score >= 70;
                    return (
                      <div 
                        key={job.id} 
                        className={`bg-white border rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 ${
                          isHighMatch ? 'border-l-4 border-l-blue-600 border-gray-200' : 'border-gray-200'
                        }`}
                        onClick={() => generateExplanation(job, score)}
                      >
                        {/* Top alignment row */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <h5 className="font-bold text-gray-900 text-sm">{getJobTypeLabel(job.jobType)}</h5>
                              {isHighMatch && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-blue-600" /> Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> Posted by {job.employerName}
                            </p>
                          </div>

                          {/* Match Score Badge */}
                          <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm text-white ${
                            score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                            score >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                            'bg-gradient-to-r from-orange-500 to-amber-600'
                          }`}>
                            {score}% Match
                          </div>
                        </div>

                        {/* Salary & Rest Day Details */}
                        <div className="grid grid-cols-3 gap-2 py-1.5 border-t border-b border-gray-100 text-center">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Salary</span>
                            <p className="text-xs font-bold text-gray-800">RM {job.salary}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rest Days</span>
                            <p className="text-xs font-bold text-gray-800">{job.restDays === 4 ? 'Weekly' : `${job.restDays} days`}</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lodging</span>
                            <p className="text-xs font-bold text-gray-800">{job.accommodation}</p>
                          </div>
                        </div>

                        {/* Action row */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <span className="text-gray-400 line-clamp-1 flex-1 pr-4">{job.jobDescription}</span>
                          <span className="text-blue-600 font-bold flex items-center whitespace-nowrap">
                            Review AI Analysis <ChevronRight className="w-4 h-4 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EMPLOYER HUB                                                */}
      {/* ============================================================== */}
      {role === 'employer' && (
        <div className="space-y-4">
          {/* Active Employer selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center">
                <User className="w-3.5 h-3.5 text-purple-600 mr-1.5" /> Active Profile Context
              </label>
              <button
                onClick={() => setShowAddJobModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post a Job</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Ahmad Kassim', 'Grace Tan'].map(empName => (
                <button
                  key={empName}
                  onClick={() => {
                    setActiveEmployer(empName);
                    setNewJobEmployer(empName);
                  }}
                  className={`p-2.5 text-center rounded-xl border text-xs font-semibold transition-all ${
                    activeEmployer === empName 
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-sm' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {empName}
                </button>
              ))}
            </div>
          </div>

          {/* Job posts list */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm px-1">My Posted Jobs ({jobs.filter(j => j.employerName === activeEmployer).length})</h4>
            
            {jobs.filter(j => j.employerName === activeEmployer).length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No jobs posted yet. Click "Post a Job" to list your first position.</p>
            ) : (
              jobs
                .filter(job => job.employerName === activeEmployer)
                .map(job => (
                  <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-gray-900 text-sm">{getJobTypeLabel(job.jobType)}</h5>
                        <p className="text-[11px] text-gray-500">ID: {job.id}</p>
                      </div>
                      <span className="font-bold text-purple-800 text-sm">RM {job.salary}</span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {job.jobDescription}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-600 uppercase">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{job.accommodation}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{job.restDays === 4 ? 'Weekly rest' : `${job.restDays} rest days`}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Deductions: RM {job.deductions}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">Lang: {job.languageRequirement}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: JOB DETAILS & AI MATCH EXPLANATION (Kakak Flow)      */}
      {/* ============================================================== */}
      {selectedJob && preferences && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{getJobTypeLabel(selectedJob.jobType)}</h3>
                  {matchScore >= 70 && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> Employer: {selectedJob.employerName}
                </p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score circle & Label */}
            <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-base shadow-md ${
                matchScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                matchScore >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                'bg-gradient-to-r from-orange-500 to-amber-500'
              }`}>
                {matchScore}%
              </div>
              <div className="flex-1 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Alignment Score</span>
                <p className="text-sm font-bold text-blue-950">
                  {matchScore >= 80 ? 'Excellent match with your search profile!' :
                   matchScore >= 50 ? 'Good alignment, but note terms differences.' :
                   'Low alignment score. Read terms carefully.'}
                </p>
              </div>
            </div>

            {/* AI Explanation Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" /> AI Explanation Layer
              </h4>
              <div className="bg-blue-950 text-white p-4 rounded-2xl shadow-inner relative overflow-hidden min-h-[70px] flex items-center">
                {loadingExplanation ? (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing job alignment...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs leading-relaxed w-full">
                    {explanation.split('\n').map((line, index) => {
                      if (!line.trim()) return null;
                      const isCheck = line.includes('✓');
                      const isWarning = line.includes('⚠');
                      return (
                        <div key={index} className="flex items-start space-x-2">
                          <span className={`text-base leading-none ${isCheck ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-blue-300'}`}>
                            {isCheck ? '✓' : isWarning ? '⚠' : '•'}
                          </span>
                          <span className="flex-1 font-semibold text-gray-100">
                            {line.replace(/^[✓⚠\-\*\s]+/, '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-normal italic">
                AI explains reasons based on matches. AI does not decide matches or replace recruitment processes.
              </p>
            </div>

            {/* Detailed Terms Table */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Job Specifications</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden text-xs">
                <div className="flex justify-between p-3 border-b bg-gray-50 font-medium">
                  <span className="text-gray-500">Expected Salary</span>
                  <span className="font-bold text-gray-900">RM {selectedJob.salary}</span>
                </div>
                <div className="flex justify-between p-3 border-b font-medium">
                  <span className="text-gray-500">Duties / Job Type</span>
                  <span className="font-bold text-gray-900">{getJobTypeLabel(selectedJob.jobType)}</span>
                </div>
                <div className="flex justify-between p-3 border-b bg-gray-50 font-medium">
                  <span className="text-gray-500">Rest Days Per Month</span>
                  <span className="font-bold text-gray-900">{selectedJob.restDays} days</span>
                </div>
                <div className="flex justify-between p-3 border-b font-medium">
                  <span className="text-gray-500">Accommodation Type</span>
                  <span className="font-bold text-gray-900">{selectedJob.accommodation}</span>
                </div>
                <div className="flex justify-between p-3 border-b bg-gray-50 font-medium">
                  <span className="text-gray-500">Required Language</span>
                  <span className="font-bold text-gray-900">{selectedJob.languageRequirement}</span>
                </div>
                {selectedJob.deductions > 0 && (
                  <div className="flex justify-between p-3 bg-red-50 text-red-950 font-medium">
                    <span className="text-red-700 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Deductions
                    </span>
                    <span className="font-bold text-red-900">RM {selectedJob.deductions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description block */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                {selectedJob.jobDescription}
              </p>
            </div>
            
            <button
              onClick={() => setSelectedJob(null)}
              className="w-full py-3 bg-gray-150 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold shadow-sm transition-colors text-center block"
            >
              Back to Matched List
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: EMPLOYER POST JOB FORM                               */}
      {/* ============================================================== */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-4 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-1">
              <h3 className="font-bold text-gray-900 text-lg">Post a Job Listing</h3>
              <button 
                onClick={() => setShowAddJobModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5 text-xs">
              {/* Employer Name (Read-only for demo context consistency) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Employer Name</label>
                <input 
                  type="text" 
                  value={newJobEmployer} 
                  disabled 
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-semibold text-gray-600"
                />
              </div>

              {/* Job Type Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Duties / Job Type</label>
                <select
                  value={newJobType}
                  onChange={(e) => setNewJobType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                >
                  <option value="childcare">🍼 Childcare</option>
                  <option value="elderly care">👵 Elderly Care</option>
                  <option value="housekeeping">🧹 Housekeeping</option>
                  <option value="cooking">🍳 Cooking</option>
                </select>
              </div>

              {/* Salary (RM) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Salary (Monthly in RM)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2100"
                  required
                  value={newJobSalary}
                  onChange={(e) => setNewJobSalary(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Rest Days (days/month) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rest Days Per Month</label>
                <select
                  value={newJobRestDays}
                  onChange={(e) => setNewJobRestDays(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                >
                  <option value="4">Weekly (4 days/month)</option>
                  <option value="2">2 days/month</option>
                  <option value="0">No rest days</option>
                </select>
              </div>

              {/* Accommodation */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Accommodation Offered</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Live-in', 'Live-out'].map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setNewJobAccommodation(item)}
                      className={`p-2.5 text-center border text-xs font-semibold rounded-xl transition-all ${
                        newJobAccommodation === item 
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item === 'Live-in' ? '🏠 Live-in' : '🚶 Live-out'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Salary Deductions (Monthly in RM, if any)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 0"
                  value={newJobDeductions}
                  onChange={(e) => setNewJobDeductions(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Required Language */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Required Language</label>
                <select
                  value={newJobLang}
                  onChange={(e) => setNewJobLang(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                >
                  <option value="Malay/Indonesian">Malay / Indonesian</option>
                  <option value="English">English</option>
                  <option value="Cantonese">Cantonese</option>
                  <option value="English / Malay">English & Malay</option>
                  <option value="English / Cantonese">English & Cantonese</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Job Description / Requirements</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Provide specific details about the job, family size, schedule, etc."
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Submit / Action buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs shadow-sm transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow transition-colors text-center"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
