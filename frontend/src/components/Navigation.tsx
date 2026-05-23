import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Calculator, MessageCircleQuestion, Briefcase, Users, FileCheck } from 'lucide-react';

interface NavigationProps {
    role: 'kakak' | 'employer';
}

const Navigation: React.FC<NavigationProps> = ({ role }) => {
    return (
        <nav className="flex space-x-2 bg-white p-2 rounded-full shadow-sm w-full max-w-lg justify-center overflow-x-auto">
            {role === 'kakak' ? (
                <>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Contract</span>
                    </NavLink>
                    <NavLink 
                        to="/fee-checker" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Fees</span>
                    </NavLink>
                    <NavLink 
                        to="/assistant" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <MessageCircleQuestion className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Ask AI</span>
                    </NavLink>
                    <NavLink 
                        to="/matching" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Job Match</span>
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">My Jobs</span>
                    </NavLink>
                    <NavLink 
                        to="/candidates" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <Users className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Candidate Match</span>
                    </NavLink>
                    <NavLink 
                        to="/contract-tools" 
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`
                        }
                    >
                        <FileCheck className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Contract Tools</span>
                    </NavLink>
                </>
            )}
        </nav>
    );
};

export default Navigation;
