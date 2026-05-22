import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const ContractExplanation: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [textContext, setTextContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState('');

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
                setExplanation(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching explanation:", error);
            setExplanation("Failed to get explanation. Please try again.");
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
                    <span className="text-sm font-medium text-gray-600 block">Click to upload PDF / Image</span>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                {file && <p className="mt-2 text-sm text-green-600 font-medium">Selected: {file.name}</p>}
            </div>

            <div className="text-center text-gray-400 text-sm font-medium">OR</div>

            <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                rows={4}
                placeholder="Paste contract text here..."
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

            {explanation && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 flex items-center mb-2">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> What this means
                    </h3>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                        {explanation}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ContractExplanation;