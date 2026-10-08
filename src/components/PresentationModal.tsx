import React, { useState, useEffect } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  X, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Fan, 
  Sliders, 
  BellRing, 
  Cpu, 
  Activity,
  Layers
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

interface DemoStep {
  id: number;
  title: string;
  badge: string;
  gasTarget: number;
  explanation: string;
  embeddedConcept: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: '1. NORMAL AIR BASELINE',
    badge: 'NORMAL (18%)',
    gasTarget: 18,
    explanation: 'Ambient air is clean. Sensor analog voltage is low (~0.59V), ADC digital word is ~737. Error is zero or negative relative to setpoint.',
    embeddedConcept: 'STM32 ADC samples PA3 continuously at 1 kHz via DMA. PID controller calculates zero ventilation demand. TIM1_CH1 PWM stays at minimum baseline.'
  },
  {
    id: 2,
    title: '2. INITIAL GAS LEAK DETECTED',
    badge: 'LEAK ONSET (32%)',
    gasTarget: 32,
    explanation: 'Combustible gas begins accumulating. Sensor resistance Rs drops, causing ADC input voltage to rise above the 29% safe threshold.',
    embeddedConcept: 'STM32 software detects crossing of safe threshold. Generates initial warning event and transitions system state from NORMAL to WARNING.'
  },
  {
    id: 3,
    title: '3. WARNING STATE & PID ACTIVATION',
    badge: 'WARNING (45%)',
    gasTarget: 45,
    explanation: 'Gas concentration reaches 45%. Error e(k) = 45 - 15 = 30%. Proportional term Kp*e(k) demands higher fan ventilation.',
    embeddedConcept: 'Discrete closed-loop PID controller executes u(k) = P + I + D. Output reaches ~55% PWM. L298N motor driver ramps exhaust fan up to 1750 RPM.'
  },
  {
    id: 4,
    title: '4. DANGER HAZARD DETECTED',
    badge: 'DANGER (68%)',
    gasTarget: 68,
    explanation: 'Gas influx increases rapidly into the Danger zone (60–79%). Rate of gas rise Δe/Δt engages the Derivative Kd term for accelerated response.',
    embeddedConcept: 'Acoustic warning tone sounds. PWM expands to ~82% duty cycle (2600 RPM). FDCAN priority frame 0x110 transmits high warning status.'
  },
  {
    id: 5,
    title: '5. CRITICAL LEAK & EMERGENCY OVERRIDE',
    badge: 'CRITICAL (92%)',
    gasTarget: 92,
    explanation: 'Severe emergency gas concentration exceeds 80%. System triggers full facility safety response.',
    embeddedConcept: 'Safety override forces TIM1_CH1 PWM to 100% MAXIMUM (3200 RPM, 450 CFM). Emergency FDCAN packet 0x0E0 broadcasts immediately. Continuous audio siren active.'
  },
  {
    id: 6,
    title: '6. EMERGENCY FORCED VENTILATION ACTIVE',
    badge: 'MAX VENT (84% DISPERSING)',
    gasTarget: 75,
    explanation: 'Industrial exhaust duct operates at maximum CFM displacement, drawing heavy volume of air to evacuate flammable concentration.',
    embeddedConcept: 'L298N driver delivers full 12.0V to fan coils. Real-time graphs demonstrate PID saturation clamp and closed-loop control maintaining stability.'
  },
  {
    id: 7,
    title: '7. AIR EVACUATION & CONCENTRATION DECAY',
    badge: 'RECOVERY (36%)',
    gasTarget: 36,
    explanation: 'Hazardous gas is being rapidly purged from the room. Sensor voltage drops back through Danger into Warning territory.',
    embeddedConcept: 'PID error e(k) decreases. Anti-windup clamped integral term smoothly winds down, decelerating exhaust fan proportionally to prevent mechanical shock.'
  },
  {
    id: 8,
    title: '8. RETURN TO NORMAL SAFE STATE',
    badge: 'SAFE RESTORED (16%)',
    gasTarget: 16,
    explanation: 'Gas concentration drops below 29% safe threshold. Ambient air restored. Alarms automatically resolve and system logs incident.',
    embeddedConcept: 'FDCAN node reports SYSTEM: NORMAL (0x00). Fan returns to idle. All embedded subsystems continue non-blocking background monitoring.'
  }
];

export const PresentationModal: React.FC = () => {
  const { 
    isDemoModeOpen, 
    setIsDemoModeOpen, 
    telemetry, 
    telemetryHistory, 
    setManualGasLevel,
    reconnectSensor 
  } = useSystem();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Apply target gas level when step changes
  useEffect(() => {
    if (isDemoModeOpen) {
      reconnectSensor();
      setManualGasLevel(currentStep.gasTarget);
    }
  }, [currentStepIndex, isDemoModeOpen]);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isDemoModeOpen && isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= DEMO_STEPS.length - 1) {
            setIsAutoPlaying(false);
            return 0; // loop or stop
          }
          return prev + 1;
        });
      }, 4500); // 4.5 seconds per step
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDemoModeOpen, isAutoPlaying]);

  if (!isDemoModeOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                Examiner Presentation Mode
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                STAGE {currentStep.id} / {DEMO_STEPS.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Academic Walkthrough of Embedded Systems Gas Detection, PID Actuation & FDCAN Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              isAutoPlaying 
                ? 'bg-amber-600 text-white border-amber-500' 
                : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isAutoPlaying ? 'Pause Auto Sequence' : 'Auto-Play Sequence'}
          </button>

          <button
            onClick={() => {
              setIsAutoPlaying(false);
              setIsDemoModeOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Presentation Content */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between py-6 space-y-6">
        
        {/* Step Sequence Breadcrumb Indicator */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {DEMO_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStepIndex(idx);
              }}
              className={`p-2 rounded-lg border text-left transition-all ${
                idx === currentStepIndex 
                  ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400' 
                  : idx < currentStepIndex
                  ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400 opacity-80'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono font-bold">STEP {step.id}</div>
              <div className="text-[11px] font-semibold truncate mt-0.5">{step.title.split('. ')[1]}</div>
            </button>
          ))}
        </div>

        {/* Large Prominent SCADA Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Gas Level */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" /> Gas Concentration
            </div>
            <div className="font-mono text-5xl font-black text-white my-2">
              {telemetry.gasLevel}
              <span className="text-2xl text-slate-400">%</span>
            </div>
            <div className="text-xs text-cyan-300 font-mono">
              Analog: {telemetry.sensorVoltage.toFixed(3)} V | ADC: {telemetry.adcValue}
            </div>
          </div>

          {/* Card 2: Fan PWM */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <Fan className="w-4 h-4 text-cyan-400 animate-spin" /> Fan PWM Duty Cycle
            </div>
            <div className="font-mono text-5xl font-black text-cyan-400 my-2">
              {telemetry.fanPwm}
              <span className="text-2xl text-slate-400">%</span>
            </div>
            <div className="text-xs text-white font-mono">
              Speed: {telemetry.fanRpm} RPM ({telemetry.fanStatus})
            </div>
          </div>

          {/* Card 3: PID Controller Demand */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" /> Discrete PID Action
            </div>
            <div className="font-mono text-5xl font-black text-blue-400 my-2">
              {telemetry.pidOutput}
              <span className="text-2xl text-slate-400">%</span>
            </div>
            <div className="text-xs text-purple-300 font-mono">
              P: {telemetry.pidP}% | I: {telemetry.pidI}% | D: {telemetry.pidD}%
            </div>
          </div>

          {/* Card 4: Alarm Annunciator State */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <BellRing className="w-4 h-4 text-red-400" /> Annunciator & Bus
            </div>
            <div className={`font-mono text-3xl font-black my-3 ${
              telemetry.alarmStatus === 'CRITICAL' ? 'text-red-400 animate-pulse' :
              telemetry.alarmStatus === 'DANGER' ? 'text-orange-400' :
              telemetry.alarmStatus === 'WARNING' ? 'text-yellow-400' : 'text-emerald-400'
            }`}>
              {telemetry.alarmStatus}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              FDCAN 1.0/5.0 Mbps: ONLINE
            </div>
          </div>

        </div>

        {/* Live Presentation Real-time Graph */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> Real-Time Closed-Loop Response Curve
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-orange-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Gas Concentration (%)
              </span>
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Fan PWM Duty (%)
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '11px' }} />
                <Line type="monotone" dataKey="gasLevel" stroke="#f97316" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="fanPwm" stroke="#00f0ff" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Step Explanation & Embedded Principles Card */}
        <div className="bg-gradient-to-r from-[#0d1424] to-[#0a0f1a] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-cyan-300 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              {currentStep.title}
            </h3>
            <span className="px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
              Target: {currentStep.badge}
            </span>
          </div>

          <p className="text-white text-sm leading-relaxed">
            {currentStep.explanation}
          </p>

          <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
            <span className="text-emerald-400 font-bold uppercase font-sans text-[11px] block">
              Embedded Systems Principle Demonstrated:
            </span>
            <p className="leading-relaxed">
              {currentStep.embeddedConcept}
            </p>
          </div>
        </div>

        {/* Bottom Sequence Navigation Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Step
          </button>

          <div className="text-xs text-slate-400 font-mono">
            Step {currentStepIndex + 1} of {DEMO_STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === DEMO_STEPS.length - 1}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-950"
          >
            Next Sequence Step <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
