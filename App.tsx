
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ConnectionType, CircuitState, SimulationResult, LEDColor, BulbType } from './types';
import { BatteryVisual, BulbVisual, SwitchVisual, WireFlow, TransformerVisual } from './components/CircuitVisuals';
import { FormulaReference } from './components/FormulaReference';
import { QuizSection } from './components/QuizSection';
import { getCircuitExplanation } from './geminiService';
import { Sparkles, RefreshCcw, Info, Lightbulb, Battery, Zap, Settings2, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Gauge, Clock, TrendingUp, Palette, ToggleLeft, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<CircuitState>({
    batteryCount: 1,
    batteryConnection: ConnectionType.SERIES,
    bulbCount: 1,
    bulbConnection: ConnectionType.SERIES,
    bulbType: BulbType.REGULAR, 
    isOpen: true,
    transformerEnabled: false,
    transformerRatio: 1.0,
    ledColor: LEDColor.YELLOW,
    forwardVoltage: 1.8
  });

  const [batteryLife, setBatteryLife] = useState<number>(100);
  const [simulation, setSimulation] = useState<SimulationResult>({
    totalVoltage: 0,
    totalCurrentMA: 0,
    brightness: 0,
    isBurnedOut: false,
    isDrained: false,
    expectedMinutes: 0,
    explanation: "嘗試開啟變壓器並調整倍率，觀察看看電壓與耗電量之間的『平方關係』吧！"
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const drainInterval = useRef<number | null>(null);

  const BATTERY_CAPACITY_UNIT = 2000; 
  const BULB_RESISTANCE_UNIT = 15;    

  const [vPerBulb, setVPerBulb] = useState(0);

  const calculateCircuit = useCallback(() => {
    const { 
      batteryCount, batteryConnection, 
      bulbCount, bulbConnection, bulbType,
      isOpen, 
      transformerEnabled, transformerRatio,
      forwardVoltage 
    } = state;
    
    if (isOpen || batteryLife <= 0) {
      setSimulation(prev => ({ 
        ...prev, 
        totalVoltage: 0, 
        totalCurrentMA: 0,
        brightness: 0, 
        isBurnedOut: false,
        isDrained: batteryLife <= 0,
        expectedMinutes: 0
      }));
      setVPerBulb(0);
      return;
    }

    const vPerBattery = 1.5;
    const sourceVoltage = batteryConnection === ConnectionType.SERIES 
      ? batteryCount * vPerBattery 
      : vPerBattery;

    const totalResistance = bulbConnection === ConnectionType.SERIES 
      ? bulbCount * BULB_RESISTANCE_UNIT
      : BULB_RESISTANCE_UNIT / bulbCount;

    const outputVoltage = transformerEnabled ? sourceVoltage * transformerRatio : sourceVoltage;
    
    const vComp = bulbConnection === ConnectionType.SERIES 
      ? outputVoltage / bulbCount 
      : outputVoltage;
    
    setVPerBulb(vComp);

    const activeForwardVoltage = bulbType === BulbType.LED ? forwardVoltage : 0;
    const effectiveV = Math.max(0, vComp - activeForwardVoltage);
    
    const loadCurrent = (effectiveV > 0 ? (outputVoltage / totalResistance) : 0) * 1000; 
    const batteryDrawCurrent = transformerEnabled ? loadCurrent * transformerRatio : loadCurrent;
    
    let brightness = 0;
    if (vComp >= activeForwardVoltage) {
      if (bulbType === BulbType.LED) {
        // LED 亮度在過壓後增加極快
        const overdrive = vComp - activeForwardVoltage;
        brightness = Math.min(100, (Math.pow(overdrive, 0.8) / Math.pow(3, 0.8)) * 100);
      } else {
        // 一般燈泡亮度與電壓平方成正比，且在極低電壓時幾乎不亮
        if (vComp < 0.5) brightness = 0;
        else brightness = Math.min(100, (Math.pow(vComp, 2) / Math.pow(3.5, 2)) * 100);
      }
    }
    
    let isBurnedOut = vComp > (bulbType === BulbType.LED ? 5.5 : 9.0); 
    if (isBurnedOut) brightness = 0;

    const totalCapacity = BATTERY_CAPACITY_UNIT * batteryCount;
    const remainingMAH = (batteryLife / 100) * totalCapacity;
    const expectedMinutes = batteryDrawCurrent > 0 ? (remainingMAH / batteryDrawCurrent) * 60 : 0;

    setSimulation(prev => ({
      ...prev,
      totalVoltage: outputVoltage,
      totalCurrentMA: batteryDrawCurrent,
      brightness: brightness,
      isBurnedOut,
      isDrained: false,
      expectedMinutes: expectedMinutes
    }));
  }, [state, batteryLife]);

  useEffect(() => { calculateCircuit(); }, [calculateCircuit]);

  useEffect(() => {
    if (!state.isOpen && batteryLife > 0 && !simulation.isBurnedOut && simulation.totalCurrentMA > 0) {
      const totalCapacity = BATTERY_CAPACITY_UNIT * state.batteryCount;
      const percentPerSecond = (simulation.totalCurrentMA / 3600) / totalCapacity * 100;

      drainInterval.current = window.setInterval(() => {
        setBatteryLife(prev => Math.max(0, prev - (percentPerSecond * 3))); 
      }, 1000);
    } else {
      if (drainInterval.current) clearInterval(drainInterval.current);
    }
    return () => { if (drainInterval.current) clearInterval(drainInterval.current); };
  }, [state.isOpen, simulation.totalCurrentMA, simulation.isBurnedOut, state.batteryCount]);

  const handleAiAsk = async () => {
    setIsAiLoading(true);
    const text = await getCircuitExplanation(state, batteryLife);
    setSimulation(prev => ({ ...prev, explanation: text || "發生錯誤" }));
    setIsAiLoading(false);
  };

  const powerFactor = useMemo(() => {
    const baseCurrent = (1.5 / BULB_RESISTANCE_UNIT) * 1000;
    return simulation.totalCurrentMA / baseCurrent;
  }, [simulation.totalCurrentMA]);

  const getColorHex = (color: LEDColor) => {
    switch(color) {
      case LEDColor.RED: return 'bg-red-500';
      case LEDColor.GREEN: return 'bg-green-500';
      case LEDColor.BLUE: return 'bg-blue-500';
      case LEDColor.YELLOW: return 'bg-yellow-400';
      case LEDColor.WHITE: return 'bg-white border-slate-200';
      default: return 'bg-yellow-400';
    }
  };

  // 根據當前狀態產生的動態科學提示
  const getObservationTip = () => {
    if (state.isOpen) return "開關斷開中，目前沒有電流流動。試著關上開關來觀察！";
    if (simulation.isBurnedOut) return "糟糕！電壓太高把燈泡燒毀了！這就是『過載』，請重置實驗。";
    if (simulation.brightness === 0 && !state.isOpen) {
      if (state.bulbType === BulbType.LED) return "LED 不亮？檢查電壓是否超過了「導通電壓 (Vf)」。";
      return "電壓太低了，鎢絲沒辦法熱到發光喔。";
    }
    if (state.bulbType === BulbType.LED) return "LED 正在發光！它比一般燈泡省電非常多，而且亮得很快。";
    if (simulation.brightness > 80) return "燈泡變得很白很亮，鎢絲溫度極高，此時非常耗電！";
    return "正常發光中。觀察看看串聯電池時，亮度是不是明顯提升了？";
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center text-slate-800">
      <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-lg border-b-4 border-blue-400">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            電路實驗室 4.6：光與電的秘密
          </h1>
          <p className="text-gray-500 mt-1">混合串並聯模擬。觀察不同負載的亮度層次與耗能表現！</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button onClick={() => setBatteryLife(100)} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 font-bold shadow-sm active:scale-95 transition-all">
            <BatteryFull size={18} /> 更換全新電池
          </button>
          <button onClick={() => { setState({ batteryCount: 1, batteryConnection: ConnectionType.SERIES, bulbCount: 1, bulbConnection: ConnectionType.SERIES, bulbType: BulbType.REGULAR, isOpen: true, transformerEnabled: false, transformerRatio: 1.0, ledColor: LEDColor.YELLOW, forwardVoltage: 1.8 }); setBatteryLife(100); }} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 font-bold active:scale-95 transition-all">
            <RefreshCcw size={18} /> 重置實驗
          </button>
        </div>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <section className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-md border-t-4 border-indigo-400">
            <h2 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2"><Settings2 size={18} /> 實驗控制台</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Battery size={14}/> 電池配置</label>
                <div className="flex gap-1 mb-1">
                  <button onClick={() => setState(s=>({...s, batteryCount: Math.max(1, s.batteryCount-1)}))} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded py-1 transition-colors font-bold text-gray-700">-</button>
                  <button onClick={() => setState(s=>({...s, batteryCount: Math.min(10, s.batteryCount+1)}))} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded py-1 transition-colors font-bold text-gray-700">+</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setState(s=>({...s, batteryConnection: ConnectionType.SERIES}))} className={`flex-1 py-1 text-[10px] rounded transition-all ${state.batteryConnection === ConnectionType.SERIES ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200'}`}>串聯 (增壓)</button>
                  <button onClick={() => setState(s=>({...s, batteryConnection: ConnectionType.PARALLEL}))} className={`flex-1 py-1 text-[10px] rounded transition-all ${state.batteryConnection === ConnectionType.PARALLEL ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200'}`}>並聯 (耐用)</button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-inner">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><Lightbulb size={14}/> 選擇負載類型</label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setState(s => ({ ...s, bulbType: BulbType.REGULAR }))}
                    className={`flex-1 py-2 text-[10px] rounded font-bold transition-all ${state.bulbType === BulbType.REGULAR ? 'bg-amber-500 text-white shadow-md' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}
                  >
                    一般燈泡
                  </button>
                  <button 
                    onClick={() => setState(s => ({ ...s, bulbType: BulbType.LED }))}
                    className={`flex-1 py-2 text-[10px] rounded font-bold transition-all ${state.bulbType === BulbType.LED ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}
                  >
                    LED 燈泡
                  </button>
                </div>

                {state.bulbType === BulbType.LED && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">LED 顏色</p>
                      <div className="flex gap-1 justify-between">
                        {Object.values(LEDColor).map((color) => (
                          <button
                            key={color}
                            onClick={() => setState(s => ({ ...s, ledColor: color }))}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${state.ledColor === color ? 'border-indigo-500 scale-110 shadow-sm' : 'border-white'} ${getColorHex(color)}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">導通電壓 (Vf)</p>
                      <div className="grid grid-cols-3 gap-1">
                        {[1.8, 2.2, 3.2].map(v => (
                          <button
                            key={v}
                            onClick={() => setState(s => ({ ...s, forwardVoltage: v }))}
                            className={`py-1 text-[9px] rounded border transition-all ${state.forwardVoltage === v ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-indigo-50'}`}
                          >
                            {v}V
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">負載數量</label>
                <div className="flex gap-1 mb-1">
                  <button onClick={() => setState(s=>({...s, bulbCount: Math.max(1, s.bulbCount-1)}))} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded py-1 transition-colors font-bold text-gray-700">-</button>
                  <button onClick={() => setState(s=>({...s, bulbCount: Math.min(10, s.bulbCount+1)}))} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded py-1 transition-colors font-bold text-gray-700">+</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setState(s=>({...s, bulbConnection: ConnectionType.SERIES}))} className={`flex-1 py-1 text-[10px] rounded transition-all ${state.bulbConnection === ConnectionType.SERIES ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200'}`}>串聯</button>
                  <button onClick={() => setState(s=>({...s, bulbConnection: ConnectionType.PARALLEL}))} className={`flex-1 py-1 text-[10px] rounded transition-all ${state.bulbConnection === ConnectionType.PARALLEL ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200'}`}>並聯</button>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-700">變壓器 (秘密武器)</span>
                  <input type="checkbox" checked={state.transformerEnabled} onChange={e=>setState(s=>({...s, transformerEnabled: e.target.checked}))} className="accent-purple-600 cursor-pointer w-4 h-4" />
                </div>
                {state.transformerEnabled && (
                  <div className="grid grid-cols-4 gap-1">
                    {[0.5, 1, 1.5, 2].map(r => (
                      <button key={r} onClick={()=>setState(s=>({...s, transformerRatio: r}))} className={`py-1 text-[8px] rounded border transition-all ${state.transformerRatio === r ? 'bg-purple-600 text-white border-purple-700' : 'bg-white hover:bg-purple-100 border-purple-200'}`}>{r}x</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border-t-4 border-green-400">
            <h3 className="text-xs font-bold text-green-700 mb-3 flex items-center gap-1"><Gauge size={14}/> 能源即時監測</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500">電池剩餘電量</span>
                  <span className="text-xs font-bold">{batteryLife.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${batteryLife > 50 ? 'bg-green-500' : batteryLife > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${batteryLife}%` }} />
                </div>
              </div>
              {!state.isOpen && powerFactor > 1.2 && (
                <div className="p-2 bg-red-50 rounded-lg border border-red-100 animate-pulse">
                  <p className="text-[9px] text-red-600 leading-tight font-bold flex items-center gap-1">
                    <TrendingUp size={12}/> 高負載消耗中 ({powerFactor.toFixed(1)}x 速)
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 md:p-8 rounded-2xl shadow-md min-h-[520px] flex flex-col justify-between border-t-4 border-blue-500 relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10 w-full">
              {/* 視覺化電路圖 */}
              <BulbVisual 
                count={state.bulbCount} 
                connection={state.bulbConnection} 
                bulbType={state.bulbType}
                active={!state.isOpen && !simulation.isBurnedOut && !simulation.isDrained} 
                brightness={simulation.brightness} 
                ledColor={state.ledColor} 
                forwardVoltage={state.forwardVoltage}
                isBurnedOut={simulation.isBurnedOut}
              />
              <div className="w-full max-w-md flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-center gap-2">
                  <WireFlow active={!state.isOpen && !simulation.isDrained} speed={simulation.totalCurrentMA / 100} />
                  <SwitchVisual isOpen={state.isOpen} onClick={() => setState(s=>({...s, isOpen: !s.isOpen}))} />
                  <WireFlow active={!state.isOpen && !simulation.isDrained} speed={simulation.totalCurrentMA / 100} />
                </div>
                <TransformerVisual enabled={state.transformerEnabled} ratio={state.transformerRatio} active={!state.isOpen && !simulation.isDrained} />
              </div>
              <BatteryVisual count={state.batteryCount} connection={state.batteryConnection} active={!state.isOpen && !simulation.isDrained} />
            </div>

            {/* 觀察提示區塊 */}
            <div className="absolute top-4 right-4 max-w-[200px] bg-yellow-50 border-2 border-yellow-200 p-3 rounded-2xl shadow-sm z-20 animate-in fade-in zoom-in">
               <p className="text-[10px] font-black text-yellow-600 uppercase flex items-center gap-1 mb-1">
                 <Eye size={12} /> 觀察小提醒
               </p>
               <p className="text-[11px] text-yellow-800 leading-tight font-medium">
                 {getObservationTip()}
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-6 z-10">
              <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                <p className="text-[10px] text-blue-400 font-bold uppercase">總電壓</p>
                <p className={`text-xl font-bold ${simulation.isBurnedOut ? 'text-red-500' : 'text-blue-700'}`}>{simulation.totalVoltage.toFixed(1)}V</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
                <p className="text-[10px] text-orange-400 font-bold uppercase">總電流</p>
                <p className="text-xl font-bold text-orange-700">{simulation.totalCurrentMA.toFixed(0)}mA</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl text-center border border-yellow-100">
                <p className="text-[10px] text-yellow-500 font-bold uppercase">負載平均電壓</p>
                <p className="text-xl font-bold text-yellow-600">{vPerBulb.toFixed(2)}V</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl text-center border border-green-100">
                <p className="text-[10px] text-green-500 font-bold uppercase">預計壽命</p>
                <p className="text-xl font-bold text-green-700 flex items-center justify-center gap-1">
                  <Clock size={16} /> {simulation.expectedMinutes.toFixed(1)}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Sparkles className="text-yellow-500" /> AI 老師的實驗解說</h3>
              <button onClick={handleAiAsk} disabled={isAiLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100">
                {isAiLoading ? '觀察中...' : '這會有什麼結果？'}
              </button>
            </div>
            <p className="text-indigo-900 leading-relaxed text-sm bg-indigo-50/50 p-4 rounded-xl">{simulation.explanation}</p>
          </div>
          
          <FormulaReference state={state} simulation={simulation} />
        </section>
      </div>

      {/* 測驗區塊 */}
      <div className="w-full flex justify-center mt-12 mb-20 px-4">
        <QuizSection />
      </div>
    </div>
  );
};

export default App;
