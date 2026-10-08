import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Sliders, 
  Activity, 
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';

export const PidControllerView: React.FC = () => {
  const { 
    telemetry, 
    telemetryHistory, 
    settings, 
    updateSettings 
  } = useSystem();

  const handleGainChange = (key: 'kp' | 'ki' | 'kd' | 'targetGasLevel', value: number) => {
    updateSettings({ [key]: value });
  };

  const resetPidDefaults = () => {
    updateSettings({
      kp: 1.8,
      ki: 0.35,
      kd: 0.45,
      targetGasLevel: 15
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Discrete Closed-Loop PID Controller Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time discrete Proportional-Integral-Derivative ventilation algorithm with anti-windup clamping [0–100%].
          </p>
        </div>
        <button
          onClick={resetPidDefaults}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset PID Defaults
        </button>
      </div>

      {/* PID Live Term Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Error */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Process Error e(k)</div>
          <div className={`font-mono text-3xl font-extrabold ${telemetry.pidError > 0 ? 'text-purple-400' : 'text-slate-300'}`}>
            {telemetry.pidError > 0 ? `+${telemetry.pidError}` : telemetry.pidError}%
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-mono">
            e(k) = Current ({telemetry.gasLevel}%) - Target ({settings.targetGasLevel}%)
          </div>
        </div>

        {/* P Term */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Proportional Term P(k)</div>
          <div className="font-mono text-3xl font-extrabold text-cyan-400">
            {telemetry.pidP}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-mono">
            Kp × e(k) = {settings.kp} × {Math.max(0, telemetry.pidError)}
          </div>
        </div>

        {/* I Term */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Integral Term I(k)</div>
          <div className="font-mono text-3xl font-extrabold text-emerald-400">
            {telemetry.pidI}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-mono">
            Ki × Σ(e·Ts) [Anti-Windup Clamped]
          </div>
        </div>

        {/* D Term */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Derivative Term D(k)</div>
          <div className="font-mono text-3xl font-extrabold text-orange-400">
            {telemetry.pidD}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-mono">
            Kd × Δe / Ts [Rate of Leak Influx]
          </div>
        </div>

      </div>

      {/* PID Output Summary & Decomposition Bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Control Action u(k) = P + I + D
            </div>
            <div className="font-mono text-3xl font-black text-white mt-1 flex items-baseline gap-2">
              <span>{telemetry.pidOutput}%</span>
              <span className="text-xs font-normal text-slate-400">Ventilation Demand</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> P: {telemetry.pidP}%
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> I: {telemetry.pidI}%
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> D: {telemetry.pidD}%
            </span>
          </div>
        </div>

        {/* Dynamic Multi-segment Bar */}
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
          <div 
            className="h-full bg-cyan-400 transition-all duration-200" 
            style={{ width: `${Math.min(100, (telemetry.pidP / (telemetry.pidOutput || 1)) * telemetry.pidOutput)}%` }}
            title={`P Contribution: ${telemetry.pidP}`}
          />
          <div 
            className="h-full bg-emerald-400 transition-all duration-200" 
            style={{ width: `${Math.min(100, (telemetry.pidI / (telemetry.pidOutput || 1)) * telemetry.pidOutput)}%` }}
            title={`I Contribution: ${telemetry.pidI}`}
          />
          <div 
            className="h-full bg-orange-400 transition-all duration-200" 
            style={{ width: `${Math.min(100, (telemetry.pidD / (telemetry.pidOutput || 1)) * telemetry.pidOutput)}%` }}
            title={`D Contribution: ${telemetry.pidD}`}
          />
        </div>
      </div>

      {/* PID Real-Time Tuning Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tuning Sliders Panel */}
        <div className="lg:col-span-1 bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> Live PID Gain Tuning
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Discrete Euler</span>
          </div>

          {/* Kp Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Kp (Proportional Gain)</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.kp.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.05"
              value={settings.kp}
              onChange={(e) => handleGainChange('kp', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="text-[10px] text-slate-300">Determines immediate reaction to present gas error.</div>
          </div>

          {/* Ki Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Ki (Integral Gain)</span>
              <span className="font-mono text-emerald-400 font-bold">{settings.ki.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={settings.ki}
              onChange={(e) => handleGainChange('ki', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="text-[10px] text-slate-300">Eliminates steady-state residual gas offset.</div>
          </div>

          {/* Kd Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Kd (Derivative Gain)</span>
              <span className="font-mono text-orange-400 font-bold">{settings.kd.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={settings.kd}
              onChange={(e) => handleGainChange('kd', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
            <div className="text-[10px] text-slate-300">Dampens surges based on rapid rate of gas rise.</div>
          </div>

          {/* Target Safe Gas Level */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Target Gas Setpoint r(t)</span>
              <span className="font-mono text-white font-bold">{settings.targetGasLevel}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="1"
              value={settings.targetGasLevel}
              onChange={(e) => handleGainChange('targetGasLevel', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="text-[10px] text-slate-300">Desired steady-state ambient air concentration.</div>
          </div>
        </div>

        {/* Live PID Response Curve */}
        <div className="lg:col-span-2 bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Dynamic Response: Gas vs Error vs PID Output
              </div>
              <span className="text-[11px] font-mono text-slate-400">Ts = {settings.samplingTimeMs}ms</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="gasLevel" stroke="#f97316" strokeWidth={2} dot={false} name="Gas Level (%)" />
                  <Line type="monotone" dataKey="pidOutput" stroke="#3b82f6" strokeWidth={2} dot={false} name="PID Output u(k)" />
                  <Line type="monotone" dataKey="pidError" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Error e(k)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Embedded C PID Implementation Box */}
          <div className="mt-4 p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <span className="text-cyan-400 font-bold">// Discrete STM32 PID Controller Loop (Embedded C)</span><br />
            float error = current_gas - target_gas;<br />
            integral += error * dt;<br />
            if (integral &gt; MAX_I) integral = MAX_I; // Anti-windup clamp<br />
            float derivative = (error - prev_error) / dt;<br />
            float u = (Kp * error) + (Ki * integral) + (Kd * derivative);<br />
            pwm_output = clamp(u, 0.0f, 100.0f);
          </div>
        </div>

      </div>

    </div>
  );
};
