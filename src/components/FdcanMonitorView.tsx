import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Radio, 
  Send, 
  Trash2, 
  Unplug, 
  RotateCcw, 
  Activity, 
  Cpu, 
  Search
} from 'lucide-react';

export const FdcanMonitorView: React.FC = () => {
  const { 
    fdcanLogs, 
    sendFdcanFrame, 
    clearFdcanLogs
  } = useSystem();

  const [isBusConnected, setIsBusConnected] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'TX' | 'RX'>('ALL');

  const filteredLogs = fdcanLogs.filter(frame => {
    const matchesSearch = frame.canId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          frame.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          frame.data.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = directionFilter === 'ALL' || frame.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const txCount = fdcanLogs.filter(f => f.direction === 'TX').length;
  const rxCount = fdcanLogs.filter(f => f.direction === 'RX').length;

  const handleManualInject = () => {
    sendFdcanFrame({
      canId: '0x205',
      name: 'SCADA_FAN_OVERRIDE_CMD',
      dlc: 8,
      data: 'FE 64 01 00 00 00 00 00',
      dataBytes: [0xFE, 0x64, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00],
      direction: 'RX',
      status: 'OK',
      node: 'SCADA Master (0x7F)'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Bus Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            FDCAN (Flexible Data-Rate CAN) Bus Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ISO 11898-1:2015 Controller Area Network frame sniffer and telemetry bus protocol analyzer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBusConnected ? (
            <button
              onClick={() => setIsBusConnected(false)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Unplug className="w-3.5 h-3.5" /> Disconnect Bus
            </button>
          ) : (
            <button
              onClick={() => setIsBusConnected(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reconnect Bus
            </button>
          )}

          <button
            onClick={handleManualInject}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Inject Test Frame
          </button>

          <button
            onClick={clearFdcanLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
            title="Clear Frame Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Topology Visualization */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Physical FDCAN Bus Architecture</span>
          <span className="font-mono text-cyan-400 text-[11px]">Differential CANH / CANL (120Ω Terminated)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Node 1: STM32 Node */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/40 shadow-sm text-center space-y-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">STM32 Sensor & Actuator Node</div>
            <div className="font-mono text-[10px] text-cyan-400">Node ID: 0x01 | FDCAN1</div>
            <div className="text-[10px] text-slate-300 pt-1">
              MQ-2 ADC Sampling + PID Fan PWM Output
            </div>
          </div>

          {/* Central Bus Cable */}
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <span className="text-cyan-400">TX</span>
              <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded relative">
                <div className="absolute inset-0 bg-white/40 animate-pulse" />
              </div>
              <span className="text-purple-400">RX</span>
            </div>
            <div className="text-[10px] font-mono text-slate-300 mt-2">
              Nominal: 1.0 Mbps | Data Phase: 5.0 Mbps
            </div>
            <div className="text-[10px] text-slate-300">
              Bus Health: {isBusConnected ? 'ONLINE (100% ACK)' : 'BUS OFF / DISCONNECTED'}
            </div>
          </div>

          {/* Node 2: SCADA Monitoring Node */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-purple-500/40 shadow-sm text-center space-y-1">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-2">
              <Radio className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-xs">Industrial SCADA Gateway Node</div>
            <div className="font-mono text-[10px] text-purple-400">Node ID: 0x7F | Gateway</div>
            <div className="text-[10px] text-slate-300 pt-1">
              Central Safety Supervision & Annunciation
            </div>
          </div>
        </div>
      </div>

      {/* Bus Performance Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Bus Status</div>
          <div className={`font-mono text-xl font-bold mt-1 ${isBusConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {isBusConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
        </div>
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">TX Frames (STM32)</div>
          <div className="font-mono text-xl font-bold text-cyan-400 mt-1">{txCount}</div>
        </div>
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">RX Frames (Master)</div>
          <div className="font-mono text-xl font-bold text-purple-400 mt-1">{rxCount}</div>
        </div>
        <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Bit Error Rate (BER)</div>
          <div className="font-mono text-xl font-bold text-emerald-400 mt-1">0.0000 %</div>
        </div>
      </div>

      {/* Live FDCAN Terminal Frame Log */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Live Communication Log & Sniffer
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter buttons */}
            <div className="flex bg-[#090d16] border border-slate-800 rounded-lg p-0.5 text-[11px]">
              {(['ALL', 'TX', 'RX'] as const).map(dir => (
                <button
                  key={dir}
                  onClick={() => setDirectionFilter(dir)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    directionFilter === dir ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter ID / Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-lg bg-[#090d16] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Console-style terminal log */}
        <div className="w-full bg-[#07090e] border border-slate-900 rounded-lg p-3 font-mono text-xs max-h-96 overflow-y-auto space-y-1.5 shadow-inner">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-300 text-center py-6 font-sans text-xs">
              No FDCAN frames matching filter criteria.
            </div>
          ) : (
            filteredLogs.map(frame => (
              <div 
                key={frame.id} 
                className={`p-1.5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 border text-[11px] transition-colors ${
                  frame.status === 'EMERGENCY' ? 'bg-red-950/40 border-red-500/50 text-red-200' :
                  frame.status === 'WARNING' ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-200' :
                  frame.direction === 'TX' ? 'bg-cyan-950/15 border-cyan-900/40 text-cyan-200' :
                  'bg-purple-950/15 border-purple-900/40 text-purple-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-[10px]">[{frame.timestamp}]</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    frame.direction === 'TX' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-purple-500/30 text-purple-300'
                  }`}>
                    {frame.direction}
                  </span>
                  <span className="font-bold text-white">{frame.canId}</span>
                  <span className="text-slate-300">({frame.name})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-[10px]">DLC: {frame.dlc}</span>
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded border border-slate-800 text-white">
                    {frame.data}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
