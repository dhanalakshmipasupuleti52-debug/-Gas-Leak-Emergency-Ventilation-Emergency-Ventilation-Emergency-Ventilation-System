import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Volume2, 
  VolumeX, 
  Unplug, 
  ArrowUpRight
} from 'lucide-react';
import { soundSynth } from '../utils/audioAlert';

export const EmergencyAlertView: React.FC = () => {
  const { 
    telemetry, 
    acknowledgeAlarm, 
    isBuzzerMuted, 
    toggleBuzzerMute,
    setActiveTab 
  } = useSystem();

  return (
    <div className="space-y-6">
      
      {/* Title & Alarm Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-cyan-400" />
            Emergency Alert & Industrial Annunciator System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SCADA multi-stage visual alarm annunciator with optical flash, audible siren, and FDCAN priority broadcast.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleBuzzerMute}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isBuzzerMuted 
                ? 'bg-slate-800 border-slate-700 text-slate-400' 
                : 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
            }`}
          >
            {isBuzzerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            {isBuzzerMuted ? 'Buzzer Muted' : 'Audible Siren Active'}
          </button>

          {!telemetry.isAlarmAcknowledged && telemetry.alarmStatus !== 'NORMAL' && (
            <button
              onClick={acknowledgeAlarm}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950 animate-pulse transition-all"
            >
              Acknowledge Alarm
            </button>
          )}
        </div>
      </div>

      {/* Main Annunciator Panels (SCADA 4-Stage Panel) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* NORMAL STAGE */}
        <div className={`p-4 rounded-xl border transition-all ${
          telemetry.alarmStatus === 'NORMAL'
            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 scada-glow-green shadow-lg'
            : 'bg-[#0d131f] border-slate-800 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold">STAGE 0</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-bold text-lg">NORMAL AIR</div>
          <div className="text-[11px] mt-2 space-y-1">
            <div>• Gas &lt; 30% concentration</div>
            <div>• Optical: Solid Green LED</div>
            <div>• Siren: Inactive</div>
            <div>• Fan: Baseline / Idle</div>
          </div>
        </div>

        {/* WARNING STAGE */}
        <div className={`p-4 rounded-xl border transition-all ${
          telemetry.alarmStatus === 'WARNING'
            ? 'bg-yellow-950/60 border-yellow-500 text-yellow-300 scada-glow-amber shadow-lg'
            : 'bg-[#0d131f] border-slate-800 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold">STAGE 1</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="font-bold text-lg">GAS WARNING</div>
          <div className="text-[11px] mt-2 space-y-1">
            <div>• Gas 30% – 59%</div>
            <div>• Optical: Amber Strobe</div>
            <div>• Siren: Intermittent Pulse</div>
            <div>• Fan: Proportional PID Ramp</div>
          </div>
        </div>

        {/* DANGER STAGE */}
        <div className={`p-4 rounded-xl border transition-all ${
          telemetry.alarmStatus === 'DANGER'
            ? 'bg-orange-950/60 border-orange-500 text-orange-300 shadow-lg'
            : 'bg-[#0d131f] border-slate-800 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold">STAGE 2</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="font-bold text-lg">GAS DANGER</div>
          <div className="text-[11px] mt-2 space-y-1">
            <div>• Gas 60% – 79%</div>
            <div>• Optical: Orange Rapid Flash</div>
            <div>• Siren: Rapid Double Tone</div>
            <div>• Fan: High CFM Exhaust</div>
          </div>
        </div>

        {/* CRITICAL STAGE */}
        <div className={`p-4 rounded-xl border transition-all ${
          telemetry.alarmStatus === 'CRITICAL'
            ? 'bg-red-950/80 border-red-500 text-red-200 scada-glow-red animate-pulse shadow-xl'
            : 'bg-[#0d131f] border-slate-800 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold">STAGE 3 (MAX)</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="font-bold text-lg">CRITICAL LEAK</div>
          <div className="text-[11px] mt-2 space-y-1">
            <div>• Gas ≥ 80% Threshold</div>
            <div>• Optical: Red Emergency Strobe</div>
            <div>• Siren: Continuous High Siren</div>
            <div>• Fan: 100% Full Exhaust Override</div>
          </div>
        </div>

      </div>

      {/* Sensor Fault Special Banner if triggered */}
      {telemetry.sensorStatus === 'DISCONNECTED' && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500 text-amber-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Unplug className="w-6 h-6 text-amber-400" />
            <div>
              <div className="font-bold uppercase tracking-wider text-sm">
                HARDWARE LINE FAULT: MQ-2 ANALOG TRACE DISCONNECTED
              </div>
              <div className="text-xs text-amber-300/80">
                Failsafe response triggered: Exhaust fan forced to safe maximum ventilation to prevent undetected gas accumulation.
              </div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 bg-amber-500/20 rounded border border-amber-500/50">
            FAILSAFE SAFE-STATE
          </span>
        </div>
      )}

      {/* Active Incident Overview & Sound Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Incident Summary Card */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" /> Current Emergency Incident Telemetry
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-sans">Active Alarm Level:</span>
              <span className="font-bold text-white">{telemetry.alarmStatus}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-sans">Trigger Concentration:</span>
              <span className="text-cyan-400 font-bold">{telemetry.gasLevel}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-sans">Operator Acknowledged:</span>
              <span className={telemetry.isAlarmAcknowledged ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.isAlarmAcknowledged ? 'YES (Muted siren tone)' : 'NO (Siren Active)'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-sans">FDCAN Alert Broadcast ID:</span>
              <span className="text-purple-400">0x0E0 (EMERGENCY_ALARM)</span>
            </div>
          </div>
        </div>

        {/* Audio Synthesis & Testing */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" /> Web Audio Synthesizer Tone Test
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Test each synthesized acoustic alarm tone configured for industrial control room annunciators:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => soundSynth.playBuzzer('WARNING')}
                className="p-2.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-semibold transition-all"
              >
                Test Warning Tone (650Hz)
              </button>
              <button
                onClick={() => soundSynth.playBuzzer('DANGER')}
                className="p-2.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-semibold transition-all"
              >
                Test Danger Beep (950Hz)
              </button>
              <button
                onClick={() => soundSynth.playBuzzer('CRITICAL')}
                className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold transition-all"
              >
                Test Critical Siren (880-1760Hz)
              </button>
              <button
                onClick={() => soundSynth.playBuzzer('FAULT')}
                className="p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
              >
                Test Sensor Fault Tone (440Hz)
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">View complete incident timeline:</span>
            <button
              onClick={() => setActiveTab('alarm-history')}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Alarm History Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
