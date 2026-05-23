import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Info, 
  ChevronRight, 
  X,
  User,
  Sliders
} from 'lucide-react';
import type { InterestSubmission } from '../types';

export interface CandidateProfile {
  id: string;
  name: string;
  expectedSalary: string;
  jobType: string;
  restDays: string;
  accommodation: string;
  language: string;
}

interface JobPosting {
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
    jobDescription: 'Support mother with a newborn child. Duties include baby care, washing baby clothes, sanitizing bottles, and light cooking.',
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
    languageRequirement: 'English / Cantonese'
  },
];

interface ApplicantMatchProps {
  employerName: string;
}

const ApplicantMatch: React.FC<ApplicantMatchProps> = ({ employerName }) => {
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_DEMO_JOBS);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Modal / Explanation State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [interests, setInterests] = useState<InterestSubmission[]>([]);

  // Send Contract State
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    salary: '',
    jobType: '',
    restDays: '',
    accommodation: '',
    deductions: '',
    duration: '2 Years',
    overtimePolicy: '',
    passportClause: 'Worker keeps passport',
    additionalNotes: ''
  });
  const [isSendingContract, setIsSendingContract] = useState(false);
  const [sentContracts, setSentContracts] = useState<string[]>([]); // Track sent ones by candidate ID

  useEffect(() => {
    fetchData();
  }, [employerName]);

  const fetchData = async () => {
    // 1. Fetch jobs
    let activeJobs = INITIAL_DEMO_JOBS;
    try {
      const jobResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/jobs`);
      if (jobResponse.data.success) {
        setJobs(jobResponse.data.data);
        activeJobs = jobResponse.data.data;
      }
    } catch (err) {
      console.warn('Backend server offline. Utilizing mock job list.', err);
    }

    // Filter jobs matching current employer
    const empJobs = activeJobs.filter(j => j.employerName === employerName);
    if (empJobs.length > 0) {
      setSelectedJob(empJobs[0]);
    } else {
      setSelectedJob(null);
    }

    // 2. Fetch candidates
    try {
      const candidateResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/candidates`);
      if (candidateResponse.data.success) {
        // Legacy setCandidates
      }
    } catch (err) {
      console.warn('Backend server offline. Utilizing mock candidate list.', err);
    }

    try {
      const interestsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/employers/${employerName}/interests`);
      if (interestsRes.data.interests) {
        setInterests(interestsRes.data.interests);
      }
    } catch (err) {
      console.warn('Failed to fetch interests', err);
    }
  };



  const getMatchedCandidates = () => {
    if (!selectedJob) return [];

    // Filter interests for the selected job
    const jobInterests = interests.filter(i => i.jobId === selectedJob.id);

    return jobInterests
      .map(interest => {
        // Map InterestSubmission to the format the UI expects for "candidate"
        return {
          candidate: {
            id: interest.id, // Using interest ID as candidate ID proxy for this view
            name: interest.kakakName,
            expectedSalary: interest.expectedSalary,
            jobType: interest.jobTypePref,
            restDays: interest.restDaysPref,
            accommodation: 'Any', // Interest doesn't store this yet
            language: 'Any'
          },
          score: interest.matchPercentage
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const generateExplanation = async (candidate: CandidateProfile, score: number) => {
    setSelectedCandidate(candidate);
    setMatchScore(score);
    setExplanation('');
    setLoadingExplanation(true);

    if (!selectedJob) return;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/explain-match`, {
        preferences: candidate, // Preferences is the candidate profile shape
        job: selectedJob
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
      if (selectedJob.jobType.toLowerCase() === candidate.jobType.toLowerCase()) {
        bullets.push(`✓ Matches candidate ${candidate.jobType} preference`);
      } else {
        bullets.push(`⚠ Different duties (${selectedJob.jobType} vs ${candidate.jobType})`);
      }

      // Check Salary
      let minExpected = 0;
      if (candidate.expectedSalary === '1500-1800') minExpected = 1500;
      else if (candidate.expectedSalary === '1800-2200') minExpected = 1800;
      else if (candidate.expectedSalary === '2200+') minExpected = 2200;

      if (selectedJob.salary >= minExpected) {
        bullets.push(`✓ Salary meets expectations`);
      } else {
        bullets.push(`⚠ Salary below expected range`);
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

  const getEmployerJobs = () => {
    const employerJobs = jobs.filter(job => job.employerName === employerName);
    return employerJobs.length > 0 ? employerJobs : jobs;
  };

  const handleSendContract = async () => {
    if (!selectedCandidate || !selectedJob) return;
    setIsSendingContract(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/contracts`, {
        ...contractForm,
        jobId: selectedJob.id,
        kakakName: selectedCandidate.name,
        employerName: employerName,
      });
      setSentContracts([...sentContracts, selectedCandidate.id]);
      setShowContractModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingContract(false);
    }
  };

  const prepContractForm = () => {
    if (selectedJob) {
      setContractForm({
        salary: selectedJob.salary.toString(),
        jobType: selectedJob.jobType,
        restDays: selectedJob.restDays === 4 ? 'Weekly' : `${selectedJob.restDays} days`,
        accommodation: selectedJob.accommodation,
        deductions: selectedJob.deductions > 0 ? `RM ${selectedJob.deductions}` : 'None',
        duration: '2 Years',
        overtimePolicy: 'Standard Rate',
        passportClause: 'Worker keeps passport',
        additionalNotes: selectedJob.jobDescription
      });
    }
    setShowContractModal(true);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Decision Support Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start space-x-3 text-purple-900 shadow-sm">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <span className="font-bold block mb-0.5 text-purple-950">Interest Inbox</span>
          Review who sent interest for each job, compare expectations, and draft a contract from the selected worker profile.
        </div>
      </div>

      {/* Select active job posting */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
          <Sliders className="w-3.5 h-3.5 text-purple-600 mr-1.5" /> Select Job Posting to Evaluate
        </label>
        
        {getEmployerJobs().length === 0 ? (
          <p className="text-gray-500 italic py-1">No active job posts found. Post a job first under "My Jobs".</p>
        ) : (
          <select
            value={selectedJob?.id || ''}
            onChange={(e) => {
              const job = jobs.find(j => j.id === e.target.value);
              setSelectedJob(job || null);
            }}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          >
            {getEmployerJobs().map(job => (
              <option key={job.id} value={job.id}>
                {getJobTypeLabel(job.jobType)} — RM {job.salary}/mo ({job.accommodation}, {job.restDays} rest days)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Candidates List sorted by match percentage */}
      {selectedJob && (
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-sm px-1 flex items-center justify-between">
            <span>Interested Workers ({getMatchedCandidates().length})</span>
            <span className="text-xs font-medium text-gray-500">Sorted by score</span>
          </h4>

          {getMatchedCandidates().map(({ candidate, score }) => {
            const isHighMatch = score >= 70;
            return (
              <div
                key={candidate.id}
                onClick={() => generateExplanation(candidate, score)}
                className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
                  isHighMatch ? 'border-l-4 border-l-purple-600 border-gray-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <h5 className="font-bold text-gray-900 text-sm flex items-center">
                        <User className="w-3.5 h-3.5 text-gray-400 mr-1" /> {candidate.name}
                      </h5>
                      {isHighMatch && (
                        <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5 text-purple-600" /> Strong Fit
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">Language: {candidate.language || 'Any'}</p>
                  </div>

                  {/* Score badge */}
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm text-white ${
                    score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    score >= 50 ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                    'bg-gradient-to-r from-orange-500 to-amber-500'
                  }`}>
                    {score}% Match
                  </div>
                </div>

                {/* Candidate Preferences summary row */}
                <div className="grid grid-cols-4 gap-1.5 py-2 border-t border-b border-gray-100 text-center text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pref Duty</span>
                    <p className="font-bold text-gray-800 line-clamp-1">{getJobTypeLabel(candidate.jobType)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Salary Pref</span>
                    <p className="font-bold text-gray-800 line-clamp-1">RM {candidate.expectedSalary}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Rest Days</span>
                    <p className="font-bold text-gray-800 line-clamp-1">{candidate.restDays === 'weekly' ? 'Weekly' : candidate.restDays === '2days' ? '2 days' : 'None'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Accommodation</span>
                    <p className="font-bold text-gray-800 line-clamp-1">{candidate.accommodation}</p>
                  </div>
                </div>

                {/* Footer click actions */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-gray-400 text-[10px] italic">Compare expectations & spot red flags</span>
                  <span className="text-purple-600 font-bold flex items-center whitespace-nowrap">
                    Review Fit Analysis <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAILED MODAL: CANDIDATE FIT & AI ALIGNMENT EXPLANATION       */}
      {/* ============================================================== */}
      {selectedCandidate && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedCandidate.name}</h3>
                  {matchScore >= 70 && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Strong Fit
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Evaluating for job: {getJobTypeLabel(selectedJob.jobType)} (RM {selectedJob.salary})</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score circle */}
            <div className="flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-2xl">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-base shadow-md ${
                matchScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                matchScore >= 50 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                'bg-gradient-to-r from-orange-500 to-amber-500'
              }`}>
                {matchScore}%
              </div>
              <div className="flex-1 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Expectation Match</span>
                <p className="text-sm font-bold text-purple-950">
                  {matchScore >= 80 ? 'Excellent alignment with worker preferences!' :
                   matchScore >= 50 ? 'Moderate alignment. Clarify divergent expectations.' :
                   'High divergence in preferences. Read analysis details.'}
                </p>
              </div>
            </div>

            {/* AI Explanation Layer */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 mr-1" /> AI Alignment Analysis
              </h4>
              <div className="bg-purple-950 text-white p-4 rounded-2xl shadow-inner relative overflow-hidden min-h-[70px] flex items-center">
                {loadingExplanation ? (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-purple-200">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing alignment...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs leading-relaxed w-full">
                    {explanation.split('\n').map((line, index) => {
                      if (!line.trim()) return null;
                      const isCheck = line.includes('✓');
                      const isWarning = line.includes('⚠');
                      return (
                        <div key={index} className="flex items-start space-x-2">
                          <span className={`text-base leading-none ${isCheck ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-purple-300'}`}>
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
                AI analysis compares expectations. AI does not select candidates, check credentials, or replace hiring decisions.
              </p>
            </div>

            {/* Side by Side comparison table */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Specifications Match</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden text-[11px] table-fixed w-full">
                <div className="grid grid-cols-3 bg-gray-50 font-bold p-2.5 border-b text-gray-600">
                  <span>Parameter</span>
                  <span>Job Offers</span>
                  <span>Candidate Prefers</span>
                </div>
                
                {/* Job type */}
                <div className="grid grid-cols-3 p-2.5 border-b">
                  <span className="font-semibold text-gray-500">Duties / Job Type</span>
                  <span className="font-bold text-gray-800">{getJobTypeLabel(selectedJob.jobType)}</span>
                  <span className={`font-bold ${selectedJob.jobType.toLowerCase() === selectedCandidate.jobType.toLowerCase() ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {getJobTypeLabel(selectedCandidate.jobType)}
                  </span>
                </div>

                {/* Salary */}
                <div className="grid grid-cols-3 p-2.5 border-b bg-gray-50">
                  <span className="font-semibold text-gray-500">Salary</span>
                  <span className="font-bold text-gray-800">RM {selectedJob.salary}</span>
                  <span className="font-bold text-gray-800">RM {selectedCandidate.expectedSalary}</span>
                </div>

                {/* Rest days */}
                <div className="grid grid-cols-3 p-2.5 border-b">
                  <span className="font-semibold text-gray-500">Rest Days</span>
                  <span className="font-bold text-gray-800">{selectedJob.restDays} days/mo</span>
                  <span className="font-bold text-gray-800">{selectedCandidate.restDays === 'weekly' ? 'Weekly' : selectedCandidate.restDays === '2days' ? '2 days' : 'None'}</span>
                </div>

                {/* Lodging */}
                <div className="grid grid-cols-3 p-2.5 border-b bg-gray-50">
                  <span className="font-semibold text-gray-500">Accommodation</span>
                  <span className="font-bold text-gray-800">{selectedJob.accommodation}</span>
                  <span className={`font-bold ${selectedJob.accommodation.toLowerCase() === selectedCandidate.accommodation.toLowerCase() ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedCandidate.accommodation}
                  </span>
                </div>

                {/* Language */}
                <div className="grid grid-cols-3 p-2.5">
                  <span className="font-semibold text-gray-500">Language</span>
                  <span className="font-bold text-gray-800">{selectedJob.languageRequirement}</span>
                  <span className="font-bold text-gray-800">{selectedCandidate.language || 'Any'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              {sentContracts.includes(selectedCandidate.id) ? (
                <button
                  disabled
                  className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-colors text-center block flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Contract Sent successfully!</span>
                </button>
              ) : (
                <button
                  onClick={prepContractForm}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all text-center flex items-center justify-center"
                >
                  Draft & Send Contract
                </button>
              )}
              
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-colors text-center block"
              >
                Back to Candidates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND CONTRACT MODAL */}
      {showContractModal && selectedCandidate && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Draft Official Contract</h3>
                <p className="text-xs text-gray-500">Sending to: {selectedCandidate.name}</p>
              </div>
              <button onClick={() => setShowContractModal(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Salary (RM)</label>
                  <input type="text" value={contractForm.salary} onChange={e => setContractForm({...contractForm, salary: e.target.value})} className="w-full border rounded-xl p-2 text-sm bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Job Type</label>
                  <input type="text" value={contractForm.jobType} onChange={e => setContractForm({...contractForm, jobType: e.target.value})} className="w-full border rounded-xl p-2 text-sm bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Rest Days</label>
                  <input type="text" value={contractForm.restDays} onChange={e => setContractForm({...contractForm, restDays: e.target.value})} className="w-full border rounded-xl p-2 text-sm bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Accommodation</label>
                  <input type="text" value={contractForm.accommodation} onChange={e => setContractForm({...contractForm, accommodation: e.target.value})} className="w-full border rounded-xl p-2 text-sm bg-gray-50" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Deductions (if any)</label>
                <input type="text" value={contractForm.deductions} onChange={e => setContractForm({...contractForm, deductions: e.target.value})} className="w-full border rounded-xl p-2 text-sm bg-gray-50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Passport Clause</label>
                <input type="text" value={contractForm.passportClause} onChange={e => setContractForm({...contractForm, passportClause: e.target.value})} className="w-full border rounded-xl p-2 text-sm bg-gray-50 border-purple-200" />
                <p className="text-[10px] text-purple-600 italic">Forcing workers to surrender passports is a major red flag.</p>
              </div>
            </div>

            <button
              onClick={handleSendContract}
              disabled={isSendingContract}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
            >
              {isSendingContract ? 'Sending...' : 'Confirm & Send Contract'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantMatch;
