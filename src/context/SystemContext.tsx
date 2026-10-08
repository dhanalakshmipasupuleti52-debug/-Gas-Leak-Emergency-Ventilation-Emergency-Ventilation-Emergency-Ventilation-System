import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import type {
  TelemetryData,
  FdcanFrame,
  AlarmEvent,
  SystemSettings,
  SimulationPreset,
  SystemMode
} from '../types';
import { SimulationDataProvider, HardwareDataProvider } from '../services/DataProvider';
import type { IDataProvider } from '../services/DataProvider';
import { soundSynth } from '../utils/audioAlert';

interface SystemContextValue {
  telemetry: TelemetryData;
  telemetryHistory: TelemetryData[];
  fdcanLogs: FdcanFrame[];
  alarmLogs: AlarmEvent[];
  settings: SystemSettings;
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;
  activePreset: SimulationPreset;
  setSimulationPreset: (preset: SimulationPreset) => void;
  setManualGasLevel: (val: number) => void;
  disconnectSensor: () => void;
  reconnectSensor: () => void;
  acknowledgeAlarm: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettingsToDefault: () => void;
  sendFdcanFrame: (frame?: Partial<FdcanFrame>) => void;
  clearFdcanLogs: () => void;
  clearAlarmHistory: () => void;
  isBuzzerMuted: boolean;
  toggleBuzzerMute: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDemoModeOpen: boolean;
  setIsDemoModeOpen: (open: boolean) => void;
}

const SystemContext = createContext<SystemContextValue | null>(null);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemMode, setSystemModeState] = useState<SystemMode>('SIMULATION');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDemoModeOpen, setIsDemoModeOpen] = useState<boolean>(false);
  const [isBuzzerMuted, setIsBuzzerMuted] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<SimulationPreset>('NORMAL');

  // Maintain provider instance
  const simProviderRef = useRef<SimulationDataProvider | null>(null);
  const hwProviderRef = useRef<HardwareDataProvider | null>(null);

  if (!simProviderRef.current) {
    simProviderRef.current = new SimulationDataProvider();
  }
  if (!hwProviderRef.current) {
    hwProviderRef.current = new HardwareDataProvider();
  }

  const currentProvider: IDataProvider = systemMode === 'SIMULATION' 
    ? simProviderRef.current 
    : hwProviderRef.current;

  const [telemetry, setTelemetry] = useState<TelemetryData>(() => currentProvider.getTelemetry());
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [fdcanLogs, setFdcanLogs] = useState<FdcanFrame[]>(() => currentProvider.getFdcanHistory());
  const [alarmLogs, setAlarmLogs] = useState<AlarmEvent[]>(() => currentProvider.getAlarmHistory());
  const [settings, setSettings] = useState<SystemSettings>(() => currentProvider.getSettings());

  // Subscribe to telemetry ticks
  useEffect(() => {
    const unsubscribe = currentProvider.subscribe(newTelemetry => {
      setTelemetry(newTelemetry);
      
      // Update rolling telemetry history (keep last 60 points)
      setTelemetryHistory(prev => {
        const next = [...prev, newTelemetry];
        return next.length > 60 ? next.slice(next.length - 60) : next;
      });

      // Update CAN and Alarm logs
      setFdcanLogs(currentProvider.getFdcanHistory());
      setAlarmLogs(currentProvider.getAlarmHistory());
    });

    return () => {
      unsubscribe();
    };
  }, [currentProvider]);

  const handleSetSystemMode = (mode: SystemMode) => {
    setSystemModeState(mode);
    soundSynth.playClick();
  };

  const handleSetSimulationPreset = (preset: SimulationPreset) => {
    setActivePreset(preset);
    currentProvider.setSimulationPreset(preset);
  };

  const handleSetManualGasLevel = (val: number) => {
    currentProvider.setManualGasLevel(val);
  };

  const handleDisconnectSensor = () => {
    setActivePreset('SENSOR_DISCONNECT');
    currentProvider.disconnectSensor();
  };

  const handleReconnectSensor = () => {
    setActivePreset('NORMAL');
    currentProvider.reconnectSensor();
  };

  const handleAcknowledgeAlarm = () => {
    currentProvider.acknowledgeAlarm();
    setAlarmLogs(currentProvider.getAlarmHistory());
  };

  const handleUpdateSettings = (newSettings: Partial<SystemSettings>) => {
    currentProvider.updateSettings(newSettings);
    setSettings(currentProvider.getSettings());
  };

  const handleResetSettingsToDefault = () => {
    currentProvider.resetSettingsToDefault();
    setSettings(currentProvider.getSettings());
  };

  const handleSendFdcanFrame = (frame?: Partial<FdcanFrame>) => {
    currentProvider.sendFdcanFrame(frame);
    setFdcanLogs(currentProvider.getFdcanHistory());
  };

  const handleClearFdcanLogs = () => {
    currentProvider.clearFdcanLogs();
    setFdcanLogs([]);
  };

  const handleClearAlarmHistory = () => {
    currentProvider.clearAlarmHistory();
    setAlarmLogs([]);
  };

  const toggleBuzzerMute = () => {
    const nextMuted = !isBuzzerMuted;
    setIsBuzzerMuted(nextMuted);
    soundSynth.setMuted(nextMuted);
  };

  const contextValue = useMemo<SystemContextValue>(() => ({
    telemetry,
    telemetryHistory,
    fdcanLogs,
    alarmLogs,
    settings,
    systemMode,
    setSystemMode: handleSetSystemMode,
    activePreset,
    setSimulationPreset: handleSetSimulationPreset,
    setManualGasLevel: handleSetManualGasLevel,
    disconnectSensor: handleDisconnectSensor,
    reconnectSensor: handleReconnectSensor,
    acknowledgeAlarm: handleAcknowledgeAlarm,
    updateSettings: handleUpdateSettings,
    resetSettingsToDefault: handleResetSettingsToDefault,
    sendFdcanFrame: handleSendFdcanFrame,
    clearFdcanLogs: handleClearFdcanLogs,
    clearAlarmHistory: handleClearAlarmHistory,
    isBuzzerMuted,
    toggleBuzzerMute,
    activeTab,
    setActiveTab,
    isDemoModeOpen,
    setIsDemoModeOpen
  }), [
    telemetry,
    telemetryHistory,
    fdcanLogs,
    alarmLogs,
    settings,
    systemMode,
    activePreset,
    isBuzzerMuted,
    activeTab,
    isDemoModeOpen
  ]);

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = (): SystemContextValue => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
