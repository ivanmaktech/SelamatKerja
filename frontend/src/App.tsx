import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import type { User, KakakProfile, EmployerProfile } from './types';

import Navigation from './components/Navigation';
import ContractExplanation from './components/ContractExplanation';
import FeeChecker from './components/FeeChecker';
import RightsAssistant from './components/RightsAssistant';
import JobMatcher from './components/JobMatcher';
import ApplicantMatch from './components/ApplicantMatch';
import EmployerDashboard from './components/EmployerDashboard';
import Login from './components/Login';
import KakakOnboarding from './components/KakakOnboarding';
import EmployerOnboarding from './components/EmployerOnboarding';
import Settings from './components/Settings';
import PendingContracts from './components/PendingContracts';

type AppState = 'login' | 'onboarding' | 'app';

// ─────────────────────────────────────────────
// Inner shell (must be inside Router)
// ─────────────────────────────────────────────
function AppShell({ user, onLogout, onUpdateUser }: { user: User; onLogout: () => void; onUpdateUser: (u: User) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [user.role]);

  const kakakPrefs = user.kakakProfile
    ? {
        expectedSalary: user.kakakProfile.expectedSalary,
        jobType: user.kakakProfile.jobTypes[0] ?? 'childcare',
        jobTypes: user.kakakProfile.jobTypes,
        restDays: user.kakakProfile.restDays === 'flexible' ? '2days' : user.kakakProfile.restDays,
        accommodation: user.kakakProfile.accommodation === 'provided'
          ? 'Live-in'
          : user.kakakProfile.accommodation === 'must-private'
          ? 'Live-in'
          : 'Live-out',
        language: user.kakakProfile.language === 'None' ? undefined : user.kakakProfile.language,
      }
    : undefined;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden md:flex-row flex-col">
      {/* ===== NAVIGATION (Sidebar on desktop, Top/Bottom on mobile) ===== */}
      <Navigation role={user.role} />

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ===== HEADER ===== */}
        <header className="w-full bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 md:hidden">
              <div className={`p-1.5 rounded-lg ${user.role === 'kakak' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                <ShieldCheck className={`w-4 h-4 ${user.role === 'kakak' ? 'text-blue-700' : 'text-purple-700'}`} />
              </div>
              <div>
                <span className="font-extrabold text-gray-900 text-sm tracking-tight">KakakSafe</span>
                <span className={`ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                  user.role === 'kakak' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {user.role === 'kakak' ? 'Worker' : 'Employer'}
                </span>
              </div>
            </div>
            
            {/* Desktop spacer to push profile to the right when logo is hidden */}
            <div className="hidden md:block flex-1" />

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-gray-400 font-medium">Welcome back</p>
                <p className="text-xs font-bold text-gray-800 leading-none">
                  {user.kakakProfile?.name ?? user.employerProfile?.name ?? user.email.split('@')[0]}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-200 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="max-w-7xl mx-auto">
            {/* Concerns banner for Kakak */}
            {user.role === 'kakak' && user.kakakProfile && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.kakakProfile.wantsClearSalary && (
                  <span className="text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full">💰 Clear salary</span>
                )}
                {user.kakakProfile.prefersLowFees && (
                  <span className="text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full">📉 Low fees</span>
                )}
                {user.kakakProfile.wantsWeeklyRest && (
                  <span className="text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🌿 Weekly rest</span>
                )}
                {user.kakakProfile.country && (
                  <span className="text-[9px] font-bold bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🌏 {user.kakakProfile.country}</span>
                )}
              </div>
            )}

            {/* Transparency badges for Employer */}
            {user.role === 'employer' && user.employerProfile && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.employerProfile.contractAvailable && (
                  <span className="text-[9px] font-bold bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full">📄 Contract available</span>
                )}
                {user.employerProfile.passportPolicy === 'worker-holds' && (
                  <span className="text-[9px] font-bold bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full">✅ Worker holds passport</span>
                )}
                {user.employerProfile.overtimePolicy === 'paid' && (
                  <span className="text-[9px] font-bold bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full">💵 Paid overtime</span>
                )}
                {user.employerProfile.location && (
                  <span className="text-[9px] font-bold bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">📍 {user.employerProfile.location}</span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ===== SCROLLABLE PAGE CONTENT ===== */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {user.role === 'kakak' ? (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <Routes>
                  <Route path="/" element={<ContractExplanation />} />
                  <Route path="/fee-checker" element={<FeeChecker />} />
                  <Route path="/assistant" element={<RightsAssistant />} />
                  <Route path="/matching" element={
                    <JobMatcher
                      userName={user.kakakProfile?.name ?? user.email}
                      initialPreferences={kakakPrefs}
                    />
                  } />
                  <Route path="/contracts" element={
                    <PendingContracts
                      userName={user.kakakProfile?.name ?? user.email}
                      preferences={kakakPrefs}
                    />
                  } />
                  <Route path="/settings" element={
                    <Settings 
                      user={user} 
                      onUpdateKakak={(p) => onUpdateUser({ ...user, kakakProfile: p })}
                      onUpdateEmployer={(p) => onUpdateUser({ ...user, employerProfile: p })}
                    />
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            ) : (
              <div className="space-y-6">
                <Routes>
                  <Route path="/" element={
                    <EmployerDashboard
                      employerName={user.employerProfile?.name ?? user.email}
                      employerProfile={user.employerProfile}
                    />
                  } />
                  <Route path="/candidates" element={
                    <ApplicantMatch
                      employerName={user.employerProfile?.name ?? user.email}
                    />
                  } />
                  <Route path="/contract-tools" element={
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                      <ContractExplanation />
                    </div>
                  } />
                  <Route path="/settings" element={
                    <Settings 
                      user={user} 
                      onUpdateKakak={(p) => onUpdateUser({ ...user, kakakProfile: p })}
                      onUpdateEmployer={(p) => onUpdateUser({ ...user, employerProfile: p })}
                    />
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────
function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loginData: { role: 'kakak' | 'employer'; name: string; email: string }) => {
    const newUser: User = { role: loginData.role, email: loginData.email };
    setPendingUser(newUser);
    setAppState('onboarding');
  };

  const handleKakakOnboardingComplete = (profile: KakakProfile) => {
    if (!pendingUser) return;
    const completeUser: User = { ...pendingUser, kakakProfile: profile };
    setUser(completeUser);
    setPendingUser(null);
    setAppState('app');
  };

  const handleEmployerOnboardingComplete = (profile: EmployerProfile) => {
    if (!pendingUser) return;
    const completeUser: User = { ...pendingUser, employerProfile: profile };
    setUser(completeUser);
    setPendingUser(null);
    setAppState('app');
  };

  const handleLogout = () => {
    setUser(null);
    setPendingUser(null);
    setAppState('login');
  };

  // ── LOGIN SCREEN ──
  if (appState === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // ── ONBOARDING SCREEN ──
  if (appState === 'onboarding' && pendingUser) {
    // Extract default name from email for pre-fill
    const defaultName = pendingUser.email.split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    if (pendingUser.role === 'kakak') {
      return <KakakOnboarding defaultName={defaultName} onComplete={handleKakakOnboardingComplete} />;
    } else {
      return <EmployerOnboarding defaultName={defaultName} onComplete={handleEmployerOnboardingComplete} />;
    }
  }

  // ── APP SCREEN ──
  if (appState === 'app' && user) {
    return (
      <Router>
        <AppShell user={user} onLogout={handleLogout} onUpdateUser={setUser} />
      </Router>
    );
  }

  // Fallback — should never reach here
  return null;
}

export default App;
