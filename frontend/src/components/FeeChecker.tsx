import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';

const FeeChecker: React.FC = () => {
    const { t } = useTranslation();
    const [fee, setFee] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleCheck = async () => {
        if (!fee) return;
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/check-fee`, { fee });
            if (response.data.success) {
                setResult(response.data.data);
            }
        } catch (error) {
            console.error("Error checking fee:", error);
            setResult(t('fee.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">{t('fee.title')}</h2>
                <p className="text-sm text-gray-500">{t('fee.subtitle')}</p>
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 font-medium">RM</span>
                </div>
                <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-3 focus:ring-2 focus:ring-secondary focus:outline-none"
                    placeholder="e.g. 7500"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                />
            </div>

            <button 
                className={`w-full py-3 rounded-lg font-medium text-white transition-opacity ${loading ? 'bg-secondary/70' : 'bg-secondary hover:bg-purple-700'}`}
                onClick={handleCheck}
                disabled={loading}
            >
                {loading ? t('fee.checking') : t('fee.checkBtn')}
            </button>

            {result && (
                <div className="mt-6 bg-purple-50 border border-purple-100 rounded-lg p-5">
                    <div className="flex items-start mb-3">
                        <ShieldCheck className="w-6 h-6 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                        <h3 className="font-semibold text-purple-900 leading-tight">{t('fee.assessment')}</h3>
                    </div>
                    <p className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed ml-8">
                        {result}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FeeChecker;