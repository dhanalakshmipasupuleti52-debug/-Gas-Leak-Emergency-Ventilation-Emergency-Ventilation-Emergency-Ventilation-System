export type GasSafetyLevel = 'NORMAL' | 'WARNING' | 'DANGER' | 'CRITICAL';

export type AlarmStatus = 'NORMAL' | 'WARNING' | 'DANGER' | 'CRITICAL' | 'SENSOR_FAULT';

export type SensorStatus = 'CONNECTED' | 'DISCONNECTED' | 'FAULT';

export type FdcanStatus = 'CONNECTED' | 'DISCONNECTED' | 'TX_ACTIVE' | 'BUS_OFF';

export type FanStatus = 'OFF' | 'LOW' | 'NORMAL' | 'HIGH' | 'MAXIMUM';

export type SystemMode = 'SIMULATION' | 'HARDWARE';

export type SimulationPreset = 
  | 'NORMAL' 
  | 'LOW_GAS' 
  | 'INCREASING' 
  | 'HIGH_GAS' 
  | 'CRITICAL' 
  | 'SENSOR_DISCONNECT' 
  | 'RANDOM_LEAK';

export interface L298NState {
  enA: boolean;          // PWM enable pin on L298N
  in1: boolean;          // Logic pin 1 (Forward direction)
  in2: boolean;          // Logic pin 2 (Forward direction)
  effectiveVoltage: number; // e.g. 0 to 12V based on PWM duty cycle
  chipTempC: number;     // Estimated driver IC temperature in Celsius
}

export interface TelemetryData {
  timestamp: string;      // HH:mm:ss format
  timeSeconds: number;    // Epoch or run time in seconds
  gasLevel: number;       // 0 to 100%
  targetGasLevel: number; // Configured target gas level (e.g. 15%)
  sensorVoltage: number;  // 0 to 3.3V analog input
  adcValue: number;       // 0 to 4095 (for 12-bit)
  adcResolutionBits: number; // 12
  samplingFreqHz: number; // 1000 Hz
  pidError: number;       // gasLevel - targetGasLevel
  pidP: number;           // Proportional term
  pidI: number;           // Integral term
  pidD: number;           // Derivative term
  pidOutput: number;      // 0 to 100%
  fanPwm: number;         // 0 to 100% PWM Duty Cycle
  fanRpm: number;         // 0 to ~3200 RPM
  fanStatus: FanStatus;
  safetyLevel: GasSafetyLevel;
  alarmStatus: AlarmStatus;
  sensorStatus: SensorStatus;
  fdcanStatus: FdcanStatus;
  l298nState: L298NState;
  isBuzzerActive: boolean;
  isAlarmAcknowledged: boolean;
}

export interface FdcanFrame {
  id: string;
  canId: string;          // e.g. '0x110', '0x120', '0x130', '0x0E0'
  name: string;           // Message Identifier name
  dlc: number;            // Data length code (bytes)
  data: string;           // Hex formatted payload or summary
  dataBytes: number[];    // Raw byte values
  timestamp: string;      // Timestamp of packet
  direction: 'TX' | 'RX'; // TX from STM32, RX at SCADA monitor
  status: 'OK' | 'WARNING' | 'EMERGENCY' | 'FAULT';
  node: string;           // 'STM32H7 Node (0x01)' or 'SCADA Master (0x7F)'
}

export interface AlarmEvent {
  id: string;
  timestamp: string;
  event: string;
  gasLevel: number;
  fanPwm: number;
  alarmLevel: AlarmStatus;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  message: string;
}

export interface SystemSettings {
  safeGasThreshold: number;     // default 29%
  warningThreshold: number;     // default 59%
  dangerThreshold: number;      // default 79%
  criticalThreshold: number;    // default 80%
  kp: number;                   // Proportional gain (default 1.8)
  ki: number;                   // Integral gain (default 0.35)
  kd: number;                   // Derivative gain (default 0.45)
  samplingTimeMs: number;       // Sampling period in ms (default 500)
  targetGasLevel: number;       // Desired ambient target (default 15%)
  adcResolutionBits: number;    // 12-bit default (4095)
  vRef: number;                 // 3.3V reference voltage
  adcSamplingFreqHz: number;    // 1000 Hz
  maxFanPwm: number;            // 100%
  buzzerAudioEnabled: boolean;  // Audio synthesis enabled
  autoVentilationPhysics: boolean; // Fan dissipation physics
}

export interface TestCase {
  id: string;
  number: number;
  name: string;
  description: string;
  expectedResult: string;
  actualResult?: string;
  status: 'IDLE' | 'RUNNING' | 'PASS' | 'FAIL';
  timestamp?: string;
  details?: string;
}
