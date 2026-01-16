
export type QuestionType = 'choice' | 'fill' | 'short' | 'essay';

export interface QuizQuestion {
  id: number | string;
  lessonId?: string; // Links question to a specific lesson
  type: QuestionType;
  question: string;
  options?: string[]; // Only for 'choice'
  correctAnswer?: string | number; // Index for choice, text for fill/short. Essay might have rubric/guide.
  points?: number; // Score value for this question
  tags?: string[];
}

export interface Resource {
  type: 'video' | 'document';
  title: string;
  url: string; // Youtube link or PDF/Word link
}

export interface SubLesson {
  id: string;
  title: string;
  // UPDATE: Added 'write' and 'review' based on user request
  type: 'vb' | 'connect' | 'extend' | 'practice' | 'write' | 'review'; 
  description: string;
  contentHtml: string;
  resources?: Resource[]; // New: Link video/tài liệu
}

export interface Lesson {
  id: string; // e.g., "lesson-1"
  order: number; // 1, 2, 3... used for sequencing
  title: string;
  description: string;
  monthUnlock: number; // 1-12
  introductionHtml: string; // Tri thức ngữ văn / Giới thiệu chung
  subLessons: SubLesson[]; // Các bài học con hiển thị theo timeline
  // REMOVED 'quiz' field
  isPublished: boolean; // Acts as "Active" state
}

export interface GameConfig {
  levelCount: number;      // Số cấp độ (ví dụ: 3 màn chơi)
  questionsPerLevel: number; // Số câu hỏi mỗi màn
  pointsPerLevel: number;    // Điểm thưởng khi qua màn
  timePerLevel?: number;     // Thời gian giới hạn (giây) - Optional
}

export interface Game {
  id: string;
  title: string;
  description: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'external' | 'quiz'; // 'external': Link ngoài, 'quiz': Tự tạo từ ngân hàng câu hỏi
  thumbnail?: string;
  gameUrl?: string; // Link to external game (Only for 'external')
  quizConfig?: GameConfig; // Config for internal quiz game (Only for 'quiz')
  isActive: boolean;
}

export type LessonStatus = 'locked' | 'unlocked' | 'completed';

export interface StudentProgress {
  lessonId: string;
  score: number; // 0-10
  passed: boolean; // true if score >= 8
  updatedAt: number;
}

export interface ProgressMap {
  [lessonId: string]: StudentProgress;
}

// --- New Types for Assignments & Reports ---

export interface RubricItem {
  id: string;
  criteria: string;
  maxPoints: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: number; // timestamp
  rubric: RubricItem[];
}

export interface Submission {
  id: string;
  type?: 'assignment' | 'exam'; // Distinguish between HW and Exams
  assignmentId: string; // Can be assignmentID or examID
  studentId: string;
  studentName: string; 
  content?: string; // For assignments
  answers?: Record<number, string | number>; // For exams: QuestionID -> UserAnswer
  essayLinks?: Record<number, string>; // For exams: QuestionID -> External Link
  submittedAt: number;
  grade?: number; // Final grade
  autoScore?: number; // Score from auto-graded parts (exams)
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface StudentProfile {
  id: string;
  name: string;
  avgScore: number;
  missedDeadlines: number;
  isAtRisk: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  completionRate: number; // Percentage
  atRiskCount: number;
  students: StudentProfile[];
}

// --- Exam Review Types ---
export interface PracticeExam {
  id: string;
  title: string;
  type: 'mid-term-1' | 'term-1' | 'mid-term-2' | 'term-2';
  description: string;
  duration: number; // minutes
  readingPassage?: string; // Content for Reading Comprehension
  questions: QuizQuestion[];
}

// --- Authentication Types ---

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

/**
 * Added rank property to StudentAccount to resolve property missing error
 * in StudentDetailedProgress.tsx
 */
export interface StudentAccount extends User {
  password?: string; // For admin management
  parentName?: string;
  phone?: string;
  totalScore: number; // Accumulated score
  studyTime: number; // In minutes
  classification?: string; // Renamed from rank (Xuất sắc, Giỏi...)
  badges?: string[]; // List of earned badge IDs (e.g., "game-g1", "game-g2")
  rank?: number;
}
