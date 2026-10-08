import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Flame, 
  ShieldAlert, 
  Fan, 
  Sliders, 
  BellRing, 
  Radio, 
  Binary, 
  Cpu, 
  Zap, 
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    telemetry, 
    telemetryHistory, 
    activePreset, 
    setSimulationPreset, 
    setManualGasLevel, 
    acknowledgeAlarm, 
    systemMode,
    setActiveTab
  } = useSystem();

  const getSafetyColor = () => {
    if (telemetry.sensorStatus === 'DISCONNECTED') return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    switch (telemetry.safetyLevel) {
      case 'CRITICAL': return 'text-red-400 border-red-500/60 bg-red-500/10 shadow-red-950';
      case 'DANGER': return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
      case 'WARNING': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      default: return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    }
  };

  const getFanRotationSpeedClass = () => {
    if (telemetry.fanPwm === 0) return '';
    if (telemetry.fanPwm <= 30) return 'animate-spin-slow';
    if (telemetry.fanPwm <= 60) return 'animate-spin-medium';
    return 'animate-spin-fast';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner if Emergency or Sensor Fault */}
      {telemetry.alarmStatus !== 'NORMAL' && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-lg ${
          telemetry.alarmStatus === 'CRITICAL' 
            ? 'bg-red-950/70 border-red-500 text-red-200 animate-pulse' 
            : telemetry.alarmStatus === 'DANGER'
            ? 'bg-orange-950/60 border-orange-500 text-orange-200'
            : telemetry.alarmStatus === 'SENSOR_FAULT'
            ? 'bg-amber-950/60 border-amber-500 text-amber-200'
            : 'bg-yellow-950/60 border-yellow-500 text-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/40">
              <ShieldAlert className="w-6 h-6 text-current" />
            </div>
            <div>
              <div className="font-bold tracking-wide text-sm uppercase">
                {telemetry.alarmStatus === 'CRITICAL' && 'EMERGENCY GAS LEAK DETECTED - MAXIMUM VENTILATION FORCED'}
                {telemetry.alarmStatus === 'DANGER' && 'HIGH GAS CONCENTRATION - VENTILATION ACCELERATING'}
                {telemetry.alarmStatus === 'WARNING' && 'GAS LEVEL ELEVATED - EXHAUST FAN ENGAGED'}
                {telemetry.alarmStatus === 'SENSOR_FAULT' && 'MQ-2 ANALOG SENSOR LINE DISCONNECTED - SAFETY 100% VENTILATION ACTIVE'}
              </div>
              <div className="text-xs opacity-80">
                Current Concentration: {telemetry.gasLevel}% | Fan Duty: {telemetry.fanPwm}% | STM32 Emergency FDCAN Broadcast: ACTIVE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!telemetry.isAlarmAcknowledged && (
              <button
                onClick={acknowledgeAlarm}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Acknowledge Alert
              </button>
            )}
            <button
              onClick={() => setActiveTab('emergency-alert')}
              className="px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 text-xs font-semibold flex items-center gap-1"
            >
              Details <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Simulation Scenario Bar */}
      <div className="bg-[#0f1523] border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Quick Simulation Test Scenarios (Examiner Control)
            </div>
            <div className="text-[11px] text-slate-300">
              Click any scenario to immediately observe embedded processing, PID fan ramping, and FDCAN alerts.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'NORMAL', label: 'Normal Air (18%)', color: 'hover:border-emerald-500' },
              { id: 'LOW_GAS', label: 'Low Gas (38%)', color: 'hover:border-yellow-500' },
              { id: 'INCREASING', label: 'Increasing Gas', color: 'hover:border-amber-500' },
              { id: 'HIGH_GAS', label: 'High Gas (68%)', color: 'hover:border-orange-500' },
              { id: 'CRITICAL', label: 'Critical Leak (92%)', color: 'hover:border-red-500' },
              { id: 'RANDOM_LEAK', label: 'Random Fluctuations', color: 'hover:border-purple-500' },
              { id: 'SENSOR_DISCONNECT', label: 'Sensor Disconnect', color: 'hover:border-pink-500' },
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => setSimulationPreset(preset.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activePreset === preset.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : `bg-slate-900/80 border-slate-700/80 text-slate-300 ${preset.color} hover:text-white`
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Manual Gas Slider Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            Smooth Gas Influx Control:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={telemetry.gasLevel}
            onChange={(e) => setManualGasLevel(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-800/60 min-w-[55px] text-center">
            {telemetry.gasLevel}%
          </span>
        </div>
      </div>

      {/* 8 Primary SCADA Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gas Concentration */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-cyan-400" /> Gas Concentration
            </span>
            <span className="font-mono text-[10px] text-slate-300">MQ-2 Analog</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {telemetry.gasLevel}
              <span className="text-lg font-normal text-slate-400 ml-1">%</span>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>{telemetry.sensorVoltage.toFixed(3)} V</div>
              <div className="text-[10px] text-slate-300">~{Math.round(telemetry.gasLevel * 85)} PPM</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                telemetry.gasLevel >= 80 ? 'bg-red-500' :
                telemetry.gasLevel >= 60 ? 'bg-orange-500' :
                telemetry.gasLevel >= 30 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${telemetry.gasLevel}%` }}
            />
          </div>
        </div>

        {/* Card 2: Gas Safety Level */}
        <div className={`border rounded-xl p-4 transition-all shadow-md ${getSafetyColor()}`}>
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Safety State
            </span>
            <span className="font-mono text-[10px] uppercase">
              {telemetry.sensorStatus === 'DISCONNECTED' ? 'FAULT' : 'SCADA MONITOR'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-2xl font-black tracking-wider">
              {telemetry.sensorStatus === 'DISCONNECTED' ? 'SENSOR FAULT' : telemetry.safetyLevel}
            </div>
          </div>
          <div className="text-[11px] mt-2 opacity-90">
            {telemetry.safetyLevel === 'NORMAL' && 'Ambient gas level safe (< 30%)'}
            {telemetry.safetyLevel === 'WARNING' && 'Warning: Moderate gas present'}
            {telemetry.safetyLevel === 'DANGER' && 'Hazard: High gas presence'}
            {telemetry.safetyLevel === 'CRITICAL' && 'Critical: Emergency evacuation!'}
            {telemetry.sensorStatus === 'DISCONNECTED' && 'Analog line open circuit'}
          </div>
        </div>

        {/* Card 3: Fan Speed / PWM Duty Cycle */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Fan className={`w-4 h-4 text-cyan-400 ${getFanRotationSpeedClass()}`} /> Fan Speed / PWM
            </span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">{telemetry.fanStatus}</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {telemetry.fanPwm}
              <span className="text-lg font-normal text-slate-400 ml-1">%</span>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div className="text-cyan-300 font-semibold">{telemetry.fanRpm} RPM</div>
              <div className="text-[10px] text-slate-300">L298N {telemetry.l298nState.effectiveVoltage}V</div>
            </div>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${telemetry.fanPwm}%` }}
            />
          </div>
        </div>

        {/* Card 4: PID Output */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> PID Output
            </span>
            <span className="font-mono text-[10px] text-slate-300">
              Err: {telemetry.pidError > 0 ? `+${telemetry.pidError}` : telemetry.pidError}%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {telemetry.pidOutput}
              <span className="text-lg font-normal text-slate-400 ml-1">%</span>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400 space-y-0.5">
              <div>P: <span className="text-cyan-400">{telemetry.pidP}</span></div>
              <div>I: <span className="text-emerald-400">{telemetry.pidI}</span> | D: <span className="text-purple-400">{telemetry.pidD}</span></div>
            </div>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${telemetry.pidOutput}%` }}
            />
          </div>
        </div>

        {/* Card 5: Alarm Status */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-cyan-400" /> Alarm Status
            </span>
            <span className="font-mono text-[10px] text-slate-300">
              {telemetry.isAlarmAcknowledged ? 'ACK' : 'UNACK'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className={`font-mono text-2xl font-black ${
              telemetry.alarmStatus === 'CRITICAL' ? 'text-red-400 animate-pulse' :
              telemetry.alarmStatus === 'DANGER' ? 'text-orange-400' :
              telemetry.alarmStatus === 'WARNING' ? 'text-yellow-400' :
              telemetry.alarmStatus === 'SENSOR_FAULT' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {telemetry.alarmStatus}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Buzzer Siren:</span>
            <span className={telemetry.isBuzzerActive ? 'text-red-400 font-bold flex items-center gap-1 animate-pulse' : 'text-slate-300'}>
              {telemetry.isBuzzerActive ? 'SOUNDING' : 'SILENT'}
            </span>
          </div>
        </div>

        {/* Card 6: FDCAN Communication Status */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" /> FDCAN Bus
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">1 Mbps / 5 Mbps</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-2xl font-bold text-emerald-400">
              {telemetry.fdcanStatus}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between font-mono">
            <span>Tx Frames:</span>
            <span className="text-cyan-300">0x110, 0x120, 0x0E0</span>
          </div>
        </div>

        {/* Card 7: Sensor Status & ADC */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-cyan-400" /> Sensor & ADC
            </span>
            <span className="font-mono text-[10px] text-slate-300">12-Bit / 3.3V</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {telemetry.adcValue}
              <span className="text-xs font-normal text-slate-300 ml-1">/ 4095</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Hardware Pin:</span>
            <span className="font-mono text-cyan-300 text-[10px]">PA3 (ADC1_IN15)</span>
          </div>
        </div>

        {/* Card 8: System Mode */}
        <div className="bg-[#0e1422] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> System Mode
            </span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">V1.0</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="font-mono text-2xl font-bold text-cyan-300">
              {systemMode}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Target Board:</span>
            <span className="text-slate-300 font-medium">STM32H743ZI</span>
          </div>
        </div>

      </div>

      {/* Synchronized Real-time Mini Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Graph 1: Gas vs Fan PWM */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Gas Level vs Fan PWM Response (Live Synchronized)
            </div>
            <button
              onClick={() => setActiveTab('realtime-graphs')}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              Full Charts <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="gasLevel" stroke="#f97316" strokeWidth={2} dot={false} name="Gas Level (%)" />
                <Line type="monotone" dataKey="fanPwm" stroke="#00f0ff" strokeWidth={2} dot={false} name="Fan PWM (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Gas Concentration (%)
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Fan PWM Duty (%)
            </div>
          </div>
        </div>

        {/* Graph 2: PID Controller Output vs Error */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              PID Output Dynamics (Discrete Closed-Loop)
            </div>
            <button
              onClick={() => setActiveTab('pid-control')}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              PID Tuning <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="pidOutput" stroke="#3b82f6" strokeWidth={2} dot={false} name="PID Output (%)" />
                <Line type="monotone" dataKey="pidError" stroke="#a855f7" strokeWidth={1.5} dot={false} name="Error e(t)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> PID Output u(k)
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Error e(k)
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Hardware Flow Summary Bar */}
      <div className="bg-[#0b1019] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-bold text-cyan-400">Hardware Pipeline:</span>
          <span className="font-mono text-[11px] text-slate-300">
            MQ-2 (PA3) → ADC1 (12-bit) → Cortex-M7 (PID) → TIM1_CH1 (PWM) → L298N → Fan → FDCAN1
          </span>
        </div>
        <button
          onClick={() => setActiveTab('system-workflow')}
          className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/60 text-cyan-300 font-semibold text-xs flex items-center gap-1 transition-all"
        >
          View System Architecture & C Code <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
