
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, HelpCircle, Lightbulb, Zap, Battery, BookOpen, Trash2, Check } from 'lucide-react';

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_DATA_POOL: Question[] = [
  // --- 電池系列 ---
  { id: 1, type: '電池', question: "兩顆 1.5V 電池『串聯』後的總電壓是多少？", options: ["1.5V", "3.0V", "0V", "4.5V"], correctAnswer: 1, explanation: "串聯電池電壓相加：1.5 + 1.5 = 3.0V。" },
  { id: 2, type: '電池', question: "兩顆 1.5V 電池『並聯』後的總電壓是多少？", options: ["1.5V", "3.0V", "0.75V", "4.5V"], correctAnswer: 0, explanation: "並聯電池電壓不變，但可以提供更久的電量。" },
  { id: 3, type: '電池', question: "哪種接法會讓電池最快沒電？", options: ["單顆電池", "電池串聯", "電池並聯", "沒接燈泡時"], correctAnswer: 1, explanation: "串聯提高電壓，會導致電流變大，能量消耗最快。" },
  { id: 4, type: '電池', question: "如果想讓實驗時間加倍但不增加亮度，應該？", options: ["電池串聯", "電池並聯", "燈泡串聯", "燈泡並聯"], correctAnswer: 1, explanation: "並聯電池就像增加水塔容量，不增加推力但增加總水量。" },
  { id: 5, type: '電池', question: "電池串聯時，如果其中一顆裝反了會？", options: ["變得超亮", "電壓互相抵消", "沒有影響", "電池會自動修復"], correctAnswer: 1, explanation: "裝反的電池會提供反向推力，抵消掉另一顆電池的電壓。" },
  // --- 燈泡系列 ---
  { id: 6, type: '燈泡', question: "兩顆燈泡『串聯』接在 3V 電源上，每顆燈泡分到幾伏特？", options: ["3V", "1.5V", "6V", "0V"], correctAnswer: 1, explanation: "串聯電路中，電壓會被組件平分（假設電阻相同）。" },
  { id: 7, type: '燈泡', question: "兩顆燈泡『並聯』接在 3V 電源上，每顆燈泡分到幾伏特？", options: ["3V", "1.5V", "6V", "0V"], correctAnswer: 0, explanation: "並聯電路中，每一條支路的電壓都等於電源總電壓。" },
  { id: 8, type: '燈泡', question: "串聯 10 顆燈泡，其中一顆壞了，其他的會？", options: ["繼續亮", "全部熄滅", "變得更亮", "閃爍不停"], correctAnswer: 1, explanation: "串聯是一條龍接法，一處斷路則全線不通。" },
  { id: 9, type: '燈泡', question: "並聯 10 顆燈泡，其中一顆壞了，其他的會？", options: ["繼續亮", "全部熄滅", "變得更暗", "一起燒掉"], correctAnswer: 0, explanation: "並聯各支路獨立，互相不干擾。" },
  { id: 10, type: '燈泡', question: "哪種燈泡接法會讓總電阻變小？", options: ["串聯", "並聯", "混聯", "都一樣"], correctAnswer: 1, explanation: "並聯會增加電流流動的路徑，讓總體流動更容易（電阻變小）。" },
  // --- LED 物理特性 ---
  { id: 11, type: 'LED', question: "LED 代表什麼意思？", options: ["發光二極體", "省電燈泡", "雷射光", "液體導體"], correctAnswer: 0, explanation: "LED 全名是 Light Emitting Diode，即發光二極體。" },
  { id: 12, type: 'LED', question: "LED 有正負極之分嗎？", options: ["有，接反不亮", "沒有，隨便接", "只有高級的才有", "視顏色而定"], correctAnswer: 0, explanation: "LED 是二極體，具有單向導電性。" },
  { id: 13, type: 'LED', question: "什麼是導通電壓 (Vf)？", options: ["燒掉的電壓", "開始發光的最低電壓", "最高的電壓", "沒電的電壓"], correctAnswer: 1, explanation: "電壓必須超過 Vf，電子才能跨過障礙開始發光。" },
  { id: 14, type: 'LED', question: "白光 LED 通常需要較高的 Vf，大約是多少？", options: ["1.5V", "3.2V", "12V", "0.5V"], correctAnswer: 1, explanation: "藍光與白光 LED 能量較高，通常需要 3V 以上才能驅動。" },
  { id: 15, type: 'LED', question: "如果給 LED 超過 6V 的電壓卻沒接電阻，會？", options: ["變超級亮", "瞬間燒毀", "自動降壓", "顏色改變但沒事"], correctAnswer: 1, explanation: "過高電壓會產生巨大電流，燒斷 LED 內部微細導線。" },
  // --- 能量與功率 ---
  { id: 16, type: '能量', question: "歐姆定律中，電流與電壓的關係是？", options: ["成正比", "成反比", "沒關係", "平方反比"], correctAnswer: 0, explanation: "推力（電壓）越大，流動（電流）就越快。" },
  { id: 17, type: '能量', question: "瓦特 (Watt) 是什麼的單位？", options: ["電壓", "電流", "功率", "電阻"], correctAnswer: 2, explanation: "瓦特代表能量消耗的速率。" },
  { id: 18, type: '能量', question: "為什麼亮度加倍，電量消耗會變成四倍？", options: ["因為熱能損失", "電壓與電流同時加倍", "電池漏電", "燈泡變熱了"], correctAnswer: 1, explanation: "P = V * I，V 變 2 倍時 I 也變 2 倍，相乘就是 4 倍。" },
  { id: 19, type: '能量', question: "家裡的電器通常是什麼接法？", options: ["串聯", "並聯", "斷路", "短路"], correctAnswer: 1, explanation: "並聯才能確保每個電器都拿到相同的 110V 電壓。" },
  { id: 20, type: '能量', question: "『短路』是什麼意思？", options: ["電線太短", "電流沒經過負載直接回流", "電燈不亮", "電池沒電"], correctAnswer: 1, explanation: "短路會產生極大電流，非常危險，可能導致起火。" },
  // --- 更多題目補充 ---
  { id: 21, type: '安全', question: "用濕手摸電池或插座危險嗎？", options: ["沒感覺", "非常危險", "只有插座危險", "水是絕緣體"], correctAnswer: 1, explanation: "水分會大幅降低人體電阻，讓電流更容易通過。" },
  { id: 22, type: '組件', question: "電路中的『開關』作用是什麼？", options: ["增加電壓", "控制電路的通斷", "改變燈泡顏色", "儲存電力"], correctAnswer: 1, explanation: "開關負責讓電路形成通路或斷路。" },
  { id: 23, type: '電池', question: "哪種電池可以重複充電使用？", options: ["鹼性電池", "鋰電池", "碳鋅電池", "水銀電池"], correctAnswer: 1, explanation: "鋰電池、鎳氫電池等屬於二次電池，可重複充電。" },
  { id: 24, type: '現象', question: "燈泡發光時通常會伴隨什麼現象？", options: ["變冷", "發熱", "變重", "縮小"], correctAnswer: 1, explanation: "電能轉換為光能時，通常會有部分轉為熱能。" },
  { id: 25, type: '變壓器', question: "變壓器 0.5x 代表？", options: ["電壓減半", "電壓加倍", "電壓不變", "燒掉"], correctAnswer: 0, explanation: "降壓可以保護低壓組件或節省電力。" },
  { id: 26, type: 'LED', question: "紅光 LED 的 Vf 通常比藍光 LED？", options: ["高", "低", "一樣", "看心情"], correctAnswer: 1, explanation: "紅光光子能量較低，導通電壓也較低（約 1.8V）。" },
  { id: 27, type: '電路', question: "一個完整的電路必須具備？", options: ["電源、導線、負載", "只有電源", "只有導線", "只要有燈泡"], correctAnswer: 0, explanation: "缺一不可，否則無法形成持續的能量流動。" },
  { id: 28, type: '材料', question: "下列何者是優良的導體？", options: ["橡皮擦", "銅線", "乾燥木頭", "塑膠尺"], correctAnswer: 1, explanation: "金屬通常是優良的電子導體。" },
  { id: 29, type: '電池', question: "3 顆 1.5V 電池並聯，總電壓是？", options: ["4.5V", "1.5V", "3V", "0.5V"], correctAnswer: 1, explanation: "並聯不管幾顆，電壓都等於單顆電壓。" },
  { id: 30, type: '能量', question: "電力公司收費通常是算？", options: ["電壓", "電流", "消耗的總能量(度)", "開燈時間"], correctAnswer: 2, explanation: "『度』是能量單位（千瓦小時）。" },
  { id: 31, type: '實驗', question: "發現電線發燙時應該？", options: ["加更多電池", "立刻切斷電源", "用冷水澆", "沒關係繼續做"], correctAnswer: 1, explanation: "發燙代表電流過大，可能發生短路或過載。" },
  { id: 32, type: 'LED', question: "為什麼 LED 比傳統燈泡省電？", options: ["比較小", "電能轉光能效率高", "顏色比較亮", "不用電池"], correctAnswer: 1, explanation: "LED 產生的廢熱極少，大部分能量都變成了光。" },
  { id: 33, type: '串聯', question: "串聯 3 顆 1.5V 電池，總電壓為？", options: ["1.5V", "3.0V", "4.5V", "6.0V"], correctAnswer: 2, explanation: "1.5 * 3 = 4.5V。" },
  { id: 34, type: '並聯', question: "兩個 30 歐姆的燈泡並聯，總電阻會變？", options: ["60 歐姆", "30 歐姆", "15 歐姆", "0 歐姆"], correctAnswer: 2, explanation: "並聯電阻公式：1/R = 1/30 + 1/30 = 2/30，所以 R = 15。" },
  { id: 35, type: '安全', question: "保險絲的作用是？", options: ["讓燈更亮", "電流過大時自動斷路", "增加電壓", "裝飾用"], correctAnswer: 1, explanation: "保險絲是保護電路的安全裝置。" },
  { id: 36, type: '組件', question: "伏特計應該如何連接在電路中？", options: ["串聯", "並聯", "隨便接", "接在開關上"], correctAnswer: 1, explanation: "伏特計要測量電壓差，必須並聯在組件兩端。" },
  { id: 37, type: '組件', question: "安培計應該如何連接在電路中？", options: ["串聯", "並聯", "隨便接", "接在電池上"], correctAnswer: 0, explanation: "安培計要讓電流流過，必須串聯在電路中。" },
  { id: 38, type: '知識', question: "誰發明了世界上第一個電池？", options: ["愛迪生", "伏特", "富蘭克林", "特斯拉"], correctAnswer: 1, explanation: "伏特堆 (Voltaic Pile) 是最早的化學電池。" },
  { id: 39, type: 'LED', question: "LED 燒毀後通常會呈現什麼外觀？", options: ["變黑或出現裂紋", "變透明", "變大顆", "沒變化"], correctAnswer: 0, explanation: "高溫會破壞半導體封裝與內部導線。" },
  { id: 40, type: '能量', question: "110V 的電壓通常比 1.5V 電池？", options: ["弱", "強很多", "一樣", "看大小"], correctAnswer: 1, explanation: "家用電電壓極高，足以致命，絕對不可亂碰。" },
  { id: 41, type: '電池', question: "電池沒電是因為？", options: ["電子用完了", "化學能耗盡了", "導線斷了", "天氣太熱"], correctAnswer: 1, explanation: "電池是靠化學反應產生電能的。" },
  { id: 42, type: '電路', question: "絕緣體的主要功能是？", options: ["導電", "防止漏電", "增加亮度", "儲存電荷"], correctAnswer: 1, explanation: "絕緣體防止電流流向不該去的地方。" },
  { id: 43, type: 'LED', question: "綠光 LED 的導通電壓大約是？", options: ["1.2V", "2.2V", "3.8V", "9V"], correctAnswer: 1, explanation: "綠光 LED 通常在 2.0V ~ 2.4V 之間啟動。" },
  { id: 44, type: '能量', question: "電能轉換為光能的比例稱為？", options: ["光效", "電阻率", "功率因數", "頻率"], correctAnswer: 0, explanation: "光效越高代表越省電。" },
  { id: 45, type: '電池', question: "電池串聯越多，燈泡？", options: ["越暗", "越亮", "沒變化", "會縮小"], correctAnswer: 1, explanation: "電壓增加，推動更多電流流過燈泡。" },
  { id: 46, type: '電池', question: "兩顆電池一正一反並聯，會發生什麼事？", options: ["電壓加倍", "產生大電流短路", "燈泡超亮", "沒事"], correctAnswer: 1, explanation: "這會形成內部循環迴路，導致電池發燙甚至爆炸。" },
  { id: 47, type: '電路', question: "開關在『斷路』狀態下，電流量是？", options: ["最大", "0", "一半", "無限大"], correctAnswer: 1, explanation: "斷路代表路徑中斷，電流無法通過。" },
  { id: 48, type: 'LED', question: "如果 LED 長腳接負極，短腳接正極，會？", options: ["亮", "不亮", "燒毀", "閃爍"], correctAnswer: 1, explanation: "通常長腳是正極，接反了就不會導通。" },
  { id: 49, type: '能量', question: "一度電等於多少千瓦小時？", options: ["1", "10", "100", "0.1"], correctAnswer: 0, explanation: "1 度電 = 1000W 使用 1 小時。" },
  { id: 50, type: '知識', question: "小小科學家做實驗最重要的是？", options: ["器材貴", "安全與觀察", "速度快", "考卷滿分"], correctAnswer: 1, explanation: "安全第一，並從觀察中學習原理！" }
];

// Fisher-Yates Shuffle 演算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const QuizSection: React.FC = () => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // 錯題本狀態
  const [wrongCollection, setWrongCollection] = useState<Question[]>([]);

  // 初始化題目與從 localStorage 載入錯題
  useEffect(() => {
    const selected = shuffleArray(QUIZ_DATA_POOL).slice(0, 4);
    setShuffledQuestions(selected);

    const savedWrong = localStorage.getItem('circuit_wrong_questions');
    if (savedWrong) {
      try {
        setWrongCollection(JSON.parse(savedWrong));
      } catch (e) {
        console.error("Failed to parse wrong questions", e);
      }
    }
  }, []);

  // 當錯題本更新時同步到 localStorage
  useEffect(() => {
    localStorage.setItem('circuit_wrong_questions', JSON.stringify(wrongCollection));
  }, [wrongCollection]);

  const handleAnswer = (idx: number) => {
    if (isAnswered || shuffledQuestions.length === 0) return;
    
    const currentQ = shuffledQuestions[currentIdx];
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswer) {
      setScore(s => s + 1);
    } else {
      // 答錯，加入錯題本 (避免重複)
      setWrongCollection(prev => {
        if (prev.find(q => q.id === currentQ.id)) return prev;
        return [...prev, currentQ];
      });
    }
  };

  const nextQuestion = () => {
    if (currentIdx < shuffledQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    const selected = shuffleArray(QUIZ_DATA_POOL).slice(0, 4);
    setShuffledQuestions(selected);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  const removeWrongQuestion = (id: number) => {
    setWrongCollection(prev => prev.filter(q => q.id !== id));
  };

  if (shuffledQuestions.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* 測驗區塊主體 */}
      {!showResult ? (
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border-t-8 border-indigo-500 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-indigo-50 px-8 py-4 flex justify-between items-center border-b border-indigo-100">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <HelpCircle size={14} /> 科學知識挑戰 {currentIdx + 1} / {shuffledQuestions.length}
            </span>
            <div className="flex gap-1">
              {shuffledQuestions.map((_, i) => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= currentIdx ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded mb-2">
                 {shuffledQuestions[currentIdx].type}
              </span>
              <h4 className="text-xl font-bold text-slate-800 leading-tight">
                {shuffledQuestions[currentIdx].question}
              </h4>
            </div>

            <div className="space-y-3">
              {shuffledQuestions[currentIdx].options.map((option, idx) => {
                const isCorrect = idx === shuffledQuestions[currentIdx].correctAnswer;
                const isSelected = idx === selectedAnswer;
                
                let btnClass = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex items-center justify-between ";
                if (!isAnswered) {
                  btnClass += "border-slate-100 hover:border-indigo-300 hover:bg-indigo-50";
                } else {
                  if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700";
                  else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700";
                  else btnClass += "border-slate-50 opacity-50";
                }

                return (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(idx)} 
                    className={btnClass}
                    disabled={isAnswered}
                  >
                    {option}
                    {isAnswered && isCorrect && <CheckCircle2 size={20} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle size={20} />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                <p className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1 uppercase">
                  <Lightbulb size={12} /> 原理解析
                </p>
                <p className="text-sm text-indigo-900 leading-relaxed">
                  {shuffledQuestions[currentIdx].explanation}
                </p>
                <button 
                  onClick={nextQuestion}
                  className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {currentIdx === shuffledQuestions.length - 1 ? '完成測驗' : '下一題'}
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border-4 border-amber-400 text-center animate-in fade-in zoom-in duration-500">
          <div className="inline-block p-4 bg-amber-100 rounded-full mb-4">
            <Award size={64} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">挑戰完成！榮譽科學家</h3>
          <p className="text-slate-600 mb-6">你在 {shuffledQuestions.length} 題中答對了 {score} 題。</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">證書評語</p>
            <p className="text-lg text-indigo-700 font-medium italic">
              {score === shuffledQuestions.length ? "「完美！你已經準備好進行更高難度的電子電路設計了！」" : 
               score >= shuffledQuestions.length / 2 ? "「很不錯喔！再多做幾次實驗，你會變得更強大的！」" : 
               "「失敗是成功之母！錯題已經自動收錄到下方紀錄本，快去複習吧。」"}
            </p>
          </div>

          <button 
            onClick={resetQuiz}
            className="flex items-center gap-2 mx-auto px-8 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200"
          >
            <RotateCcw size={20} /> 抽換新題目挑戰
          </button>
        </div>
      )}

      {/* 錯題紀錄本區塊 */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <BookOpen className="text-indigo-500" size={20} />
            小小科學家錯題本 ({wrongCollection.length})
          </h3>
          {wrongCollection.length > 0 && (
            <button 
              onClick={() => { if(confirm("確定要清空所有錯題紀錄嗎？")) setWrongCollection([]); }} 
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> 清空紀錄
            </button>
          )}
        </div>

        {wrongCollection.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="text-slate-400" />
            </div>
            <p className="text-slate-400 font-medium">目前沒有錯題紀錄，繼續保持！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wrongCollection.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative group animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => removeWrongQuestion(q.id)}
                  className="absolute top-4 right-4 p-2 bg-green-50 text-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-green-500 hover:text-white"
                  title="我學會了，從紀錄移除"
                >
                  <Check size={16} />
                </button>
                
                <div className="pr-10">
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded uppercase mb-2 inline-block">
                    {q.type}
                  </span>
                  <h5 className="font-bold text-slate-800 mb-3">{q.question}</h5>
                  
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-green-600 uppercase">正確答案</p>
                        <p className="text-sm text-green-800 font-medium">{q.options[q.correctAnswer]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Lightbulb size={12} /> 複習重點
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      {q.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                   <button 
                    onClick={() => removeWrongQuestion(q.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                   >
                     我已經學會了 <ArrowRight size={12} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
