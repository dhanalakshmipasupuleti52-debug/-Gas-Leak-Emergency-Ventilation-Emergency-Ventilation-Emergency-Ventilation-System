import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Settings, 
  RotateCcw, 
  Save, 
  Sliders, 
  Binary, 
  Flame, 
  Fan, 
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSettingsToDefault } = useSystem();
  const [formData, setFormData] = useState(settings);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  const handleChange = (key: keyof typeof settings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  const handleReset = () => {
    resetSettingsToDefault();
    setFormData(settings);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            System Configuration & Engineering Calibration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure safety grading thresholds, discrete PID gains, ADC quantization parameters, and failsafe behaviors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showSaveToast && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Gas Threshold Calibration */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Gas Safety Level Threshold Calibration (%)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Safe Ambient Max (%):
              </label>
              <input
                type="number"
                min="10"
                max="40"
                value={formData.safeGasThreshold}
                onChange={(e) => handleChange('safeGasThreshold', parseInt(e.target.value) || 29)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Default: 29% (0–29% NORMAL)</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Warning Threshold (%):
              </label>
              <input
                type="number"
                min="30"
                max="65"
                value={formData.warningThreshold}
                onChange={(e) => handleChange('warningThreshold', parseInt(e.target.value) || 59)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Default: 59% (30–59% WARNING)</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Danger Threshold (%):
              </label>
              <input
                type="number"
                min="60"
                max="79"
                value={formData.dangerThreshold}
                onChange={(e) => handleChange('dangerThreshold', parseInt(e.target.value) || 79)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Default: 79% (60–79% DANGER)</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Critical Threshold (%):
              </label>
              <input
                type="number"
                min="80"
                max="95"
                value={formData.criticalThreshold}
                onChange={(e) => handleChange('criticalThreshold', parseInt(e.target.value) || 80)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Default: 80% (80–100% CRITICAL)</span>
            </div>
          </div>
        </div>

        {/* 2. PID Algorithm Constants */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Discrete PID Controller Gains & Timing
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Kp (Proportional Gain):
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="5.0"
                value={formData.kp}
                onChange={(e) => handleChange('kp', parseFloat(e.target.value) || 1.8)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Immediate error proportional gain</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Ki (Integral Gain):
              </label>
              <input
                type="number"
                step="0.05"
                min="0.0"
                max="2.0"
                value={formData.ki}
                onChange={(e) => handleChange('ki', parseFloat(e.target.value) || 0.35)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-emerald-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Accumulated steady-state purge gain</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Kd (Derivative Gain):
              </label>
              <input
                type="number"
                step="0.05"
                min="0.0"
                max="2.0"
                value={formData.kd}
                onChange={(e) => handleChange('kd', parseFloat(e.target.value) || 0.45)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-orange-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Rate of gas change anticipation</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Sampling Time Ts (ms):
              </label>
              <input
                type="number"
                min="100"
                max="2000"
                step="50"
                value={formData.samplingTimeMs}
                onChange={(e) => handleChange('samplingTimeMs', parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-purple-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Periodic PID computation cycle</span>
            </div>
          </div>
        </div>

        {/* 3. Hardware & ADC Settings */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Binary className="w-4 h-4 text-emerald-400" />
            STM32 SAR ADC Peripheral Configuration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                ADC Resolution (N Bits):
              </label>
              <select
                value={formData.adcResolutionBits}
                onChange={(e) => handleChange('adcResolutionBits', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={10}>10-Bit (0–1023)</option>
                <option value={12}>12-Bit (0–4095, STM32 Default)</option>
                <option value={16}>16-Bit (0–65535, H7 High Res)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Reference Voltage Vref (V):
              </label>
              <select
                value={formData.vRef}
                onChange={(e) => handleChange('vRef', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={3.3}>3.3 V (STM32 Nucleo Default)</option>
                <option value={5.0}>5.0 V (5V Tolerant Rail)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Sampling Frequency (Hz):
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                step="100"
                value={formData.adcSamplingFreqHz}
                onChange={(e) => handleChange('adcSamplingFreqHz', parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Actuator & Audio Toggles */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Fan className="w-4 h-4 text-cyan-400" />
            Actuator Limits & Environmental Simulation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Maximum Fan PWM Duty Cycle (%):
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.maxFanPwm}
                onChange={(e) => handleChange('maxFanPwm', parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-300 mt-0.5 block">Safety ceiling clamp for ventilation fan</span>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoVentilationPhysics}
                  onChange={(e) => handleChange('autoVentilationPhysics', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-300 font-semibold">
                  Enable Airflow Dissipation Physics (Fan naturally reduces ambient gas)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.buzzerAudioEnabled}
                  onChange={(e) => handleChange('buzzerAudioEnabled', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-300 font-semibold">
                  Enable Audible SCADA Web Audio Siren Synthesizer
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-950"
          >
            <Save className="w-4 h-4" /> Save Engineering Settings
          </button>
        </div>

      </form>

    </div>
  );
};
