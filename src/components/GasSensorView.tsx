import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Unplug, 
  Zap, 
  HelpCircle, 
  Layers, 
  RotateCcw,
  Sliders
} from 'lucide-react';

export const GasSensorView: React.FC = () => {
  const { 
    telemetry, 
    setManualGasLevel, 
    setSimulationPreset, 
    activePreset, 
    disconnectSensor, 
    reconnectSensor, 
    settings,
    setActiveTab
  } = useSystem();

  const getSafetyBadge = () => {
    if (telemetry.sensorStatus === 'DISCONNECTED') {
      return (
        <span className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5 animate-pulse">
          <AlertTriangle className="w-4 h-4" /> SENSOR LINE FAULT
        </span>
      );
    }
    switch (telemetry.safetyLevel) {
      case 'CRITICAL':
        return (
          <span className="px-3 py-1 rounded-md bg-red-600/30 border border-red-500 text-red-300 font-mono font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <Flame className="w-4 h-4" /> CRITICAL DANGER (80–100%)
          </span>
        );
      case 'DANGER':
        return (
          <span className="px-3 py-1 rounded-md bg-orange-500/20 border border-orange-500/50 text-orange-300 font-mono font-bold text-xs flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> HAZARDOUS GAS (60–79%)
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-3 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-mono font-bold text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> WARNING LEVEL (30–59%)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> NORMAL AIR (0–29%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyan-400" />
            MQ-2 Semiconductor Gas Sensor Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulates Tin Dioxide (SnO₂) electrochemical resistance variation under combustible gas (LPG, CH₄, CO, Smoke).
          </p>
        </div>
        <div>{getSafetyBadge()}</div>
      </div>

      {/* Main Sensor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Readouts & Physical Chamber */}
        <div className="lg:col-span-1 bg-[#0e1422] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Sensing Chamber Status</span>
              <span className="font-mono text-cyan-400 text-[11px]">Pin: PA3 (ADC1)</span>
            </div>

            {/* Chamber Visualization Graphic */}
            <div className="relative w-full h-44 rounded-xl bg-gradient-to-b from-slate-900 to-black border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              {/* Animated gas particles overlay */}
              <div 
                className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                style={{ 
                  backgroundColor: telemetry.gasLevel >= 80 ? 'rgba(239, 68, 68, 0.25)' :
                    telemetry.gasLevel >= 60 ? 'rgba(249, 115, 22, 0.2)' :
                    telemetry.gasLevel >= 30 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                  backdropFilter: `blur(${Math.min(8, telemetry.gasLevel / 12)}px)`
                }}
              />

              {/* Sensor Module Icon */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  telemetry.sensorStatus === 'DISCONNECTED' ? 'border-amber-500 bg-amber-950/40' :
                  telemetry.gasLevel >= 80 ? 'border-red-500 bg-red-950/40 scada-glow-red' :
                  telemetry.gasLevel >= 60 ? 'border-orange-500 bg-orange-950/40' :
                  telemetry.gasLevel >= 30 ? 'border-yellow-500 bg-yellow-950/40' :
                  'border-emerald-500 bg-emerald-950/30'
                }`}>
                  <Flame className={`w-10 h-10 ${
                    telemetry.sensorStatus === 'DISCONNECTED' ? 'text-amber-400' :
                    telemetry.gasLevel >= 80 ? 'text-red-400 animate-pulse' :
                    telemetry.gasLevel >= 60 ? 'text-orange-400' :
                    telemetry.gasLevel >= 30 ? 'text-yellow-400' : 'text-emerald-400'
                  }`} />
                </div>
                <div className="mt-2 text-xs font-mono font-bold text-slate-300">
                  {telemetry.sensorStatus === 'DISCONNECTED' ? 'CIRCUIT OPEN' : 'MQ-2 SnO₂ CORE'}
                </div>
                <div className="text-[10px] text-slate-300">
                  {telemetry.sensorStatus === 'DISCONNECTED' ? 'Vout = 0.000 V' : `Heater: 5.0V | Vout: ${telemetry.sensorVoltage.toFixed(3)}V`}
                </div>
              </div>
            </div>

            {/* Digital & Analog Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Gas Concentration</div>
                <div className="font-mono text-2xl font-black text-white mt-1">
                  {telemetry.gasLevel}%
                </div>
              </div>
              <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Analog Voltage (Vin)</div>
                <div className="font-mono text-2xl font-black text-cyan-400 mt-1">
                  {telemetry.sensorVoltage.toFixed(3)} V
                </div>
              </div>
              <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-medium">ADC Digital Word</div>
                <div className="font-mono text-xl font-bold text-emerald-400 mt-1">
                  {telemetry.adcValue} <span className="text-[10px] text-slate-400">/ 4095</span>
                </div>
              </div>
              <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-medium">Estimated PPM</div>
                <div className="font-mono text-xl font-bold text-orange-400 mt-1">
                  ~{Math.round(telemetry.gasLevel * 85)}
                </div>
              </div>
            </div>
          </div>

          {/* Fault / Reconnect Button */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            {telemetry.sensorStatus === 'CONNECTED' ? (
              <button
                onClick={disconnectSensor}
                className="w-full py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Unplug className="w-4 h-4" /> Simulate Sensor Disconnection Fault
              </button>
            ) : (
              <button
                onClick={reconnectSensor}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reconnect Sensor Line
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Controls, Smooth Slider, Presets, Safety Thresholds */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preset Buttons Card */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" /> Sensor Simulation Presets
              </span>
              <span className="text-[11px] text-slate-400">Smooth state injection</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'NORMAL', label: 'Normal Air (18%)', desc: 'Baseline ambient air', color: 'border-emerald-500/40 text-emerald-300' },
                { id: 'LOW_GAS', label: 'Low Gas (38%)', desc: 'Mild leak warning', color: 'border-yellow-500/40 text-yellow-300' },
                { id: 'INCREASING', label: 'Increasing Gas', desc: 'Continuous leak influx', color: 'border-amber-500/40 text-amber-300' },
                { id: 'HIGH_GAS', label: 'High Gas (68%)', desc: 'Hazardous threshold', color: 'border-orange-500/40 text-orange-300' },
                { id: 'CRITICAL', label: 'Critical Leak (92%)', desc: 'Emergency evacuation', color: 'border-red-500/40 text-red-300' },
                { id: 'RANDOM_LEAK', label: 'Random Fluctuations', desc: 'Turbulent leak airflow', color: 'border-purple-500/40 text-purple-300' },
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setSimulationPreset(preset.id as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activePreset === preset.id 
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-sm' 
                      : 'bg-[#090d16] hover:bg-slate-800/60 border-slate-800'
                  }`}
                >
                  <div className={`text-xs font-bold ${preset.color}`}>{preset.label}</div>
                  <div className="text-[10px] text-slate-300 mt-1">{preset.desc}</div>
                </button>
              ))}
            </div>

            {/* Smooth manual slider */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Continuous Gas Concentration Influx Slider:</span>
                <span className="font-mono text-cyan-300 font-bold text-sm bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  {telemetry.gasLevel}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={telemetry.gasLevel}
                onChange={(e) => setManualGasLevel(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-300 mt-1">
                <span>0% (Clean Air)</span>
                <span>29% (Safe)</span>
                <span>59% (Warning)</span>
                <span>79% (Danger)</span>
                <span>100% (Critical)</span>
              </div>
            </div>
          </div>

          {/* Safety Thresholds Spectrum Card */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> Configured Safety Spectrum
              </span>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" /> Adjust in Settings
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                <div className="font-bold text-emerald-400">0% – {settings.safeGasThreshold}%</div>
                <div className="text-[11px] font-semibold text-emerald-300 mt-0.5">NORMAL</div>
                <div className="text-[10px] text-slate-300 mt-1">Fan remains low/idle; no sirens.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-950/30 border border-yellow-500/40">
                <div className="font-bold text-yellow-400">{settings.safeGasThreshold + 1}% – {settings.warningThreshold}%</div>
                <div className="text-[11px] font-semibold text-yellow-300 mt-0.5">WARNING</div>
                <div className="text-[10px] text-slate-300 mt-1">Proportional fan ventilation ramps.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-500/40">
                <div className="font-bold text-orange-400">{settings.warningThreshold + 1}% – {settings.dangerThreshold}%</div>
                <div className="text-[11px] font-semibold text-orange-300 mt-0.5">DANGER</div>
                <div className="text-[10px] text-slate-300 mt-1">High fan CFM exhaust + audio alert.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40">
                <div className="font-bold text-red-400">{settings.criticalThreshold}% – 100%</div>
                <div className="text-[11px] font-semibold text-red-300 mt-0.5">CRITICAL</div>
                <div className="text-[10px] text-slate-300 mt-1">100% PWM + emergency strobe + FDCAN.</div>
              </div>
            </div>
          </div>

          {/* Academic & Hardware Theory Card */}
          <div className="bg-[#0b1019] border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> MQ-2 Sensor Working Principle in Embedded Systems:
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The MQ-2 contains a micro-ceramic tube with an Al₂O₃ layer coated with SnO₂ sensitive material. In clean air, the sensor has high resistance. When combustible gas is absorbed by the surface, oxygen ions reduce, lowering sensor resistance Rs. In a voltage divider circuit with load resistor RL, the output voltage Vout = Vcc × (RL / (Rs + RL)) increases proportionally and enters STM32 pin PA3.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
