import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  X, 
  User, 
  MapPin 
} from 'lucide-react';

import { useLocation } from 'react-router-dom';
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

const INITIAL_DEMO_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    employerName: 'Ahmad Kassim',
    salary: 2100,
    jobType: 'childcare',
    restDays: 4,
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
    restDays: 2,
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
    restDays: 4,
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
    restDays: 4,
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
    restDays: 2,
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

interface JobMatcherProps {
  userName: string;
  initialPreferences?: {
    expectedSalary: string;
    jobType: string;
    jobTypes?: string[];
    restDays: string;
    accommodation: string;
    language?: string;
  };
}

const JobMatcher: React.FC<JobMatcherProps> = ({ userName, initialPreferences }) => {
  const location = useLocation();
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_DEMO_JOBS);
  const [preferences, setPreferences] = useState<KakakPreferences | null>(initialPreferences || null);
  const [isOnboarding, setIsOnboarding] = useState(!initialPreferences && !location.state?.autoOpenJob);
  
  // Job Matching Details Modal State
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [interestedJobs, setInterestedJobs] = useState<string[]>([]);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  // Onboarding Form States
  const [prefJobType, setPrefJobType] = useState<string>('childcare');
  const [prefSalary, setPrefSalary] = useState<string>('1800-2200');
  const [prefRestDays, setPrefRestDays] = useState<string>('weekly');
  const [prefAccom, setPrefAccom] = useState<string>('Live-in');
  const [prefLang, setPrefLang] = useState<string>('Malay/Indonesian');

  // Load initial jobs; use onboarding preferences if provided, else fall back to demo name match
  useEffect(() => {
    fetchJobs();
    if (initialPreferences) {
      // Pre-fill from onboarding wizard
      const prefs: KakakPreferences = {
        expectedSalary: initialPreferences.expectedSalary,
        jobType: initialPreferences.jobType,
        restDays: initialPreferences.restDays,
        accommodation: initialPreferences.accommodation,
        language: initialPreferences.language,
      };
      setPreferences(prefs);
      setPrefJobType(prefs.jobType);
      setPrefSalary(prefs.expectedSalary);
      setPrefRestDays(prefs.restDays);
      setPrefAccom(prefs.accommodation);
      setPrefLang(prefs.language ?? 'Malay/Indonesian');
    } else if (userName === 'Siti Rahma' || location.state?.autoOpenJob) {
      setPreferences(DEMO_PREFERENCES_SITI);
      setPrefJobType(DEMO_PREFERENCES_SITI.jobType);
      setPrefSalary(DEMO_PREFERENCES_SITI.expectedSalary);
      setPrefRestDays(DEMO_PREFERENCES_SITI.restDays);
      setPrefAccom(DEMO_PREFERENCES_SITI.accommodation);
      setPrefLang(DEMO_PREFERENCES_SITI.language || 'Malay/Indonesian');
    } else {
      setPreferences(null);
      setIsOnboarding(true);
    }
  }, [userName, initialPreferences, location.state]);

  // Handle auto-open job from routing
  useEffect(() => {
    if (location.state?.autoOpenJob && preferences) {
      generateExplanation(location.state.autoOpenJob, location.state.autoOpenScore || 50);
      // Clear the state so it doesn't reopen if they close and trigger another render
      window.history.replaceState({}, document.title);
    }
  }, [location.state, preferences]);


  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/jobs`);
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.warn('Backend server offline. Utilizing mock job list.', error);
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

  const handleInterest = async () => {
    if (!selectedJob || !preferences || interestedJobs.includes(selectedJob.id)) return;
    
    setIsSubmittingInterest(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/jobs/interest`, {
        jobId: selectedJob.id,
        kakakName: userName,
        country: 'Malaysia', 
        matchPercentage: matchScore,
        expectedSalary: preferences.expectedSalary,
        jobTypePref: preferences.jobType,
        restDaysPref: preferences.restDays
      });
      setInterestedJobs(prev => [...prev, selectedJob.id]);
    } catch (err) {
      console.error('Failed to submit interest', err);
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  const generateExplanation = async (job: JobPosting, score: number) => {
    setSelectedJob(job);
    setMatchScore(score);
    setExplanation('');
    setLoadingExplanation(true);

    if (!preferences) {
      setLoadingExplanation(false);
      setExplanation('Please complete your profile preferences first to get a personalized AI match explanation.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/explain-match`, {
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
    <div className="space-y-4 w-full">
      {/* Decision Support Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 text-blue-900 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <span className="font-bold block mb-0.5 text-blue-950">Decision Support System Notice</span>
          KakakSafe helps domestic workers evaluate how employment terms match their preferences. We do not operate as an agency or hiring platform, nor do we replacement legal channels.
        </div>
      </div>

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
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm px-1 flex items-center justify-between">
              <span>Matched Jobs ({getMatchedJobs().length})</span>
              <span className="text-xs font-medium text-gray-500">Sorted by score</span>
            </h4>

            {getMatchedJobs().length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm bg-white border border-gray-200 rounded-2xl">
                No matched jobs found. Try adjusting preferences.
              </p>
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
                    {/* Top row */}
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

                      {/* Score badge */}
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm text-white ${
                        score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                        score >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                        'bg-gradient-to-r from-orange-500 to-amber-600'
                      }`}>
                        {score}% Match
                      </div>
                    </div>

                    {/* Details row */}
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

                    {/* Footer row */}
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

      {/* Modal: Job Details & AI Explanation */}
      {selectedJob && preferences && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-5 animate-scale-up">
            
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

            <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-base shadow-md ${
                matchScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                matchScore >= 50 ? 'bg-gradient-to-r from-blue-50 hover:bg-blue-100 text-blue-800 border' :
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

            {/* AI Explanation Layer */}
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

            {/* Detailed Table */}
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

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                {selectedJob.jobDescription}
              </p>
            </div>
            
            <div className="pt-2 space-y-2">
              {interestedJobs.includes(selectedJob.id) ? (
                <button
                  disabled
                  className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-colors text-center block flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Interest Sent! Employer will review.</span>
                </button>
              ) : (
                <button
                  onClick={handleInterest}
                  disabled={isSubmittingInterest}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all text-center flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingInterest ? 'Sending...' : "I'm Interested"}
                </button>
              )}
              
              <button
                onClick={() => setSelectedJob(null)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-colors text-center block"
              >
                Back to Matched List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
