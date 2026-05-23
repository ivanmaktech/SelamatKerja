import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../i18n';

type ContractFields = {
  salary: string | null;
  recruitment_fee: string | null;
  deductions: string | null;
  working_hours: string | null;
  rest_day: string | null;
  employment_duration: string | null;
  termination_clause: string | null;
  passport_clause: string | null;
  accommodation: string | null;
  penalties: string | null;
};

export default function ContractExplanation() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [textContext, setTextContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [fields, setFields] = useState<ContractFields | null>(null);

  const fieldLabels: { key: keyof ContractFields; tKey: string }[] = [
    { key: 'salary', tKey: 'contract.field.salary' },
    { key: 'recruitment_fee', tKey: 'contract.field.recruitmentFee' },
    { key: 'deductions', tKey: 'contract.field.deductions' },
    { key: 'working_hours', tKey: 'contract.field.workingHours' },
    { key: 'rest_day', tKey: 'contract.field.restDay' },
    { key: 'employment_duration', tKey: 'contract.field.duration' },
    { key: 'termination_clause', tKey: 'contract.field.termination' },
    { key: 'passport_clause', tKey: 'contract.field.passport' },
    { key: 'accommodation', tKey: 'contract.field.accommodation' },
    { key: 'penalties', tKey: 'contract.field.penalties' },
  ];

  const handleExplain = async () => {
    if (!file && !textContext) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append('contract', file);
      else formData.append('text', textContext);

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/explain-contract`, formData);
      if (res.data.success) {
        setAiSuggestions(res.data.data || '');
        setFields(res.data.extracted || null);
      } else {
        setAiSuggestions('No suggestions available.');
        setFields(null);
      }
    } catch (err) {
      console.error('Explain error', err);
      setAiSuggestions('Failed to get suggestions. Please try again.');
      setFields(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('contract.title')}</h2>
        <p className="text-sm text-gray-500">{t('contract.subtitle')}</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
        <label className="cursor-pointer block">
          <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-600 block">{t('contract.uploadLabel')}</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {file && <p className="mt-2 text-sm text-green-600 font-medium">{t('contract.selected')}: {file.name}</p>}
      </div>

      <div className="text-center text-gray-400 text-sm font-medium">{t('contract.or')}</div>

      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        rows={4}
        placeholder={t('contract.pastePlaceholder')}
        value={textContext}
        onChange={(e) => setTextContext(e.target.value)}
      />

      <button
        className={`w-full py-3 rounded-lg font-medium text-white transition-opacity ${loading ? 'bg-primary/70' : 'bg-primary hover:bg-blue-700'}`}
        onClick={handleExplain}
        disabled={loading}
      >
        {loading ? t('contract.analyzing') : t('contract.simplifyBtn')}
      </button>

      {fields && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{t('contract.fieldsNote')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldLabels.map(({ key, tKey }) => (
              <div key={key} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t(tKey)}</p>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{fields[key] || t('contract.notFound')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSuggestions && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center text-lg">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" /> {t('contract.aiSuggestions')}
            </h3>
          </div>
          <div className="text-sm text-gray-800">{renderFormattedAiSuggestions(aiSuggestions, t('contract.verdict'), t('contract.redFlagsTitle'))}</div>
        </div>
      )}
    </div>
  );
}

const renderRedFlagsBlock = (flags: string[], title: string) => {
  return (
    <div className="border-l-4 border-red-300 bg-red-50 p-4 rounded">
      <h4 className="text-base font-semibold mb-2 text-red-700">{title}</h4>
      <div className="space-y-2 text-sm text-gray-800">
        {flags.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
            <div className="flex-1 leading-relaxed text-gray-800">{f}</div>
            <button
              onClick={async () => {
                try { await navigator.clipboard.writeText(f); } catch (e) { console.warn('copy failed', e); }
              }}
              aria-label="Copy red flag"
              className="ml-2 text-gray-500 hover:text-red-700"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderFormattedAiSuggestions = (raw: string, verdictLabel: string, redFlagsTitle: string) => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      if (typeof parsed[0] === 'object' && parsed.every((p: any) => p && (p.type === 'red-flag' || p.type === 'red_flag' || p.type === 'warning' || p.severity))) {
        const items = (parsed as any[]).map((o) => (o.title ? `${o.title}${o.detail ? ': ' + o.detail : ''}` : o.detail || JSON.stringify(o)));
        return renderRedFlagsBlock(items, redFlagsTitle);
      }
      return renderListFromStrings(parsed.map(String));
    }
  } catch (e) {}

  const validRaw = typeof raw === 'string' ? raw : String(raw);
  let verdict: string | null = null;
  const remainingLines: string[] = [];
  const lines = validRaw.split('\n');
  for (const line of lines) {
    const verdictMatch = line.match(/verdict\s*:?\s*(.*)/i);
    if (!verdict && verdictMatch) {
      verdict = verdictMatch[1].trim() || null;
    } else {
      remainingLines.push(line);
    }
  }
  const text = remainingLines.join('\n').trim();

  return (
    <div>
      {verdict && (
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase">{verdictLabel}</span>
          <div className={`mt-2 inline-block px-3 py-1 rounded-full ${verdict.toLowerCase().includes('good') ? 'bg-green-100 text-green-800' : verdict.toLowerCase().includes('red') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} font-semibold`}>
            {verdict}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({ children }) => <ul className="list-none m-0 p-0 space-y-3">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside m-0 p-0 space-y-3">{children}</ol>,
            li: ({ children }) => (
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
                <div className="flex-1 text-gray-800 leading-relaxed">{children}</div>
              </li>
            )
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

function renderListFromStrings(items: string[]) {
  const cleanItems = items.map(it => it.replace(/^[\-\*\u2022\•]\s+/, '').trim()).filter(Boolean);
  return (
    <ul className="list-none space-y-3">
      {cleanItems.map((it, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
          <div className="flex-1 text-gray-800 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ ul: ({ children }) => <ul className="list-none m-0 p-0 space-y-2">{children}</ul>, li: ({ children }) => <li className="inline">{children}</li> }}>
              {it}
            </ReactMarkdown>
          </div>
          <button onClick={async () => { try { await navigator.clipboard.writeText(it); } catch (e) { console.warn('copy failed', e); } }} aria-label="Copy" className="ml-2 text-gray-400 hover:text-gray-700">
            <Copy className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}