import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './pages/Overview';
import { HistoryPage } from './pages/History';
import { LogsPage } from './pages/Logs';
import { useDashboardData } from './hooks/useDashboardData';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const dashboardData = useDashboardData();
  const { config } = dashboardData;

  const getEnvironmentStatus = () => {
    if (!config) return 'Offline';
    const { activePort, testPort } = config.trafficRules || {};

    if (activePort && testPort) return 'Hybrid (Canary)';
    if (activePort === 3002) return 'Blue';
    if (activePort === 3003) return 'Green';
    return 'Unknown';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage data={dashboardData} />;
      case 'history':
        return <HistoryPage deployments={dashboardData.deployments} />;
      case 'logs':
        return <LogsPage logs={dashboardData.logs} />;
      default:
        return <OverviewPage data={dashboardData} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} environment={getEnvironmentStatus()}>
      {renderContent()}
    </Layout>
  );
}

export default App;
