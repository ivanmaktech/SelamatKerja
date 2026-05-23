import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  X,
  ShieldCheck,
  Users,
  ChevronRight
} from 'lucide-react';
import type { EmployerProfile, InterestSubmission } from '../types';

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
    languageRequirement: 'English / Cantonese',
  },
];

interface EmployerDashboardProps {
  employerName: string;
  employerProfile?: EmployerProfile;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ employerName, employerProfile }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_DEMO_JOBS);
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [interests, setInterests] = useState<InterestSubmission[]>([]);
  
  // Job Form State
  const [newJobType, setNewJobType] = useState<string>('childcare');
  const [newJobSalary, setNewJobSalary] = useState<string>('');
  const [newJobRestDays, setNewJobRestDays] = useState<string>('4');
  const [newJobAccommodation, setNewJobAccommodation] = useState<string>('Live-in');
  const [newJobDeductions, setNewJobDeductions] = useState<string>('0');
  const [newJobLang, setNewJobLang] = useState<string>('Malay/Indonesian');
  const [newJobDesc, setNewJobDesc] = useState<string>('');

  useEffect(() => {
    fetchJobs();
  }, [employerName]);

  useEffect(() => {
    fetchInterests();
  }, [employerName]);

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

  const fetchInterests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/employers/${encodeURIComponent(employerName)}/interests`);
      if (response.data.interests) {
        setInterests(response.data.interests);
      }
    } catch (error) {
      console.warn('Backend server offline. Utilizing empty interest inbox.', error);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobSalary || !newJobDesc) return;

    const payload = {
      employerName,
      salary: Number(newJobSalary),
      jobType: newJobType,
      restDays: Number(newJobRestDays),
      accommodation: newJobAccommodation,
      deductions: Number(newJobDeductions || 0),
      jobDescription: newJobDesc,
      languageRequirement: newJobLang
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/jobs`, payload);
      if (response.data.success) {
        setJobs(prev => [...prev, response.data.data]);
      } else {
        throw new Error('Failed to create job on server');
      }
    } catch (error) {
      console.warn('Backend server offline or error. Creating job locally in frontend state.', error);
      const localJob: JobPosting = {
        id: `job-${Date.now()}`,
        employerName,
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
    return jobs.filter(job => job.employerName === employerName);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Dashboard Sub Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-bold text-gray-900 text-base">Employer Dashboard</h3>
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-purple-700">{employerProfile?.name ?? employerName}</span>
            {employerProfile?.location && <span className="text-gray-400"> · {employerProfile.location}</span>}
            {employerProfile?.agencyType && (
              <span className="ml-1 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                {employerProfile.agencyType === 'private-employer' ? '🏡 Private' : '🏢 Agency'}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddJobModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow flex items-center space-x-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Job</span>
        </button>
      </div>

      {/* Transparency profile panel */}
      {employerProfile && (
        <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Your Transparency Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className={`flex items-center space-x-1.5 p-2 rounded-xl border ${
              employerProfile.contractAvailable ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}>
              <span>📄</span>
              <span className="font-semibold">{employerProfile.contractAvailable ? 'Contract available' : 'No contract yet'}</span>
            </div>
            <div className={`flex items-center space-x-1.5 p-2 rounded-xl border ${
              employerProfile.passportPolicy === 'worker-holds' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
              employerProfile.passportPolicy === 'agency-holds' ? 'border-amber-200 bg-amber-50 text-amber-800' :
              'border-gray-100 bg-gray-50 text-gray-500'
            }`}>
              <span>🪪</span>
              <span className="font-semibold">
                {employerProfile.passportPolicy === 'worker-holds' ? 'Worker holds passport' :
                 employerProfile.passportPolicy === 'agency-holds' ? 'Agency holds passport' :
                 'Passport: to discuss'}
              </span>
            </div>
            <div className={`flex items-center space-x-1.5 p-2 rounded-xl border ${
              employerProfile.overtimePolicy === 'paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}>
              <span>⏱️</span>
              <span className="font-semibold">
                {employerProfile.overtimePolicy === 'paid' ? 'Paid overtime' :
                 employerProfile.overtimePolicy === 'time-off' ? 'Time off in lieu' :
                 'Overtime: N/A'}
              </span>
            </div>
            <div className={`flex items-center space-x-1.5 p-2 rounded-xl border ${
              employerProfile.showRecruitmentFee ? 'border-purple-200 bg-purple-50 text-purple-800' : 'border-gray-100 bg-gray-50 text-gray-500'
            }`}>
              <span>💵</span>
              <span className="font-semibold">{employerProfile.showRecruitmentFee ? 'Fee visible to candidates' : 'Fee not disclosed'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-5 shadow-lg flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-purple-100">
            <Users className="w-3.5 h-3.5" />
            <span>Interest Inbox</span>
          </div>
          <h4 className="text-base font-bold">See who sent interest and send a contract from there.</h4>
          <p className="text-xs text-purple-100 max-w-xl">
            {interests.length > 0
              ? `${interests.length} interested worker${interests.length === 1 ? '' : 's'} are waiting for review.`
              : 'No interest yet. Once a worker responds, their profile appears here and in the matching inbox.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/interests')}
          className="shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-purple-700 text-xs font-bold shadow-sm hover:bg-purple-50 transition-colors"
        >
          <span>Open Inbox</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {interests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Latest interested workers</h4>
              <p className="text-xs text-gray-500">Open the inbox to review the full list and draft a contract.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-100 px-2 py-1 rounded-full">
              {interests.length}
            </span>
          </div>

          <div className="space-y-2">
            {interests.slice(0, 3).map(interest => {
              const job = jobs.find(item => item.id === interest.jobId);
              return (
                <div key={interest.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{interest.kakakName}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {job ? getJobTypeLabel(job.jobType) : 'Job interest'} · {interest.country}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-purple-700">{interest.matchPercentage}%</p>
                    <p className="text-[10px] text-gray-400">match</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List of active employer jobs */}
      <div className="space-y-3">
        <h4 className="font-bold text-gray-900 text-sm px-1">My Posted Jobs ({getEmployerJobs().length})</h4>
        
        {getEmployerJobs().length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm bg-white border border-gray-200 rounded-2xl">
            No jobs posted yet. Click "Post a Job" to get started.
          </p>
        ) : (
          getEmployerJobs().map(job => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-gray-900 text-sm">{getJobTypeLabel(job.jobType)}</h5>
                  <p className="text-[10px] text-gray-400">ID: {job.id}</p>
                </div>
                <span className="font-extrabold text-purple-800 text-sm">RM {job.salary}</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {job.jobDescription}
              </p>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{job.accommodation}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">{job.restDays === 4 ? 'Weekly rest' : `${job.restDays} rest days`}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">Deductions: RM {job.deductions}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">Lang: {job.languageRequirement}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-4 animate-scale-up">
            
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
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Employer Name</label>
                <input 
                  type="text" 
                  value={employerName} 
                  disabled 
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-semibold text-gray-600"
                />
              </div>

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

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors text-center"
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

export default EmployerDashboard;
