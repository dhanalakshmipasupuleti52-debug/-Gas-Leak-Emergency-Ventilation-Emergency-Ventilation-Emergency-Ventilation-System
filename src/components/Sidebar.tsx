import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  LayoutDashboard,
  Flame,
  Binary,
  Sliders,
  Fan,
  BellRing,
  Radio,
  LineChart,
  GitFork,
  CheckCheck,
  History,
  Settings,
  Info,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, telemetry } = useSystem();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gas-sensor', label: 'Gas Sensor (MQ-2)', icon: Flame },
    { id: 'adc-sampling', label: 'ADC Sampling', icon: Binary },
    { id: 'pid-control', label: 'PID Controller', icon: Sliders },
    { id: 'fan-control', label: 'Fan Control (PWM)', icon: Fan },
    { id: 'emergency-alert', label: 'Emergency Alert', icon: BellRing, badge: telemetry.alarmStatus !== 'NORMAL' ? telemetry.alarmStatus : undefined },
    { id: 'fdcan-monitor', label: 'FDCAN Monitor', icon: Radio },
    { id: 'realtime-graphs', label: 'Real-time Graphs', icon: LineChart },
    { id: 'system-workflow', label: 'System Workflow', icon: GitFork },
    { id: 'testing-validation', label: 'Testing & Validation', icon: CheckCheck },
    { id: 'alarm-history', label: 'Alarm History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about-project', label: 'About Project', icon: Info },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-[#090d15] border-r border-slate-800/80 pt-16 flex flex-col justify-between
      transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:pt-0
      ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Supervisory Control & Data
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-600/25 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  item.badge === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' :
                  item.badge === 'DANGER' ? 'bg-orange-500 text-white' :
                  item.badge === 'WARNING' ? 'bg-yellow-500 text-black' :
                  'bg-amber-600 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Embedded Systems Quick Node Status Box */}
      <div className="p-3 m-3 rounded-lg bg-[#0d131f] border border-slate-800 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Activity className="w-3.5 h-3.5" /> STM32 Node
          </span>
          <span className="font-mono text-[10px] text-emerald-400">ONLINE</span>
        </div>
        <div className="space-y-1 font-mono text-[10px] text-slate-300">
          <div className="flex justify-between">
            <span>MCU:</span>
            <span className="text-slate-200">STM32H743ZI</span>
          </div>
          <div className="flex justify-between">
            <span>Clock:</span>
            <span className="text-slate-200">480 MHz M7</span>
          </div>
          <div className="flex justify-between">
            <span>ADC:</span>
            <span className="text-cyan-300">12-bit / 1 kHz</span>
          </div>
          <div className="flex justify-between">
            <span>PWM:</span>
            <span className="text-cyan-300">{telemetry.fanPwm}% (TIM1_CH1)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
