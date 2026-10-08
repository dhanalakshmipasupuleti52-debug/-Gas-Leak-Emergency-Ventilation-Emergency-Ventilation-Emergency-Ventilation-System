import type { AlarmEvent, TelemetryData } from '../types';

export function exportAlarmHistoryCsv(events: AlarmEvent[], filename = 'gas_system_alarm_history.csv') {
  const headers = ['Timestamp', 'Event', 'Gas Level (%)', 'Fan PWM (%)', 'Alarm Level', 'Status', 'Message'];
  const rows = events.map(e => [
    `"${e.timestamp}"`,
    `"${e.event}"`,
    e.gasLevel.toFixed(1),
    e.fanPwm.toFixed(1),
    `"${e.alarmLevel}"`,
    `"${e.status}"`,
    `"${e.message.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportTelemetryCsv(dataPoints: TelemetryData[], filename = 'gas_system_telemetry.csv') {
  const headers = [
    'Timestamp',
    'Gas Level (%)',
    'Sensor Voltage (V)',
    'ADC Digital (12-bit)',
    'PID Error',
    'PID Output (%)',
    'Fan PWM (%)',
    'Fan RPM',
    'Safety Level',
    'Alarm Status',
    'Sensor Status'
  ];

  const rows = dataPoints.map(d => [
    `"${d.timestamp}"`,
    d.gasLevel.toFixed(1),
    d.sensorVoltage.toFixed(3),
    d.adcValue,
    d.pidError.toFixed(1),
    d.pidOutput.toFixed(1),
    d.fanPwm.toFixed(1),
    Math.round(d.fanRpm),
    `"${d.safetyLevel}"`,
    `"${d.alarmStatus}"`,
    `"${d.sensorStatus}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
