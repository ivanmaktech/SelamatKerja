import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, Briefcase, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { JobPosting } from '../types';
import { useNavigate } from 'react-router-dom';

const RightsAssistant: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<{ role: 'user' | 'bot', text: string, type?: 'qa' | 'job_match', jobs?: JobPosting[] }>([
        { role: 'bot', text: 'Hello! I am here to help answer questions about your rights and employment. Or, tell me your job preferences and I will find matches for you!' }
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
                    // Fallback for old API format
                    setChat(prev => [...prev, { role: 'bot', text: responseData }]);
                } else {
                    // New structured format
                    setChat(prev => [...prev, { role: 'bot', text: responseData.message, type: responseData.type, jobs: responseData.jobs }]);
                }
            }
        } catch (error) {
            console.error("Error asking question:", error);
            setChat(prev => [...prev, { role: 'bot', text: "I'm sorry, I couldn't reach the server. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4 h-[500px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Ask in My Language</h2>
                <p className="text-sm text-gray-500">Get safe, verified answers about your employment rights.</p>
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
                                <div className="mt-3 space-y-2">
                                    {msg.jobs.map(job => (
                                        <div key={job.id} onClick={() => navigate('/matching')} className="bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{job.jobType}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1" /> {job.employerName}
                                                    </div>
                                                </div>
                                                <div className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center">
                                                    RM {job.salary}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-teal-600 font-semibold flex items-center">
                                                View Match Details <ChevronRight className="w-3 h-3 ml-0.5" />
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
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded-full py-2.5 px-4 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                    placeholder="Ask a question..."
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