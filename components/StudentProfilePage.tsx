
import React, { useState, useEffect } from 'react';
import { StudentAccount, Lesson, ProgressMap, Submission, PracticeExam, Game } from '../types';
import { Award, Clock, Star, Medal, GraduationCap, CheckCircle, Lock, Download, Printer, Gamepad2 } from 'lucide-react';
import { getGames } from '../services/mockProvider';

interface StudentProfilePageProps {
  student: StudentAccount;
  lessons: Lesson[];
  progress: ProgressMap;
  exams: PracticeExam[];
  submissions: Submission[];
}

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ student, lessons, progress, exams, submissions }) => {
  const [allGames, setAllGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
        const data = await getGames();
        setAllGames(data);
    };
    fetchGames();
  }, []);
  
  // Logic: Calculate Semester 1 Completion (Lesson 1 to 5)
  const semester1Lessons = lessons.filter(l => l.id.includes('lesson') && l.order <= 5);
  const isSemester1Done = semester1Lessons.every(l => progress[l.id]?.passed);
  
  // Calculate Avg Score for Certificate
  const sem1Scores = semester1Lessons.map(l => progress[l.id]?.score || 0);
  const sem1Avg = sem1Scores.length > 0 ? (sem1Scores.reduce((a, b) => a + b, 0) / sem1Scores.length).toFixed(1) : '0';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Hồ sơ học tập</h1>
        <p className="text-slate-500">Theo dõi lộ trình, huy hiệu và nhận chứng chỉ hoàn thành khóa học.</p>
      </div>

      {/* 1. Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Clock size={32} /></div>
           <div>
              <p className="text-slate-500 text-sm">Tổng thời gian học</p>
              <h3 className="text-2xl font-bold text-slate-900">{Math.floor(student.studyTime / 60)} giờ {student.studyTime % 60} phút</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full"><Star size={32} /></div>
           <div>
              <p className="text-slate-500 text-sm">Điểm tích lũy</p>
              <h3 className="text-2xl font-bold text-slate-900">{student.totalScore} điểm</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="p-4 bg-purple-100 text-purple-600 rounded-full"><Medal size={32} /></div>
           <div>
              <p className="text-slate-500 text-sm">Xếp hạng hiện tại</p>
              <h3 className="text-2xl font-bold text-slate-900">{student.classification}</h3>
           </div>
        </div>
      </div>

      {/* 2. Certificate Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap className="text-indigo-600" /> Chứng nhận học tập
        </h2>
        
        {isSemester1Done ? (
          <div className="relative bg-white p-8 rounded-xl border-4 border-double border-yellow-400 shadow-xl max-w-3xl mx-auto text-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
             {/* Decorative Corners */}
             <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-600 m-2"></div>
             <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-600 m-2"></div>
             <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-600 m-2"></div>
             <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-600 m-2"></div>

             <div className="mb-6">
                <div className="inline-block p-3 rounded-full bg-yellow-100 text-yellow-600 mb-4 border-2 border-yellow-400">
                    <Award size={48} />
                </div>
                <h3 className="text-4xl font-serif font-bold text-slate-900 uppercase tracking-widest mb-2">Giấy Chứng Nhận</h3>
                <p className="text-yellow-700 font-serif italic text-lg">Hoàn thành chương trình Ngữ Văn 8 - Học kỳ I</p>
             </div>

             <div className="space-y-4 mb-8">
                <p className="text-slate-600">Chứng nhận học viên:</p>
                <h2 className="text-3xl font-bold text-indigo-900 font-serif">{student.name}</h2>
                <div className="flex justify-center gap-8 text-slate-700 mt-4">
                    <div className="text-center">
                        <span className="block text-xs uppercase text-slate-400">Điểm trung bình</span>
                        <span className="text-xl font-bold">{sem1Avg}</span>
                    </div>
                     <div className="text-center">
                        <span className="block text-xs uppercase text-slate-400">Xếp loại</span>
                        <span className="text-xl font-bold text-indigo-600">{student.classification}</span>
                    </div>
                </div>
             </div>

             <div className="pt-6 border-t border-yellow-200 flex justify-between items-end">
                <div className="text-left">
                    <p className="text-xs text-slate-400">Ngày cấp</p>
                    <p className="font-bold text-slate-700">{new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=Teacher&backgroundColor=transparent" className="w-16 h-10 ml-auto opacity-50 mb-1" alt="signature"/>
                    <p className="text-xs font-bold text-slate-900 uppercase">Giáo viên phụ trách</p>
                </div>
             </div>
             
             <div className="absolute -right-4 -bottom-4 print:hidden">
                <button className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105" title="Tải xuống">
                    <Download size={20} />
                </button>
             </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-10 text-center">
              <Lock className="mx-auto text-slate-300 mb-3" size={48} />
              <h3 className="text-lg font-bold text-slate-500 mb-1">Chứng nhận Học kỳ I đang bị khóa</h3>
              <p className="text-slate-400 text-sm mb-4">Hoàn thành 5 bài học đầu tiên với điểm số đạt yêu cầu để mở khóa.</p>
              <div className="w-full max-w-md mx-auto bg-slate-200 h-4 rounded-full overflow-hidden">
                 <div 
                   className="bg-indigo-500 h-full" 
                   style={{ width: `${(semester1Lessons.filter(l => progress[l.id]?.passed).length / 5) * 100}%` }}
                 ></div>
              </div>
              <p className="text-xs text-indigo-600 mt-2 font-bold">Tiến độ: {semester1Lessons.filter(l => progress[l.id]?.passed).length}/5 bài</p>
          </div>
        )}
      </div>

      {/* 3. Badges Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson Badges */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
             <Star className="text-orange-500" /> Huy hiệu Bài học (Chủ đề)
           </h3>
           <div className="grid grid-cols-4 gap-4">
              {lessons.map(lesson => {
                 const isPassed = progress[lesson.id]?.passed;
                 return (
                   <div key={lesson.id} className="flex flex-col items-center group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 transition-all ${
                         isPassed 
                         ? 'bg-orange-100 border-orange-400 text-orange-600 shadow-md scale-105' 
                         : 'bg-slate-50 border-slate-200 text-slate-300 grayscale'
                      }`}>
                         {isPassed ? <CheckCircle size={20} /> : <Lock size={16} />}
                      </div>
                      <span className={`text-[10px] text-center font-bold ${isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                        Bài {lesson.order}
                      </span>
                   </div>
                 );
              })}
           </div>
        </div>

        {/* Exam Badges */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
             <Award className="text-red-500" /> Huy hiệu Kiểm tra
           </h3>
           <div className="space-y-4">
              {exams.map(exam => {
                 // Check if exam is submitted
                 const sub = submissions.find(s => s.assignmentId === exam.id);
                 const isDone = sub && sub.status === 'graded'; // Or pending if we just want to track completion
                 
                 // Safe title handling to avoid substring on non-string
                 const title = String(exam.title || 'Đề thi');

                 return (
                    <div key={exam.id} className={`flex items-center gap-4 p-3 rounded-xl border ${isDone ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                       <div className={`p-2 rounded-full ${isDone ? 'bg-white text-red-500 shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                          <Award size={20} />
                       </div>
                       <div className="flex-1">
                          <h4 className={`font-bold text-xs ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>{title.substring(0, 20)}{title.length > 20 ? '...' : ''}</h4>
                       </div>
                       {isDone && (
                          <span className="font-bold text-red-600 text-sm">{sub?.grade}/10</span>
                       )}
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Game Badges (New) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
             <Gamepad2 className="text-purple-500" /> Huy hiệu Trò chơi
           </h3>
           <div className="space-y-4">
              {allGames.filter(g => g.type === 'quiz').map(game => {
                 const hasBadge = student.badges?.includes(`badge-game-${game.id}`);
                 return (
                    <div key={game.id} className={`flex items-center gap-3 p-3 rounded-xl border ${hasBadge ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`p-2 rounded-full border-2 ${hasBadge ? 'bg-white border-purple-300 text-purple-600' : 'border-slate-200 text-slate-300 grayscale'}`}>
                            <Medal size={24} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm ${hasBadge ? 'text-purple-900' : 'text-slate-400'}`}>{game.title}</h4>
                            <p className="text-[10px] text-slate-500">{hasBadge ? 'Đã hoàn thành xuất sắc' : 'Chưa mở khóa'}</p>
                        </div>
                    </div>
                 );
              })}
              {allGames.filter(g => g.type === 'quiz').length === 0 && <p className="text-xs text-slate-400 italic">Chưa có trò chơi tính điểm nào.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
