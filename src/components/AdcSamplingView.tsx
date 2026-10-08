import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Binary, 
  Activity, 
  Cpu, 
  Settings, 
  Zap
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

export const AdcSamplingView: React.FC = () => {
  const { telemetry, telemetryHistory, settings, setActiveTab } = useSystem();

  const maxAdcVal = Math.pow(2, settings.adcResolutionBits) - 1;
  const lsbStepMv = ((settings.vRef / maxAdcVal) * 1000).toFixed(3);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            STM32H7 ADC Sampling & Quantization Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Successive Approximation Register (SAR) Analog-to-Digital Converter peripheral simulation.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300">
            Clock: 480 MHz / ADC Pre: 1/4
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300">
            Fs: {settings.adcSamplingFreqHz} Hz
          </span>
        </div>
      </div>

      {/* Primary Quantization Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Sensor Voltage */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Analog Input Voltage (Vin)</div>
          <div className="font-mono text-3xl font-extrabold text-cyan-400">
            {telemetry.sensorVoltage.toFixed(3)}
            <span className="text-sm font-normal text-slate-400 ml-1">V</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono">
            Range: 0.000V – {settings.vRef.toFixed(1)}00V
          </div>
        </div>

        {/* Quantized ADC Register */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">ADC1-&gt;DR Digital Word</div>
          <div className="font-mono text-3xl font-extrabold text-emerald-400">
            {telemetry.adcValue}
            <span className="text-xs font-normal text-slate-300 ml-1">/ {maxAdcVal}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono">
            Hex: 0x{telemetry.adcValue.toString(16).padStart(4, '0').toUpperCase()}
          </div>
        </div>

        {/* Resolution & LSB Size */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Resolution & 1 LSB Size</div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {settings.adcResolutionBits}
            <span className="text-sm font-normal text-slate-400 ml-1">Bits</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono">
            1 LSB = {lsbStepMv} mV / step
          </div>
        </div>

        {/* Sampling Frequency & Channel */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-400 mb-1">Sampling Frequency</div>
          <div className="font-mono text-3xl font-extrabold text-purple-400">
            {settings.adcSamplingFreqHz}
            <span className="text-sm font-normal text-slate-400 ml-1">Hz</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono">
            Sample Time: {telemetry.timestamp}
          </div>
        </div>

      </div>

      {/* Live Waveform Chart */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Quantized ADC Digital Output Waveform
            </div>
            <div className="text-xs text-slate-400">
              Real-time conversion stream sampled into STM32 memory buffer via DMA circular mode
            </div>
          </div>
          <div className="font-mono text-xs text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/60">
            Sampling: Continuous Regular Channel 15
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, maxAdcVal]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', fontSize: '12px' }}
                formatter={(value: any) => [`${value} (0x${Number(value).toString(16).toUpperCase()})`, 'ADC Value']}
              />
              <Line 
                type="stepAfter" 
                dataKey="adcValue" 
                stroke="#00f0ff" 
                strokeWidth={2} 
                dot={false} 
                name="ADC Digital (12-bit)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Formula & Calculation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Math Calculation Card */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            ADC Quantization Mathematical Formula
          </div>

          <div className="p-4 rounded-lg bg-[#090d16] border border-cyan-500/30 text-cyan-300 font-mono text-sm space-y-2">
            <div className="font-bold text-center text-white py-1">
              ADC Value = (Vin / Vref) × (2^N - 1)
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 space-y-1">
              <div>• <span className="text-cyan-400">Vin</span> = Sensor analog voltage ({telemetry.sensorVoltage.toFixed(3)} V)</div>
              <div>• <span className="text-cyan-400">Vref</span> = Reference voltage ({settings.vRef.toFixed(1)} V from STM32 VDD/VREF+ pin)</div>
              <div>• <span className="text-cyan-400">N</span> = ADC Resolution ({settings.adcResolutionBits} bits → 2^{settings.adcResolutionBits} - 1 = {maxAdcVal})</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="text-slate-300 font-sans">Current Substitution:</span><br />
            ADC = ({telemetry.sensorVoltage.toFixed(3)} / {settings.vRef.toFixed(1)}) × {maxAdcVal} = <span className="text-emerald-400 font-bold">{telemetry.adcValue}</span>
          </div>
        </div>

        {/* STM32 Peripheral Hardware Reference */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 space-y-3 shadow-md text-xs">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            STM32H743ZI ADC Peripheral Configuration
          </div>
          
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In the physical STM32 firmware, the ADC is initialized using STM32CubeIDE HAL drivers with Timer Triggering to maintain exact 1 kHz equidistant sampling intervals:
          </p>

          <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
{`/* STM32CubeIDE HAL ADC Configuration */
hadc1.Instance = ADC1;
hadc1.Init.Resolution = ADC_RESOLUTION_12B;
hadc1.Init.ScanConvMode = ADC_SCAN_DISABLE;
hadc1.Init.ContinuousConvMode = DISABLE;
hadc1.Init.ExternalTrigConv = ADC_EXTERNALTRIG_T3_TRGO;
hadc1.Init.DataAlign = ADC_DATAALIGN_RIGHT;
HAL_ADC_Init(&hadc1);
HAL_ADC_Start_DMA(&hadc1, (uint32_t*)&adc_buffer, 1);`}
          </pre>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Settings className="w-3.5 h-3.5" /> Modify Vref & Resolution in Settings
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
