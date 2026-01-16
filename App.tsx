
import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, ChevronLeft, LogOut, LayoutDashboard, FileText, ArrowLeft, ArrowRight, Gamepad2, UserCircle, Link as LinkIcon, Video, Library, Activity, BookCheck } from 'lucide-react';
import { getLessons, getProgress, saveProgress, getAssignments, getMySubmissions, isTimeUnlocked, getCurrentUser, logout, getStudents, getPracticeExams, submitExam, getQuestions } from './services/mockProvider';
import { Lesson, ProgressMap, Assignment, SubLesson, User, StudentAccount, PracticeExam, Game, QuizQuestion } from './types';
import LessonCard from './components/LessonCard';
import QuizComponent from './components/QuizComponent';
import AssignmentList from './components/AssignmentList';
import SubmissionView from './components/SubmissionView';
import DashboardReport from './components/DashboardReport';
import LoginPage from './components/LoginPage';
import StudentLeaderboard from './components/StudentLeaderboard';
import ExamReviewWidget from './components/ExamReviewWidget';
import GameList from './components/GameList';
import StudentProgressSidebar from './components/StudentProgressSidebar';
import StudentProfilePage from './components/StudentProfilePage';
import GamePlayer from './components/GamePlayer';
import StudentLibrary from './components/StudentLibrary';
import StudentDetailedProgress from './components/StudentDetailedProgress';

type ViewMode = 'lessons' | 'assignments' | 'games' | 'library' | 'progress' | 'profile' | 'dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('lessons');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [leaderboardData, setLeaderboardData] = useState<StudentAccount[]>([]);
  const [practiceExams, setPracticeExams] = useState<PracticeExam[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  // UI State
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSubLesson, setSelectedSubLesson] = useState<SubLesson | null>(null);
  const [activeLessonTab, setActiveLessonTab] = useState<'content' | 'quiz'>('content');
  const [lessonQuestions, setLessonQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedExam, setSelectedExam] = useState<PracticeExam | null>(null);
  const [examMode, setExamMode] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  // Initial Load
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'teacher') setViewMode('dashboard');
      fetchData(user);
    }
  }, []);

  const fetchData = async (user: User) => {
    setIsLoading(true);
    try {
      const [lData, aData, pData, sData, eData, subData] = await Promise.all([
        getLessons(),
        getAssignments(),
        getProgress(),
        getStudents(),
        getPracticeExams(),
        getMySubmissions()
      ]);
      
      setLessons(lData);
      setAssignments(aData);
      setProgressMap(pData);
      setLeaderboardData(sData);
      setPracticeExams(eData);
      setMySubmissions(subData);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'teacher') {
      setViewMode('dashboard');
    } else {
      setViewMode('lessons');
    }
    fetchData(user);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setSelectedLesson(null);
    setSelectedAssignment(null);
    setSelectedSubLesson(null);
    setSelectedExam(null);
    setExamMode(false);
    setActiveGame(null);
    setLessons([]); 
  };

  const resetViews = () => {
    setSelectedLesson(null);
    setSelectedAssignment(null);
    setExamMode(false);
    setActiveGame(null);
    setSelectedSubLesson(null);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedSubLesson(null);
    setActiveLessonTab('content');
    window.scrollTo(0,0);
  };

  const handleSubLessonSelect = (subLesson: SubLesson) => {
    setSelectedSubLesson(subLesson);
    window.scrollTo(0,0);
  };

  const handleLoadQuiz = async () => {
      setActiveLessonTab('quiz');
      if (selectedLesson) {
          const qs = await getQuestions(selectedLesson.id);
          setLessonQuestions(qs);
      }
  };

  const handleAssignmentSelect = async (assign: Assignment) => {
    const subs = await getMySubmissions();
    setMySubmissions(subs);
    setSelectedAssignment(assign);
    window.scrollTo(0,0);
  };

  const handleStartExam = (exam: PracticeExam) => {
    setSelectedExam(exam);
    setExamMode(true);
    window.scrollTo(0,0);
  };

  const handleQuizComplete = async (score: number) => {
    if (selectedLesson) {
      await saveProgress(selectedLesson.id, score);
      const newProgress = await getProgress();
      setProgressMap(newProgress);
      const newStudents = await getStudents();
      setLeaderboardData(newStudents);
    }
  };

  const handleExamComplete = async (score: number, answers: Record<number, string | number>, essayLinks: Record<number, string>) => {
    if (selectedExam) {
       await submitExam(selectedExam.id, answers, essayLinks, score);
       const subs = await getMySubmissions();
       setMySubmissions(subs);
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-700">
          <BookOpen className="text-indigo-600" />
          <span className="hidden md:inline">Ngữ Văn 8 DL</span>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-[50vw] md:max-w-none no-scrollbar">
          {currentUser.role === 'student' && (
            <>
              <button 
                onClick={() => { setViewMode('lessons'); resetViews(); }}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'lessons' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
              >
                Lộ trình
              </button>
              <button 
                onClick={() => { setViewMode('library'); resetViews(); }}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${viewMode === 'library' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
              >
                <Library size={16} /> Học liệu
              </button>
              <button 
                onClick={() => { setViewMode('progress'); resetViews(); }}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1 ${viewMode === 'progress' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
              >
                <Activity size={16} /> Tiến độ
              </button>
              <button 
                onClick={() => { setViewMode('assignments'); resetViews(); }}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'assignments' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
              >
                Bài tập
              </button>
               <button 
                onClick={() => { setViewMode('games'); resetViews(); }}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${viewMode === 'games' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
              >
                <Gamepad2 size={16} /> Trò chơi
              </button>
            </>
          )}
          {currentUser.role === 'teacher' && (
            <button 
              onClick={() => setViewMode('dashboard')}
               className={`px-4 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm text-indigo-700 whitespace-nowrap`}
            >
              Quản trị & Chấm bài
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-right cursor-pointer" onClick={() => setViewMode('profile')}>
             <div className="hidden md:block">
               <p className="text-sm font-bold text-slate-900 leading-tight">{currentUser.name}</p>
               <p className="text-[10px] text-indigo-600 uppercase font-bold">{currentUser.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
             </div>
             <img src={currentUser.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-indigo-100 bg-slate-50" />
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><LogOut size={20} /></button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    if (currentUser.role === 'teacher') return <div className="max-w-7xl mx-auto px-4 py-8"><DashboardReport /></div>;

    if (viewMode === 'library') return <StudentLibrary lessons={lessons} onSelectSubLesson={(lesson, sub) => { setSelectedLesson(lesson); handleSubLessonSelect(sub); }} />;
    
    // Fix: Calculate and inject rank when rendering the detailed progress view
    if (viewMode === 'progress') {
      const foundStudent = leaderboardData.find(s => s.id === currentUser.id);
      const rankIndex = leaderboardData.findIndex(s => s.id === currentUser.id);
      const studentWithRank = foundStudent 
        ? { ...foundStudent, rank: rankIndex + 1 } 
        : { ...(currentUser as StudentAccount), rank: undefined };
      return (
        <StudentDetailedProgress 
          student={studentWithRank} 
          lessons={lessons} 
          progress={progressMap} 
          submissions={mySubmissions} 
        />
      );
    }

    if (viewMode === 'profile') return <StudentProfilePage student={leaderboardData.find(s => s.id === currentUser.id) || (currentUser as StudentAccount)} lessons={lessons} progress={progressMap} exams={practiceExams} submissions={mySubmissions} />;

    if (viewMode === 'games') {
      if (activeGame) return <GamePlayer game={activeGame} onExit={() => setActiveGame(null)} />;
      return <GameList onPlayGame={(game) => { setActiveGame(game); window.scrollTo(0,0); }} />;
    }

    if (viewMode === 'assignments') {
      if (selectedAssignment) return <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in"><SubmissionView assignment={selectedAssignment} existingSubmission={mySubmissions.find(s => s.assignmentId === selectedAssignment?.id)} onBack={() => setSelectedAssignment(null)} /></div>;
      return <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in"><div className="mb-8"><h1 className="text-3xl font-bold text-slate-900 mb-2">Bài tập về nhà</h1><p className="text-slate-500">Hoàn thành các bài tập tự luận để củng cố kiến thức và lấy điểm thành phần.</p></div><AssignmentList assignments={assignments} submissions={mySubmissions} onSelectAssignment={handleAssignmentSelect} /></div>;
    }

    if (examMode && selectedExam) {
       return <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in"><button onClick={() => { setExamMode(false); setSelectedExam(null); }} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"><ArrowLeft size={20} /> Thoát bài thi</button><div className="mb-6 border-b pb-4"><h1 className="text-2xl font-bold text-slate-900">{selectedExam.title}</h1><p className="text-slate-500">{selectedExam.description} • Thời gian: {selectedExam.duration} phút</p></div><QuizComponent questions={selectedExam.questions} readingPassage={selectedExam.readingPassage} passingScore={0} onComplete={handleExamComplete} /></div>;
    }

    if (selectedLesson) {
      if (selectedSubLesson) {
        return (
          <div className="min-h-screen bg-white animate-fade-in">
             <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => setSelectedSubLesson(null)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"><ArrowLeft size={20} /> Quay lại danh sách bài học</button>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{selectedSubLesson.title}</h1>
                <p className="text-lg text-slate-500 mb-8 italic">{selectedSubLesson.description}</p>
                <div className="prose prose-lg prose-indigo max-w-none bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner"><div dangerouslySetInnerHTML={{ __html: selectedSubLesson.contentHtml }} /></div>
                {selectedSubLesson.resources && selectedSubLesson.resources.length > 0 && (
                  <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100"><h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-lg"><LinkIcon size={24} /> Tài liệu & Học liệu đính kèm</h3><div className="grid gap-3">{selectedSubLesson.resources.map((res, i) => (<a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-200 hover:shadow-md transition-shadow group"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">{res.type === 'video' ? <Video size={20} /> : <FileText size={20} />}</div><div className="flex-1"><h4 className="font-bold text-slate-800 group-hover:text-blue-700">{res.title}</h4><p className="text-xs text-slate-500 truncate">{res.url}</p></div><ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500" /></a>))}</div></div>
                )}
                <div className="mt-8 flex justify-between"><button onClick={() => setSelectedSubLesson(null)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Đã hiểu, quay lại</button></div>
             </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-white">
          <div className="max-w-5xl mx-auto px-4 py-8">
             <button onClick={() => setSelectedLesson(null)} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"><ChevronLeft size={20} /> Quay lại lộ trình chung</button>
            <div className="mb-8 border-b pb-6"><span className="text-indigo-600 font-bold tracking-wide uppercase text-sm">Chủ đề {selectedLesson.order}</span><h1 className="text-3xl font-bold text-slate-900 mt-2 mb-4">{selectedLesson.title}</h1><div className="prose prose-slate max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: selectedLesson.introductionHtml }} /></div>
            <div className="flex justify-center mb-8"><div className="bg-slate-100 p-1 rounded-xl inline-flex"><button onClick={() => setActiveLessonTab('content')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeLessonTab === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><BookOpen size={18} /> Các văn bản</button><button onClick={handleLoadQuiz} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeLessonTab === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Trophy size={18} /> Kiểm tra tổng kết</button></div></div>
            {activeLessonTab === 'content' ? (
              <div className="animate-fade-in max-w-3xl mx-auto"><div className="relative"><div className="absolute left-6 top-4 bottom-4 w-0.5 bg-indigo-100" /><div className="space-y-6">{(Array.isArray(selectedLesson.subLessons) ? selectedLesson.subLessons : []).map((sub, idx) => (<div key={sub.id} className="relative pl-16"><div className="absolute left-6 -translate-x-1/2 top-4 w-8 h-8 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center z-10 text-indigo-600 shadow-sm"><span className="text-xs font-bold">{idx + 1}</span></div><div onClick={() => handleSubLessonSelect(sub)} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"><div className="flex items-center gap-2 mb-2"><span className={`text-xs px-2 py-0.5 rounded font-medium ${sub.type === 'vb' ? 'bg-blue-100 text-blue-700' : sub.type === 'connect' ? 'bg-green-100 text-green-700' : sub.type === 'extend' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>{sub.type === 'vb' ? 'Văn bản chính' : sub.type === 'connect' ? 'Đọc kết nối' : sub.type === 'extend' ? 'Đọc mở rộng' : 'Thực hành'}</span>{sub.resources && sub.resources.length > 0 && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold flex items-center gap-0.5"><LinkIcon size={10} /> +{sub.resources.length}</span>)}</div><h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sub.title}</h3><p className="text-slate-500 text-sm mt-1">{sub.description}</p><div className="mt-3 flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Xem nội dung <ArrowRight size={16} className="ml-1" /></div></div></div>))}</div></div><div className="mt-12 pt-8 border-t border-slate-100 flex justify-center"><button onClick={handleLoadQuiz} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg font-medium">Hoàn thành chủ đề & Làm kiểm tra <Trophy size={20} /></button></div></div>
            ) : (
              <div className="animate-fade-in"><div className="text-center mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-2">Kiểm tra kiến thức chủ đề</h2><p className="text-slate-500">Đạt 8/10 điểm để mở khóa chủ đề tiếp theo.</p></div><QuizComponent questions={lessonQuestions} passingScore={8} onComplete={(score) => handleQuizComplete(score)} /></div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        <header className="mb-8 text-center"><h1 className="text-3xl font-bold text-slate-900 mb-4">Lộ trình Ngữ Văn 8</h1><p className="text-slate-500 max-w-2xl mx-auto">Chinh phục các chủ đề học tập để nâng cao kiến thức và thăng hạng trên bảng vàng.</p></header>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 order-2 lg:order-1 sticky top-24 h-fit space-y-6">
             <StudentProgressSidebar student={leaderboardData.find(s => s.id === currentUser?.id) || (currentUser as StudentAccount)} onViewProfile={() => { setViewMode('profile'); window.scrollTo(0,0); }} />
             <StudentLeaderboard students={leaderboardData} currentUser={currentUser} />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {lessons.filter(l => l.isPublished).map((lesson, index) => {
                  const publishedLessons = lessons.filter(l => l.isPublished);
                  const currentIndex = publishedLessons.findIndex(pl => pl.id === lesson.id);
                  const previousLessonId = currentIndex > 0 ? publishedLessons[currentIndex - 1].id : null;
                  const isPreviousPassed = previousLessonId ? progressMap[previousLessonId]?.passed : true;
                  const timeUnlocked = isTimeUnlocked(lesson.monthUnlock);
                  const progressUnlocked = lesson.order === 1 || isPreviousPassed;
                  const isLocked = !timeUnlocked || !progressUnlocked;
                  const isCompleted = progressMap[lesson.id]?.passed;

                  return (
                    <div key={lesson.id} className="relative pl-16">
                      <div className={`absolute left-6 -translate-x-1/2 top-8 w-10 h-10 rounded-full border-4 shadow-sm flex items-center justify-center z-10 transition-colors ${isCompleted ? 'bg-green-500 border-green-100 text-white' : isLocked ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-indigo-600 border-indigo-100 text-white'}`}>{isCompleted ? <BookCheck size={18} strokeWidth={3} /> : <span className="font-bold text-sm">{lesson.order}</span>}</div>
                      <LessonCard lesson={lesson} progress={progressMap[lesson.id]} isPreviousPassed={!!isPreviousPassed} onClick={handleLessonSelect} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 order-3 lg:order-3 space-y-6 lg:sticky lg:top-24 h-fit">
             <ExamReviewWidget exams={practiceExams} onStartExam={handleStartExam} />
             <div onClick={() => { setViewMode('games'); window.scrollTo(0,0); }} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer group hover:border-purple-300 hover:shadow-md transition-all"><div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white flex justify-between items-center"><div className="flex items-center gap-2"><Gamepad2 size={20} /><h3 className="font-bold text-lg">Giải trí</h3></div><ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"/></div><div className="p-4"><p className="text-sm text-slate-500 mb-3">Vừa học vừa chơi với các trò chơi tương tác thú vị.</p><div className="flex items-center justify-between"><div className="flex -space-x-2 overflow-hidden"><div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-green-100 flex items-center justify-center text-[10px] text-green-600 font-bold">W</div><div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">Q</div><div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-red-100 flex items-center justify-center text-[10px] text-red-600 font-bold">K</div></div><span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Chơi ngay</span></div></div></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {renderHeader()}
      {renderContent()}
    </div>
  );
}

export default App;
