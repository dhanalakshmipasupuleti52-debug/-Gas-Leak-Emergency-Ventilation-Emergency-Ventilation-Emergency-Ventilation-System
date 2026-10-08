import { 
  Info, 
  Cpu, 
  Flame, 
  Layers, 
  Radio, 
  Sliders, 
  FileCode, 
  GitFork, 
  BookOpen
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          Project Architecture & Technical Specification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Academic Capstone Demonstration: Smart Industrial Gas Leak Emergency Ventilation System.
        </p>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-gradient-to-br from-[#0e1422] via-[#090d16] to-[#05070c] border border-cyan-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
            Embedded Systems Design & SCADA Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Industrial Gas Leak Emergency Ventilation System
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
            A safety-critical automated embedded control and supervision system designed to detect toxic/combustible industrial gas leaks, evaluate hazard levels in real time, execute closed-loop discrete PID exhaust fan modulation via Timer PWM, trigger multi-stage emergency audio/visual alarms, and broadcast deterministic telemetry packets across an ISO 11898-1:2015 FDCAN bus.
          </p>
        </div>
      </div>

      {/* Core Methodology Pipeline */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <GitFork className="w-4 h-4 text-cyan-400" />
          Core Engineering Methodology
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          {[
            { step: '1. SENSING', desc: 'MQ-2 SnO2 Gas Sensor', icon: Flame, color: 'text-orange-400' },
            { step: '2. PROCESSING', desc: 'STM32H7 SAR ADC + DMA', icon: Cpu, color: 'text-cyan-400' },
            { step: '3. CONTROL', desc: 'Discrete PID Algorithm', icon: Sliders, color: 'text-blue-400' },
            { step: '4. VENTILATION', desc: 'PWM + L298N H-Bridge Fan', icon: Layers, color: 'text-emerald-400' },
            { step: '5. MONITORING', desc: 'FDCAN 1/5 Mbps + SCADA', icon: Radio, color: 'text-purple-400' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2 flex flex-col items-center">
                <Icon className={`w-6 h-6 ${item.color}`} />
                <div className={`font-bold text-xs ${item.color}`}>{item.step}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware & Software Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hardware Specifications */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Hardware Architecture Specifications
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Microcontroller:</span>
              <span className="font-mono text-cyan-300 font-bold">STM32H743ZI (Nucleo-144)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Architecture:</span>
              <span className="font-mono text-white">ARM 32-bit Cortex-M7 with FPU @ 480 MHz</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Gas Sensor:</span>
              <span className="font-mono text-orange-300">MQ-2 Tin Dioxide (SnO2) Semiconductor</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Motor Driver:</span>
              <span className="font-mono text-white">L298N Dual H-Bridge Power Transistor Driver</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Exhaust Actuator:</span>
              <span className="font-mono text-white">12V High-CFM DC Brushless Fan (3200 RPM)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Bus Interface:</span>
              <span className="font-mono text-purple-300">FDCAN Transceiver (TJA1051 / MCP2562FD)</span>
            </div>
          </div>
        </div>

        {/* Software & Embedded Firmware Specifications */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            Embedded Firmware & Software Stack
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Language / Toolchain:</span>
              <span className="font-mono text-white">Embedded C / STM32CubeIDE / GCC ARM</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Hardware Abstraction:</span>
              <span className="font-mono text-cyan-300">STM32Cube HAL + LL (Low-Layer) Drivers</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Control Theory:</span>
              <span className="font-mono text-blue-300">Discrete Euler Closed-Loop PID + Anti-Windup</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Actuation Method:</span>
              <span className="font-mono text-white">TIM1 Hardware PWM (25 kHz Carrier)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Supervisory Interface:</span>
              <span className="font-mono text-purple-300">Industrial React + TypeScript SCADA Web App</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400 font-semibold">Bridge Architecture:</span>
              <span className="font-mono text-emerald-300">DataProvider Interface (Simulation / Hardware)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Academic Integrity & Hardware Bridge Note */}
      <div className="bg-[#0b1019] border border-cyan-500/30 rounded-xl p-5 space-y-2 text-xs">
        <div className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
          <BookOpen className="w-4 h-4" /> Academic Project Demonstration Notice & Examiner Guide
        </div>
        <p className="text-slate-300 leading-relaxed text-xs">
          This web application operates in <strong>Interactive High-Fidelity Simulation Mode</strong> for classroom and laboratory demonstration. It precisely solves the real discrete PID equations, converts analog sensor values using exact 12-bit STM32 successive-approximation quantization formulas, simulates L298N thermal/voltage dynamics, and serializes ISO 11898-1 FDCAN packets. 
        </p>
        <p className="text-slate-400 leading-relaxed text-xs">
          The code is architected with a decoupled <code className="text-cyan-300">IDataProvider</code> abstraction layer (<code className="text-cyan-300">SimulationDataProvider</code> and <code className="text-cyan-300">HardwareDataProvider</code>) so that physical STM32 Nucleo hardware streaming real sensor telemetry over UART / WebSerial or WebSocket bridge can be connected with zero UI refactoring.
        </p>
      </div>

    </div>
  );
};
