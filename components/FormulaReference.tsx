
import React from 'react';
import { CircuitState, ConnectionType, SimulationResult } from '../types';
import { Brain, Calculator, Equal, Zap } from 'lucide-react';

interface FormulaReferenceProps {
  state: CircuitState;
  simulation: SimulationResult;
}

export const FormulaReference: React.FC<FormulaReferenceProps> = ({ state, simulation }) => {
  // 基礎常數 (同步 App.tsx)
  const V_PER_BATTERY = 1.5;
  const R_PER_BULB = 15;

  // 計算邏輯說明
  const voltageCalc = state.batteryConnection === ConnectionType.SERIES 
    ? `${V_PER_BATTERY}V × ${state.batteryCount}顆 = ${simulation.totalVoltage.toFixed(1)}V`
    : `${V_PER_BATTERY}V (並聯電壓不變)`;

  const resistanceCalc = state.bulbConnection === ConnectionType.SERIES
    ? `${R_PER_BULB}Ω × ${state.bulbCount}個 = ${state.bulbCount * R_PER_BULB}Ω`
    : `${R_PER_BULB}Ω / ${state.bulbCount}個 = ${(R_PER_BULB / state.bulbCount).toFixed(1)}Ω`;

  return (
    <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl shadow-xl border-t-4 border-amber-400">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
        <Brain className="text-amber-400" size={20} />
        <h3 className="font-bold text-lg text-white">進階科學教室：電力公式運算</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 歐姆定律 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Calculator size={14} /> 歐姆定律 (Ohm's Law)
          </div>
          <div className="bg-slate-800 p-3 rounded-lg font-mono text-sm border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">公式：I (電流) = V (電壓) / R (電阻)</p>
            <div className="flex items-center gap-2 text-white">
              <span className="text-blue-400">{simulation.totalVoltage.toFixed(1)}V</span>
              <span>/</span>
              <span className="text-yellow-400">{(state.bulbConnection === ConnectionType.SERIES ? state.bulbCount * R_PER_BULB : R_PER_BULB / state.bulbCount).toFixed(1)}Ω</span>
              <Equal size={14} className="text-slate-500" />
              <span className="text-orange-400">{simulation.totalCurrentMA.toFixed(0)}mA</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">※ 電壓越高或電阻越小，電流就會越大。</p>
        </div>

        {/* 電力與功率 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Zap size={14} /> 功率與耗電 (Power)
          </div>
          <div className="bg-slate-800 p-3 rounded-lg font-mono text-sm border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">公式：P (功率) = V (電壓) × I (電流)</p>
            <div className="flex items-center gap-2 text-white">
              <span className="text-blue-400">{simulation.totalVoltage.toFixed(1)}V</span>
              <span>×</span>
              <span className="text-orange-400">{(simulation.totalCurrentMA / 1000).toFixed(3)}A</span>
              <Equal size={14} className="text-slate-500" />
              <span className="text-green-400">{(simulation.totalVoltage * (simulation.totalCurrentMA / 1000)).toFixed(2)}W (瓦特)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">※ 功率代表能量消耗的速度，這決定了你的燈泡有多亮。</p>
        </div>

        {/* 串並聯細節 */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="text-[11px] bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <span className="text-blue-400 font-bold block mb-1">電源端運算：</span>
            {voltageCalc}
          </div>
          <div className="text-[11px] bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <span className="text-yellow-400 font-bold block mb-1">負載端電阻：</span>
            {resistanceCalc}
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-amber-900/20 rounded-lg border border-amber-900/30">
        <h4 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
          為什麼變壓器 2x 會讓耗電變 4x？
        </h4>
        <p className="text-[10px] text-amber-100/80 leading-relaxed">
          這是因為功率 P = V² / R。當電壓 (V) 變成 2 倍時，2 的平方就是 4 倍！
          在實驗中，當你把電壓從 1.5V 提升到 3.0V 時，能量流失的速度會是指數級增長的。
        </p>
      </div>
    </div>
  );
};
