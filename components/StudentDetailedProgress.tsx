
import React from 'react';
import { StudentAccount, Lesson, ProgressMap, Submission } from '../types';
import { Activity, CheckCircle, Clock, Trophy, Target, Calendar, ArrowUpRight, ArrowRight, MessageCircle } from 'lucide-react';

interface StudentDetailedProgressProps {
  student: StudentAccount;
  lessons: Lesson[];
  progress: ProgressMap;
  submissions: Submission[];
}

const StudentDetailedProgress: React.FC<StudentDetailedProgressProps> = ({ student, lessons, progress, submissions }) => {
  const publishedLessons = lessons.filter(l => l.isPublished);
  const completedCount = publishedLessons.filter(l => progress[l.id]?.passed).length;
  const completionPercent = Math.round((completedCount / publishedLessons.length) * 100) || 0;

  const getStatusColor = (score: number) => {
    if (score >= 9) return 'text-purple-600 bg-purple-50 border-purple-100';
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Activity className="text-indigo-600" /> Tiến độ học tập
           </h1>
           <p className="text-slate-500 mt-1">Phân tích kết quả và lộ trình chinh phục mục tiêu.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-6">
           <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Thời gian học</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-1 justify-center"><Clock size={18} className="text-blue-500" /> {Math.round(student.studyTime / 60)}h</span>
           </div>
           <div className="w-px h-10 bg-slate-100"></div>
           <div className="text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Huy hiệu</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-1 justify-center"><Trophy size={18} className="text-yellow-500" /> {(student.badges || []).length}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Progress Visualization */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-3xl border shadow-sm">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="font-bold text-lg text-slate-900">Tiến trình chương trình</h3>
                 <span className="text-3xl font-black text-indigo-600">{completionPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border p-1 mb-8">
                 <div 
                   className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-100"
                   style={{ width: `${completionPercent}%` }}
                 />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                       <CheckCircle size={16} /> <span className="text-xs font-bold uppercase">Hoàn thành</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{completedCount} <span className="text-sm font-normal text-slate-500">/ {publishedLessons.length} bài</span></p>
                 </div>
                 <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                       <Target size={16} /> <span className="text-xs font-bold uppercase">Điểm TB</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{(student.totalScore / (completedCount || 1)).toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 10</span></p>
                 </div>
                 <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                       <ArrowUpRight size={16} /> <span className="text-xs font-bold uppercase">Thứ hạng</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">#{student.rank || '??'}</p>
                 </div>
              </div>
           </div>

           {/* Detailed Scores Table */}
           <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                 <h3 className="font-bold text-lg">Bảng điểm chi tiết</h3>
                 <button className="text-xs text-indigo-600 font-bold hover:underline">Xuất báo cáo PDF</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                       <tr>
                          <th className="px-6 py-4">Chủ đề</th>
                          <th className="px-6 py-4 text-center">Trạng thái</th>
                          <th className="px-6 py-4 text-center">Điểm số</th>
                          <th className="px-6 py-4 text-right">Ngày học</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {publishedLessons.map(lesson => {
                          const p = progress[lesson.id];
                          return (
                             <tr key={lesson.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{lesson.order}</div>
                                      <div>
                                         <p className="font-bold text-sm text-slate-900">{lesson.title}</p>
                                         <p className="text-[10px] text-slate-500">Tháng {lesson.monthUnlock}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   {p?.passed ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                         <CheckCircle size={10} /> ĐÃ ĐẠT
                                      </span>
                                   ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                         CHƯA HÀNH
                                      </span>
                                   )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                   {p ? (
                                      <div className={`inline-block w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${getStatusColor(p.score)}`}>
                                         {p.score}
                                      </div>
                                   ) : <span className="text-slate-200">-</span>}
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-slate-400">
                                   {p ? new Date(p.updatedAt).toLocaleDateString('vi-VN') : '-'}
                                </td>
                             </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right: Feedback & Milestones */}
        <div className="space-y-6">
           <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 p-8 opacity-20"><Trophy size={100} /></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Mục tiêu tiếp theo</h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10">Bạn chỉ còn 2 bài nữa để nhận chứng chỉ Học kỳ 1!</p>
              <div className="flex items-center justify-between mb-2 text-xs font-bold">
                 <span>Tiến độ nhận Cert</span>
                 <span>80%</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-4">
                 <div className="bg-white h-full w-[80%]" />
              </div>
              <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                 Tiếp tục bài học <ArrowRight size={16} />
              </button>
           </div>

           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <MessageCircle className="text-blue-500" /> Nhận xét giáo viên
              </h3>
              <div className="space-y-4">
                 {submissions.filter(s => s.status === 'graded').slice(0, 3).map(sub => (
                    <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">Bài tập #{sub.assignmentId.substring(0,4)}</span>
                          <span className="text-xs font-black text-slate-900">{sub.grade}/10</span>
                       </div>
                       <p className="text-xs text-slate-600 italic line-clamp-3">"{sub.feedback || 'Rất tốt, hãy phát huy!'}"</p>
                    </div>
                 ))}
                 {submissions.filter(s => s.status === 'graded').length === 0 && (
                    <div className="text-center py-6 text-slate-400">
                       <p className="text-xs">Chưa có nhận xét nào từ giáo viên.</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <Calendar className="text-purple-500" /> Hoạt động gần đây
              </h3>
              <div className="space-y-4 relative">
                 <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100" />
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 relative">
                       <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-200 z-10 flex-shrink-0" />
                       <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">Hoàn thành kiểm tra Bài {i}</p>
                          <p className="text-[10px] text-slate-400">14:20 - 20/03/2024</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailedProgress;
