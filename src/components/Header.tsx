import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Cpu, 
  Volume2, 
  VolumeX, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Radio, 
  ShieldAlert
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    telemetry, 
    systemMode, 
    setSystemMode, 
    isBuzzerMuted, 
    toggleBuzzerMute, 
    acknowledgeAlarm, 
    setIsDemoModeOpen 
  } = useSystem();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString() + ' | ' + now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (telemetry.sensorStatus === 'DISCONNECTED') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs font-bold tracking-wider">SENSOR FAULT</span>
        </div>
      );
    }

    switch (telemetry.alarmStatus) {
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600/30 border border-red-500 text-red-300 animate-pulse">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="font-mono text-xs font-bold tracking-wider">CRITICAL ALARM</span>
          </div>
        );
      case 'DANGER':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-500/20 border border-orange-500/50 text-orange-300">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-xs font-bold tracking-wider">DANGER LEAK</span>
          </div>
        );
      case 'WARNING':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-500/20 border border-yellow-500/50 text-yellow-300">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="font-mono text-xs font-bold tracking-wider">WARNING STATE</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold tracking-wider">NORMAL OPERATION</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-[#0b1019] border-b border-slate-800/80 px-4 py-3 sticky top-0 z-40 shadow-xl backdrop-blur-md">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand & Controller Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-700/40 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-wide text-slate-100 uppercase">
                Smart Industrial Gas Leak Emergency Ventilation System
              </h1>
              <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                STM32H743ZI
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-medium">Embedded Systems SCADA Dashboard</span>
              <span>•</span>
              <span className="font-mono text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 inline" /> FDCAN 1Mbps
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Right: Status, Controls, Audio, Demo */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Status Badge */}
          {getStatusBadge()}

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setSystemMode('SIMULATION')}
              className={`px-2.5 py-1 rounded transition-colors ${
                systemMode === 'SIMULATION' 
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulation Mode
            </button>
            <button
              onClick={() => setSystemMode('HARDWARE')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                systemMode === 'HARDWARE' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hardware Bridge Architecture Ready for STM32"
            >
              <Cpu className="w-3 h-3" />
              Hardware Bridge
            </button>
          </div>

          {/* Alarm Acknowledge Button if unacknowledged */}
          {telemetry.isBuzzerActive && (
            <button
              onClick={acknowledgeAlarm}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-900/40 animate-pulse transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              ACK Alarm
            </button>
          )}

          {/* Audio Buzzer Toggle */}
          <button
            onClick={toggleBuzzerMute}
            className={`p-2 rounded-lg border text-xs flex items-center transition-colors ${
              isBuzzerMuted
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/50'
            }`}
            title={isBuzzerMuted ? 'Unmute Industrial Buzzer' : 'Mute Industrial Buzzer'}
          >
            {isBuzzerMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Presentation / Demo Mode Button */}
          <button
            onClick={() => setIsDemoModeOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all border border-emerald-400/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Presentation Mode
          </button>
        </div>

      </div>
    </header>
  );
};
