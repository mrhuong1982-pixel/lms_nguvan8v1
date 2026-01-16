
import React, { useState, useEffect } from 'react';
import { Game, QuizQuestion } from '../types';
import { getRandomQuestions, saveGameResult } from '../services/mockProvider';
import { Gamepad2, Trophy, Star, ArrowRight, RefreshCw, XCircle, Play, CheckCircle, X, HelpCircle, ChevronRight, Medal, Loader2, Quote } from 'lucide-react';

interface GamePlayerProps {
  game: Game;
  onExit: () => void;
}

const GamePlayer: React.FC<GamePlayerProps> = ({ game, onExit }) => {
  // Game Config
  const totalLevels = game.quizConfig?.levelCount || 3;
  const questionsPerLevel = game.quizConfig?.questionsPerLevel || 5;
  const pointsPerLevel = game.quizConfig?.pointsPerLevel || 10;

  // Global Game State
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'level-success' | 'level-fail' | 'game-complete'>('intro');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Level State
  const [levelQuestions, setLevelQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [correctCountInLevel, setCorrectCountInLevel] = useState(0);

  // Question Interaction State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // --- Logic Handlers ---

  const startLevel = async (level: number) => {
    setIsLoading(true);
    try {
      // Async fetch questions from Question Bank
      const questions = await getRandomQuestions(questionsPerLevel);
      
      if (questions.length === 0) {
        alert("Chưa có câu hỏi nào trong ngân hàng đề!");
        onExit();
        return;
      }

      setLevelQuestions(questions);
      setCurrentLevel(level);
      setCurrentQIndex(0);
      setCorrectCountInLevel(0);
      resetQuestionState();
      setGameState('playing');
    } catch (e) {
      console.error("Failed to start level", e);
      alert("Lỗi tải câu hỏi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleOptionClick = (optionIndex: number) => {
    if (isAnswered) return; // Prevent multiple clicks

    const currentQ = levelQuestions[currentQIndex];
    const isRight = optionIndex === currentQ.correctAnswer;

    setSelectedOption(optionIndex);
    setIsAnswered(true);
    setIsCorrect(isRight);

    if (isRight) {
      setCorrectCountInLevel(prev => prev + 1);
      // Add point for specific question immediately (optional, or just count pass/fail)
      setTotalScore(prev => prev + (currentQ.points || 1)); 
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < levelQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      finishLevel();
    }
  };

  const finishLevel = () => {
    // Determine pass/fail based on correctCountInLevel
    // Logic: Pass if >= 50% correct
    const passThreshold = Math.ceil(levelQuestions.length / 2);
    
    if (correctCountInLevel >= passThreshold) {
      const levelBonus = pointsPerLevel;
      const newTotalScore = totalScore + levelBonus;
      setTotalScore(newTotalScore); // Update local state for UI

      if (currentLevel >= totalLevels) {
        // --- GAME COMPLETED LOGIC ---
        // Save the score and award badge
        saveGameResult(game.id, newTotalScore, true);
        setGameState('game-complete');
      } else {
        setGameState('level-success');
      }
    } else {
      setGameState('level-fail');
    }
  };

  // --- Render Views ---

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Đang tải câu hỏi từ ngân hàng...</p>
      </div>
    );
  }

  // 1. INTRO SCREEN
  if (gameState === 'intro') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-md w-full relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
           
           <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
              <Gamepad2 size={48} />
           </div>
           
           <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{game.title}</h1>
           <p className="text-slate-500 mb-8 px-4">{game.description}</p>
           
           <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
              <div className="text-center">
                 <div className="text-xs text-slate-400 font-bold uppercase">Cấp độ</div>
                 <div className="font-black text-slate-800 text-xl">{totalLevels}</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                 <div className="text-xs text-slate-400 font-bold uppercase">Câu hỏi</div>
                 <div className="font-black text-slate-800 text-xl">{questionsPerLevel} <span className="text-xs text-slate-400 font-normal">/ màn</span></div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                 <div className="text-xs text-slate-400 font-bold uppercase">Yêu cầu</div>
                 <div className="font-black text-green-600 text-xl">50%</div>
              </div>
           </div>

           <div className="space-y-3">
              <button onClick={() => startLevel(1)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all transform active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                <Play size={20} fill="currentColor" /> Bắt đầu ngay
              </button>
              <button onClick={onExit} className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-sm">
                Quay lại
              </button>
           </div>
        </div>
      </div>
    );
  }

  // 2. PLAYING SCREEN (Custom UI)
  if (gameState === 'playing') {
    const currentQ = levelQuestions[currentQIndex];
    if (!currentQ) return <div className="p-8 text-center">Lỗi tải câu hỏi.</div>;

    const progressPercent = ((currentQIndex + 1) / levelQuestions.length) * 100;
    // CRITICAL FIX: Ensure options is an array to prevent "map is not a function" error
    const safeOptions = Array.isArray(currentQ.options) ? currentQ.options : [];

    return (
      <div className="max-w-2xl mx-auto min-h-screen md:min-h-0 md:py-8 animate-fade-in">
         {/* HEADER - Fixed/Sticky friendly */}
         <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 md:rounded-2xl md:border md:shadow-sm">
            <div className="h-1.5 w-full bg-slate-100 md:rounded-t-2xl overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center p-4">
               <div className="flex items-center gap-3">
                  <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-colors">
                     <X size={20} />
                  </button>
                  <div>
                     <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                           Level {currentLevel}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                           Câu {currentQIndex + 1}/{levelQuestions.length}
                        </span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100 shadow-sm">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-yellow-700 text-sm">{totalScore}</span>
               </div>
            </div>
         </div>

         {/* GAME AREA */}
         <div className="p-4 md:p-0 md:mt-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-8">
               {/* Question Container - Improved UI */}
               <div className="mb-6">
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 md:p-8 rounded-2xl border border-indigo-100 min-h-[160px] flex items-center justify-center relative overflow-hidden group">
                      {/* Decorative elements */}
                      <div className="absolute top-3 left-3 text-indigo-200 pointer-events-none opacity-50">
                        <Quote size={40} className="fill-current" />
                      </div>
                      <div className="absolute bottom-3 right-3 text-indigo-200 pointer-events-none opacity-50 transform rotate-180">
                        <Quote size={40} className="fill-current" />
                      </div>
                      
                      <h2 className="text-lg md:text-2xl font-bold text-slate-800 leading-relaxed text-center relative z-10 break-words w-full">
                         {currentQ.question}
                      </h2>
                  </div>
               </div>

               {/* Options Grid */}
               <div className="space-y-3">
                  {safeOptions.map((option, idx) => {
                     let stateClasses = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-200 shadow-sm";
                     let icon = <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400 transition-colors group-hover:border-indigo-300 group-hover:text-indigo-400">{String.fromCharCode(65 + idx)}</div>;
                     
                     if (isAnswered) {
                        if (idx === currentQ.correctAnswer) {
                           // Correct Answer Style
                           stateClasses = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500 shadow-md";
                           icon = <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700"><CheckCircle size={18} /></div>;
                        } else if (idx === selectedOption) {
                           // Wrong Selection Style
                           stateClasses = "border-red-300 bg-red-50 text-red-800 opacity-50";
                           icon = <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700"><XCircle size={18} /></div>;
                        } else {
                           // Other options when answered
                           stateClasses = "border-slate-100 bg-slate-50 text-slate-400 opacity-40";
                        }
                     }

                     return (
                        <button
                           key={idx}
                           onClick={() => handleOptionClick(idx)}
                           disabled={isAnswered}
                           className={`group w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${stateClasses} ${!isAnswered ? 'active:scale-[0.99] active:shadow-inner' : ''}`}
                        >
                           <div className="shrink-0">{icon}</div>
                           <span className="font-medium text-base md:text-lg">{option}</span>
                        </button>
                     );
                  })}
               </div>

               {/* FEEDBACK & NEXT BUTTON AREA - Appears Immediately Below Options */}
               {isAnswered && (
                  <div className={`mt-6 p-4 rounded-2xl animate-in slide-in-from-bottom-2 fade-in duration-300 flex flex-col md:flex-row items-center justify-between gap-4 ${
                     isCorrect ? 'bg-green-100 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-200' : 'bg-red-100'}`}>
                           {isCorrect 
                              ? <CheckCircle size={24} className="text-green-600" />
                              : <XCircle size={24} className="text-red-600" />
                           }
                        </div>
                        <div>
                           <p className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {isCorrect ? 'Chính xác! +1 điểm' : 'Chưa đúng rồi!'}
                           </p>
                           {!isCorrect && (
                              <p className="text-xs text-red-600 mt-1">
                                 Đáp án đúng là: <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-red-200">{String.fromCharCode(65 + (currentQ.correctAnswer as number))}</span>
                              </p>
                           )}
                        </div>
                     </div>

                     <button 
                        onClick={handleNextQuestion}
                        className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                           isCorrect ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'
                        }`}
                     >
                        {currentQIndex < levelQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành Level'} 
                        <ChevronRight size={20} />
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  // 3. LEVEL SUCCESS / FAIL SCREENS
  if (gameState === 'level-success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
         <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100 text-center max-w-sm w-full relative overflow-hidden">
            {/* Confetti BG effect placeholder */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]"></div>
            
            <div className="relative z-10">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce shadow-inner">
                  <Trophy size={48} fill="currentColor" className="text-green-500" />
               </div>
               
               <h2 className="text-2xl font-black text-slate-900 mb-2">Đỉnh quá!</h2>
               <p className="text-slate-500 mb-6">Bạn đã vượt qua Level {currentLevel}</p>
               
               <div className="bg-green-50 p-4 rounded-2xl mb-8 flex justify-center gap-8">
                  <div className="text-center">
                     <span className="block text-xs font-bold text-green-600 uppercase">Đúng</span>
                     <span className="block text-2xl font-black text-slate-800">{correctCountInLevel}/{levelQuestions.length}</span>
                  </div>
                  <div className="text-center">
                     <span className="block text-xs font-bold text-green-600 uppercase">Điểm</span>
                     <span className="block text-2xl font-black text-slate-800">+{pointsPerLevel}</span>
                  </div>
               </div>
               
               <button 
                 onClick={() => startLevel(currentLevel + 1)}
                 className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-transform hover:scale-105 shadow-xl shadow-green-200 flex items-center justify-center gap-2"
               >
                 Tiếp tục Level {currentLevel + 1} <ArrowRight size={20} />
               </button>
            </div>
         </div>
      </div>
    );
  }

  if (gameState === 'level-fail') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
         <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center max-w-sm w-full">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
               <XCircle size={48} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2">Chưa đủ điểm!</h2>
            <p className="text-slate-500 mb-6">Bạn cần đúng ít nhất 50% để qua màn này.</p>
            
            <div className="bg-red-50 p-4 rounded-2xl mb-8 border border-red-100">
               <span className="text-sm font-medium text-red-800">Kết quả: {correctCountInLevel}/{levelQuestions.length} câu đúng</span>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => startLevel(currentLevel)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                <RefreshCw size={20} /> Thử lại ngay
              </button>
              <button onClick={onExit} className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-sm">
                Thoát game
              </button>
            </div>
         </div>
      </div>
    );
  }

  // 4. GAME COMPLETE SCREEN
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-yellow-300 text-center max-w-lg w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]">
          <div className="relative z-10">
             <div className="w-32 h-32 bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-white animate-pulse">
                 <Trophy size={64} className="text-white" />
             </div>
             
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">CHIẾN THẮNG!</h1>
             <p className="text-lg md:text-xl text-slate-500 mb-8">Bạn đã chinh phục toàn bộ {totalLevels} màn chơi.</p>
             
             <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Tổng điểm nhận được</p>
                    <p className="text-3xl font-black text-indigo-600">+{totalScore}</p>
                 </div>
                 <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                    <p className="text-xs text-yellow-600 uppercase font-bold tracking-widest mb-1">Huy hiệu mới</p>
                    <div className="flex items-center justify-center gap-2 text-yellow-700 font-bold">
                       <Medal size={24} /> <span>Vua Trò Chơi</span>
                    </div>
                 </div>
             </div>
   
             <button 
               onClick={onExit}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-transform hover:scale-105 shadow-2xl"
             >
               Trở về trang chủ
             </button>
          </div>
        </div>
    </div>
  );
};

export default GamePlayer;
