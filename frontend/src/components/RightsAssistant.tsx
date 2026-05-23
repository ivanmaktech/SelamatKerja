import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, MapPin, ChevronRight } from 'lucide-react';
import type { JobPosting } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

const RightsAssistant: React.FC = () => {
    const { t } = useTranslation();
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<{ role: 'user' | 'bot', text: string, type?: 'qa' | 'job_match', jobs?: JobPosting[] }[]>([
        { role: 'bot', text: t('rights.greeting') }
    ]);
    const navigate = useNavigate();

    const handleAsk = async () => {
        if (!question.trim()) return;
        
        const q = question;
        setChat(prev => [...prev, { role: 'user', text: q }]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/ask`, { question: q });
            if (response.data.success) {
                const responseData = response.data.data;
                if (typeof responseData === 'string') {
                    setChat(prev => [...prev, { role: 'bot', text: responseData }]);
                } else {
                    setChat(prev => [...prev, { role: 'bot', text: responseData.message, type: responseData.type, jobs: responseData.jobs }]);
                }
            }
        } catch (error) {
            console.error("Error asking question:", error);
            setChat(prev => [...prev, { role: 'bot', text: t('rights.serverError') }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4 h-[500px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">{t('rights.title')}</h2>
                <p className="text-sm text-gray-500">{t('rights.subtitle')}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                {chat.map((msg, idx) => (
                    <div key={idx} className={`flex max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                        {msg.role === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0">
                                <Bot className="w-5 h-5 text-teal-600" />
                            </div>
                        )}
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                            {msg.text}
                            {msg.type === 'job_match' && msg.jobs && msg.jobs.length > 0 && (
                                <div className="mt-4 flex overflow-x-auto space-x-3 pb-3 scrollbar-hide snap-x">
                                    {msg.jobs.map(job => (
                                        <div key={job.id} onClick={() => navigate('/matching', { state: { autoOpenJob: job, autoOpenScore: job.matchPercentage } })} className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all group min-w-[220px] max-w-[220px] h-36 flex flex-col justify-between snap-center flex-shrink-0">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">{job.jobType}</div>
                                                    {job.matchPercentage && (
                                                        <div className="bg-teal-50 text-teal-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center">
                                                            {job.matchPercentage}% {t('rights.match')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center mb-1">
                                                    <MapPin className="w-3 h-3 mr-1" /> <span className="truncate">{job.employerName}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-gray-900 font-extrabold text-sm">RM {job.salary}</div>
                                                <div className="bg-teal-600 text-white p-1.5 rounded-full group-hover:bg-teal-500 transition-colors shadow-sm">
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex max-w-[85%] mr-auto">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <Bot className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm rounded-tl-sm">
                            {t('rights.thinking')}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded-full py-2.5 px-4 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                    placeholder={t('rights.placeholder')}
                    value={question}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading}
                />
                <button 
                    className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-full transition-colors disabled:opacity-50"
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default RightsAssistant;