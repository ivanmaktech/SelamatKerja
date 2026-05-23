import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import Navigation from './components/Navigation';
import ContractExplanation from './components/ContractExplanation';
import FeeChecker from './components/FeeChecker';
import RightsAssistant from './components/RightsAssistant';
import JobMatcher from './components/JobMatcher';
import ApplicantMatch from './components/ApplicantMatch';
import EmployerDashboard from './components/EmployerDashboard';
import Login from './components/Login';

interface User {
  role: 'kakak' | 'employer';
  name: string;
  email: string;
}

function AppShell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const navigate = useNavigate();

  // When role changes, navigate to the root home page
  useEffect(() => {
    navigate('/');
  }, [user.role]);

  return (
    <div className="min-h-screen flex flex-col items-center pt-6 pb-10 bg-gray-50">
      {/* ===== APP HEADER ===== */}
      <header className="w-full max-w-lg mb-5 px-4">
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${user.role === 'kakak' ? 'bg-blue-100' : 'bg-purple-100'}`}>
              <ShieldCheck className={`w-4 h-4 ${user.role === 'kakak' ? 'text-blue-700' : 'text-purple-700'}`} />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-sm tracking-tight">SelamatKerja</span>
              <span className={`ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                user.role === 'kakak' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {user.role === 'kakak' ? 'Worker' : 'Employer'}
              </span>
            </div>
          </div>

          {/* User greeting + logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-medium">Welcome back</p>
              <p className="text-xs font-bold text-gray-800 leading-none">{user.name}</p>
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
      </header>

      {/* ===== ROLE-BASED NAVIGATION ===== */}
      <Navigation role={user.role} />

      {/* ===== MAIN CONTENT ===== */}
      <main className="w-full max-w-lg mt-6 px-4 sm:px-0">
        {user.role === 'kakak' ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <Routes>
              <Route path="/" element={<ContractExplanation />} />
              <Route path="/fee-checker" element={<FeeChecker />} />
              <Route path="/assistant" element={<RightsAssistant />} />
              <Route path="/matching" element={<JobMatcher userName={user.name} />} />
              {/* Redirect any employer routes back to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        ) : (
          <div className="space-y-4">
            <Routes>
              <Route path="/" element={<EmployerDashboard employerName={user.name} />} />
              <Route path="/candidates" element={<ApplicantMatch employerName={user.name} />} />
              <Route path="/contract-tools" element={
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <ContractExplanation />
                </div>
              } />
              {/* Redirect any kakak routes back to employer home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Router>
      <AppShell user={user} onLogout={handleLogout} />
    </Router>
  );
}

export default App;
