import React from 'react';
import { Assignment, Submission } from '../types';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface AssignmentListProps {
  assignments: Assignment[];
  submissions: Submission[];
  onSelectAssignment: (assignment: Assignment) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, submissions, onSelectAssignment }) => {
  
  const getSubmissionStatus = (assignmentId: string) => {
    const sub = submissions.find(s => s.assignmentId === assignmentId);
    if (!sub) return { label: 'Chưa nộp', color: 'text-slate-500 bg-slate-100', icon: AlertCircle };
    if (sub.status === 'pending') return { label: 'Đang chờ chấm', color: 'text-orange-600 bg-orange-50', icon: Clock };
    return { label: `Đã chấm: ${sub.grade}/10`, color: 'text-green-600 bg-green-50', icon: CheckCircle };
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {assignments.map(assign => {
        const status = getSubmissionStatus(assign.id);
        const Icon = status.icon;
        const isExpired = Date.now() > assign.deadline;

        return (
          <div 
            key={assign.id} 
            onClick={() => onSelectAssignment(assign)}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${status.color}`}>
                <Icon size={14} /> {status.label}
              </span>
              <span className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-slate-500'}`}>
                Hạn: {new Date(assign.deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {assign.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2">
              {assign.description}
            </p>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 font-medium">
              <FileText size={16} /> Chi tiết bài tập
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssignmentList;