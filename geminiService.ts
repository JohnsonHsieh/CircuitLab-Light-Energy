
import { GoogleGenAI } from "@google/genai";
import { CircuitState, ConnectionType } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCircuitExplanation = async (state: CircuitState, batteryLife: number) => {
  const transformerDesc = state.transformerEnabled 
    ? `使用了變壓器 (${state.transformerRatio}x)。` 
    : "未使用變壓器。";

  const prompt = `
    你是一位國小自然老師。請根據以下電路狀態，向 10 歲的小朋友解釋。
    
    電路狀態：
    - 電池：${state.batteryCount} 個 (${state.batteryConnection === ConnectionType.SERIES ? '串聯' : '並聯'})
    - 目前電量：${batteryLife.toFixed(0)}%
    - 變壓器：${transformerDesc}
    - 燈泡：${state.bulbCount} 個 (${state.bulbConnection === ConnectionType.SERIES ? '串聯' : '並聯'})

    解釋重點（必須符合物理原理）：
    1. 強調「亮度是有代價的」：解釋為什麼變壓器讓電壓變 2 倍時，電流也會變 2 倍，導致耗電變成 4 倍（平方關係）。可以用「推力加倍，速度也加倍，所以能量消耗快四倍」來比喻。
    2. 說明增加電池數量如何幫助應對高耗電。
    3. 提醒學生觀察「預計壽命」的劇烈變化。
    4. 字數 150 字內，語氣親切，使用繁體中文，多用比喻。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "老師正在觀察你的實驗。你發現當電壓變高時，電量是不是掉得超級快？這就是『強大力量的代價』喔！";
  }
};
