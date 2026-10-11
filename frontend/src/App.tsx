import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';
import { SignupPage } from './views/SignupPage';
import { ScadaControlView } from './views/ScadaControlView';
import { ZeroTrustView } from './views/ZeroTrustView';
import { AttackSimulatorView } from './views/AttackSimulatorView';
import { DeviceManagementView } from './views/DeviceManagementView';
import { UserManagementView } from './views/UserManagementView';
import { SecurityLogsView } from './views/SecurityLogsView';
import { MLAnalyticsView } from './views/MLAnalyticsView';
import { VulnerabilityView } from './views/VulnerabilityView';
import { CryptoDemoView } from './views/CryptoDemoView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  const handleRunDemoScenario = (scenarioKey: string) => {
    setActiveTab('attacks');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <LandingPage
            onEnterConsole={() => setActiveTab('scada')}
            onExploreDemo={() => setActiveTab('attacks')}
          />
        );
      case 'scada':
        return <ScadaControlView />;
      case 'zerotrust':
        return <ZeroTrustView />;
      case 'attacks':
        return <AttackSimulatorView />;
      case 'devices':
        return <DeviceManagementView />;
      case 'users':
        return <UserManagementView />;
      case 'logs':
        return <SecurityLogsView />;
      case 'analytics':
        return <MLAnalyticsView />;
      case 'vulnerabilities':
        return <VulnerabilityView />;
      case 'crypto':
        return <CryptoDemoView />;
      case 'settings':
        return <SettingsView />;
      case 'login':
        return (
          <LoginPage
            onSuccess={() => setActiveTab('scada')}
            onGoToSignup={() => setActiveTab('signup')}
          />
        );
      case 'signup':
        return <SignupPage onGoToLogin={() => setActiveTab('login')} />;
      default:
        return <ScadaControlView />;
    }
  };

  // Full-width views without sidebar
  const isFullWidthPage = activeTab === 'overview' || activeTab === 'login' || activeTab === 'signup';

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemoScenario={handleRunDemoScenario}
      />

      {isFullWidthPage ? (
        <main className="flex-1">{renderView()}</main>
      ) : (
        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 p-6 overflow-y-auto min-h-[calc(100vh-65px)]">
            {renderView()}
          </main>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
