import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

// Render a clean, human-readable red flags block. Accepts an array of strings.
const renderRedFlagsBlock = (flags: string[]) => {
  return (
    <div className="border-l-4 border-red-300 bg-red-50 p-4 rounded">
      <h4 className="text-base font-semibold mb-2 text-red-700">Red Flags (human-readable)</h4>
      <div className="space-y-2 text-sm text-gray-800">
        {flags.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
            <div className="flex-1 leading-relaxed text-gray-800">{f}</div>
            <button
              onClick={async () => {
                try {
                  // extract plain text from React elements if needed, but 'f' is a string here
                  await navigator.clipboard.writeText(f);
                } catch (e) {
                  console.warn('copy failed', e);
                }
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

const renderFormattedAiSuggestions = (raw: string) => {
  // Try to parse structured JSON arrays first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      if (typeof parsed[0] === 'object' && parsed.every((p: any) => p && (p.type === 'red-flag' || p.type === 'red_flag' || p.type === 'warning' || p.severity))) {
        const items = (parsed as any[]).map((o) => (o.title ? `${o.title}${o.detail ? ': ' + o.detail : ''}` : o.detail || JSON.stringify(o)));
        return renderRedFlagsBlock(items);
      }
      // If it's just an array of strings
      return renderListFromStrings(parsed.map(String));
    }
  } catch (e) {
    // not JSON — continue with string parsing
  }

  // Ensure raw is always a string
  const validRaw = typeof raw === 'string' ? raw : String(raw);

  // Extract verdict line if present
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
          <span className="text-xs text-gray-500 uppercase">Verdict</span>
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
             li: ({ children }) => {
               // Render each bullet point as inline, the parent wrapper will give it layout
               return (
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
                    <div className="flex-1 text-gray-800 leading-relaxed">
                      {children}
                    </div>
                  </li>
               );
             }
           }}
         >
           {text}
         </ReactMarkdown>
      </div>
    </div>
  );
};

function renderListFromStrings(items: string[]) {
  const cleanItems = items
    .map(it => it.replace(/^[\-\*\u2022\•]\s+/, '').trim())
    .filter(Boolean);

  return (
    <ul className="list-none space-y-3">
      {cleanItems.map((it, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-black flex-shrink-0" />
          <div className="flex-1 text-gray-800 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({ children }) => <ul className="list-none m-0 p-0 space-y-2">{children}</ul>,
                li: ({ children }) => <li className="inline">{children}</li>,
              }}
            >
              {it}
            </ReactMarkdown>
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(it);
              } catch (e) {
                console.warn('copy failed', e);
              }
            }}
            aria-label="Copy"
            className="ml-2 text-gray-400 hover:text-gray-700"
          >
            <Copy className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}