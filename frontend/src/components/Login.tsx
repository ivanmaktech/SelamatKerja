import React from 'react';
import { 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: { role: 'kakak' | 'employer'; name: string; email: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Mock login as a new Kakak via Google
    onLogin({
      role: 'kakak',
      name: 'Google User',
      email: 'user@gmail.com'
    });
  };

  const handleGitHubLogin = () => {
    // Mock login as a new Employer via GitHub
    onLogin({
      role: 'employer',
      name: 'GitHub Employer',
      email: 'employer@github.com'
    });
  };

  const loginAsDemoKakak = () => {
    onLogin({
      role: 'kakak',
      name: 'Siti Rahma',
      email: 'siti.rahma@demo.org'
    });
  };

  const loginAsDemoEmployer = (name: string) => {
    onLogin({
      role: 'employer',
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@demo.org`
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-w-4xl w-full mx-auto animate-scale-up">
      {/* Left side: Premium Branding & Core Value Proposition */}
      <div className="md:w-1/2 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold tracking-wider text-xl">SelamatKerja</span>
          </div>
          <p className="text-blue-100 text-xs font-semibold tracking-wide uppercase">
            Migrant Worker Decision Support Companion
          </p>
        </div>

        <div className="my-8 md:my-0 space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
            Support. Match. <br />Protect.
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed max-w-sm">
            Empowering domestic workers to analyze employment contracts, check recruitment fees, and match their job preferences with verified employers.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Spot contract red-flags instantly',
              'Check typical recruitment fee benchmarks',
              'Evaluate job alignment without bias'
            ].map((bullet, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs text-blue-50 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-blue-200/80 leading-normal">
          SelamatKerja is a decision support system. We do not replace legal recruitment channels or agencies.
        </div>
      </div>

      {/* Right side: Login forms */}
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Create Account or Login</h3>
          <p className="text-xs text-gray-500">Access your personalized dashboard</p>
        </div>

        {/* Social logins */}
        <div className="space-y-2.5">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-200 rounded-xl font-semibold text-xs text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-300"
          >
            {/* SVG Google logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.626 5.626 0 018.3 12.975a5.626 5.626 0 015.69-5.625c1.47 0 2.8.5 3.84 1.485l3.21-3.21C19.105 3.84 16.73 3 13.99 3A9.982 9.982 0 004 12.975a9.982 9.982 0 009.99 9.975c5.38 0 9.8-3.89 9.8-9.975 0-.58-.06-1.16-.17-1.69H12.24z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button 
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-200 rounded-xl font-semibold text-xs text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-300"
          >
            {/* SVG GitHub logo */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-150"></div>
          <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">or direct demo login</span>
          <div className="flex-grow border-t border-gray-150"></div>
        </div>

        {/* Demo login triggers */}
        <div className="space-y-3">
          {/* Kakak login card */}
          <div 
            onClick={loginAsDemoKakak}
            className="p-3.5 border border-blue-100 rounded-xl bg-blue-50/30 hover:bg-blue-50/70 hover:border-blue-300 shadow-xs cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700 group-hover:scale-110 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">Log in as Kakak (Worker)</p>
                <p className="text-[10px] text-gray-500">Explore jobs matching Siti Rahma</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Employer login cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { name: 'Ahmad Kassim', details: 'Ahmad\'s Household' },
              { name: 'Grace Tan', details: 'Grace\'s Family' }
            ].map(employer => (
              <div 
                key={employer.name}
                onClick={() => loginAsDemoEmployer(employer.name)}
                className="p-3 border border-purple-100 rounded-xl bg-purple-50/30 hover:bg-purple-50/70 hover:border-purple-300 shadow-xs cursor-pointer flex flex-col justify-between text-left transition-all group"
              >
                <div className="bg-purple-100 p-1.5 rounded-lg text-purple-700 self-start mb-2 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-1">{employer.name}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{employer.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
