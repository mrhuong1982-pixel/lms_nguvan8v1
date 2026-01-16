
import React, { useState, useEffect } from 'react';
import { Assignment, Submission } from '../types';
import { Send, CheckCircle, Clock, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { submitAssignment } from '../services/mockProvider';

interface SubmissionViewProps {
  assignment: Assignment;
  existingSubmission?: Submission;
  onBack: () => void;
}

const SubmissionView: React.FC<SubmissionViewProps> = ({ assignment, existingSubmission, onBack }) => {
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (existingSubmission) {
      setContent(existingSubmission.content || '');
    }
  }, [existingSubmission]);

  const handleSubmit = async () => {
    if (!content.trim() && !linkUrl.trim()) return;
    setIsSubmitting(true);
    
    let finalContent = content;
    if (linkUrl.trim()) {
      finalContent += `\n\n🔗 Link bài làm: ${linkUrl.trim()}`;
    }

    await submitAssignment(assignment.id, finalContent);
    setIsSubmitting(false);
    setJustSubmitted(true);
  };

  if (justSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border">
        <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
          <CheckCircle size={48} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Nộp bài thành công!</h3>
        <p className="text-slate-500 mb-6">Giáo viên sẽ chấm điểm và phản hồi sớm.</p>
        <button onClick={onBack} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isGraded = existingSubmission?.status === 'graded';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">{assignment.title}</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Clock size={16} /> Hạn nộp: {new Date(assignment.deadline).toLocaleDateString('vi-VN')}
        </div>
        <div className="prose prose-slate bg-slate-50 p-4 rounded-lg mb-6">
          <p>{assignment.description}</p>
        </div>

        <div className="mb-6">
          <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 mb-3">Tiêu chí chấm điểm (Rubric)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignment.rubric.map(r => (
              <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                <span className="text-sm font-medium">{r.criteria}</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{r.maxPoints} điểm</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Bài làm của bạn</h3>
        
        {isGraded ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-green-800">Kết quả: {existingSubmission?.grade}/10 điểm</span>
              <span className="text-xs text-green-600 italic">Đã chấm</span>
            </div>
            <p className="text-sm text-green-700"><strong>Nhận xét:</strong> {existingSubmission?.feedback}</p>
          </div>
        ) : null}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isGraded}
          className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none mb-4"
          placeholder="Nhập nội dung bài làm trực tiếp..."
        ></textarea>

        {/* Attachment Section */}
        {!isGraded && (
          <div className="space-y-4 mb-4">
            
            {/* Link Input */}
            <div className="flex items-center gap-2">
               <div className="relative flex-1">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Dán đường dẫn sản phẩm (Canva, Docs, Drive...)"
                  />
               </div>
               {linkUrl && (
                 <a href={linkUrl} target="_blank" rel="noreferrer" className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100" title="Kiểm tra link">
                   <ExternalLink size={20} />
                 </a>
               )}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-end gap-3 border-t pt-4">
          <button 
            onClick={onBack}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
          >
            Hủy
          </button>
          {!isGraded && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !linkUrl.trim())}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
            >
              {isSubmitting ? 'Đang gửi...' : 'Nộp bài'} <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionView;
