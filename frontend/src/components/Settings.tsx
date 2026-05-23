import React, { useState } from 'react';
import type { User, KakakProfile, EmployerProfile } from '../types';
import { Save, CheckCircle } from 'lucide-react';
import { useTranslation } from '../i18n';

interface SettingsProps {
  user: User;
  onUpdateKakak: (profile: KakakProfile) => void;
  onUpdateEmployer: (profile: EmployerProfile) => void;
}

// Same options as onboarding for consistency
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

const JOB_TYPES = [
  { label: '🍼 Childcare', value: 'childcare' },
  { label: '👵 Elderly Care', value: 'elderly care' },
  { label: '🧹 Housekeeping', value: 'housekeeping' },
  { label: '🍳 Cooking', value: 'cooking' },
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

const AGENCY_TYPES = [
  { label: '🏡 Private Employer', value: 'private-employer' },
  { label: '🏢 Recruitment Agency', value: 'recruitment-agency' },
];

const Settings: React.FC<SettingsProps> = ({ user, onUpdateKakak, onUpdateEmployer }) => {
  const { t } = useTranslation();
  const [successMsg, setSuccessMsg] = useState('');

  // Kakak State
  const k = user.kakakProfile;
  const [kName, setKName] = useState(k?.name || '');
  const [kCountry, setKCountry] = useState(k?.country || 'Indonesia');
  const [kOtherCountry, setKOtherCountry] = useState('');
  const [kLoc, setKLoc] = useState(k?.preferredLocation || 'Kuala Lumpur');
  const [kSalary, setKSalary] = useState(k?.expectedSalary || '1500-1800');
  const [kJobTypes, setKJobTypes] = useState<string[]>(k?.jobTypes || ['childcare']);
  const [kRestDays] = useState(k?.restDays || 'weekly');
  const [kAccom, setKAccom] = useState(k?.accommodation || 'provided');
  const [kLang] = useState(k?.language || 'Malay/Indonesian');
  const [kWantsClear, setKWantsClear] = useState(k?.wantsClearSalary ?? true);
  const [kLowFees, setKLowFees] = useState(k?.prefersLowFees ?? true);
  const [kWeeklyRest, setKWeeklyRest] = useState(k?.wantsWeeklyRest ?? true);

  // Employer State
  const e = user.employerProfile;
  const [eName, setEName] = useState(e?.name || '');
  const [eLoc, setELoc] = useState(e?.location || 'Kuala Lumpur');
  const [eType, setEType] = useState(e?.agencyType || 'private-employer');
  const [eExp] = useState(e?.yearsExperience || '1-3 years');
  const [eShowFee, setEShowFee] = useState(e?.showRecruitmentFee ?? true);
  const [eContract, setEContract] = useState(e?.contractAvailable ?? true);
  const [ePassport, setEPassport] = useState(e?.passportPolicy || 'worker-holds');
  const [eOvertime, setEOvertime] = useState(e?.overtimePolicy || 'paid');

  const showSuccess = () => {
    setSuccessMsg(t('settings.savedMsg'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const saveKakak = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKakak({
      name: kName,
      country: kCountry === 'Others' ? (kOtherCountry || 'Others') : kCountry,
      preferredLocation: kLoc,
      expectedSalary: kSalary,
      jobTypes: kJobTypes,
      restDays: kRestDays,
      accommodation: kAccom,
      language: kLang,
      wantsClearSalary: kWantsClear,
      prefersLowFees: kLowFees,
      wantsWeeklyRest: kWeeklyRest
    });
    showSuccess();
  };

  const saveEmployer = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmployer({
      name: eName,
      location: eLoc,
      agencyType: eType,
      yearsExperience: eExp,
      showRecruitmentFee: eShowFee,
      contractAvailable: eContract,
      passportPolicy: ePassport,
      overtimePolicy: eOvertime
    });
    showSuccess();
  };

  const toggleKJobType = (type: string) => {
    setKJobTypes(prev =>
      prev.includes(type) ? (prev.length > 1 ? prev.filter(t => t !== type) : prev) : [...prev, type]
    );
  };

  if (user.role === 'kakak') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('settings.personalSettings')}</h2>
          
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          <form onSubmit={saveKakak} className="space-y-8">
            {/* Profile */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">{t('settings.basicProfile')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">{t('settings.fullName')}</label>
                  <input
                    type="text"
                    value={kName}
                    onChange={e => setKName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">{t('settings.countryOfOrigin')}</label>
                  <select
                    value={APPROVED_COUNTRIES.some(c => c.value === kCountry) ? kCountry : 'Others'}
                    onChange={e => {
                      setKCountry(e.target.value);
                      if (e.target.value !== 'Others') setKOtherCountry('');
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {APPROVED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {kCountry === 'Others' && (
                     <input
                       type="text"
                       value={kOtherCountry}
                       onChange={e => setKOtherCountry(e.target.value)}
                       placeholder={t('settings.specifyCountry')}
                       className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-2"
                     />
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">{t('settings.jobPreferences')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">{t('settings.preferredState')}</label>
                  <select value={kLoc} onChange={e => setKLoc(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                    {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">{t('settings.expectedSalary')}</label>
                  <select value={kSalary} onChange={e => setKSalary(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                    {SALARY_RANGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">{t('settings.accommodation')}</label>
                  <select value={kAccom} onChange={e => setKAccom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                    <option value="provided">{t('settings.provided')}</option>
                    <option value="no-preference">{t('settings.noPreference')}</option>
                    <option value="must-private">{t('settings.needPrivacy')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">{t('settings.jobTypes')}</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map(jt => (
                    <button
                      type="button"
                      key={jt.value}
                      onClick={() => toggleKJobType(jt.value)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                        kJobTypes.includes(jt.value) ? 'bg-blue-50 border-blue-600 text-blue-800 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {jt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Concerns */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">{t('settings.keyConcerns')}</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                  <input type="checkbox" checked={kWantsClear} onChange={e => setKWantsClear(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">{t('settings.wantClearSalary')}</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                  <input type="checkbox" checked={kLowFees} onChange={e => setKLowFees(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">{t('settings.preferLowFees')}</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                  <input type="checkbox" checked={kWeeklyRest} onChange={e => setKWeeklyRest(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">{t('settings.wantWeeklyRest')}</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>{t('settings.saveChanges')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Employer Settings UI
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('settings.orgSettings')}</h2>
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={saveEmployer} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">{t('settings.orgDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">{t('settings.employerAgencyName')}</label>
                <input
                  type="text"
                  value={eName}
                  onChange={e => setEName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">{t('settings.location')}</label>
                <select value={eLoc} onChange={e => setELoc(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                  {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">{t('settings.type')}</label>
                <select value={eType} onChange={e => setEType(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                  {AGENCY_TYPES.map(a => <option key={a.value} value={a.value}>{a.value === 'private-employer' ? t('settings.privateEmployer') : t('settings.recruitmentAgency')}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">{t('settings.transparencySettings')}</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                <input type="checkbox" checked={eShowFee} onChange={e => setEShowFee(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                <span className="text-sm font-medium">{t('settings.showRecruitmentFee')}</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                <input type="checkbox" checked={eContract} onChange={e => setEContract(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                <span className="text-sm font-medium">{t('settings.contractAvailable')}</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">{t('settings.passportPolicy')}</label>
                <select value={ePassport} onChange={e => setEPassport(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                  <option value="worker-holds">{t('settings.workerHoldsPassport')}</option>
                  <option value="agency-holds">{t('settings.agencyHoldsTemporarily')}</option>
                  <option value="discuss">{t('settings.toBeDiscussed')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">{t('settings.overtimePolicy')}</label>
                <select value={eOvertime} onChange={e => setEOvertime(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
                  <option value="paid">{t('settings.paidOvertime')}</option>
                  <option value="time-off">{t('settings.timeOffInLieu')}</option>
                  <option value="none">{t('settings.notApplicable')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>{t('settings.saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
