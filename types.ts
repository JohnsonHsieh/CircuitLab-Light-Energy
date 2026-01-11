
export enum ConnectionType {
  SERIES = 'SERIES',
  PARALLEL = 'PARALLEL'
}

export enum LEDColor {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  WHITE = 'WHITE'
}

export enum BulbType {
  LED = 'LED',
  REGULAR = 'REGULAR' // 一般燈泡 (鎢絲燈)
}

export interface CircuitState {
  batteryCount: number;
  batteryConnection: ConnectionType;
  bulbCount: number;
  bulbConnection: ConnectionType;
  bulbType: BulbType;
  isOpen: boolean;
  transformerEnabled: boolean;
  transformerRatio: number; // 0.5, 1, 1.5, 2
  ledColor: LEDColor;
  forwardVoltage: number; // 導通電壓，例如 1.8V, 2.2V, 3.2V
}

export interface SimulationResult {
  totalVoltage: number;
  totalCurrentMA: number; // 總電流 (毫安培)
  brightness: number; 
  isBurnedOut: boolean;
  isDrained: boolean;
  expectedMinutes: number; // 預估剩餘分鐘
  explanation: string;
}
