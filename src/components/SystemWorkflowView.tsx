import React, { useState } from 'react';
import { 
  Flame, 
  Binary, 
  Cpu, 
  Activity, 
  Sliders, 
  Zap, 
  Layers, 
  Fan, 
  Radio, 
  BellRing, 
  ArrowDown, 
  Code2, 
  FileText 
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: any;
  hardware: string;
  pins: string;
  explanation: string;
  codeSnippet: string;
}

export const SystemWorkflowView: React.FC = () => {
  const [selectedStepId, setSelectedStepId] = useState<string>('mcu');

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'sensor',
      number: 1,
      title: 'MQ-2 GAS SENSOR',
      subtitle: 'Electrochemical Sensing',
      icon: Flame,
      hardware: 'MQ-2 SnO2 Gas Sensor Module with onboard comparator and heater',
      pins: 'VCC (+5V), GND, AOUT → STM32 Pin PA3',
      explanation: 'Absorbs combustible hydrocarbon gas molecules onto heated Tin Dioxide (SnO2) sensing surface. Gas reduces material resistance, causing analog output voltage Vout to rise proportionately.',
      codeSnippet: `// Hardware Connection:
// MQ-2 AOUT connected to STM32 PA3 (ADC1_IN15)
// MQ-2 VCC connected to 5.0V supply rail
// MQ-2 GND connected to common digital ground`
    },
    {
      id: 'adc',
      number: 2,
      title: 'ADC SAMPLING',
      subtitle: 'Successive Approximation',
      icon: Binary,
      hardware: 'STM32H7 16-bit SAR ADC configured in 12-bit mode (0-4095)',
      pins: 'PA3 mapped to ADC1_IN15',
      explanation: 'Timer TIM3 triggers ADC regular conversions at exactly 1 kHz sampling frequency. Quantized reading ADC_Value = (Vin / 3.3V) * 4095 is transferred directly into memory via DMA circular buffer without CPU intervention.',
      codeSnippet: `/* HAL ADC DMA Start in STM32 main.c */
HAL_TIM_Base_Start(&htim3); // 1 kHz TRGO trigger
HAL_ADC_Start_DMA(&hadc1, (uint32_t*)&adc_raw_value, 1);

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef* hadc) {
    // Process new sample every 1 millisecond
    process_adc_sample(adc_raw_value);
}`
    },
    {
      id: 'mcu',
      number: 3,
      title: 'STM32H743ZI MCU',
      subtitle: 'Cortex-M7 480MHz Core',
      icon: Cpu,
      hardware: 'STM32H743ZI Nucleo-144 Board, 2MB Flash, 1MB RAM',
      pins: 'System Core, SysTick, NVIC interrupt management',
      explanation: 'High-performance ARM Cortex-M7 with Double-Precision FPU running real-time tasks: digital filtering of ADC words, closed-loop discrete PID mathematics, PWM duty cycle modulation, and CAN-FD communication.',
      codeSnippet: `/* System Clock Configuration: 480 MHz Core */
RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
RCC_OscInitStruct.PLL.PLLM = 4;
RCC_OscInitStruct.PLL.PLLN = 480;
RCC_OscInitStruct.PLL.PLLP = 2; // 480 MHz SYSCLK
HAL_RCC_OscConfig(&RCC_OscInitStruct);`
    },
    {
      id: 'processing',
      number: 4,
      title: 'GAS LEVEL PROCESSING',
      subtitle: 'Scaling & Threshold Evaluation',
      icon: Activity,
      hardware: 'STM32 Floating Point Unit (FPU)',
      pins: 'Internal DSP registers',
      explanation: 'Linearizes ADC counts into engineering units (0.0% to 100.0% concentration). Evaluates current safety band against stored thresholds (Normal < 30%, Warning 30-59%, Danger 60-79%, Critical >= 80%).',
      codeSnippet: `/* Scale 12-bit ADC word to 0-100% */
float gas_percentage = ((float)adc_raw_value / 4095.0f) * 100.0f;

if (gas_percentage >= CRITICAL_THRESHOLD) {
    system_alarm_state = STATE_CRITICAL;
} else if (gas_percentage >= DANGER_THRESHOLD) {
    system_alarm_state = STATE_DANGER;
} else if (gas_percentage >= WARNING_THRESHOLD) {
    system_alarm_state = STATE_WARNING;
} else {
    system_alarm_state = STATE_NORMAL;
}`
    },
    {
      id: 'pid',
      number: 5,
      title: 'PID CONTROLLER',
      subtitle: 'Discrete Closed-Loop Algorithm',
      icon: Sliders,
      hardware: 'Software execution on Cortex-M7 FPU',
      pins: 'Internal algorithm variables',
      explanation: 'Calculates dynamic ventilation demand based on error e(k) = gas_level - target. Employs trapezoidal numerical integration with anti-windup clamping to prevent overshoots while ensuring complete steady-state gas purge.',
      codeSnippet: `/* Discrete Closed-Loop PID Routine */
float error = gas_percentage - TARGET_SETPOINT;
if (error > 0.0f) {
    integral_sum += error * DT;
    if (integral_sum > MAX_I) integral_sum = MAX_I; // Anti-windup
    float derivative = (error - prev_error) / DT;
    pid_output = (Kp * error) + (Ki * integral_sum) + (Kd * derivative);
    prev_error = error;
} else {
    pid_output = 0.0f;
    integral_sum = 0.0f;
}
pid_output = clamp(pid_output, 0.0f, 100.0f);`
    },
    {
      id: 'pwm',
      number: 6,
      title: 'PWM GENERATION',
      subtitle: 'Timer Capture/Compare',
      icon: Zap,
      hardware: 'STM32 General-Purpose Advanced Timer 1 (TIM1)',
      pins: 'PA8 configured as TIM1_CH1 alternate function',
      explanation: 'Timer TIM1 configured in PWM Mode 1 generates high-frequency 25 kHz carrier square wave. The Capture/Compare Register (TIM1->CCR1) dynamically adjusts pulse width from 0% (OFF) to 100% (Full Speed).',
      codeSnippet: `/* Modulate PWM Duty Cycle on TIM1 Channel 1 */
uint32_t ccr_val = (uint32_t)((pid_output / 100.0f) * __HAL_TIM_GET_AUTORELOAD(&htim1));
__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, ccr_val);`
    },
    {
      id: 'motor-driver',
      number: 7,
      title: 'L298N MOTOR DRIVER',
      subtitle: 'Dual Full-Bridge Power Stage',
      icon: Layers,
      hardware: 'L298N Dual H-Bridge Driver IC with Flyback Diodes',
      pins: 'ENA (TIM1_CH1 / PA8), IN1 (PB0=HIGH), IN2 (PB1=LOW), +12V Motor Vcc',
      explanation: 'Isolates STM32 digital logic from industrial inductive fan load. Modulates 12V DC power supplied to the motor coils in direct proportion to TIM1 PWM duty cycle.',
      codeSnippet: `// Pin assignments:
// IN1 -> PB0 (GPIO_PIN_SET)
// IN2 -> PB1 (GPIO_PIN_RESET) -> Direction: Forward exhaust
// ENA -> PA8 (TIM1_CH1 PWM output 0-100%)
// OUT1, OUT2 connected to 12V Brushless Fan leads`
    },
    {
      id: 'exhaust-fan',
      number: 8,
      title: 'EXHAUST FAN',
      subtitle: 'Emergency Forced Air Displacement',
      icon: Fan,
      hardware: '12V High-CFM Industrial Ventilation Fan (up to 3200 RPM)',
      pins: 'Connected to L298N OUT1 & OUT2',
      explanation: 'Spins up dynamically to generate negative pressure inside the industrial duct, evacuating hazardous combustible gas safely to outside scrubber units.',
      codeSnippet: `// Ventilation Response Curve:
// 0% PWM   -> Fan OFF (0 RPM, 0 CFM)
// 30% PWM  -> Low Speed (~960 RPM, 135 CFM)
// 60% PWM  -> Normal Exhaust (~1920 RPM, 270 CFM)
// 100% PWM -> Max Emergency Evacuation (3200 RPM, 450 CFM)`
    },
    {
      id: 'fdcan',
      number: 9,
      title: 'FDCAN MONITORING',
      subtitle: 'ISO 11898-1:2015 Protocol Bus',
      icon: Radio,
      hardware: 'STM32 FDCAN1 Peripheral + TJA1051 CAN-FD Transceiver',
      pins: 'PD0 (FDCAN1_RX), PD1 (FDCAN1_TX)',
      explanation: 'Transmits high-speed prioritized telemetry frames across the industrial plant bus to central SCADA workstations at 1 Mbps nominal and 5 Mbps data phase.',
      codeSnippet: `/* Broadcast Telemetry Frame on FDCAN1 */
FDCAN_TxHeaderTypeDef txHeader;
txHeader.Identifier = 0x110; // GAS_METRICS
txHeader.IdType = FDCAN_STANDARD_ID;
txHeader.TxFrameType = FDCAN_DATA_FRAME;
txHeader.DataLength = FDCAN_DLC_BYTES_8;
HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &txHeader, txData);`
    },
    {
      id: 'alarm',
      number: 10,
      title: 'EMERGENCY ALARM',
      subtitle: 'Audio/Visual Annunciator',
      icon: BellRing,
      hardware: 'Piezoelectric Buzzer + High-Intensity Red LED Beacon',
      pins: 'PB14 (Buzzer PWM), PB7 (Strobe Relay)',
      explanation: 'Triggers visual strobe and acoustic warning tones when gas exceeds warning thresholds or when a sensor fault occurs, alerting facility personnel immediately.',
      codeSnippet: `if (system_alarm_state == STATE_CRITICAL) {
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_7, GPIO_PIN_SET); // Strobe ON
    TIM12->CCR1 = 500; // 50% duty audio buzzer siren
} else {
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_7, GPIO_PIN_RESET);
    TIM12->CCR1 = 0;
}`
    }
  ];

  const selectedStep = workflowSteps.find(s => s.id === selectedStepId) || workflowSteps[2];
  const SelectedIcon = selectedStep.icon;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          End-to-End Embedded Architecture & Signal Flow Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed hardware pipeline: Sensing → ADC → Processing → PID Control → PWM → Motor Driver → Ventilation → FDCAN → Alarm. Click any block to view pinouts and STM32 HAL C code.
        </p>
      </div>

      {/* Interactive Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Flow Steps */}
        <div className="lg:col-span-5 space-y-2">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = selectedStepId === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 border-cyan-400 shadow-md text-white' 
                      : 'bg-[#0e1422] hover:bg-[#131c2e] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      {step.number}
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-wide">{step.title}</div>
                      <div className="text-[10px] text-slate-400">{step.subtitle}</div>
                    </div>
                  </div>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                </button>

                {/* Animated Arrow Connector */}
                {idx < workflowSteps.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-500/60 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Detailed Block Inspector */}
        <div className="lg:col-span-7 bg-[#0e1422] border border-slate-800 rounded-xl p-6 shadow-xl sticky top-20 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <SelectedIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-400 font-semibold">STAGE {selectedStep.number} OF 10</div>
                <div className="text-base font-bold text-white">{selectedStep.title}</div>
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Active Stage
            </span>
          </div>

          {/* Hardware & Pinout Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Hardware Subsystem
              </div>
              <div className="text-white font-medium text-[11px]">{selectedStep.hardware}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-purple-400" /> Microcontroller Pinout
              </div>
              <div className="font-mono text-cyan-300 text-[11px]">{selectedStep.pins}</div>
            </div>
          </div>

          {/* Engineering Description */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Functional Description
            </div>
            <p className="text-slate-300 text-xs leading-relaxed bg-[#090d16] p-3.5 rounded-lg border border-slate-800">
              {selectedStep.explanation}
            </p>
          </div>

          {/* STM32 HAL C Code Snippet */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" /> STM32CubeIDE / HAL C Firmware Implementation
            </div>
            <pre className="p-4 rounded-lg bg-black/80 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
              {selectedStep.codeSnippet}
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
