
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, RefreshCw, ArrowRight, Link as LinkIcon, BookOpen, X } from 'lucide-react';

interface QuizComponentProps {
  questions: QuizQuestion[];
  readingPassage?: string;
  onComplete: (score: number, answers: Record<number, string | number>, essayLinks: Record<number, string>) => void;
  passingScore: number;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions = [], readingPassage, onComplete, passingScore }) => {
  // Ensure questions is an array and filter out nulls/undefined to prevent crashes
  const safeQuestions = Array.isArray(questions) ? questions.filter(q => !!q) : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Store answers as mixed type: number (index) or string (text)
  const [answers, setAnswers] = useState<(number | string)[]>(new Array(safeQuestions.length).fill(''));
  
  // Store links for essay questions: index -> url string
  const [essayLinks, setEssayLinks] = useState<Record<number, string>>({});
  
  const [showResult, setShowResult] = useState(false);
  const [showPassageMobile, setShowPassageMobile] = useState(false);

  // If no questions, return message
  if (safeQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Không có câu hỏi nào trong bài kiểm tra này.
      </div>
    );
  }

  const handleAnswerChange = (val: string | number) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = val;
    setAnswers(newAnswers);
  };

  const handleLinkChange = (val: string) => {
    setEssayLinks(prev => ({
      ...prev,
      [currentIndex]: val
    }));
  };

  // Pure function to calculate results without side effects
  const getQuizResults = () => {
    let correctCount = 0;
    let earnedPoints = 0;
    let totalPoints = 0;
    let pending = 0;

    safeQuestions.forEach((q, index) => {
      const ans = answers[index];
      const point = q.points || 1; // Default to 1 if no point specified
      totalPoints += point;
      
      if (q.type === 'choice') {
        if (ans === q.correctAnswer) {
          correctCount++;
          earnedPoints += point;
        }
      } else if (q.type === 'fill' || q.type === 'short') {
        const userStr = String(ans).trim().toLowerCase();
        const correctStr = String(q.correctAnswer).trim().toLowerCase();
        if (userStr === correctStr && userStr !== '') {
          correctCount++;
          earnedPoints += point;
        }
      } else if (q.type === 'essay') {
        pending++;
      }
    });
    return { score: correctCount, earnedPoints, totalPoints, pending };
  };

  const { score, earnedPoints, totalPoints, pending: essayPendingCount } = getQuizResults();
  
  // Passing logic: If it's a practice exam (passingScore = 0 or low), we might always pass. 
  // Otherwise, use percentage or count.
  const isPassed = earnedPoints >= passingScore; 

  const handleSubmit = () => {
    setShowResult(true);
    
    // Convert array answers to map (QuestionID -> Answer) for storage
    const answersMap: Record<number, string | number> = {};
    const linksMap: Record<number, string> = {};
    
    safeQuestions.forEach((q, idx) => {
      answersMap[q.id] = answers[idx];
      if (essayLinks[idx]) {
        linksMap[q.id] = essayLinks[idx];
      }
    });

    onComplete(earnedPoints, answersMap, linksMap);
  };

  const handleRetry = () => {
    setAnswers(new Array(safeQuestions.length).fill(''));
    setEssayLinks({});
    setCurrentIndex(0);
    setShowResult(false);
  };

  if (showResult) {
    // If it is a practice exam (passingScore = 0 usually implies no immediate pass/fail threshold, or exam mode)
    // We show a different message if there are essay questions pending grading
    if (passingScore === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center animate-fade-in">
          <div className="mb-4 p-4 rounded-full bg-blue-100 text-blue-600">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Đã nộp bài thành công!</h3>
          <p className="text-slate-600 mb-6 text-lg">
            Bài làm của bạn đã được gửi đến giáo viên. <br/>
            Kết quả chi tiết và điểm số sẽ được cập nhật sau khi giáo viên chấm xong phần tự luận.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 inline-block text-left mb-6">
             <p className="text-sm text-slate-500 mb-1">Điểm trắc nghiệm (Tạm tính):</p>
             <p className="text-xl font-bold text-slate-900">{earnedPoints} điểm</p>
          </div>
          <button
            onClick={() => window.location.reload()} // Simple reload to reset or user clicks navigation
            className="hidden" // User should navigate away via main menu
          >
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center animate-fade-in">
        <div className={`mb-4 p-4 rounded-full ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isPassed ? <CheckCircle size={48} /> : <XCircle size={48} />}
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {isPassed ? 'Hoàn thành bài kiểm tra' : 'Chưa đạt yêu cầu'}
        </h3>
        <div className="text-slate-600 mb-2 text-lg">
          <p>Điểm số: <span className="font-bold text-slate-900">{earnedPoints}/{totalPoints}</span></p>
          <p className="text-sm">({score} câu đúng)</p>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          {isPassed 
            ? 'Chúc mừng bạn đã hoàn thành bài thi.' 
            : 'Bạn cần cải thiện điểm số để đạt yêu cầu.'}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={20} /> Làm lại
        </button>
      </div>
    );
  }

  // Safety check to ensure current question exists before rendering
  const currentQuestion = safeQuestions[currentIndex];
  if (!currentQuestion) {
     return <div className="p-8 text-center">Đang tải câu hỏi hoặc dữ liệu lỗi...</div>;
  }

  const isLastQuestion = currentIndex === safeQuestions.length - 1;
  const currentAnswer = answers[currentIndex];
  const currentLink = essayLinks[currentIndex];
  
  // Logic answered: check text OR link (for essay)
  const isAnswered = (currentAnswer !== '' && currentAnswer !== -1) || (!!currentLink && currentLink.trim() !== '');

  const QuizContent = (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-6">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / safeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
             Câu {currentIndex + 1}/{safeQuestions.length}
           </h4>
           <div className="flex gap-2">
             {currentQuestion.points && (
               <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                 {currentQuestion.points} điểm
               </span>
             )}
             <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase">
                {currentQuestion.type === 'choice' ? 'Trắc nghiệm' : 
                 currentQuestion.type === 'fill' ? 'Điền khuyết' :
                 currentQuestion.type === 'short' ? 'Trả lời ngắn' : 'Tiểu luận'}
             </span>
           </div>
        </div>
        
        <h3 className="text-xl font-medium text-slate-900 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="flex-1">
          {/* Multiple Choice Render */}
          {currentQuestion.type === 'choice' && (
            <div className="space-y-3">
              {(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerChange(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    currentAnswer === idx
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      currentAnswer === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Fill / Short Answer Render */}
          {(currentQuestion.type === 'fill' || currentQuestion.type === 'short') && (
            <div className="mt-4">
               <input 
                 type="text" 
                 value={currentAnswer as string} 
                 onChange={(e) => handleAnswerChange(e.target.value)}
                 className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                 placeholder="Nhập câu trả lời của bạn..."
               />
            </div>
          )}

          {/* Essay Render with Link Upload */}
          {currentQuestion.type === 'essay' && (
            <div className="mt-4 space-y-4">
               <textarea 
                 value={currentAnswer as string} 
                 onChange={(e) => handleAnswerChange(e.target.value)}
                 className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none"
                 placeholder="Viết bài tự luận trực tiếp tại đây..."
               />
               
               <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={currentLink || ''}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="Dán link bài làm (Canva, Docs, Drive...)"
                  />
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(c => c - 1)}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
        >
          Quay lại
        </button>
        
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!answers.every((a, idx) => {
               const q = safeQuestions[idx];
               if (q.type === 'essay') {
                 // Check if ANY field has data for essay (text or link)
                 return (a !== '' || (!!essayLinks[idx] && essayLinks[idx].trim() !== ''));
               }
               return (a !== '' && a !== -1);
            })} 
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Nộp bài <CheckCircle size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(c => c + 1)}
            disabled={!isAnswered}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Tiếp theo <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );

  // If reading passage is present, use split view layout
  if (readingPassage) {
    return (
      <div className="max-w-7xl mx-auto h-[80vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Passage Panel (Sticky/Scrollable on Desktop) */}
          <div className={`
             lg:block bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-y-auto h-full
             ${showPassageMobile ? 'fixed inset-0 z-50 bg-white m-0 rounded-none' : 'hidden'}
          `}>
             {showPassageMobile && (
               <button 
                 onClick={() => setShowPassageMobile(false)}
                 className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-600"
               >
                 <X size={24} />
               </button>
             )}
             <div className="prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: readingPassage }} />
             </div>
          </div>

          {/* Mobile Toggle Button */}
          <button 
             onClick={() => setShowPassageMobile(true)}
             className="lg:hidden flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 mb-4 font-bold"
          >
             <BookOpen size={18} /> Đọc văn bản
          </button>

          {/* Quiz Panel */}
          <div className="h-full overflow-y-auto custom-scrollbar pb-10">
            {QuizContent}
          </div>
        </div>
      </div>
    );
  }

  // Default layout for normal quiz
  return <div className="max-w-3xl mx-auto">{QuizContent}</div>;
};

export default QuizComponent;
