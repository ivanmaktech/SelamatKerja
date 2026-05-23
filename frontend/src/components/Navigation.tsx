import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Calculator, MessageCircleQuestion, Briefcase, Users, FileCheck, Settings, ShieldCheck } from 'lucide-react';

interface NavigationProps {
    role: 'kakak' | 'employer';
}

const Navigation: React.FC<NavigationProps> = ({ role }) => {
    const navItemClass = ({ isActive }: { isActive: boolean }) => 
        `flex items-center px-4 py-3 md:py-2.5 rounded-xl md:rounded-lg text-sm font-semibold transition-all ${
            isActive 
            ? 'bg-blue-600 text-white shadow-sm md:bg-blue-50 md:text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <nav className="w-full bg-white md:w-64 md:flex-shrink-0 md:h-full md:border-r md:border-gray-200 overflow-y-auto flex flex-col">
            {/* BRAND LOGO (Desktop only) */}
            <div className="hidden md:flex items-center px-6 py-5 border-b border-gray-100 mb-4">
                <div className={`p-1.5 rounded-lg ${role === 'kakak' ? 'bg-blue-100' : 'bg-purple-100'} mr-2.5`}>
                    <ShieldCheck className={`w-5 h-5 ${role === 'kakak' ? 'text-blue-700' : 'text-purple-700'}`} />
                </div>
                <div>
                    <span className="font-extrabold text-gray-900 text-base tracking-tight">KakakSafe</span>
                    <div className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 ${
                        role === 'kakak' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                        {role === 'kakak' ? 'Worker Mode' : 'Employer Mode'}
                    </div>
                </div>
            </div>

            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 p-3 md:p-4 overflow-x-auto md:overflow-visible flex-1">
                {role === 'kakak' ? (
                    <>
                        <NavLink to="/" className={navItemClass}>
                            <FileText className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Contract</span>
                        </NavLink>
                        <NavLink to="/fee-checker" className={navItemClass}>
                            <Calculator className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Fees</span>
                        </NavLink>
                        <NavLink to="/assistant" className={navItemClass}>
                            <MessageCircleQuestion className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Ask AI</span>
                        </NavLink>
                        <NavLink to="/matching" className={navItemClass}>
                            <Briefcase className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Job Match</span>
                        </NavLink>
                        <NavLink to="/contracts" className={navItemClass}>
                            <FileCheck className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Pending Contracts</span>
                        </NavLink>
                        <div className="hidden md:block my-2 border-t border-gray-100" />
                        <NavLink to="/settings" className={navItemClass}>
                            <Settings className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Settings</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/" className={navItemClass}>
                            <Briefcase className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">My Jobs</span>
                        </NavLink>
                        <NavLink to="/interests" className={navItemClass}>
                            <Users className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Interest Inbox</span>
                        </NavLink>
                        <NavLink to="/contract-tools" className={navItemClass}>
                            <FileCheck className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Contract Tools</span>
                        </NavLink>
                        <div className="hidden md:block my-2 border-t border-gray-100" />
                        <NavLink to="/settings" className={navItemClass}>
                            <Settings className="w-4 h-4 mr-2.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Settings</span>
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navigation;

