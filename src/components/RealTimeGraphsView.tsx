import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer
} from 'recharts';
import { 
  Download, 
  Pause, 
  Play, 
  Flame, 
  Fan, 
  Sliders, 
  Binary
} from 'lucide-react';
import { exportTelemetryCsv } from '../utils/exportCsv';

export const RealTimeGraphsView: React.FC = () => {
  const { telemetryHistory, telemetry } = useSystem();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [frozenHistory, setFrozenHistory] = useState(telemetryHistory);

  const displayData = isPaused ? frozenHistory : telemetryHistory;

  const togglePause = () => {
    if (!isPaused) {
      setFrozenHistory([...telemetryHistory]);
    }
    setIsPaused(!isPaused);
  };

  const handleExportCsv = () => {
    exportTelemetryCsv(displayData);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            Synchronized Real-Time Telemetry Oscilloscope
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Displaying live 60-second sliding window of system variables sampled by STM32 DMA and PID engine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPaused 
                ? 'bg-amber-600 text-white border-amber-500' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume Live Stream' : 'Freeze Stream'}
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* 4 Synchronized Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Gas Concentration vs Time */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              1. Gas Concentration vs Time (%)
            </div>
            <span className="font-mono text-xs font-bold text-orange-400">
              Current: {telemetry.gasLevel}%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gasLevel" 
                  stroke="#f97316" 
                  strokeWidth={2.5} 
                  dot={false} 
                  name="Gas Level (%)" 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fan PWM Duty Cycle vs Time */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Fan className="w-4 h-4 text-cyan-400" />
              2. Fan PWM Duty Cycle vs Time (%)
            </div>
            <span className="font-mono text-xs font-bold text-cyan-400">
              Current: {telemetry.fanPwm}% ({telemetry.fanRpm} RPM)
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fanPwm" 
                  stroke="#00f0ff" 
                  strokeWidth={2.5} 
                  dot={false} 
                  name="Fan PWM (%)" 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: PID Controller Output vs Time */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              3. Discrete PID Output u(k) vs Time (%)
            </div>
            <span className="font-mono text-xs font-bold text-blue-400">
              Current: {telemetry.pidOutput}%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pidOutput" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  dot={false} 
                  name="PID Output (%)" 
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="pidError" 
                  stroke="#a855f7" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3" 
                  dot={false} 
                  name="Error e(t)" 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: ADC Quantized Reading vs Time */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-400" />
              4. STM32 ADC Digital Word (12-bit, 0–4095)
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">
              Current: {telemetry.adcValue} / 4095
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 4095]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="adcValue" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={false} 
                  name="ADC Reading" 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
