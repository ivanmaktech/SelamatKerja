import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles } from 'lucide-react';
import type { KakakProfile } from '../types';
import { useTranslation } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface KakakOnboardingProps {
  defaultName: string;
  onComplete: (profile: KakakProfile) => void;
}

const APPROVED_COUNTRIES = [
  { label: '🇮🇩 Indonesia', value: 'Indonesia' },
  { label: '🇹🇭 Thailand', value: 'Thailand' },
  { label: '🇰🇭 Cambodia', value: 'Cambodia' },
  { label: '🇵🇭 Philippines', value: 'Philippines' },
  { label: '🇱🇰 Sri Lanka', value: 'Sri Lanka' },
  { label: '🇮🇳 India', value: 'India' },
  { label: '🇻🇳 Vietnam', value: 'Vietnam' },
  { label: '🇱🇦 Laos', value: 'Laos' },
  { label: '🇳🇵 Nepal', value: 'Nepal' },
  { label: '🌏 Others', value: 'Others' },
];

const SALARY_RANGES = [
  { label: 'RM 1,200–1,500', value: '1200-1500' },
  { label: 'RM 1,500–1,800', value: '1500-1800' },
  { label: 'RM 1,800–2,200', value: '1800-2200' },
  { label: 'RM 2,200+', value: '2200+' },
];

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

const JOB_TYPES = [
  { label: '🍼 Childcare', value: 'childcare' },
  { label: '👵 Elderly Care', value: 'elderly care' },
  { label: '🧹 Housekeeping', value: 'housekeeping' },
  { label: '🍳 Cooking', value: 'cooking' },
];

const REST_DAY_OPTIONS = [
  { label: '📅 Weekly', sublabel: '4 days/month', value: 'weekly' },
  { label: '📅 2× Month', sublabel: '2 days/month', value: '2days' },
  { label: '🤝 Flexible', sublabel: 'Open to discuss', value: 'flexible' },
];

const ACCOMMODATION_OPTIONS = [
  { label: '🏠 Provided', sublabel: 'Accommodation included', value: 'provided' },
  { label: '🤷 No Preference', sublabel: 'Either is fine', value: 'no-preference' },
  { label: '🔒 Need Privacy', sublabel: 'Private room required', value: 'must-private' },
];

const LANGUAGE_OPTIONS = [
  { label: '🇲🇾 Malay/Indonesian', value: 'Malay/Indonesian' },
  { label: '🇬🇧 English', value: 'English' },
  { label: '📖 Basic Only', value: 'Basic' },
  { label: '🤐 Not specified', value: 'None' },
];

const TOTAL_STEPS = 3;

const KakakOnboarding: React.FC<KakakOnboardingProps> = ({ defaultName, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  // Step 1 — Basic Profile
  const [name, setName] = useState(defaultName);
  const [country, setCountry] = useState('Indonesia');
  const [otherCountry, setOtherCountry] = useState('');

  // Step 2 — Job Preferences
  const [preferredLocation, setPreferredLocation] = useState('Kuala Lumpur');
  const [expectedSalary, setExpectedSalary] = useState('1500-1800');
  const [jobTypes, setJobTypes] = useState<string[]>(['childcare']);
  const [restDays, setRestDays] = useState('weekly');
  const [accommodation, setAccommodation] = useState('provided');
  const [language, setLanguage] = useState('Malay/Indonesian');

  // Step 3 — Concerns
  const [wantsClearSalary, setWantsClearSalary] = useState(true);
  const [prefersLowFees, setPrefersLowFees] = useState(true);
  const [wantsWeeklyRest, setWantsWeeklyRest] = useState(true);

  const toggleJobType = (type: string) => {
    setJobTypes(prev =>
      prev.includes(type) ? (prev.length > 1 ? prev.filter(t => t !== type) : prev) : [...prev, type]
    );
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim() || defaultName,
      country: country === 'Others' ? (otherCountry.trim() || 'Others') : country,
      preferredLocation,
      expectedSalary,
      jobTypes,
      restDays,
      accommodation,
      language,
      wantsClearSalary,
      prefersLowFees,
      wantsWeeklyRest,
    });
  };

  const progressPct = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 pt-7 pb-5 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">{t('onboard.workerSetup')}</span>
            </div>
            <span className="text-[10px] font-bold text-blue-300">{t('onboard.step')} {step} {t('onboard.of')} {TOTAL_STEPS}</span>
          </div>
          <h2 className="font-extrabold text-xl leading-tight">
            {step === 1 && t('onboard.kakakStep1Title')}
            {step === 2 && t('onboard.kakakStep2Title')}
            {step === 3 && t('onboard.kakakStep3Title')}
          </h2>
          <p className="text-blue-100 text-xs">
            {step === 1 && t('onboard.kakakStep1Desc')}
            {step === 2 && t('onboard.kakakStep2Desc')}
            {step === 3 && t('onboard.kakakStep3Desc')}
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

          {/* ===== STEP 1: Basic Profile ===== */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.nameLabel')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('onboard.kakak.namePlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.countryLabel')}</label>
                <div className="flex flex-wrap gap-2">
                  {APPROVED_COUNTRIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => { setCountry(c.value); setOtherCountry(''); }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        country === c.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t(c.label)}
                    </button>
                  ))}
                </div>

                {/* Others — free text + warning */}
                {country === 'Others' && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={otherCountry}
                      onChange={e => setOtherCountry(e.target.value)}
                      placeholder={t('onboard.kakak.countryOtherPlaceholder')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <div className="flex items-start space-x-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
                      <div className="text-[11px] text-amber-900 leading-relaxed">
                        <p className="font-bold mb-0.5">{t('onboard.kakak.countryWarningTitle')}</p>
                        <p>{t('onboard.kakak.countryWarning1')}</p>
                        <p className="mt-1">{t('onboard.kakak.countryWarning2')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== STEP 2: Job Preferences ===== */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Salary */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.salaryLabel')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {SALARY_RANGES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setExpectedSalary(s.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        expectedSalary === s.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.locationLabel')}</label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(l => (
                    <button
                      key={l.value}
                      onClick={() => setPreferredLocation(l.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        preferredLocation === l.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Types — multi-select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t('onboard.kakak.jobTypeLabel')} <span className="text-blue-500 normal-case">{t('onboard.kakak.jobTypePickAll')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_TYPES.map(jt => (
                    <button
                      key={jt.value}
                      onClick={() => toggleJobType(jt.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center relative ${
                        jobTypes.includes(jt.value)
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t(jt.label)}
                      {jobTypes.includes(jt.value) && (
                        <span className="absolute top-1 right-1.5 text-blue-600 text-[10px]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rest Days */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.restDayLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {REST_DAY_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRestDays(r.value)}
                      className={`px-2 py-2.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        restDays === r.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div>{t(r.label)}</div>
                      <div className="text-[9px] font-normal text-gray-400 mt-0.5">{t(r.sublabel)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.accommodationLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOMMODATION_OPTIONS.map(a => (
                    <button
                      key={a.value}
                      onClick={() => setAccommodation(a.value)}
                      className={`px-2 py-2.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        accommodation === a.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div>{t(a.label)}</div>
                      <div className="text-[9px] font-normal text-gray-400 mt-0.5">{t(a.sublabel)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('onboard.kakak.languageLabel')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGE_OPTIONS.map(l => (
                    <button
                      key={l.value}
                      onClick={() => setLanguage(l.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        language === l.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t(l.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Concerns ===== */}
          {step === 3 && (
            <div className="space-y-4">
                <p className="text-[11px] text-gray-500 bg-white border rounded-xl p-3 shadow-sm">
                  {t('onboard.kakak.step3Info')}
                </p>

              {[
                {
                  label: t('onboard.kakak.concern1Label'),
                  sublabel: t('onboard.kakak.concern1Desc'),
                  value: wantsClearSalary,
                  setter: setWantsClearSalary,
                  icon: '💰',
                },
                {
                  label: t('onboard.kakak.concern2Label'),
                  sublabel: t('onboard.kakak.concern2Desc'),
                  value: prefersLowFees,
                  setter: setPrefersLowFees,
                  icon: '📉',
                },
                {
                  label: t('onboard.kakak.concern3Label'),
                  sublabel: t('onboard.kakak.concern3Desc'),
                  value: wantsWeeklyRest,
                  setter: setWantsWeeklyRest,
                  icon: '🌿',
                },
              ].map(concern => (
                <div
                  key={concern.label}
                  onClick={() => concern.setter(v => !v)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    concern.value
                      ? 'border-blue-300 bg-blue-50/60 shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{concern.icon}</span>
                    <div>
                      <p className={`text-xs font-bold ${concern.value ? 'text-blue-900' : 'text-gray-800'}`}>
                        {concern.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{concern.sublabel}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${
                    concern.value ? 'bg-blue-600 justify-end' : 'bg-gray-200 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white space-y-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-200" />
                  <p className="text-xs font-bold">{t('onboard.all_set')}</p>
                </div>
                <p className="text-[11px] text-blue-100 leading-relaxed">
                  {t('onboard.match_desc')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {(() => {
          const isBlocked = step === 1 && country === 'Others';
          return (
            <div className="px-6 pb-6 space-y-2">
              <div className="absolute top-4 right-4">
                <LanguageSwitcher />
              </div>
              {isBlocked && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <span className="text-sm">🚫</span>
                  <p className="text-[11px] text-red-700 font-semibold leading-snug">
                    {t('onboard.blocked_error')}
                  </p>
                </div>
              )}
              <div className="flex space-x-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center space-x-1.5 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
                <button
                  disabled={isBlocked}
                  onClick={() => !isBlocked && (step < TOTAL_STEPS ? setStep(s => s + 1) : handleFinish())}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-xl shadow-md transition-all ${
                    isBlocked
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white'
                  }`}
                >
                  {step < TOTAL_STEPS ? (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Find My Jobs →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default KakakOnboarding;
