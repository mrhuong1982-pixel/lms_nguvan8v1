
import React, { useState, useEffect } from 'react';
import { DashboardStats, Submission, StudentAccount, User, PracticeExam, Assignment, Lesson } from '../types';
import { getDashboardStats, getAllSubmissions, gradeSubmission, getStudents, getCurrentUser, getPracticeExams, getAssignments, getLessons, getAllProgress, setupDatabase } from '../services/mockProvider';
import { Users, AlertTriangle, BookCheck, CheckCircle, BookOpen, Gamepad2, LayoutDashboard, UserCog, FileEdit, Trophy, CheckSquare, HelpCircle, BarChart3, Database, RefreshCw } from 'lucide-react';
import AdminLessonManager from './AdminLessonManager';
import AdminGameManager from './AdminGameManager';
import AdminStudentManager from './AdminStudentManager';
import AdminExamManager from './AdminExamManager';
import AdminQuestionManager from './AdminQuestionManager';
import StudentLeaderboard from './StudentLeaderboard';
import AdminProgressMatrix from './AdminProgressMatrix';

const DashboardReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'students' | 'lessons' | 'questions' | 'games' | 'exams' | 'leaderboard' | 'progress'>('stats');
  const [isUpdatingDB, setIsUpdatingDB] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  
  // Exams & Assignments & Lessons
  const [practiceExams, setPracticeExams] = useState<PracticeExam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Progress & Students
  const [allStudents, setAllStudents] = useState<StudentAccount[]>([]);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setStats(await getDashboardStats());
      setSubmissions(await getAllSubmissions());
      setAllStudents(await getStudents());
      setCurrentUser(getCurrentUser());
      setPracticeExams(await getPracticeExams());
      setAssignments(await getAssignments());
      setLessons(await getLessons());
      setAllProgress(await getAllProgress());
    };
    fetchData();
  }, []);

  // --- Handlers for Grading ---
  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradeInputs({});
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    let totalScore = 0;

    if (selectedSubmission.type === 'assignment') {
      const assignment = assignments.find(a => a.id === selectedSubmission.assignmentId);
      if (assignment) {
        const currentScore = (Object.values(gradeInputs) as number[]).reduce((a, b) => a + b, 0);
        totalScore = currentScore > 0 ? currentScore : (selectedSubmission.grade || 0);
      }
    } else if (selectedSubmission.type === 'exam') {
      // Calculate exam score: Auto Score + Manual Essay Score
      const essayScore = (Object.values(gradeInputs) as number[]).reduce((a, b) => a + b, 0);
      totalScore = (selectedSubmission.autoScore || 0) + essayScore;
    }

    await gradeSubmission(selectedSubmission.id, totalScore, feedback);
    
    // Update local state to reflect changes immediately
    const updatedSubs = submissions.map(s => 
      s.id === selectedSubmission.id ? { ...s, grade: totalScore, feedback, status: 'graded' as const } : s
    );
    setSubmissions(updatedSubs);
    setSelectedSubmission(null);
  };

  const handleUpdateDB = async () => {
    if (confirm("Thao tác này sẽ đồng bộ cấu trúc các bảng trong Google Sheet (thêm các cột còn thiếu). Bạn có chắc không?")) {
      setIsUpdatingDB(true);
      try {
        await setupDatabase();
        alert("Cập nhật cấu trúc thành công!");
      } catch (e: any) {
        alert("Lỗi cập nhật: " + e.message);
      } finally {
        setIsUpdatingDB(false);
      }
    }
  };

  if (!stats) return <div>Loading...</div>;

  const renderSidebar = () => (
    <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
      <div className="bg-white rounded-xl border shadow-sm p-4 sticky top-24">
         <h3 className="font-bold text-slate-900 mb-4 px-2">Quản trị viên</h3>
         <nav className="space-y-1 mb-6">
           <button 
             onClick={() => setActiveTab('stats')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <LayoutDashboard size={18} /> Tổng quan & Chấm bài
           </button>
           <button 
             onClick={() => setActiveTab('progress')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'progress' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <BarChart3 size={18} /> Tiến độ Học tập
           </button>
           <button 
             onClick={() => setActiveTab('leaderboard')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'leaderboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <Trophy size={18} /> Bảng Vàng (Top)
           </button>
           <button 
             onClick={() => setActiveTab('students')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <UserCog size={18} /> Quản lý Học sinh
           </button>
           <button 
             onClick={() => setActiveTab('exams')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'exams' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <FileEdit size={18} /> Quản lý Đề thi
           </button>
           <button 
             onClick={() => setActiveTab('lessons')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'lessons' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <BookOpen size={18} /> Quản lý Bài học
           </button>
           <button 
             onClick={() => setActiveTab('questions')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'questions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <HelpCircle size={18} /> Ngân hàng câu hỏi
           </button>
           <button 
             onClick={() => setActiveTab('games')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'games' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <Gamepad2 size={18} /> Quản lý Trò chơi
           </button>
         </nav>

         <div className="pt-4 border-t border-slate-100">
            <button 
               onClick={handleUpdateDB}
               disabled={isUpdatingDB}
               className="w-full flex items-center gap-2 justify-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
            >
               {isUpdatingDB ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />} 
               Cập nhật Cấu trúc DB
            </button>
         </div>
      </div>
    </div>
  );

  const renderStatsContent = () => (
    <div className="space-y-8 animate-fade-in">
       {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
            <div><p className="text-sm text-slate-500">Tổng học sinh</p><h3 className="text-2xl font-bold">{stats.totalStudents}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
            <div><p className="text-sm text-slate-500">Tỷ lệ hoàn thành</p><h3 className="text-2xl font-bold">{stats.completionRate}%</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
            <div><p className="text-sm text-slate-500">Học sinh nguy cơ</p><h3 className="text-2xl font-bold">{stats.atRiskCount}</h3></div>
          </div>
        </div>
      </div>

      {/* Grading & At Risk (Existing UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-slate-900">Bài nộp cần chấm (Bài tập & Đề thi)</h3>
          <div className="space-y-3">
            {submissions.filter(s => s.status === 'pending').length === 0 && (
              <p className="text-slate-500 text-sm italic">Không có bài nộp nào đang chờ.</p>
            )}
            {submissions.filter(s => s.status === 'pending').map(sub => {
              const title = sub.type === 'exam' 
                ? practiceExams.find(e => e.id === sub.assignmentId)?.title 
                : assignments.find(a => a.id === sub.assignmentId)?.title;
                
              return (
                <div key={sub.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-sm">{sub.studentName}</p>
                    <p className="text-xs text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded mr-1 ${sub.type === 'exam' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sub.type === 'exam' ? 'Đề thi' : 'Bài tập'}
                      </span>
                      {title || 'Unknown Assignment'}
                    </p>
                  </div>
                  <button onClick={() => handleSelectSubmission(sub)} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded hover:bg-indigo-200">
                    Chấm ngay
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-slate-900">Cảnh báo học tập</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-3 py-2">Học sinh</th>
                  <th className="px-3 py-2">Điểm TB</th>
                  <th className="px-3 py-2">TT</th>
                </tr>
              </thead>
              <tbody>
                {stats.students.filter(s => s.isAtRisk).map(st => (
                  <tr key={st.id} className="border-b">
                    <td className="px-3 py-2 font-medium">{st.name}</td>
                    <td className="px-3 py-2 text-red-600 font-bold">{st.avgScore}</td>
                    <td className="px-3 py-2"><span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">Nguy cơ</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Leaderboard Content
  const renderLeaderboardContent = () => {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
           <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
             <div>
               <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                 <Trophy className="text-yellow-500" /> Bảng Vàng Thành Tích
               </h2>
               <p className="text-slate-500 mt-1">Danh sách vinh danh Top 3, Top 5, Top 10 học sinh xuất sắc nhất.</p>
             </div>
             <div className="flex gap-2">
               <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-100 text-sm font-bold">
                 Top 1: {allStudents[0]?.name || 'N/A'}
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Left: Preview visual widget (Using existing StudentLeaderboard component) */}
             <div>
               <h3 className="font-bold text-slate-700 mb-4">Giao diện hiển thị trên App học sinh</h3>
               <div className="border rounded-xl shadow-sm bg-slate-50 p-4 max-w-sm mx-auto lg:mx-0">
                  <StudentLeaderboard 
                    students={allStudents} 
                    currentUser={currentUser || { id: 'preview', name: 'Giáo viên', role: 'teacher', username: 'teacher' }} 
                  />
               </div>
             </div>

             {/* Right: Detailed Analysis / List */}
             <div>
                <h3 className="font-bold text-slate-700 mb-4">Danh sách chi tiết</h3>
                <div className="bg-slate-50 rounded-xl p-4 border space-y-4">
                   {/* Top 3 Card */}
                   <div className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy size={64} className="text-yellow-500"/></div>
                      <h4 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
                        <Trophy size={18} /> Top 3 Xuất Sắc Nhất
                      </h4>
                      <div className="space-y-2">
                        {allStudents.slice(0, 3).map((s, i) => (
                           <div key={s.id} className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-1 last:border-0 last:pb-0">
                              <span className="font-medium flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">{i+1}</span> 
                                {s.name}
                              </span>
                              <span className="font-bold text-slate-700">{s.totalScore}đ</span>
                           </div>
                        ))}
                         {allStudents.length === 0 && <span className="text-xs text-slate-500">Chưa có dữ liệu</span>}
                      </div>
                   </div>

                   {/* Top 5 & 10 Summary */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                         <h4 className="font-bold text-indigo-700 mb-2 text-sm">Top 5</h4>
                         <ul className="text-xs space-y-1 text-slate-600 list-disc pl-4">
                            {allStudents.slice(3, 5).map(s => (
                              <li key={s.id}>{s.name} ({s.totalScore}đ)</li>
                            ))}
                            {allStudents.length < 5 && <li className="list-none text-slate-400 italic">Cần thêm dữ liệu</li>}
                         </ul>
                      </div>
                       <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                         <h4 className="font-bold text-slate-700 mb-2 text-sm">Top 10</h4>
                         <ul className="text-xs space-y-1 text-slate-600 list-disc pl-4">
                            {allStudents.slice(5, 10).map(s => (
                              <li key={s.id}>{s.name} ({s.totalScore}đ)</li>
                            ))}
                            {allStudents.length < 6 && <li className="list-none text-slate-400 italic">Cần thêm dữ liệu</li>}
                         </ul>
                      </div>
                   </div>
                   
                   <div className="text-center pt-2">
                      <button 
                        onClick={() => setActiveTab('students')}
                        className="text-xs text-indigo-600 font-medium hover:underline"
                      >
                        Xem và quản lý tất cả học sinh &rarr;
                      </button>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    );
  };

  // View: Grading Interface Overlay (Keep existing logic)
  if (selectedSubmission) {
     // ... (Existing grading logic same as provided in context) ...
     if (selectedSubmission.type === 'assignment' || !selectedSubmission.type) {
      const assignment = assignments.find(a => a.id === selectedSubmission.assignmentId);
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm h-fit">
            <button onClick={() => setSelectedSubmission(null)} className="text-sm text-slate-500 mb-4 hover:underline">← Quay lại</button>
            <h2 className="text-xl font-bold mb-2">{assignment?.title}</h2>
            <div className="bg-slate-50 p-4 rounded-lg border min-h-[300px] whitespace-pre-wrap">{selectedSubmission.content}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BookCheck className="text-indigo-600" /> Chấm điểm</h3>
            <div className="space-y-4 mb-6">
              {assignment?.rubric.map(r => (
                <div key={r.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{r.criteria}</span><span className="font-semibold">{gradeInputs[r.id] || 0}/{r.maxPoints}</span>
                  </div>
                  <input type="range" min="0" max={r.maxPoints} step="0.5" value={gradeInputs[r.id] || 0} onChange={(e) => setGradeInputs({...gradeInputs, [r.id]: parseFloat(e.target.value)})} className="w-full accent-indigo-600"/>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between font-bold text-lg"><span>Tổng điểm:</span><span className="text-indigo-600">{(Object.values(gradeInputs) as number[]).reduce((a, b) => a + b, 0)}/10</span></div>
            </div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-2 border rounded-lg h-24 text-sm mb-4" placeholder="Nhập nhận xét..." />
            <button onClick={handleSaveGrade} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Lưu kết quả</button>
          </div>
        </div>
      );
    } else {
      // Exam Grading
      const exam = practiceExams.find(e => e.id === selectedSubmission.assignmentId);
      if (!exam) return <div>Exam data not found</div>;
      const autoScore = selectedSubmission.autoScore || 0;
      const manualQuestions = exam.questions.filter(q => q.type === 'essay' || q.type === 'short');
      const maxManualScore = manualQuestions.reduce((acc, q) => acc + (q.points || 0), 0);
      const currentManualScore = (Object.values(gradeInputs) as number[]).reduce((a, b) => a + b, 0);

      return (
        <div className="animate-fade-in">
           <button onClick={() => setSelectedSubmission(null)} className="text-sm text-slate-500 mb-4 hover:underline">← Quay lại danh sách</button>
           
           <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{exam.title} - Bài làm của {selectedSubmission.studentName}</h2>
              <div className="flex items-center gap-4 mt-4">
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                     <span className="block text-xs font-bold uppercase">Điểm máy chấm</span>
                     <span className="text-xl font-bold">{autoScore}</span>
                  </div>
                  <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-200">
                     <span className="block text-xs font-bold uppercase">Điểm tự luận</span>
                     <span className="text-xl font-bold">{currentManualScore} <span className="text-sm font-normal">/ {maxManualScore}</span></span>
                  </div>
                   <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 ml-auto">
                     <span className="block text-xs font-bold uppercase">Tổng điểm</span>
                     <span className="text-xl font-bold">{autoScore + currentManualScore}</span>
                  </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 {exam.readingPassage && (
                   <div className="bg-slate-50 p-6 rounded-xl border">
                      <h3 className="font-bold text-slate-500 uppercase text-sm mb-3">Văn bản đọc hiểu</h3>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: exam.readingPassage }} />
                   </div>
                 )}
                 <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">Chi tiết câu hỏi tự luận</h3>
                    {manualQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-white p-4 rounded-xl border shadow-sm">
                         <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-700">Câu hỏi {idx+1} ({q.points} điểm)</span>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{q.type === 'essay' ? 'Tự luận' : 'Trả lời ngắn'}</span>
                         </div>
                         <p className="mb-4 text-slate-800 font-medium">{q.question}</p>
                         <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                            <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Bài làm học sinh:</p>
                            <p className="whitespace-pre-wrap text-indigo-900">
                              {selectedSubmission.answers?.[q.id] || '(Không có câu trả lời)'}
                            </p>
                         </div>
                         <div className="flex items-center gap-3 bg-slate-50 p-2 rounded border">
                            <span className="text-sm font-bold">Chấm điểm:</span>
                            <input 
                              type="number" min="0" max={q.points} step="0.25"
                              value={gradeInputs[q.id] || 0}
                              onChange={(e) => {
                                const val = Math.min(parseFloat(e.target.value) || 0, q.points || 0);
                                setGradeInputs({...gradeInputs, [q.id]: val});
                              }}
                              className="w-20 p-1 border rounded text-center font-bold"
                            />
                            <span className="text-sm text-slate-500">/ {q.points}</span>
                            <input type="range" min="0" max={q.points} step="0.25" value={gradeInputs[q.id] || 0} onChange={(e) => setGradeInputs({...gradeInputs, [q.id]: parseFloat(e.target.value)})} className="flex-1 accent-indigo-600"/>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
                    <h3 className="font-bold text-lg mb-4">Xác nhận chấm thi</h3>
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-3 border rounded-lg h-32 text-sm mb-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nhập nhận xét chung..." />
                    <button onClick={handleSaveGrade} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                      <CheckCircle size={20} /> Lưu kết quả & Công bố
                    </button>
                 </div>
              </div>
           </div>
        </div>
      );
    }
  }

  // Main Dashboard View with Sidebar
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {renderSidebar()}
      <div className="flex-1 min-w-0">
        {activeTab === 'stats' && renderStatsContent()}
        {activeTab === 'leaderboard' && renderLeaderboardContent()}
        {activeTab === 'progress' && <AdminProgressMatrix students={allStudents} lessons={lessons} allProgress={allProgress} />}
        {activeTab === 'students' && <AdminStudentManager />}
        {activeTab === 'exams' && <AdminExamManager />}
        {activeTab === 'lessons' && <AdminLessonManager />}
        {activeTab === 'questions' && <AdminQuestionManager />}
        {activeTab === 'games' && <AdminGameManager />}
      </div>
    </div>
  );
};

export default DashboardReport;
