
import { Lesson, ProgressMap, Assignment, Submission, DashboardStats, StudentProfile, User, Game, StudentAccount, QuizQuestion, PracticeExam } from '../types';
import { SAMPLE_LESSONS } from './seedData';

// --- CONFIGURATION ---
const API_URL = 'https://script.google.com/macros/s/AKfycbzuzqdrfzFBCsFEYq-V5p6oXaqOfN-EYGXPUxXLxg-Oblfe-SsBivI2LnP6yvRGixgU7A/exec';
const SESSION_KEY = 'nguvan8_session';

// Helper: API Caller
async function apiCall(action: string, payload: any = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    });
    const json = await response.json();
    if (!json.ok) {
      throw new Error(json.error || 'API Error');
    }
    return json.data;
  } catch (error) {
    console.error(`API Call Error [${action}]:`, error);
    throw error;
  }
}

// --- AUTHENTICATION ---

export const login = async (username: string, password: string): Promise<User> => {
  const user = await apiCall('auth.login', { username, password });
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  throw new Error('Đăng nhập thất bại (Dữ liệu trả về rỗng)');
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// --- DATA FETCHING (ASYNC) ---

// 0. SYSTEM
export const setupDatabase = async () => {
  return apiCall('system.setup');
};

// 1. LESSONS
export const getLessons = async (): Promise<Lesson[]> => {
  const list = await apiCall('lessons.list');
  const safeList = Array.isArray(list) ? list : [];
  
  // CONVERT LOGIC: 1 -> true, 0 -> false
  return safeList.map((l: any) => ({
    ...l,
    isPublished: Number(l.isPublished) === 1
  })).sort((a: Lesson, b: Lesson) => a.order - b.order);
};

export const saveLesson = async (lesson: Lesson) => {
  const payload = {
    ...lesson,
    isPublished: lesson.isPublished ? 1 : 0
  };

  if (lesson.id && !lesson.id.startsWith('new_')) {
     return apiCall('lessons.update', payload);
  } else {
     return apiCall('lessons.add', payload);
  }
};

export const deleteLesson = async (id: string) => {
  return apiCall('lessons.remove', { id });
};

export const syncSampleLessons = async (): Promise<string> => {
  try {
    const currentLessons = await getLessons();
    let addedCount = 0;
    let updatedCount = 0;

    for (const sample of SAMPLE_LESSONS) {
      const existing = currentLessons.find(l => l.title === sample.title);
      const payloadData = {
          ...sample,
          isPublished: sample.isPublished ? 1 : 0
      };
      
      if (existing) {
        await apiCall('lessons.update', { ...payloadData, id: existing.id });
        updatedCount++;
      } else {
        const payload = { ...payloadData, id: `new_${sample.id}` }; 
        await apiCall('lessons.add', payload);
        addedCount++;
      }
    }
    return `Đồng bộ thành công: Thêm ${addedCount} bài, Cập nhật ${updatedCount} bài.`;
  } catch (e: any) {
    console.error("Sync failed", e);
    throw new Error("Lỗi đồng bộ: " + e.message);
  }
};

// 2. USERS / STUDENTS
export const getStudents = async (): Promise<StudentAccount[]> => {
  const users = await apiCall('users.list');
  return (Array.isArray(users) ? users : [])
    .filter((u: any) => u.role === 'student')
    .map((u: any) => ({
      ...u,
      classification: u.classification || calculateClassification(u.totalScore || 0, u.studyTime || 0)
    }))
    .sort((a: StudentAccount, b: StudentAccount) => (b.totalScore || 0) - (a.totalScore || 0));
};

export const saveStudent = async (student: StudentAccount) => {
   if (student.id) return apiCall('students.update', student);
   return apiCall('students.add', student);
};

export const deleteStudent = async (id: string) => {
  return apiCall('students.remove', { id });
};

export const importStudentsFromCSV = async (csvContent: string) => {
  const lines = csvContent.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [username, password, name, parentName, phone] = line.split(',');
    if (username && name) {
      await apiCall('students.add', { 
        username: username.trim(), 
        password: password?.trim() || '123', 
        fullName: name.trim(), 
        parentName, 
        phone 
      });
    }
  }
};

// 3. QUESTIONS
export const getQuestions = async (lessonId?: string): Promise<QuizQuestion[]> => {
  const criteria = lessonId ? { lessonId } : {};
  const res = await apiCall('questions.list', criteria);
  return Array.isArray(res) ? res : [];
};

export const saveQuestion = async (question: QuizQuestion) => {
   if (question.id && typeof question.id === 'string' && !question.id.toString().startsWith('temp_')) {
     return apiCall('questions.update', question);
   } else {
     return apiCall('questions.add', question);
   }
};

export const deleteQuestion = async (id: string | number) => {
  return apiCall('questions.remove', { id });
};

// 4. EXAMS
export const getPracticeExams = async (): Promise<PracticeExam[]> => {
  const res = await apiCall('exams.list');
  const safeRes = Array.isArray(res) ? res : [];
  return safeRes.map((exam: any) => ({
    ...exam,
    questions: Array.isArray(exam.questions) ? exam.questions : []
  }));
};

export const savePracticeExam = async (exam: PracticeExam) => {
  if (exam.id && !exam.id.startsWith('new_')) return apiCall('exams.update', exam);
  return apiCall('exams.add', exam);
};

export const deletePracticeExam = async (id: string) => {
  return apiCall('exams.remove', { id });
};

// 5. GAMES
export const getGames = async (): Promise<Game[]> => {
  const list = await apiCall('games.list');
  if (!Array.isArray(list)) return [];
  return list.map((g: any) => ({
    ...g,
    quizConfig: g.quizConfigJson || g.quizConfig
  }));
};

export const saveGame = async (game: Game) => {
   const payload = { ...game };
   if (payload.quizConfig) {
      // @ts-ignore
      payload.quizConfigJson = payload.quizConfig;
      // @ts-ignore
      delete payload.quizConfig;
   }

   if (game.id && !game.id.startsWith('new_')) {
      return apiCall('games.update', payload);
   }
   return apiCall('games.add', payload);
};

export const deleteGame = async (id: string) => {
  return apiCall('games.remove', { id });
};

export const saveGameResult = async (gameId: string, score: number, isCompleted: boolean) => {
  const user = getCurrentUser();
  if (!user) return;
  return apiCall('games.saveResult', { 
     studentId: user.id, 
     gameId, 
     score, 
     isCompleted 
  });
};

// 6. ASSIGNMENTS
export const getAssignments = async (): Promise<Assignment[]> => {
  const res = await apiCall('assignments.list');
  return Array.isArray(res) ? res : [];
};

export const saveAssignment = async (assign: Assignment) => {
   if (assign.id) return apiCall('assignments.update', assign);
   return apiCall('assignments.add', assign);
};

// 7. PROGRESS
export const getProgress = async (): Promise<ProgressMap> => {
  const user = getCurrentUser();
  if (!user) return {};
  const list = await apiCall('progress.listByStudent', { studentId: user.id });
  
  const map: ProgressMap = {};
  if (Array.isArray(list)) {
    list.forEach((p: any) => {
      map[p.lessonId] = p;
    });
  }
  return map;
};

export const getAllProgress = async (): Promise<any[]> => {
  const list = await apiCall('progress.list');
  return Array.isArray(list) ? list : [];
};

export const saveProgress = async (lessonId: string, score: number) => {
  const user = getCurrentUser();
  if (!user) return;
  await apiCall('progress.update', {
    studentId: user.id,
    lessonId,
    score,
    passed: score >= 8
  });
};

// 8. SUBMISSIONS
export const getMySubmissions = async (): Promise<Submission[]> => {
  const user = getCurrentUser();
  if (!user) return [];
  const res = await apiCall('submissions.listByStudent', { student_id: user.id });
  return Array.isArray(res) ? res : [];
};

export const getAllSubmissions = async (): Promise<Submission[]> => {
  const res = await apiCall('submissions.listAll');
  return Array.isArray(res) ? res : [];
};

export const submitAssignment = async (assignmentId: string, content: string) => {
  const user = getCurrentUser();
  if (!user) return;
  return apiCall('submissions.submit', {
    type: 'assignment',
    assignment_id: assignmentId,
    student_id: user.id,
    studentName: user.name,
    content: content,
    status: 'pending'
  });
};

export const submitExam = async (examId: string, answers: Record<number, string | number>, essayLinks: Record<number, string>, autoScore: number) => {
  const user = getCurrentUser();
  if (!user) return;
  return apiCall('submissions.submit', {
    type: 'exam',
    assignment_id: examId,
    student_id: user.id,
    studentName: user.name,
    answers_json: JSON.stringify(answers),
    essay_links: JSON.stringify(essayLinks),
    auto_score: autoScore,
    status: 'pending'
  });
};

export const gradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
  return apiCall('submissions.grade', { id: submissionId, grade, feedback });
};

// 9. DASHBOARD
export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiCall('reports.classOverview', { classId: 'all' });
};

// --- HELPERS ---

export const calculateClassification = (score: number, minutes: number): string => {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Giỏi';
  if (score >= 65) return 'Khá';
  if (score >= 50) return 'Trung bình';
  return 'Cần cố gắng';
};

export const isTimeUnlocked = (lessonMonth: number): boolean => {
  return true;
};

export const getRandomQuestions = async (count: number): Promise<QuizQuestion[]> => {
   const allQuestions = await getQuestions('all');
   if (!allQuestions || allQuestions.length === 0) return [];
   const validQuestions = allQuestions.filter(q => 
      q && q.question && q.type === 'choice' && Array.isArray(q.options) && q.options.length >= 2
   );
   const shuffled = [...validQuestions];
   for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled.slice(0, count);
};
