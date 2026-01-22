import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Flag, CheckCircle, ListChecks, Play } from 'lucide-react';
import SubmitFlagPage from './pages/SubmitFlagPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import FlagManagementPage from './pages/FlagManagementPage';
import RuntimeDemoPage from './pages/RuntimeDemoPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Submit Flag
                </Link>
                <Link
                  to="/approvals"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pending Approvals
                </Link>
                <Link
                  to="/management"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                >
                  <ListChecks className="w-4 h-4 mr-2" />
                  Flag Management
                </Link>
                <Link
                  to="/runtime"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Runtime Demo
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<SubmitFlagPage />} />
            <Route path="/approvals" element={<PendingApprovalsPage />} />
            <Route path="/management" element={<FlagManagementPage />} />
            <Route path="/runtime" element={<RuntimeDemoPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
