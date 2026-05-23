import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';

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

const fieldLabels: { key: keyof ContractFields; label: string }[] = [
  { key: 'salary', label: 'Salary' },
  { key: 'recruitment_fee', label: 'Recruitment fee' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'working_hours', label: 'Working hours' },
  { key: 'rest_day', label: 'Rest day / leave' },
  { key: 'employment_duration', label: 'Contract period' },
  { key: 'termination_clause', label: 'Termination clause' },
  { key: 'passport_clause', label: 'Passport clause' },
  { key: 'accommodation', label: 'Accommodation / food' },
  { key: 'penalties', label: 'Penalties' },
];

export default function ContractExplanation(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [textContext, setTextContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [fields, setFields] = useState<ContractFields | null>(null);

  const handleExplain = async () => {
    if (!file && !textContext) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append('contract', file);
      else formData.append('text', textContext);

      const res = await axios.post('http://localhost:3001/api/explain-contract', formData);
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
        <h2 className="text-xl font-semibold mb-2">Explain My Contract</h2>
        <p className="text-sm text-gray-500">Upload your employment contract or paste the text, and get a simple explanation of the terms.</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
        <label className="cursor-pointer block">
          <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-600 block">Click to upload an image of your contract</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {file && <p className="mt-2 text-sm text-green-600 font-medium">Selected: {file.name}</p>}
      </div>

      <div className="text-center text-gray-400 text-sm font-medium">OR</div>

      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        rows={4}
        placeholder="Paste contract text here if you do not have an image..."
        value={textContext}
        onChange={(e) => setTextContext(e.target.value)}
      />

      <button
        className={`w-full py-3 rounded-lg font-medium text-white transition-opacity ${loading ? 'bg-primary/70' : 'bg-primary hover:bg-blue-700'}`}
        onClick={handleExplain}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Simplify & Explain'}
      </button>

      {fields && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            We show the contract as separate fields so you can quickly check salary, duration, rest days, and any unusual terms.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldLabels.map(({ key, label }) => (
              <div key={key} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{fields[key] || 'Not found'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSuggestions && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center text-lg">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" /> AI suggestions
            </h3>
          </div>

          <div className="text-sm text-gray-800">{renderFormattedAiSuggestions(aiSuggestions)}</div>
        </div>
      )}
    </div>
  );
}

// Helpers
const parseBoldSegments = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const [full, inner] = match;
    const idx = match.index;
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
    parts.push(
      <strong key={idx} className="font-semibold">
        {inner}
      </strong>
    );
    lastIndex = idx + full.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : [text];
};

const renderFormattedAiSuggestions = (raw: string) => {
  const lines = raw
    .split('\n')
    .map((l) => l.replace('\t', ' ').trim())
    .filter((l) => l && !/^\u2022$/.test(l));

  let verdict: string | null = null;
  const items: string[] = [];
  let current: string | null = null;

  for (const rawLine of lines) {
    if (!rawLine) continue;
    const plain = rawLine.replace(/\*\*/g, '').trim();
    const verdictMatch = plain.match(/verdict\s*:?\s*(.*)/i);
    if (!verdict && verdictMatch) {
      verdict = verdictMatch[1].trim() || null;
      continue;
    }

    if (/^[\-\*\u2022\•]\s+/.test(rawLine)) {
      if (current) items.push(current.trim());
      current = rawLine.replace(/^[\-\*\u2022\•]\s+/, '').trim();
      continue;
    }

    if (/:/.test(rawLine) && !current) {
      items.push(rawLine.trim());
      continue;
    }

    if (current) current += ' ' + rawLine.trim();
    else items.push(rawLine.trim());
  }
  if (current) items.push(current.trim());

  const elems: React.ReactNode[] = [];
  if (verdict) {
    const v = verdict.trim();
    const vLower = v.toLowerCase();
    const badge = vLower.includes('good') ? 'bg-green-100 text-green-800' : vLower.includes('red') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

    elems.push(
      <div key="verdict" className="mb-4">
        <span className="text-xs text-gray-500 uppercase">Verdict</span>
        <div className={`mt-2 inline-block px-3 py-1 rounded-full ${badge} font-semibold`}>{v}</div>
      </div>
    );
  }

  const listItems = items
    .map((it) => it.replace(/^\u2022\s*/, '').replace(/^[\-\*]\s*/, '').trim())
    .filter((it) => it && it !== '-' && it !== '*' && it !== '•')
    .map((text, idx) => {
      const t = text.replace(/^[\-\*\u2022\•]\s*/, '').trim();
      const isRedFlag = /red flag|red-flag/i.test(t);

      const content = t.includes(':') ? (
        (() => {
          const [label, rest] = t.split(':').map((s) => s.trim());
          return (
            <div className="text-gray-800 leading-relaxed">
              <strong className="font-semibold">{label}:</strong> {rest}
            </div>
          );
        })()
      ) : /\*\*/.test(t) ? (
        <div className="text-gray-800 leading-relaxed">{parseBoldSegments(t)}</div>
      ) : (
        <div className="text-gray-800 leading-relaxed">{t}</div>
      );

      return (
        <li key={idx} className="mb-3">
          <div className="flex items-start gap-3">
            <span className={`mt-1 w-2 h-2 rounded-full ${isRedFlag ? 'bg-red-600' : 'bg-gray-300'}`} />
            <div className="flex-1">{isRedFlag ? <div className="text-red-800">{content}</div> : content}</div>
          </div>
        </li>
      );
    });

  if (listItems.length) elems.push(
    <ul key="list" className="list-disc list-inside space-y-1">
      {listItems}
    </ul>
  );

  return <>{elems}</>;
};

// (component exported above)
