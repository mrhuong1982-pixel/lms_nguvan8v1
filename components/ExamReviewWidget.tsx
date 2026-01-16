import React, { useState } from 'react';
import { PracticeExam } from '../types';
import { FileEdit, Clock, ChevronRight, PenTool, ChevronDown, ChevronUp } from 'lucide-react';

interface ExamReviewWidgetProps {
  exams: PracticeExam[];
  onStartExam: (exam: PracticeExam) => void;
}

const ExamReviewWidget: React.FC<ExamReviewWidgetProps> = ({ exams, onStartExam }) => {
  const [expandedSection, setExpandedSection] = useState<string>('term-1');

  const sections = [
    { id: 'mid-term-1', label: 'Giữa kỳ I', color: 'bg-blue-100 text-blue-800' },
    { id: 'term-1', label: 'Cuối kỳ I', color: 'bg-purple-100 text-purple-800' },
    { id: 'mid-term-2', label: 'Giữa kỳ II', color: 'bg-blue-100 text-blue-800' },
    { id: 'term-2', label: 'Cuối kỳ II', color: 'bg-purple-100 text-purple-800' },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? '' : id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center gap-2 mb-1">
          <FileEdit size={20} className="text-white" />
          <h3 className="font-bold text-lg">Ôn tập & Kiểm tra</h3>
        </div>
        <p className="text-orange-50 text-xs">Luyện đề trắc nghiệm & tự luận</p>
      </div>

      <div className="p-3 space-y-2">
        {sections.map(section => {
           const sectionExams = exams.filter(e => e.type === section.id);
           const isExpanded = expandedSection === section.id;
           
           return (
             <div key={section.id} className="border rounded-lg overflow-hidden bg-white">
               <button 
                 onClick={() => toggleSection(section.id)}
                 className={`w-full flex items-center justify-between p-3 text-sm font-bold transition-colors ${isExpanded ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
               >
                 <span className={`${section.color} px-2 py-0.5 rounded text-xs`}>{section.label}</span>
                 {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
               </button>
               
               {isExpanded && (
                 <div className="bg-slate-50 p-2 space-y-2 border-t">
                    {sectionExams.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Chưa có đề thi nào.</p>}
                    {sectionExams.map(exam => (
                      <div 
                        key={exam.id}
                        onClick={() => onStartExam(exam)}
                        className="p-3 rounded bg-white border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md cursor-pointer group transition-all"
                      >
                         <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-orange-700">{exam.title}</h4>
                         <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <span className="flex items-center gap-1"><Clock size={12}/> {exam.duration}'</span>
                            <span>•</span>
                            <span>{exam.questions.length} câu</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                               {exam.readingPassage ? 'Đọc hiểu + Viết' : 'Trắc nghiệm'}
                            </span>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-orange-500"/>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>
           );
        })}
      </div>
      
      <div className="px-4 py-3 bg-slate-50 border-t text-center">
        <p className="text-xs text-slate-500 italic">
          Chọn đề thi để bắt đầu làm bài
        </p>
      </div>
    </div>
  );
};

export default ExamReviewWidget;