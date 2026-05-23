import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ContractExplanation from './components/ContractExplanation';
import FeeChecker from './components/FeeChecker';
import RightsAssistant from './components/RightsAssistant';
import JobMatcher from './components/JobMatcher';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center pt-8 bg-gray-50">
        <header className="mb-8 text-center px-4">
          <h1 className="text-3xl font-bold text-primary mb-2">SelamatKerja</h1>
          <p className="text-gray-600">Your trusted AI companion for understanding your rights, fees, and contracts.</p>
        </header>
        <Navigation />
        <main className="w-full max-w-lg mt-6 bg-white p-6 rounded-lg shadow-md px-4 sm:px-8">
          <Routes>
            <Route path="/" element={<ContractExplanation />} />
            <Route path="/fee-checker" element={<FeeChecker />} />
            <Route path="/assistant" element={<RightsAssistant />} />
            <Route path="/matching" element={<JobMatcher />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

