import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Fan, 
  Activity, 
  Cpu, 
  Thermometer
} from 'lucide-react';

export const FanControlView: React.FC = () => {
  const { telemetry } = useSystem();

  // Dynamic spin duration based on PWM: 0% -> stop, 100% -> 0.15s, 30% -> 1s
  const spinStyle: React.CSSProperties = telemetry.fanPwm > 0 ? {
    animation: `spin ${(3.5 / (telemetry.fanPwm / 15 + 0.5)).toFixed(2)}s linear infinite`
  } : {};

  // Duty cycle square wave generation for visual scope
  const tonPercentage = telemetry.fanPwm;
  const toffPercentage = 100 - tonPercentage;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Fan className="w-5 h-5 text-cyan-400" />
            Variable-Speed Exhaust Fan & L298N Driver Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Timer PWM Generation (STM32 TIM1_CH1) modulating 12V High-CFM brushless industrial ventilation fan.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300">
            TIM1 Freq: 25 kHz
          </span>
          <span className={`px-2.5 py-1 rounded border font-bold ${
            telemetry.fanStatus === 'MAXIMUM' ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse' :
            telemetry.fanStatus === 'HIGH' ? 'bg-orange-500/20 border-orange-500 text-orange-300' :
            telemetry.fanStatus === 'NORMAL' ? 'bg-blue-500/20 border-blue-500 text-blue-300' :
            telemetry.fanStatus === 'LOW' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' :
            'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            STATUS: {telemetry.fanStatus}
          </span>
        </div>
      </div>

      {/* Main Fan & Motor Driver Simulation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 3D-styled Industrial Fan Rotor */}
        <div className="lg:col-span-1 bg-[#0e1422] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-between shadow-md">
          <div className="w-full flex justify-between items-center text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Industrial Exhaust Duct</span>
            <span className="font-mono text-cyan-400">{telemetry.fanRpm} RPM</span>
          </div>

          {/* Fan Chamber Graphic */}
          <div className="relative my-6 w-52 h-52 rounded-full border-4 border-slate-700 bg-gradient-to-b from-slate-900 via-[#0a0f18] to-black flex items-center justify-center p-4 shadow-inner">
            {/* Duct safety cage grill */}
            <div className="absolute inset-0 rounded-full border border-slate-600/30 flex items-center justify-center pointer-events-none">
              <div className="w-full h-0.5 bg-slate-700/40" />
              <div className="h-full w-0.5 bg-slate-700/40 absolute" />
            </div>

            {/* Glowing speed aura */}
            <div 
              className="absolute inset-3 rounded-full transition-all duration-300 pointer-events-none"
              style={{
                boxShadow: telemetry.fanPwm > 0 
                  ? `0 0 ${Math.min(30, telemetry.fanPwm / 2)}px rgba(0, 240, 255, ${telemetry.fanPwm / 200})` 
                  : 'none'
              }}
            />

            {/* Rotating Fan Blades */}
            <div 
              className="relative w-36 h-36 flex items-center justify-center transition-all"
              style={spinStyle}
            >
              {/* Central Hub */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border-2 border-cyan-400 z-10 shadow-md flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
              </div>

              {/* 4 Aerodynamic Blades */}
              <div className="absolute w-6 h-28 bg-gradient-to-t from-slate-600 to-slate-400 rounded-lg transform rotate-0 opacity-90 shadow-md" />
              <div className="absolute w-6 h-28 bg-gradient-to-t from-slate-600 to-slate-400 rounded-lg transform rotate-90 opacity-90 shadow-md" />
              <div className="absolute w-6 h-28 bg-gradient-to-t from-slate-600 to-slate-400 rounded-lg transform rotate-45 opacity-90 shadow-md" />
              <div className="absolute w-6 h-28 bg-gradient-to-t from-slate-600 to-slate-400 rounded-lg transform -rotate-45 opacity-90 shadow-md" />
            </div>
          </div>

          {/* RPM & Airflow CFM Readout */}
          <div className="w-full grid grid-cols-2 gap-2 text-center">
            <div className="bg-[#090d16] p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Rotor Speed</div>
              <div className="font-mono text-lg font-bold text-white mt-0.5">{telemetry.fanRpm} RPM</div>
            </div>
            <div className="bg-[#090d16] p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Exhaust Flow</div>
              <div className="font-mono text-lg font-bold text-cyan-400 mt-0.5">
                {Math.round((telemetry.fanPwm / 100) * 450)} CFM
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: L298N Motor Driver, PWM Oscilloscope, Duty Cycle Math */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* L298N Dual H-Bridge Driver Status Card */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> L298N Dual H-Bridge Motor Driver State
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">Driver IC: ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                <div className="text-slate-400 text-[11px]">Pin ENA (PWM)</div>
                <div className="font-mono text-lg font-bold text-cyan-400 mt-1">
                  {telemetry.l298nState.enA ? `${telemetry.fanPwm}%` : 'LOW (0V)'}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">TIM1_CH1 / PA8</div>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                <div className="text-slate-400 text-[11px]">Pin IN1 / IN2</div>
                <div className="font-mono text-lg font-bold text-emerald-400 mt-1">
                  {telemetry.l298nState.in1 ? 'HIGH / LOW' : 'LOW / LOW'}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">Direction: Exhaust FWD</div>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                <div className="text-slate-400 text-[11px]">Motor Voltage (Vout)</div>
                <div className="font-mono text-lg font-bold text-white mt-1">
                  {telemetry.l298nState.effectiveVoltage} V
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">Vs Supply: 12.0 V</div>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Heatsink Temp
                </div>
                <div className="font-mono text-lg font-bold text-orange-400 mt-1">
                  {telemetry.l298nState.chipTempC} °C
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">Safe Range (&lt; 85°C)</div>
              </div>
            </div>
          </div>

          {/* Oscilloscope PWM Square Wave Visualizer */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" /> PWM Waveform Oscilloscope Visualizer
              </span>
              <span className="font-mono text-xs text-cyan-300">
                Duty Cycle: {telemetry.fanPwm}%
              </span>
            </div>

            {/* Synthetic Oscilloscope Screen */}
            <div className="w-full h-24 bg-black rounded-lg border border-cyan-900/50 p-2 relative flex items-center overflow-hidden">
              {/* Scope grid */}
              <div className="absolute inset-0 bg-industrial-grid opacity-30" />

              {/* Square waveform pulse rendering */}
              <div className="relative z-10 w-full flex items-center h-16">
                {[0, 1, 2, 3].map(period => (
                  <div key={period} className="flex-1 flex items-end h-full">
                    {/* TON high part */}
                    <div 
                      className="h-full border-t-2 border-r-2 border-l-2 border-cyan-400 bg-cyan-400/10 transition-all duration-200"
                      style={{ width: `${Math.max(1, tonPercentage)}%` }}
                    />
                    {/* TOFF low part */}
                    <div 
                      className="h-1 border-b-2 border-cyan-700/60 transition-all duration-200"
                      style={{ width: `${Math.max(1, toffPercentage)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* PWM Duty Formula Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                <div className="text-slate-400 text-[11px] font-sans">PWM Duty Cycle Formula:</div>
                <div className="text-cyan-300 font-bold mt-1">
                  Duty Cycle = (TON / Tperiod) × 100%
                </div>
                <div className="text-slate-300 text-[10px] mt-1 font-sans">
                  Where Tperiod = 40 µs (f = 25 kHz carrier frequency)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                <div className="text-slate-400 text-[11px] font-sans">Ventilation Speed Tier:</div>
                <div className="text-emerald-400 font-bold mt-1">
                  {telemetry.fanPwm === 0 && '0% → Fan OFF'}
                  {telemetry.fanPwm > 0 && telemetry.fanPwm <= 30 && `${telemetry.fanPwm}% → LOW SPEED`}
                  {telemetry.fanPwm > 30 && telemetry.fanPwm <= 60 && `${telemetry.fanPwm}% → NORMAL VENTILATION`}
                  {telemetry.fanPwm > 60 && telemetry.fanPwm <= 80 && `${telemetry.fanPwm}% → HIGH VENTILATION`}
                  {telemetry.fanPwm > 80 && `${telemetry.fanPwm}% → MAXIMUM SAFETY EVACUATION`}
                </div>
                <div className="text-slate-300 text-[10px] mt-1 font-sans">
                  Auto-ramped by discrete PID gas controller
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
