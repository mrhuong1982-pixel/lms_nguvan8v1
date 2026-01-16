import React from 'react';
import { StudentAccount } from '../types';
import { Clock, Star, Award, ChevronRight, UserCircle } from 'lucide-react';

interface StudentProgressSidebarProps {
  student: StudentAccount;
  onViewProfile: () => void;
}

const StudentProgressSidebar: React.FC<StudentProgressSidebarProps> = ({ student, onViewProfile }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <img 
            src={student.avatar} 
            alt="Avatar" 
            className="w-12 h-12 rounded-full border-2 border-white bg-white"
          />
          <div>
            <h3 className="font-bold text-lg leading-tight">{student.name}</h3>
            <span className="text-xs text-indigo-100 bg-indigo-500/50 px-2 py-0.5 rounded-full">
              {student.classification || 'Học viên'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex flex-col items-center justify-center text-center">
             <Star className="text-yellow-500 mb-1" size={20} />
             <span className="text-xl font-bold text-slate-800">{student.totalScore}</span>
             <span className="text-xs text-slate-500">Điểm tích lũy</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
             <Clock className="text-blue-500 mb-1" size={20} />
             <span className="text-xl font-bold text-slate-800">{Math.round((student.studyTime || 0) / 60)}h</span>
             <span className="text-xs text-slate-500">Thời gian học</span>
          </div>
        </div>

        <button 
          onClick={onViewProfile}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 group transition-all"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
             <Award className="text-purple-500" size={18} />
             Hồ sơ & Chứng nhận
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default StudentProgressSidebar;