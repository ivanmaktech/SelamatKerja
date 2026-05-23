import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, UserCheck, Briefcase, Eye, EyeOff, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { useTranslation } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface LoginProps {
  onLogin: (user: { role: 'kakak' | 'employer'; name: string; email: string }) => void;
}

const DEMO_KAKAK = { role: 'kakak' as const, name: 'Siti Rahma', email: 'siti.rahma@demo.org' };
const DEMO_EMPLOYERS = [
  { role: 'employer' as const, name: 'Ahmad Kassim', email: 'ahmad.kassim@demo.org' },
  { role: 'employer' as const, name: 'Grace Tan', email: 'grace.tan@demo.org' },
];

type AuthMode = 'login' | 'signup';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [roleTab, setRoleTab] = useState<'kakak' | 'employer'>('kakak');
  const [error, setError] = useState('');

  const reset = (mode: AuthMode) => {
    setAuthMode(mode);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError(t('login.emailRequired')); return; }
    if (password.length < 6) { setError(t('login.passwordTooShort')); return; }
    if (authMode === 'signup' && password !== confirmPassword) {
      setError(t('login.passwordsDoNotMatch')); return;
    }

    try {
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      const payload = authMode === 'signup' 
        ? { email, password, role: roleTab, name }
        : { email, password };

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${endpoint}`, payload);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLogin(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.authFailed'));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden min-h-[520px]">

      {/* ===== LEFT: Branding Panel ===== */}
      <div className="md:w-5/12 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-14 -ml-14 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold tracking-wider text-lg">KakakSafe</span>
            </div>
            <LanguageSwitcher />
          </div>
          <p className="text-blue-200 text-[10px] font-semibold tracking-widest uppercase">
            {t('login.tagline')}
          </p>
        </div>

        <div className="my-6 md:my-0 space-y-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
            {t('login.heroTitle').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed max-w-xs">
            {t('login.heroDesc')}
          </p>
          <div className="space-y-2.5 pt-1">
            {[
              t('login.bullet1'),
              t('login.bullet2'),
              t('login.bullet3'),
            ].map((b, i) => (
              <div key={i} className="flex items-center space-x-2.5 text-xs text-blue-50 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-blue-200/70 leading-normal relative z-10">
          {t('login.disclaimer')}
        </p>
      </div>

      {/* ===== RIGHT: Auth Forms ===== */}
      <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center space-y-5">

        {/* ── Login / Sign Up toggle ── */}
        <div>
          <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-5">
            <button
              onClick={() => reset('login')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('login.login')}</span>
            </button>
            <button
              onClick={() => reset('signup')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('login.signUp')}</span>
            </button>
          </div>

          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            {authMode === 'login' ? t('login.welcomeBack') : t('login.createAccount')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {authMode === 'login' ? t('login.signInTo') : t('login.setUpProfile')}
          </p>
        </div>

        {/* ── Role selector ── */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { setRoleTab('kakak'); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              roleTab === 'kakak'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👩 {t('login.kakakWorker')}
          </button>
          <button
            onClick={() => { setRoleTab('employer'); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              roleTab === 'employer'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏢 {t('login.employerAgency')}
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('login.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('login.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password — Sign Up only */}
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('login.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                    confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-500 font-semibold">{t('login.passwordMismatch')}</p>
              )}
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center space-x-2 ${
              roleTab === 'kakak' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {authMode === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login.loginAs')} {roleTab === 'kakak' ? 'Kakak' : t('login.employerAgency')}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('login.createAndContinue')}</span>
              </>
            )}
          </button>
        </form>

        {/* ── Auth mode switcher hint ── */}
        <p className="text-center text-[11px] text-gray-400">
          {authMode === 'login' ? (
            <>{t('login.dontHaveAccount')}{' '}
              <button onClick={() => reset('signup')} className="text-blue-600 font-bold hover:underline">
                {t('login.signUpFree')}
              </button>
            </>
          ) : (
            <>{t('login.alreadyHaveAccount')}{' '}
              <button onClick={() => reset('login')} className="text-blue-600 font-bold hover:underline">
                {t('login.loginHere')}
              </button>
            </>
          )}
        </p>

        {/* ── Divider ── */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-150" />
          <span className="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('login.orTryDemo')}</span>
          <div className="flex-grow border-t border-gray-150" />
        </div>

        {/* ── Demo Triggers ── */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => onLogin(DEMO_KAKAK)}
            className="p-3.5 border border-blue-100 rounded-xl bg-blue-50/40 hover:bg-blue-50/80 hover:border-blue-300 cursor-pointer flex flex-col transition-all group"
          >
            <div className="bg-blue-100 p-1.5 rounded-lg text-blue-700 self-start mb-2 group-hover:scale-110 transition-transform">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-bold text-gray-900 leading-tight">{t('login.tryAsWorker')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('login.kakakDemoAccount')}</p>
          </div>

          <div
            onClick={() => onLogin(DEMO_EMPLOYERS[0])}
            className="p-3.5 border border-purple-100 rounded-xl bg-purple-50/40 hover:bg-purple-50/80 hover:border-purple-300 cursor-pointer flex flex-col transition-all group"
          >
            <div className="bg-purple-100 p-1.5 rounded-lg text-purple-700 self-start mb-2 group-hover:scale-110 transition-transform">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-bold text-gray-900 leading-tight">{t('login.tryAsEmployer')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('login.employerDemoAccount')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
