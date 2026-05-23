import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

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

const ContractExplanation: React.FC = () => {
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
            if (file) {
                formData.append('contract', file);
            } else {
                formData.append('text', textContext);
            }
            const response = await axios.post('http://localhost:3001/api/explain-contract', formData);
            if (response.data.success) {
                setAiSuggestions(response.data.data || '');
                setFields(response.data.extracted || null);
            }
        } catch (error) {
            console.error("Error fetching explanation:", error);
            setAiSuggestions("Failed to get suggestions. Please try again.");
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
                        We show the contract as separate fields so you can quickly check salary, duration, rest days, and any unusual terms. If a term is unclear, it stays as Not found.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fieldLabels.map(({ key, label }) => (
                        <div key={key} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                {fields[key] || 'Not found'}
                            </p>
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {aiSuggestions && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 flex items-center mb-2">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> AI suggestions
                    </h3>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                        {aiSuggestions}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ContractExplanation;