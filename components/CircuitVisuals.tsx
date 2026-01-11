
import React from 'react';
import { ConnectionType, LEDColor, BulbType } from '../types';

interface ComponentProps {
  count: number;
  connection: ConnectionType;
  bulbType: BulbType;
  active: boolean;
  brightness?: number;
  ledColor?: LEDColor;
  forwardVoltage?: number;
  isBurnedOut?: boolean;
}

const Tooltip: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg -top-12 left-1/2 -translate-x-1/2 w-32 pointer-events-none border border-slate-600">
    <p className="font-bold border-b border-slate-600 mb-1">{title}</p>
    <p className="text-slate-300 leading-tight">{desc}</p>
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-600"></div>
  </div>
);

export const BatteryVisual: React.FC<{ count: number; connection: ConnectionType; active: boolean }> = ({ count, connection }) => {
  const batteries = Array.from({ length: count });
  
  return (
    <div className={`group flex ${connection === ConnectionType.SERIES ? 'flex-row flex-wrap justify-center' : 'flex-col items-center'} gap-2 p-4 bg-white/50 rounded-xl border-2 border-dashed border-blue-200 relative max-w-full`}>
      <Tooltip 
        title={`電池 (${connection === ConnectionType.SERIES ? '串聯' : '並聯'})`} 
        desc="電源核心。每顆提供 1.5V 電壓。串聯增加推力，並聯增加持久度。" 
      />
      {batteries.map((_, i) => (
        <div key={i} className="relative">
          <svg width="60" height="30" viewBox="0 0 60 30" className="drop-shadow-sm">
            <rect x="5" y="5" width="45" height="20" rx="2" fill="#3b82f6" />
            <rect x="50" y="10" width="5" height="10" rx="1" fill="#1d4ed8" />
            <text x="27" y="20" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">1.5V</text>
            <text x="10" y="20" fontSize="12" fill="white" fontWeight="bold">-</text>
            <text x="40" y="20" fontSize="12" fill="white" fontWeight="bold">+</text>
          </svg>
        </div>
      ))}
      <span className="absolute -top-3 left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
        電池 ({connection === ConnectionType.SERIES ? '串聯' : '並聯'}) x {count}
      </span>
    </div>
  );
};

export const TransformerVisual: React.FC<{ enabled: boolean; ratio: number; active: boolean }> = ({ enabled, ratio, active }) => {
  if (!enabled) return <div className="w-12 h-1 bg-gray-300 rounded-full" />;

  return (
    <div className="relative group flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200 transition-all hover:border-purple-400">
      <Tooltip 
        title={`變壓器 (${ratio}x)`} 
        desc={`透過電磁原理改變電壓。目前將輸入電壓乘上 ${ratio} 倍，這也會大幅改變耗電速度。`} 
      />
      <svg width="60" height="50" viewBox="0 0 60 50">
        <path d="M10 15 Q15 5 20 15 Q25 5 30 15 Q35 5 40 15" fill="none" stroke="#a855f7" strokeWidth="3" />
        <rect x="10" y="20" width="40" height="10" rx="2" fill="#64748b" />
        <path d="M10 35 Q15 45 20 35 Q25 45 30 35 Q35 45 40 35" fill="none" stroke={active ? "#e879f9" : "#a855f7"} strokeWidth={ratio > 1 ? "5" : "2"} />
        {active && <circle cx="50" cy="25" r="3" fill="#fbbf24" className="animate-ping" />}
      </svg>
      <span className="text-[10px] font-bold text-purple-700 mt-1">{ratio}x 變壓</span>
      <span className="absolute -top-3 left-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
        變壓器
      </span>
    </div>
  );
};

export const BulbVisual: React.FC<ComponentProps> = ({ count, connection, bulbType, active, brightness = 0, ledColor = LEDColor.YELLOW, forwardVoltage = 1.8, isBurnedOut = false }) => {
  const bulbs = Array.from({ length: count });
  const normalizedBrightness = active ? brightness / 100 : 0;

  const getLightColor = (color: LEDColor) => {
    switch(color) {
      case LEDColor.RED: return { glow: 'rgba(239, 68, 68, ', tint: '#ef4444', unlit: '#fee2e2' };
      case LEDColor.GREEN: return { glow: 'rgba(34, 197, 94, ', tint: '#22c55e', unlit: '#dcfce7' };
      case LEDColor.BLUE: return { glow: 'rgba(59, 130, 246, ', tint: '#3b82f6', unlit: '#dbeafe' };
      case LEDColor.YELLOW: return { glow: 'rgba(253, 224, 71, ', tint: '#fde047', unlit: '#fef9c3' };
      case LEDColor.WHITE: return { glow: 'rgba(255, 255, 255, ', tint: '#ffffff', unlit: '#f3f4f6' };
      default: return { glow: 'rgba(253, 224, 71, ', tint: '#fde047', unlit: '#fef9c3' };
    }
  };

  const colorConfig = getLightColor(ledColor);

  const renderRegularBulb = (isActive: boolean, currentBrightness: number) => {
    const isGlowing = isActive && currentBrightness > 0;
    // 一般燈泡絲極隨亮度改變顏色：暗紅 -> 橙 -> 黃白
    let filamentColor = '#64748b'; // 未通電
    if (isBurnedOut) filamentColor = '#1e293b';
    else if (isGlowing) {
      if (currentBrightness < 30) filamentColor = '#ef4444'; // 暗紅
      else if (currentBrightness < 70) filamentColor = '#f59e0b'; // 橙
      else filamentColor = '#fbbf24'; // 耀眼黃
    }

    const pulseSpeed = isGlowing ? (1.5 - (currentBrightness / 100)) : 1.5;
    
    return (
      <svg width="50" height="70" viewBox="0 0 50 70">
        <rect x="15" y="55" width="20" height="15" fill="#94a3b8" />
        <rect x="15" y="55" width="20" height="2" fill="#64748b" />
        <rect x="15" y="60" width="20" height="2" fill="#64748b" />
        <circle cx="25" cy="35" r="20" fill={isGlowing ? `rgba(251, 191, 36, ${0.1 + (currentBrightness/200)})` : "rgba(255,255,255,0.05)"} stroke="#cbd5e1" strokeWidth="1" />
        <path 
          d="M20 55 L20 45 Q20 30 25 30 Q30 30 30 45 L30 55" 
          fill="none" 
          stroke={filamentColor} 
          strokeWidth={isGlowing ? 2 : 1.5} 
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {isGlowing && (
          <path 
            d="M22 35 Q25 32 28 35" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="2" 
            strokeLinecap="round" 
            style={{ animation: `pulse ${pulseSpeed}s ease-in-out infinite` }} 
          />
        )}
        {isBurnedOut && (
          <path d="M15 30 L35 40 M15 40 L35 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    );
  };

  const renderLEDShape = (isActive: boolean, currentBrightness: number) => {
    const isGlowing = isActive && currentBrightness > 0;
    const isOverdriven = currentBrightness > 90 || isBurnedOut;
    const isWhiteLED = ledColor === LEDColor.WHITE;
    const bodyColor = isBurnedOut ? '#475569' : (isGlowing ? colorConfig.tint : colorConfig.unlit);
    
    const pulseSpeed = isGlowing ? (0.8 - (currentBrightness / 200)) : 0.8;

    return (
      <svg width="40" height="60" viewBox="0 0 50 70">
        <line x1="18" y1="55" x2="18" y2="70" stroke="#94a3b8" strokeWidth="2" />
        <line x1="32" y1="55" x2="32" y2="70" stroke="#94a3b8" strokeWidth="2" />
        <rect x="15" y="50" width="20" height="5" fill="#cbd5e1" />
        <path d="M10 50 L40 50 L40 30 Q40 10 25 10 Q10 10 10 30 Z" fill={bodyColor} fillOpacity={isGlowing ? 0.95 : 0.6} stroke="#cbd5e1" strokeWidth="1" />
        
        {!isGlowing && !isBurnedOut && isWhiteLED && (
          <circle cx="25" cy="35" r="5" fill="#fde047" fillOpacity="0.7" />
        )}

        {isGlowing && (
          <circle 
            cx="25" cy="30" r="12" 
            fill="white" 
            fillOpacity={0.6} 
            filter="blur(4px)" 
            style={{ animation: `pulse ${pulseSpeed}s ease-in-out infinite` }} 
          />
        )}

        {isBurnedOut && (
          <g stroke="#1e293b" strokeWidth="2">
            <line x1="15" y1="20" x2="35" y2="40" />
            <line x1="35" y1="20" x2="15" y2="40" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className={`group flex ${connection === ConnectionType.SERIES ? 'flex-row flex-wrap justify-center' : 'flex-col items-center'} gap-6 p-8 bg-white/50 rounded-2xl border-2 border-dashed border-yellow-200 relative transition-all hover:border-yellow-400 max-w-full shadow-inner`}>
      <Tooltip 
        title={bulbType === BulbType.LED ? "發光二極體 (LED)" : "一般燈泡 (鎢絲)"} 
        desc={bulbType === BulbType.LED ? "具有單向導電性，電壓越高反應越快，超過 Vf 會變得很亮。" : "鎢絲受熱發光，亮度隨電壓平方增加，非常耗能。"} 
      />
      
      {/* 亮度提示標籤 */}
      {active && !isBurnedOut && brightness > 0 && (
        <div className="absolute -right-2 top-2 rotate-12 bg-yellow-400 text-white text-[9px] px-2 py-0.5 rounded-md font-black shadow-lg animate-bounce pointer-events-none uppercase tracking-tighter">
          {brightness > 80 ? '超亮 (危險)' : brightness > 40 ? '明亮' : '微光'}
        </div>
      )}

      {bulbs.map((_, i) => (
        <div key={i} className="relative flex flex-col items-center">
          {active && brightness > 0 && !isBurnedOut && (
            <div 
              className="absolute top-2 w-20 h-20 rounded-full blur-3xl transition-all duration-300" 
              style={{ 
                backgroundColor: `${colorConfig.glow}${normalizedBrightness * 0.8})`, 
                transform: `scale(${1 + (normalizedBrightness * 1.5)})`,
                opacity: 0.5 + (normalizedBrightness * 0.5)
              }}
            />
          )}
          {bulbType === BulbType.LED ? renderLEDShape(active, brightness) : renderRegularBulb(active, brightness)}
        </div>
      ))}
      <span className={`absolute -top-3 left-2 text-white text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors shadow-sm ${isBurnedOut ? 'bg-red-600' : 'bg-yellow-500'}`}>
        {bulbType === BulbType.LED ? `LED ${ledColor}` : '一般燈泡'} x {count}
      </span>
    </div>
  );
};

export const SwitchVisual: React.FC<{ isOpen: boolean; onClick: () => void }> = ({ isOpen, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-4 bg-white/50 rounded-xl border-2 border-dashed border-green-200 hover:bg-green-50 transition-all hover:border-green-400 active:scale-95"
    >
      <Tooltip 
        title="開關" 
        desc={isOpen ? "目前是斷開狀態，電路不通。" : "目前是閉合狀態，電流可以流過。"} 
      />
      <svg width="60" height="40" viewBox="0 0 80 40">
        <circle cx="20" cy="30" r="4" fill="#166534" />
        <circle cx="60" cy="30" r="4" fill="#166534" />
        <line 
          x1="20" y1="30" 
          x2={isOpen ? "45" : "60"} 
          y2={isOpen ? "5" : "30"} 
          stroke="#16a34a" 
          strokeWidth="4" 
          className="transition-all duration-300"
        />
      </svg>
      <span className="mt-1 text-[10px] font-bold text-green-700">{isOpen ? '斷開' : '閉合'}</span>
      <span className="absolute -top-3 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
        開關
      </span>
    </button>
  );
};

export const WireFlow: React.FC<{ active: boolean; speed: number }> = ({ active, speed }) => {
  if (!active || speed <= 0) return <div className="h-2 w-full bg-gray-300 rounded-full" />;
  
  const duration = Math.max(0.05, 1.2 / speed);
  
  return (
    <div className="relative h-2 w-full bg-blue-900 rounded-full overflow-hidden group shadow-inner">
      <Tooltip 
        title="導線與電流" 
        desc={`負責輸送能量。目前的流動強度約 ${ (speed * 100).toFixed(0) } mA。流動越快代表能量越大。`} 
      />
      <div 
        className="absolute inset-0"
        style={{ 
          animation: `wire-scroll ${duration}s linear infinite`,
          backgroundImage: 'linear-gradient(90deg, transparent 0%, #3b82f6 20%, #60a5fa 50%, #3b82f6 80%, transparent 100%)',
          backgroundSize: '40px 100%',
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.5) inset'
        }}
      />
    </div>
  );
};
