import type {
  TelemetryData,
  FdcanFrame,
  AlarmEvent,
  SystemSettings,
  SimulationPreset,
  AlarmStatus,
  GasSafetyLevel,
  SensorStatus,
  FanStatus
} from '../types';
import { soundSynth } from '../utils/audioAlert';

export interface IDataProvider {
  getTelemetry(): TelemetryData;
  subscribe(callback: (data: TelemetryData) => void): () => void;
  setGasTarget(val: number): void;
  setSimulationPreset(preset: SimulationPreset): void;
  setManualGasLevel(level: number): void;
  disconnectSensor(): void;
  reconnectSensor(): void;
  acknowledgeAlarm(): void;
  updateSettings(settings: Partial<SystemSettings>): void;
  getSettings(): SystemSettings;
  resetSettingsToDefault(): void;
  sendFdcanFrame(customFrame?: Partial<FdcanFrame>): void;
  clearFdcanLogs(): void;
  clearAlarmHistory(): void;
  getFdcanHistory(): FdcanFrame[];
  getAlarmHistory(): AlarmEvent[];
  destroy(): void;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  safeGasThreshold: 29,
  warningThreshold: 59,
  dangerThreshold: 79,
  criticalThreshold: 80,
  kp: 1.8,
  ki: 0.35,
  kd: 0.45,
  samplingTimeMs: 500,
  targetGasLevel: 15,
  adcResolutionBits: 12,
  vRef: 3.3,
  adcSamplingFreqHz: 1000,
  maxFanPwm: 100,
  buzzerAudioEnabled: true,
  autoVentilationPhysics: true
};

const SETTINGS_STORAGE_KEY = 'stm32_gas_system_settings_v1';
const ALARM_STORAGE_KEY = 'stm32_gas_system_alarms_v1';

export class SimulationDataProvider implements IDataProvider {
  private subscribers: Set<(data: TelemetryData) => void> = new Set();
  private timerId: number | null = null;
  private settings: SystemSettings;

  // State variables
  private currentGasLevel: number = 18.0;      // Ambient air gas level %
  private targetSimGasLevel: number = 18.0;    // Target driven by preset or slider
  private isSensorConnected: boolean = true;
  private isAlarmAcknowledged: boolean = false;
  private activePreset: SimulationPreset = 'NORMAL';

  // Discrete PID state
  private integralSum: number = 0;
  private prevError: number = 0;

  // Buffers
  private fdcanLogs: FdcanFrame[] = [];
  private alarmLogs: AlarmEvent[] = [];
  private lastTelemetry: TelemetryData | null = null;
  private frameCounter: number = 1;
  private lastCanBroadcastTime: number = 0;
  private lastAudioAlertTime: number = 0;

  constructor() {
    this.settings = this.loadStoredSettings();
    this.alarmLogs = this.loadStoredAlarms();
    this.initDefaultFrames();
    this.startSimulationLoop();
  }

  private loadStoredSettings(): SystemSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(s: SystemSettings) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore
    }
  }

  private loadStoredAlarms(): AlarmEvent[] {
    try {
      const stored = localStorage.getItem(ALARM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'evt_init_1',
        timestamp: new Date().toLocaleTimeString(),
        event: 'System Boot Complete',
        gasLevel: 18.0,
        fanPwm: 0,
        alarmLevel: 'NORMAL',
        status: 'RESOLVED',
        message: 'STM32H743ZI gas monitoring loop initialized'
      }
    ];
  }

  private saveAlarms() {
    try {
      localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(this.alarmLogs.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  private initDefaultFrames() {
    const now = new Date().toLocaleTimeString();
    this.fdcanLogs = [
      {
        id: 'can_boot_1',
        canId: '0x100',
        name: 'SYS_BOOT',
        dlc: 8,
        data: '01 48 37 00 00 00 00 00',
        dataBytes: [0x01, 0x48, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00],
        timestamp: now,
        direction: 'TX',
        status: 'OK',
        node: 'STM32H7 Node (0x01)'
      }
    ];
  }

  private startSimulationLoop() {
    const tickInterval = 200; // ms
    this.timerId = window.setInterval(() => {
      this.tick(tickInterval);
    }, tickInterval);
  }

  private tick(dtMs: number) {
    const dtSeconds = dtMs / 1000;
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    // 1. Gas Concentration Dynamics
    if (!this.isSensorConnected) {
      // Sensor is disconnected: ambient reading drops to 0 at ADC input
      this.currentGasLevel = 0;
    } else {
      if (this.activePreset === 'RANDOM_LEAK') {
        // Random fluctuation between 35% and 85%
        if (Math.random() < 0.05) {
          this.targetSimGasLevel = 35 + Math.random() * 50;
        }
      } else if (this.activePreset === 'INCREASING') {
        // Slowly increase gas level
        this.targetSimGasLevel = Math.min(95, this.targetSimGasLevel + 0.8);
      }

      // Approach target smoothly
      const approachSpeed = 0.08;
      this.currentGasLevel += (this.targetSimGasLevel - this.currentGasLevel) * approachSpeed;

      // Ventilation effect: if fan is running and auto-physics enabled, fan actively clears gas!
      if (this.settings.autoVentilationPhysics && this.lastTelemetry && this.lastTelemetry.fanPwm > 0) {
        // Ventilation reduces gas back towards safe ambient (15%)
        const exhaustRate = (this.lastTelemetry.fanPwm / 100) * 0.45;
        if (this.targetSimGasLevel <= this.settings.targetGasLevel) {
          this.currentGasLevel = Math.max(12, this.currentGasLevel - exhaustRate);
        } else if (this.activePreset !== 'CRITICAL' && this.activePreset !== 'HIGH_GAS') {
          // If not held high, fan dissipates concentration
          this.currentGasLevel = Math.max(this.settings.targetGasLevel, this.currentGasLevel - exhaustRate * 0.5);
        }
      }

      // Add small analog noise (+- 0.15%)
      this.currentGasLevel += (Math.random() - 0.5) * 0.25;
      this.currentGasLevel = Math.max(0, Math.min(100, this.currentGasLevel));
    }

    // 2. ADC Quantization Calculation
    // Vin = (gasLevel / 100) * Vref
    const sensorVoltage = this.isSensorConnected 
      ? (this.currentGasLevel / 100) * this.settings.vRef 
      : 0.0;

    // ADC Formula: ADC Value = (Vin / Vref) * (2^N - 1)
    const maxAdcValue = Math.pow(2, this.settings.adcResolutionBits) - 1;
    const adcValue = this.isSensorConnected
      ? Math.round((sensorVoltage / this.settings.vRef) * maxAdcValue)
      : 0;

    // 3. Safety Level Determination
    let safetyLevel: GasSafetyLevel = 'NORMAL';
    if (!this.isSensorConnected) {
      safetyLevel = 'NORMAL'; // Sensor disconnected treated separately as FAULT
    } else if (this.currentGasLevel >= this.settings.criticalThreshold) {
      safetyLevel = 'CRITICAL';
    } else if (this.currentGasLevel >= this.settings.dangerThreshold) {
      safetyLevel = 'DANGER';
    } else if (this.currentGasLevel >= this.settings.warningThreshold) {
      safetyLevel = 'WARNING';
    } else {
      safetyLevel = 'NORMAL';
    }

    // 4. Alarm Status Determination
    let alarmStatus: AlarmStatus = 'NORMAL';
    let sensorStatus: SensorStatus = 'CONNECTED';

    if (!this.isSensorConnected) {
      sensorStatus = 'DISCONNECTED';
      alarmStatus = 'SENSOR_FAULT';
    } else {
      alarmStatus = safetyLevel;
    }

    // Check alarm history recording on transitions
    if (this.lastTelemetry && this.lastTelemetry.alarmStatus !== alarmStatus) {
      this.recordAlarmTransition(alarmStatus, this.currentGasLevel, timeStr);
      this.isAlarmAcknowledged = false; // Reset acknowledgement on new level
    }

    // 5. PID Calculation
    // u(k) = Kp * e(k) + Ki * sum(e(k)*dt) + Kd * (e(k) - e(k-1))/dt
    let pidError = 0;
    let pidP = 0;
    let pidI = 0;
    let pidD = 0;
    let pidOutput = 0;

    if (!this.isSensorConnected) {
      // Sensor fault failsafe: PWM forced to maximum safety ventilation
      pidError = 100;
      pidP = 100;
      pidI = 0;
      pidD = 0;
      pidOutput = 100;
    } else {
      // Normal PID calculation based on error above target
      pidError = this.currentGasLevel - this.settings.targetGasLevel;

      if (pidError > 0) {
        pidP = this.settings.kp * pidError;
        
        // Anti-windup clamping for integral sum
        this.integralSum += pidError * dtSeconds;
        this.integralSum = Math.max(0, Math.min(100 / (this.settings.ki || 1), this.integralSum));
        pidI = this.settings.ki * this.integralSum;

        pidD = this.settings.kd * ((pidError - this.prevError) / dtSeconds);
        this.prevError = pidError;

        pidOutput = pidP + pidI + pidD;
      } else {
        // Below target: no ventilation required or baseline idle
        this.integralSum = Math.max(0, this.integralSum - 0.5);
        this.prevError = 0;
        pidOutput = 0;
      }

      // Clamp PID output between 0 and 100%
      pidOutput = Math.max(0, Math.min(this.settings.maxFanPwm, pidOutput));
    }

    // If critical, force maximum PWM safety override
    if (safetyLevel === 'CRITICAL') {
      pidOutput = 100;
    }

    // 6. Fan PWM & Speed Response
    const fanPwm = Math.round(pidOutput);
    let fanStatus: FanStatus = 'OFF';
    if (fanPwm === 0) fanStatus = 'OFF';
    else if (fanPwm <= 30) fanStatus = 'LOW';
    else if (fanPwm <= 60) fanStatus = 'NORMAL';
    else if (fanPwm <= 80) fanStatus = 'HIGH';
    else fanStatus = 'MAXIMUM';

    const maxRpm = 3200;
    const fanRpm = Math.round((fanPwm / 100) * maxRpm);

    // 7. L298N Motor Driver State
    const l298nEffectiveVoltage = (fanPwm / 100) * 12.0; // 12V motor supply
    const chipTempC = 28 + (fanPwm / 100) * 22; // Ambient 28C to 50C full load

    // 8. Audio Buzzer Simulation
    const isBuzzerActive = (alarmStatus === 'CRITICAL' || alarmStatus === 'DANGER' || alarmStatus === 'SENSOR_FAULT') 
      && !this.isAlarmAcknowledged;

    const currentTimeMs = Date.now();
    if (isBuzzerActive && this.settings.buzzerAudioEnabled) {
      if (currentTimeMs - this.lastAudioAlertTime > (alarmStatus === 'CRITICAL' ? 1200 : 2500)) {
        this.lastAudioAlertTime = currentTimeMs;
        soundSynth.playBuzzer(alarmStatus === 'SENSOR_FAULT' ? 'FAULT' : alarmStatus as 'WARNING' | 'DANGER' | 'CRITICAL');
      }
    }

    // 9. FDCAN Periodic Broadcasting
    if (currentTimeMs - this.lastCanBroadcastTime >= 1000) {
      this.lastCanBroadcastTime = currentTimeMs;
      this.broadcastFdcanTelemetry(timeStr, this.currentGasLevel, fanPwm, alarmStatus, sensorStatus);
    }

    const telemetry: TelemetryData = {
      timestamp: timeStr,
      timeSeconds: Math.floor(currentTimeMs / 1000),
      gasLevel: parseFloat(this.currentGasLevel.toFixed(1)),
      targetGasLevel: this.settings.targetGasLevel,
      sensorVoltage: parseFloat(sensorVoltage.toFixed(3)),
      adcValue,
      adcResolutionBits: this.settings.adcResolutionBits,
      samplingFreqHz: this.settings.adcSamplingFreqHz,
      pidError: parseFloat(pidError.toFixed(1)),
      pidP: parseFloat(pidP.toFixed(1)),
      pidI: parseFloat(pidI.toFixed(1)),
      pidD: parseFloat(pidD.toFixed(1)),
      pidOutput: parseFloat(pidOutput.toFixed(1)),
      fanPwm,
      fanRpm,
      fanStatus,
      safetyLevel,
      alarmStatus,
      sensorStatus,
      fdcanStatus: 'CONNECTED',
      l298nState: {
        enA: fanPwm > 0,
        in1: fanPwm > 0,
        in2: false,
        effectiveVoltage: parseFloat(l298nEffectiveVoltage.toFixed(1)),
        chipTempC: parseFloat(chipTempC.toFixed(1))
      },
      isBuzzerActive,
      isAlarmAcknowledged: this.isAlarmAcknowledged
    };

    this.lastTelemetry = telemetry;
    this.notifySubscribers(telemetry);
  }

  private recordAlarmTransition(alarm: AlarmStatus, gasLevel: number, timestamp: string) {
    let eventName = 'Condition Normal';
    let msg = 'Gas concentration within safe threshold.';
    let status: 'ACTIVE' | 'RESOLVED' = 'RESOLVED';

    if (alarm === 'CRITICAL') {
      eventName = 'Emergency Gas Leak';
      msg = 'Gas concentration exceeded critical threshold! Full ventilation & siren active.';
      status = 'ACTIVE';
    } else if (alarm === 'DANGER') {
      eventName = 'High Gas Hazard';
      msg = 'Dangerous gas concentration detected. Increased exhaust ventilation.';
      status = 'ACTIVE';
    } else if (alarm === 'WARNING') {
      eventName = 'Gas Warning Triggered';
      msg = 'Gas level above safe threshold. Ventilation fan ramping up.';
      status = 'ACTIVE';
    } else if (alarm === 'SENSOR_FAULT') {
      eventName = 'Sensor Line Fault';
      msg = 'MQ-2 analog line open-circuit detected. Failsafe 100% ventilation engaged.';
      status = 'ACTIVE';
    }

    const newEvent: AlarmEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      event: eventName,
      gasLevel: parseFloat(gasLevel.toFixed(1)),
      fanPwm: this.lastTelemetry ? this.lastTelemetry.fanPwm : 0,
      alarmLevel: alarm,
      status,
      message: msg
    };

    this.alarmLogs.unshift(newEvent);
    if (this.alarmLogs.length > 100) this.alarmLogs.pop();
    this.saveAlarms();
  }

  private broadcastFdcanTelemetry(
    timestamp: string, 
    gas: number, 
    pwm: number, 
    alarm: AlarmStatus, 
    sensor: SensorStatus
  ) {
    const gasByte = Math.round(gas);
    const pwmByte = Math.round(pwm);
    const alarmCode = alarm === 'NORMAL' ? 0x00 : alarm === 'WARNING' ? 0x01 : alarm === 'DANGER' ? 0x02 : alarm === 'CRITICAL' ? 0x03 : 0xEE;
    const sensorCode = sensor === 'CONNECTED' ? 0x01 : 0x00;

    // Frame 1: 0x110 GAS_TELEMETRY
    const frame1: FdcanFrame = {
      id: `can_${this.frameCounter++}`,
      canId: '0x110',
      name: 'GAS_TELEMETRY',
      dlc: 8,
      data: `[GAS: ${gas.toFixed(1)}%] 0x${gasByte.toString(16).padStart(2, '0').toUpperCase()} 00 00 00`,
      dataBytes: [gasByte, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      timestamp,
      direction: 'TX',
      status: alarm === 'CRITICAL' ? 'EMERGENCY' : alarm === 'WARNING' ? 'WARNING' : 'OK',
      node: 'STM32H7 Node (0x01)'
    };

    // Frame 2: 0x120 FAN_PWM_PID
    const frame2: FdcanFrame = {
      id: `can_${this.frameCounter++}`,
      canId: '0x120',
      name: 'FAN_PWM_PID',
      dlc: 8,
      data: `[PWM: ${pwm}%] 0x${pwmByte.toString(16).padStart(2, '0').toUpperCase()} 00 00 00`,
      dataBytes: [pwmByte, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      timestamp,
      direction: 'TX',
      status: 'OK',
      node: 'STM32H7 Node (0x01)'
    };

    this.fdcanLogs.unshift(frame2);
    this.fdcanLogs.unshift(frame1);

    // Emergency high-priority frame if critical or fault
    if (alarm === 'CRITICAL' || alarm === 'SENSOR_FAULT') {
      const emFrame: FdcanFrame = {
        id: `can_${this.frameCounter++}`,
        canId: '0x0E0',
        name: alarm === 'SENSOR_FAULT' ? 'SENSOR_FAULT_ALERT' : 'EMERGENCY_ALARM',
        dlc: 8,
        data: `ALARM_CODE: 0x${alarmCode.toString(16).toUpperCase()} SENS: 0x${sensorCode.toString(16).toUpperCase()}`,
        dataBytes: [alarmCode, sensorCode, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00],
        timestamp,
        direction: 'TX',
        status: 'EMERGENCY',
        node: 'STM32H7 Node (0x01)'
      };
      this.fdcanLogs.unshift(emFrame);
    }

    if (this.fdcanLogs.length > 150) {
      this.fdcanLogs = this.fdcanLogs.slice(0, 150);
    }
  }

  public getTelemetry(): TelemetryData {
    if (!this.lastTelemetry) {
      return {
        timestamp: new Date().toLocaleTimeString(),
        timeSeconds: Math.floor(Date.now() / 1000),
        gasLevel: 18.0,
        targetGasLevel: this.settings.targetGasLevel,
        sensorVoltage: (18 / 100) * this.settings.vRef,
        adcValue: Math.round(((18 / 100) * this.settings.vRef / this.settings.vRef) * 4095),
        adcResolutionBits: 12,
        samplingFreqHz: 1000,
        pidError: 3.0,
        pidP: 5.4,
        pidI: 0.5,
        pidD: 0,
        pidOutput: 5.9,
        fanPwm: 6,
        fanRpm: 200,
        fanStatus: 'LOW',
        safetyLevel: 'NORMAL',
        alarmStatus: 'NORMAL',
        sensorStatus: 'CONNECTED',
        fdcanStatus: 'CONNECTED',
        l298nState: {
          enA: true,
          in1: true,
          in2: false,
          effectiveVoltage: 0.7,
          chipTempC: 28.5
        },
        isBuzzerActive: false,
        isAlarmAcknowledged: false
      };
    }
    return this.lastTelemetry;
  }

  public subscribe(callback: (data: TelemetryData) => void): () => void {
    this.subscribers.add(callback);
    if (this.lastTelemetry) {
      callback(this.lastTelemetry);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(data: TelemetryData) {
    this.subscribers.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error('Telemetry subscriber error:', err);
      }
    });
  }

  public setGasTarget(val: number): void {
    this.targetSimGasLevel = Math.max(0, Math.min(100, val));
  }

  public setManualGasLevel(level: number): void {
    this.isSensorConnected = true;
    this.activePreset = 'NORMAL';
    this.targetSimGasLevel = Math.max(0, Math.min(100, level));
    this.currentGasLevel = this.targetSimGasLevel;
  }

  public setSimulationPreset(preset: SimulationPreset): void {
    this.activePreset = preset;
    soundSynth.playClick();

    switch (preset) {
      case 'NORMAL':
        this.isSensorConnected = true;
        this.targetSimGasLevel = 18.0;
        break;
      case 'LOW_GAS':
        this.isSensorConnected = true;
        this.targetSimGasLevel = 38.0;
        break;
      case 'INCREASING':
        this.isSensorConnected = true;
        this.targetSimGasLevel = Math.max(25, this.currentGasLevel);
        break;
      case 'HIGH_GAS':
        this.isSensorConnected = true;
        this.targetSimGasLevel = 68.0;
        break;
      case 'CRITICAL':
        this.isSensorConnected = true;
        this.targetSimGasLevel = 92.0;
        break;
      case 'RANDOM_LEAK':
        this.isSensorConnected = true;
        this.targetSimGasLevel = 50.0;
        break;
      case 'SENSOR_DISCONNECT':
        this.disconnectSensor();
        break;
    }
  }

  public disconnectSensor(): void {
    this.isSensorConnected = false;
    this.activePreset = 'SENSOR_DISCONNECT';
    soundSynth.playClick();
  }

  public reconnectSensor(): void {
    this.isSensorConnected = true;
    this.targetSimGasLevel = 18.0;
    this.activePreset = 'NORMAL';
    soundSynth.playClick();
  }

  public acknowledgeAlarm(): void {
    this.isAlarmAcknowledged = true;
    soundSynth.stop();
    soundSynth.playClick();

    if (this.alarmLogs.length > 0 && this.alarmLogs[0].status === 'ACTIVE') {
      this.alarmLogs[0].status = 'ACKNOWLEDGED';
      this.saveAlarms();
    }
  }

  public updateSettings(newSettings: Partial<SystemSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    soundSynth.setMuted(!this.settings.buzzerAudioEnabled);
    this.saveSettings(this.settings);
  }

  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public resetSettingsToDefault(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    soundSynth.setMuted(!this.settings.buzzerAudioEnabled);
    this.saveSettings(this.settings);
  }

  public sendFdcanFrame(customFrame?: Partial<FdcanFrame>): void {
    const timeStr = new Date().toLocaleTimeString();
    const frame: FdcanFrame = {
      id: `can_manual_${Date.now()}`,
      canId: customFrame?.canId || '0x200',
      name: customFrame?.name || 'MANUAL_SCADA_REQ',
      dlc: customFrame?.dlc || 8,
      data: customFrame?.data || 'AA BB CC DD 01 02 03 04',
      dataBytes: customFrame?.dataBytes || [0xAA, 0xBB, 0xCC, 0xDD, 0x01, 0x02, 0x03, 0x04],
      timestamp: timeStr,
      direction: customFrame?.direction || 'RX',
      status: customFrame?.status || 'OK',
      node: customFrame?.node || 'SCADA Master (0x7F)'
    };

    this.fdcanLogs.unshift(frame);
    if (this.fdcanLogs.length > 150) this.fdcanLogs.pop();
    soundSynth.playClick();
  }

  public clearFdcanLogs(): void {
    this.fdcanLogs = [];
  }

  public clearAlarmHistory(): void {
    this.alarmLogs = [];
    this.saveAlarms();
  }

  public getFdcanHistory(): FdcanFrame[] {
    return [...this.fdcanLogs];
  }

  public getAlarmHistory(): AlarmEvent[] {
    return [...this.alarmLogs];
  }

  public destroy(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.subscribers.clear();
  }
}

export class HardwareDataProvider implements IDataProvider {
  private fallbackSim: SimulationDataProvider;
  private isConnected: boolean = false;

  constructor() {
    this.fallbackSim = new SimulationDataProvider();
  }

  public getTelemetry(): TelemetryData {
    const data = this.fallbackSim.getTelemetry();
    return {
      ...data,
      fdcanStatus: this.isConnected ? 'CONNECTED' : 'DISCONNECTED'
    };
  }

  public subscribe(callback: (data: TelemetryData) => void): () => void {
    return this.fallbackSim.subscribe(data => {
      callback({
        ...data,
        fdcanStatus: this.isConnected ? 'CONNECTED' : 'DISCONNECTED'
      });
    });
  }

  public setGasTarget(val: number): void {
    this.fallbackSim.setGasTarget(val);
  }

  public setSimulationPreset(preset: SimulationPreset): void {
    this.fallbackSim.setSimulationPreset(preset);
  }

  public setManualGasLevel(level: number): void {
    this.fallbackSim.setManualGasLevel(level);
  }

  public disconnectSensor(): void {
    this.fallbackSim.disconnectSensor();
  }

  public reconnectSensor(): void {
    this.fallbackSim.reconnectSensor();
  }

  public acknowledgeAlarm(): void {
    this.fallbackSim.acknowledgeAlarm();
  }

  public updateSettings(settings: Partial<SystemSettings>): void {
    this.fallbackSim.updateSettings(settings);
  }

  public getSettings(): SystemSettings {
    return this.fallbackSim.getSettings();
  }

  public resetSettingsToDefault(): void {
    this.fallbackSim.resetSettingsToDefault();
  }

  public sendFdcanFrame(customFrame?: Partial<FdcanFrame>): void {
    this.fallbackSim.sendFdcanFrame(customFrame);
  }

  public clearFdcanLogs(): void {
    this.fallbackSim.clearFdcanLogs();
  }

  public clearAlarmHistory(): void {
    this.fallbackSim.clearAlarmHistory();
  }

  public getFdcanHistory(): FdcanFrame[] {
    return this.fallbackSim.getFdcanHistory();
  }

  public getAlarmHistory(): AlarmEvent[] {
    return this.fallbackSim.getAlarmHistory();
  }

  public destroy(): void {
    this.fallbackSim.destroy();
  }
}
