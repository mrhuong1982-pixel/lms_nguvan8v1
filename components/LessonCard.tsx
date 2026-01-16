import React from 'react';
import { Lesson, StudentProgress } from '../types';
import { Lock, Unlock, CheckCircle, Clock } from 'lucide-react';
import { isTimeUnlocked } from '../services/mockProvider';

interface LessonCardProps {
  lesson: Lesson;
  progress?: StudentProgress;
  isPreviousPassed: boolean;
  onClick: (lesson: Lesson) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, progress, isPreviousPassed, onClick }) => {
  const timeUnlocked = isTimeUnlocked(lesson.monthUnlock);
  
  // Logic Double Lock
  // 1. First lesson is always progress-unlocked (order === 1)
  // 2. Subsequent lessons need previous passed
  const progressUnlocked = lesson.order === 1 || isPreviousPassed;
  
  const isLocked = !timeUnlocked || !progressUnlocked;
  const isCompleted = progress?.passed;

  let statusText = "";
  let statusColor = "";
  let Icon = Lock;

  if (!timeUnlocked) {
    statusText = `Mở vào tháng ${lesson.monthUnlock}`;
    statusColor = "text-slate-400 bg-slate-100";
    Icon = Clock;
  } else if (!progressUnlocked) {
    statusText = "Hoàn thành bài trước";
    statusColor = "text-red-500 bg-red-50";
    Icon = Lock;
  } else if (isCompleted) {
    statusText = `Đã học (${progress?.score}/10)`;
    statusColor = "text-green-600 bg-green-50";
    Icon = CheckCircle;
  } else {
    statusText = "Sẵn sàng học";
    statusColor = "text-blue-600 bg-blue-50";
    Icon = Unlock;
  }

  return (
    <div 
      onClick={() => !isLocked && onClick(lesson)}
      className={`relative group rounded-xl border p-5 transition-all duration-300 ${
        isLocked 
          ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-80' 
          : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-300 cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusColor}`}>
          <Icon size={14} />
          {statusText}
        </span>
        <span className="text-xs text-slate-400 font-medium">Tháng {lesson.monthUnlock}</span>
      </div>

      <h3 className={`font-bold text-lg mb-2 ${isLocked ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-700'}`}>
        {lesson.title}
      </h3>
      
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
        {lesson.description}
      </p>

      {/* Progress Bar mini if started but not passed */}
      {!isLocked && !isCompleted && progress && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-orange-400 h-full" 
            style={{ width: `${(progress.score / 10) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default LessonCard;