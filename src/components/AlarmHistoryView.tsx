import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Filter
} from 'lucide-react';
import { exportAlarmHistoryCsv } from '../utils/exportCsv';

export const AlarmHistoryView: React.FC = () => {
  const { alarmLogs, clearAlarmHistory } = useSystem();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredLogs = alarmLogs.filter(event => {
    const matchesSearch = event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.alarmLevel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || event.alarmLevel === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleExportCsv = () => {
    exportAlarmHistoryCsv(alarmLogs);
  };

  const getAlarmBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/50">CRITICAL</span>;
      case 'DANGER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-600/30 text-orange-300 border border-orange-500/50">DANGER</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-600/30 text-yellow-300 border border-yellow-500/50">WARNING</span>;
      case 'SENSOR_FAULT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600/30 text-amber-300 border border-amber-500/50">FAULT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/50">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Historical Event & Safety Alarm Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persistent timestamped audit trail of gas hazards, alarm transitions, and operator acknowledgements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Alarm CSV
          </button>

          <button
            onClick={clearAlarmHistory}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        
        {/* Severity Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          <div className="flex bg-[#090d16] border border-slate-800 rounded-lg p-0.5 text-xs">
            {['ALL', 'CRITICAL', 'DANGER', 'WARNING', 'NORMAL', 'SENSOR_FAULT'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] font-mono ${
                  severityFilter === lvl 
                    ? 'bg-cyan-600 text-white font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search events or messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#090d16] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event Name</th>
                <th className="px-4 py-3">Gas Level</th>
                <th className="px-4 py-3">Fan PWM</th>
                <th className="px-4 py-3">Alarm Level</th>
                <th className="px-4 py-3">Audit Status</th>
                <th className="px-4 py-3">Engineering Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No alarm history records matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(event => (
                  <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{event.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap font-sans">{event.event}</td>
                    <td className="px-4 py-3 text-cyan-400 font-bold">{event.gasLevel.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-purple-400 font-bold">{event.fanPwm.toFixed(1)}%</td>
                    <td className="px-4 py-3 whitespace-nowrap">{getAlarmBadge(event.alarmLevel)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        event.status === 'ACTIVE' ? 'bg-red-500/20 text-red-300' :
                        event.status === 'ACKNOWLEDGED' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-sans text-[11px] max-w-xs truncate" title={event.message}>
                      {event.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
