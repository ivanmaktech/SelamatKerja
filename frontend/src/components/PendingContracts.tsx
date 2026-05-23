import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Sparkles, AlertTriangle, CheckCircle, ChevronRight, X, Clock } from 'lucide-react';
import type { StructuredContract, KakakPreferences } from '../types';

interface PendingContractsProps {
  userName: string;
  preferences: KakakPreferences | null;
}

const PendingContracts: React.FC<PendingContractsProps> = ({ userName, preferences }) => {
  const [contracts, setContracts] = useState<StructuredContract[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [selectedContract, setSelectedContract] = useState<StructuredContract | null>(null);
  const [ruleWarnings, setRuleWarnings] = useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [userName]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/kakak/${userName}/contracts`);
      if (res.data.contracts) {
        setContracts(res.data.contracts);
      }
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (contract: StructuredContract) => {
    setSelectedContract(contract);
    
    // 1. Local Deterministic Rule Engine
    const warnings: string[] = [];
    if (preferences) {
      // Check salary
      const expectedMin = parseInt(preferences.expectedSalary.split('-')[0].replace('+', '')) || 0;
      const offered = parseInt(contract.salary) || 0;
      if (offered < expectedMin) {
        warnings.push(`Salary offered (RM ${offered}) is below your expected minimum (RM ${expectedMin}).`);
      }
      // Deductions
      if (contract.deductions && contract.deductions.toLowerCase() !== 'none' && contract.deductions !== '0') {
        warnings.push(`Contract includes deductions: ${contract.deductions}.`);
      }
      // Passport
      if (contract.passportClause && contract.passportClause.toLowerCase().includes('surrender') || contract.passportClause.toLowerCase().includes('employer keeps')) {
        warnings.push('Employer requires you to surrender passport. This is against the law.');
      }
    }
    setRuleWarnings(warnings);

    // 2. Fetch AI Fairness
    setLoadingAi(true);
    setAiExplanation('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/explain-contract-fairness`, {
        contract,
        preferences
      });
      if (res.data.success) {
        setAiExplanation(res.data.explanation);
      }
    } catch (error) {
      console.error(error);
      setAiExplanation('⚠ Could not load AI analysis.\n✓ Review terms manually.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 text-blue-900 shadow-sm">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <span className="font-bold block mb-0.5 text-blue-950">Pending Contracts</span>
          Review official contract offers from employers. KakakSafe provides both strict rule checks and AI summaries to help you understand the terms before deciding.
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500 text-sm py-4 text-center">Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <div className="text-center py-8 bg-white border rounded-2xl">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No pending contracts right now.</p>
          </div>
        ) : (
          contracts.map(contract => (
            <div key={contract.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md cursor-pointer space-y-3" onClick={() => handleReview(contract)}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{contract.jobType}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">From: {contract.employerName}</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pending Review
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Salary</span>
                  <span className="font-bold text-gray-800">RM {contract.salary}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-bold text-gray-800">{contract.duration}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-400">Sent on {new Date(contract.timestamp).toLocaleDateString()}</span>
                <span className="text-blue-600 font-bold flex items-center">
                  Review Contract <ChevronRight className="w-4 h-4 ml-0.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REVIEW MODAL */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-5 animate-scale-up">
            
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Contract Review</h3>
                <p className="text-xs text-gray-500">Employer: {selectedContract.employerName}</p>
              </div>
              <button onClick={() => setSelectedContract(null)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Summary Layer */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" /> AI Fairness Summary
              </h4>
              <div className="bg-blue-950 text-white p-4 rounded-2xl shadow-inner min-h-[70px] flex items-center">
                {loadingAi ? (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating fairness...</span>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs leading-relaxed w-full">
                    {aiExplanation.split('\n').map((line, index) => {
                      if (!line.trim()) return null;
                      const isCheck = line.includes('✓');
                      const isWarning = line.includes('⚠');
                      return (
                        <div key={index} className="flex items-start space-x-2">
                          <span className={`text-base leading-none ${isCheck ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-blue-300'}`}>
                            {isCheck ? '✓' : isWarning ? '⚠' : '•'}
                          </span>
                          <span className="flex-1 font-semibold text-gray-100">{line.replace(/^[✓⚠\-\*\s]+/, '')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Deterministic Rule Engine Flags */}
            {ruleWarnings.length > 0 ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Important Warnings
                </h4>
                <ul className="space-y-1.5">
                  {ruleWarnings.map((w, i) => (
                    <li key={i} className="text-xs text-red-900 flex items-start">
                      <span className="mr-1.5 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center text-emerald-800 text-xs font-bold">
                <CheckCircle className="w-4 h-4 mr-1.5" /> No strict rule violations detected.
              </div>
            )}

            {/* Detailed Contract Terms */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Official Terms</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-[110px_1fr] border-b">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Salary</div>
                  <div className="p-2.5 font-bold text-gray-900">RM {selectedContract.salary}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] border-b">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Job Type</div>
                  <div className="p-2.5 font-bold text-gray-900">{selectedContract.jobType}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] border-b">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Rest Days</div>
                  <div className="p-2.5 font-bold text-gray-900">{selectedContract.restDays}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] border-b">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Accommodation</div>
                  <div className="p-2.5 font-bold text-gray-900">{selectedContract.accommodation}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] border-b">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Deductions</div>
                  <div className={`p-2.5 font-bold ${selectedContract.deductions.toLowerCase() !== 'none' ? 'text-red-600' : 'text-gray-900'}`}>{selectedContract.deductions}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] border-b">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Passport</div>
                  <div className="p-2.5 font-bold text-gray-900">{selectedContract.passportClause}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr]">
                  <div className="bg-gray-50 p-2.5 font-semibold text-gray-500">Overtime</div>
                  <div className="p-2.5 font-bold text-gray-900">{selectedContract.overtimePolicy}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedContract(null)}
              className="w-full py-3 bg-gray-150 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold shadow-sm transition-colors text-center block"
            >
              Close Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingContracts;
