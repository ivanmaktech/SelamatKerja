import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Calculator, MessageCircleQuestion } from 'lucide-react';

const Navigation: React.FC = () => {
    return (
        <nav className="flex space-x-2 bg-white p-2 rounded-full shadow-sm w-full max-w-lg justify-center overflow-x-auto">
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
        </nav>
    );
};

export default Navigation;