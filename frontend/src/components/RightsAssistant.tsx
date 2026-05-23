import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot } from 'lucide-react';

const RightsAssistant: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: 'Hello! I am here to help answer questions about your rights and employment. For example: "Can my employer keep my passport?"' }
    ]);

    const handleAsk = async () => {
        if (!question.trim()) return;
        
        const q = question;
        setChat(prev => [...prev, { role: 'user', text: q }]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/ask`, { question: q });
            if (response.data.success) {
                setChat(prev => [...prev, { role: 'bot', text: response.data.data }]);
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