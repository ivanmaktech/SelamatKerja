// Shared domain types for KakakSafe

export interface KakakProfile {
  name: string;
  country: string; // 'Indonesia' | 'Philippines' | 'Bangladesh' | 'Myanmar' | 'Other'
  preferredLocation: string; // 'Kuala Lumpur' | 'Selangor' | 'Penang' | 'Johor' | 'Other'
  // Job Preferences (core matching data)
  expectedSalary: string; // '1200-1500' | '1500-1800' | '1800-2200' | '2200+'
  jobTypes: string[];     // multi-select: ['childcare', 'elderly care', 'housekeeping', 'cooking']
  restDays: string;       // 'weekly' | '2days' | 'flexible'
  accommodation: string;  // 'provided' | 'no-preference' | 'must-private'
  language: string;       // 'Malay/Indonesian' | 'English' | 'Basic' | 'None'
  // Concern toggles
  wantsClearSalary: boolean;
  prefersLowFees: boolean;
  wantsWeeklyRest: boolean;
}

export interface EmployerProfile {
  name: string;
  location: string;         // 'Kuala Lumpur' | 'Selangor' | 'Penang' | 'Johor' | 'Other'
  agencyType: string;       // 'private-employer' | 'recruitment-agency'
  yearsExperience: string;  // '< 1 year' | '1-3 years' | '3+ years'
  // Transparency fields
  showRecruitmentFee: boolean;
  contractAvailable: boolean;
  passportPolicy: string;   // 'worker-holds' | 'agency-holds' | 'discuss'
  overtimePolicy: string;   // 'paid' | 'time-off' | 'none'
}

export interface User {
  role: 'kakak' | 'employer';
  email: string;
  kakakProfile?: KakakProfile;
  employerProfile?: EmployerProfile;
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
