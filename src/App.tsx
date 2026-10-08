import React, { useState } from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GasSensorView } from './components/GasSensorView';
import { AdcSamplingView } from './components/AdcSamplingView';
import { PidControllerView } from './components/PidControllerView';
import { FanControlView } from './components/FanControlView';
import { EmergencyAlertView } from './components/EmergencyAlertView';
import { FdcanMonitorView } from './components/FdcanMonitorView';
import { RealTimeGraphsView } from './components/RealTimeGraphsView';
import { SystemWorkflowView } from './components/SystemWorkflowView';
import { TestingValidationView } from './components/TestingValidationView';
import { AlarmHistoryView } from './components/AlarmHistoryView';
import { SettingsView } from './components/SettingsView';
import { AboutProjectView } from './components/AboutProjectView';
import { PresentationModal } from './components/PresentationModal';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab } = useSystem();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'gas-sensor':
        return <GasSensorView />;
      case 'adc-sampling':
        return <AdcSamplingView />;
      case 'pid-control':
        return <PidControllerView />;
      case 'fan-control':
        return <FanControlView />;
      case 'emergency-alert':
        return <EmergencyAlertView />;
      case 'fdcan-monitor':
        return <FdcanMonitorView />;
      case 'realtime-graphs':
        return <RealTimeGraphsView />;
      case 'system-workflow':
        return <SystemWorkflowView />;
      case 'testing-validation':
        return <TestingValidationView />;
      case 'alarm-history':
        return <AlarmHistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'about-project':
        return <AboutProjectView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top SCADA Header */}
      <Header />

      {/* Mobile Drawer Toggle Bar */}
      <div className="md:hidden bg-[#0a0e17] border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Navigation Menu</span>
        </button>
        <span className="font-mono text-cyan-400 font-bold uppercase">{activeTab}</span>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto relative">
        {/* Navigation Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        {/* Primary View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* SCADA Status Bar Footer */}
      <footer className="bg-[#090d16] border-t border-slate-800/80 px-4 py-2.5 text-xs text-slate-400">
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
              SYSTEM ACTIVE
            </span>
            <span>•</span>
            <span className="text-slate-300">Target: STM32H743ZI Nucleo</span>
            <span>•</span>
            <span className="text-cyan-400">TIM1 PWM: 25 kHz</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Embedded Systems Capstone Project</span>
            <span>•</span>
            <span className="text-slate-300">Sensing → Processing → Control → Ventilation → Monitoring</span>
          </div>
        </div>
      </footer>

      {/* Fullscreen Presentation / Examiner Demo Modal */}
      <PresentationModal />
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <MainLayout />
    </SystemProvider>
  );
}
