import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles } from 'lucide-react';
import type { EmployerProfile } from '../types';
import { useTranslation } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface EmployerOnboardingProps {
  defaultName: string;
  onComplete: (profile: EmployerProfile) => void;
}

const LOCATIONS = [
  { label: 'Johor', value: 'Johor' },
  { label: 'Kedah', value: 'Kedah' },
  { label: 'Kelantan', value: 'Kelantan' },
  { label: 'Melaka', value: 'Melaka' },
  { label: 'Negeri Sembilan', value: 'Negeri Sembilan' },
  { label: 'Pahang', value: 'Pahang' },
  { label: 'Perak', value: 'Perak' },
  { label: 'Perlis', value: 'Perlis' },
  { label: 'Pulau Pinang', value: 'Pulau Pinang' },
  { label: 'Sabah', value: 'Sabah' },
  { label: 'Sarawak', value: 'Sarawak' },
  { label: 'Selangor', value: 'Selangor' },
  { label: 'Terengganu', value: 'Terengganu' },
  { label: 'W.P. Kuala Lumpur', value: 'Kuala Lumpur' },
  { label: 'W.P. Labuan', value: 'Labuan' },
  { label: 'W.P. Putrajaya', value: 'Putrajaya' },
];

const AGENCY_TYPES = [
  { label: '🏡 Private Employer', sublabel: 'Hiring for own household', value: 'private-employer' },
  { label: '🏢 Recruitment Agency', sublabel: 'Placing workers for clients', value: 'recruitment-agency' },
];

const EXPERIENCE_OPTIONS = [
  { label: '🌱 New', sublabel: '< 1 year', value: '< 1 year' },
  { label: '📈 Some', sublabel: '1–3 years', value: '1-3 years' },
  { label: '⭐ Experienced', sublabel: '3+ years', value: '3+ years' },
];

const PASSPORT_POLICIES = [
  { label: '✅ Worker holds own passport', value: 'worker-holds' },
  { label: '🏢 Agency holds temporarily', value: 'agency-holds' },
  { label: '💬 To be discussed', value: 'discuss' },
];

const OVERTIME_POLICIES = [
  { label: '💵 Paid overtime', value: 'paid' },
  { label: '⏰ Time off in lieu', value: 'time-off' },
  { label: '—  Not applicable', value: 'none' },
];

const TOTAL_STEPS = 3;

const EmployerOnboarding: React.FC<EmployerOnboardingProps> = ({ defaultName, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  // Step 1 — Basic Info
  const [name, setName] = useState(defaultName);
  const [location, setLocation] = useState('Kuala Lumpur');
  const [agencyType, setAgencyType] = useState('private-employer');

  // Step 2 — Trust Info
  const [yearsExperience, setYearsExperience] = useState('1-3 years');

  // Step 3 — Transparency
  const [showRecruitmentFee, setShowRecruitmentFee] = useState(true);
  const [contractAvailable, setContractAvailable] = useState(true);
  const [passportPolicy, setPassportPolicy] = useState('worker-holds');
  const [overtimePolicy, setOvertimePolicy] = useState('paid');

  const handleFinish = () => {
    onComplete({
      name: name.trim() || defaultName,
      location,
      agencyType,
      yearsExperience,
      showRecruitmentFee,
      contractAvailable,
      passportPolicy,
      overtimePolicy,
    });
  };

  const progressPct = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 pt-7 pb-5 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-200">{t('onboard.employerSetup')}</span>
            </div>
            <span className="text-[10px] font-bold text-purple-300">{t('onboard.step')} {step} {t('onboard.of')} {TOTAL_STEPS}</span>
          </div>
          <h2 className="font-extrabold text-xl leading-tight">
            {step === 1 && t('onboard.empStep1Title')}
            {step === 2 && t('onboard.empStep2Title')}
            {step === 3 && t('onboard.empStep3Title')}
          </h2>
          <p className="text-purple-100 text-xs">
            {step === 1 && t('onboard.empStep1Desc')}
            {step === 2 && t('onboard.empStep2Desc')}
            {step === 3 && t('onboard.empStep3Desc')}
          </p>
          {/* Progress Bar */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5">

          {/* ===== STEP 1: Basic Info ===== */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.emp.nameLabel')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('onboard.emp.namePlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.emp.locationLabel')}</label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(l => (
                    <button
                      key={l.value}
                      onClick={() => setLocation(l.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        location === l.value
                          ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.emp.agencyTypeLabel')}</label>
                <div className="space-y-2">
                  {AGENCY_TYPES.map(at => (
                    <button
                      key={at.value}
                      onClick={() => setAgencyType(at.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        agencyType === at.value
                          ? 'border-purple-600 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <p className={`text-xs font-bold ${agencyType === at.value ? 'text-purple-900' : 'text-gray-800'}`}>
                        {t(at.label)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t(at.sublabel)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2: Trust Info ===== */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-800 leading-relaxed">
                <strong>Why this matters:</strong> Workers feel safer knowing they're connecting with experienced employers. Even new employers build trust through transparency.
              </div>

              {/* Summary of step 1 selections */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-1.5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Profile So Far</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-bold text-gray-800">{name || defaultName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-bold text-gray-800">{location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-bold text-gray-800">
                    {agencyType === 'private-employer' ? 'Private Employer' : 'Recruitment Agency'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.emp.experienceLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {EXPERIENCE_OPTIONS.map(e => (
                    <button
                      key={e.value}
                      onClick={() => setYearsExperience(e.value)}
                      className={`px-2 py-3 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        yearsExperience === e.value
                          ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div>{t(e.label)}</div>
                      <div className="text-[9px] font-normal text-gray-400 mt-0.5">{t(e.sublabel)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Transparency ===== */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-purple-800 bg-purple-50 border border-purple-100 rounded-xl p-3 leading-relaxed">
                <strong>This is your transparency profile.</strong> Workers see these fields when evaluating your job listing. Honest policies lead to better matches and longer placements.
              </p>

              {/* Toggle fields */}
              {[
                {
                  label: t('onboard.emp.toggle1Label'),
                  sublabel: t('onboard.emp.toggle1Desc'),
                  value: showRecruitmentFee,
                  setter: setShowRecruitmentFee,
                  icon: '💰',
                },
                {
                  label: t('onboard.emp.toggle2Label'),
                  sublabel: t('onboard.emp.toggle2Desc'),
                  value: contractAvailable,
                  setter: setContractAvailable,
                  icon: '📄',
                },
              ].map(toggle => (
                <div
                  key={toggle.label}
                  onClick={() => toggle.setter(v => !v)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    toggle.value
                      ? 'border-purple-300 bg-purple-50/60 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold">{t('onboard.finish')}</span>
                    <div>
                      <p className={`text-xs font-bold ${toggle.value ? 'text-purple-900' : 'text-gray-800'}`}>
                        {toggle.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{toggle.sublabel}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${
                    toggle.value ? 'bg-purple-600 justify-end' : 'bg-gray-200 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              ))}

              {/* Passport Policy */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.emp.passportLabel')}</label>
                <div className="space-y-1.5">
                  {PASSPORT_POLICIES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPassportPolicy(p.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        passportPolicy === p.value
                          ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t(p.label)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overtime Policy */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.emp.overtimeLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {OVERTIME_POLICIES.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setOvertimePolicy(o.value)}
                      className={`px-2 py-2.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        overtimePolicy === o.value
                          ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t(o.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 text-white space-y-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-200" />
                  <p className="text-xs font-bold">Profile complete!</p>
                </div>
                <p className="text-[11px] text-purple-100 leading-relaxed">
                  {t('onboard.emp.transparencyMsg')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex space-x-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center space-x-1.5 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('onboard.back')}</span>
            </button>
          )}
          <button
            onClick={() => step < TOTAL_STEPS ? setStep(s => s + 1) : handleFinish()}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            {step < TOTAL_STEPS ? (
              <>
                <span>{t('onboard.continue')}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t('onboard.goToDashboard')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerOnboarding;
