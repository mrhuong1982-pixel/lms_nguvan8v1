
import React, { useState, useEffect } from 'react';
import { Lesson, QuizQuestion, QuestionType } from '../types';
import { getLessons, getQuestions, saveQuestion, deleteQuestion } from '../services/mockProvider';
import { Save, Trash, Plus, Upload, Download, FileType, Filter, Loader2, Edit, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminQuestionManager: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [lData, qData] = await Promise.all([getLessons(), getQuestions('all')]);
      setLessons(lData || []);
      setQuestions(qData || []);
    } catch (e) {
      console.error("Failed to load initial data", e);
      setLessons([]);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const qData = await getQuestions('all');
      setQuestions(qData || []);
    } catch (e) {
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: QuizQuestion = {
      id: '', // Will be generated
      lessonId: selectedLessonId === 'all' ? (lessons[0]?.id || '') : selectedLessonId,
      type: type,
      question: '',
      options: type === 'choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'choice' ? 0 : '',
      points: 1
    };
    setEditingQuestion(newQ);
  };

  const handleSaveQuestion = async () => {
    if (editingQuestion) {
        setIsLoading(true);
        await saveQuestion(editingQuestion);
        setEditingQuestion(null);
        await handleRefresh(); // Refresh list from server
        setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
        setIsLoading(true);
        await deleteQuestion(id);
        await handleRefresh();
        setIsLoading(false);
    }
  };

  // --- EXCEL LOGIC ---

  const downloadTemplate = () => {
    // Define headers and sample data
    const data = [
      {
        type: "choice",
        question: "Thủ đô của Việt Nam là gì?",
        correctAnswer: 0,
        options: "Hà Nội|Hồ Chí Minh|Đà Nẵng|Cần Thơ",
        points: 1,
        note: "correctAnswer là số thứ tự bắt đầu từ 0 (0=A, 1=B...)"
      },
      {
        type: "fill",
        question: "Điền vào chỗ trống: Học đi đôi với...?",
        correctAnswer: "hành",
        options: "",
        points: 1,
        note: "correctAnswer là từ cần điền"
      },
      {
        type: "short",
        question: "Tác giả bài 'Hịch tướng sĩ' là ai?",
        correctAnswer: "Trần Quốc Tuấn",
        options: "",
        points: 2,
        note: "correctAnswer là câu trả lời ngắn"
      },
      {
        type: "essay",
        question: "Em hãy nêu cảm nghĩ về nhân vật Lão Hạc?",
        correctAnswer: "",
        options: "",
        points: 5,
        note: "Tự luận không cần đáp án"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-width columns for better UX
    const wscols = [
        {wch: 10}, // type
        {wch: 40}, // question
        {wch: 15}, // correctAnswer
        {wch: 30}, // options
        {wch: 8},  // points
        {wch: 40}  // note
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mau_Cau_Hoi");
    XLSX.writeFile(workbook, "Mau_Ngan_Hang_Cau_Hoi.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Parse JSON from Excel
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        let count = 0;
        const targetLessonId = selectedLessonId === 'all' ? (lessons[0]?.id || 'unknown') : selectedLessonId;

        for (const row of data) {
           // Basic validation
           if (!row.question || !row.type) continue;

           const type = row.type.toString().trim().toLowerCase() as QuestionType;
           let options: string[] | undefined = undefined;
           let correctAnswer: string | number = row.correctAnswer;

           // Parse Options
           if (type === 'choice' && row.options) {
              options = row.options.toString().split('|').map((o: string) => o.trim());
              // Ensure correct answer is an index number for choice
              if (!isNaN(parseInt(row.correctAnswer))) {
                 correctAnswer = parseInt(row.correctAnswer);
              } else {
                 // Fallback if user typed 'A' instead of 0
                 const charCode = row.correctAnswer.toString().toUpperCase().charCodeAt(0);
                 if (charCode >= 65 && charCode <= 68) correctAnswer = charCode - 65;
                 else correctAnswer = 0;
              }
           } else {
              // Ensure string for other types
              correctAnswer = row.correctAnswer ? row.correctAnswer.toString() : '';
           }

           const newQ: QuizQuestion = {
              id: `temp_${Date.now()}_${count}`,
              lessonId: targetLessonId,
              type: type,
              question: row.question,
              options: options,
              correctAnswer: correctAnswer,
              points: row.points ? parseFloat(row.points) : 1
           };

           await saveQuestion(newQ);
           count++;
        }

        await handleRefresh();
        alert(`Đã nhập thành công ${count} câu hỏi từ Excel!`);
      } catch (error) {
        console.error("Lỗi nhập file", error);
        alert("Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra định dạng.");
      } finally {
        setIsLoading(false);
        // Reset file input
        e.target.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  // --- END EXCEL LOGIC ---

  const safeQuestions = Array.isArray(questions) ? questions : [];
  const filteredQuestions = selectedLessonId === 'all' 
    ? safeQuestions 
    : safeQuestions.filter(q => q.lessonId === selectedLessonId);

  // Form for Adding/Editing
  if (editingQuestion) {
     return (
        <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
           <h3 className="text-xl font-bold mb-6">{editingQuestion.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
           
           <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Thuộc bài học</label>
              <select 
                value={editingQuestion.lessonId}
                onChange={e => setEditingQuestion({...editingQuestion, lessonId: e.target.value})}
                className="w-full border p-2 rounded"
              >
                 {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                 ))}
              </select>
           </div>
           
           <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Nội dung câu hỏi</label>
              <textarea 
                value={editingQuestion.question}
                onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                className="w-full border p-2 rounded h-24"
                placeholder="Nhập câu hỏi..."
              />
           </div>

           {editingQuestion.type === 'choice' && editingQuestion.options && (
              <div className="mb-4 space-y-2">
                 <label className="block text-sm font-bold mb-1">Các lựa chọn (Chọn đáp án đúng)</label>
                 {editingQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                       <input 
                         type="radio" 
                         name="correct" 
                         checked={editingQuestion.correctAnswer === idx}
                         onChange={() => setEditingQuestion({...editingQuestion, correctAnswer: idx})}
                       />
                       <input 
                         type="text" 
                         value={opt}
                         onChange={e => {
                            const newOpts = [...editingQuestion.options!];
                            newOpts[idx] = e.target.value;
                            setEditingQuestion({...editingQuestion, options: newOpts});
                         }}
                         className="flex-1 border p-2 rounded text-sm"
                         placeholder={`Lựa chọn ${String.fromCharCode(65+idx)}`}
                       />
                    </div>
                 ))}
              </div>
           )}

           {(editingQuestion.type === 'fill' || editingQuestion.type === 'short') && (
               <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Đáp án chính xác</label>
                  <input 
                     type="text" 
                     value={editingQuestion.correctAnswer as string}
                     onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                     className="w-full border p-2 rounded"
                     placeholder="Nhập từ hoặc câu trả lời đúng..."
                  />
               </div>
           )}

           {editingQuestion.type === 'essay' && (
               <div className="mb-4 bg-orange-50 p-3 rounded border border-orange-200">
                  <p className="text-sm text-orange-800 font-bold mb-1"><FileType size={16} className="inline mr-1"/> Câu hỏi tự luận</p>
                  <p className="text-xs text-orange-700">Học sinh sẽ trả lời bằng văn bản dài. Không có đáp án tự động.</p>
               </div>
           )}

           <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <button onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
              <button onClick={handleSaveQuestion} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">
                 {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu câu hỏi
              </button>
           </div>
        </div>
     );
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900 mb-1">Ngân hàng câu hỏi</h2>
           <p className="text-sm text-slate-500">Quản lý câu hỏi cho từng bài học</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 border">
                <Filter size={16} className="text-slate-400"/>
                <select 
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="bg-transparent border-none py-2 text-sm focus:ring-0 text-slate-700 outline-none w-48"
                >
                  <option value="all">Tất cả bài học</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
            </div>
            
            <div className="flex gap-2">
                 <button 
                    onClick={downloadTemplate} 
                    title="Tải mẫu Excel" 
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm font-medium"
                 >
                    <FileSpreadsheet size={18} /> Tải mẫu Excel
                 </button>
                 <label 
                    title="Nhập từ file Excel" 
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
                 >
                    <Upload size={18} /> Nhập Excel
                    <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                 </label>
            </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
           <button onClick={() => handleAddQuestion('choice')} className="py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border border-indigo-200">
             <Plus size={16} /> Trắc nghiệm
           </button>
           <button onClick={() => handleAddQuestion('fill')} className="py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border border-indigo-200">
             <Plus size={16} /> Điền khuyết
           </button>
           <button onClick={() => handleAddQuestion('short')} className="py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border border-indigo-200">
             <Plus size={16} /> Trả lời ngắn
           </button>
           <button onClick={() => handleAddQuestion('essay')} className="py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-1 border border-indigo-200">
             <Plus size={16} /> Tự luận
           </button>
      </div>

      {isLoading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32}/><p className="text-slate-500 mt-2">Đang tải dữ liệu...</p></div> : (
        <div className="space-y-4">
           {filteredQuestions.length === 0 && <p className="text-center text-slate-500 py-10">Chưa có câu hỏi nào cho bộ lọc này.</p>}
           {filteredQuestions.map((q, idx) => {
             if (!q) return null; // CRITICAL FIX: Skip undefined/null questions
             return (
             <div key={q.id || idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative group hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex justify-between mb-2">
                   <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                           q.type === 'choice' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                           q.type === 'fill' ? 'bg-green-100 text-green-700 border-green-200' :
                           q.type === 'essay' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                           'bg-purple-100 text-purple-700 border-purple-200'
                       }`}>
                           {q.type}
                       </span>
                       <span className="text-xs text-slate-400">
                          Bài: {lessons.find(l => l.id === q.lessonId)?.title || 'Chung'}
                       </span>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingQuestion(q)} className="p-1.5 bg-white border rounded text-blue-600 hover:bg-blue-50"><Edit size={14}/></button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 bg-white border rounded text-red-600 hover:bg-red-50"><Trash size={14}/></button>
                   </div>
                </div>
                
                <h4 className="font-bold text-slate-800 mb-2">{q.question}</h4>
                
                {q.type === 'choice' && q.options && Array.isArray(q.options) && (
                   <ul className="text-sm text-slate-600 pl-4 list-disc mb-2 grid grid-cols-2 gap-x-4">
                      {q.options.map((opt, i) => (
                         <li key={i} className={i === q.correctAnswer ? 'text-green-600 font-bold' : ''}>
                            {opt} {i === q.correctAnswer && '(Đúng)'}
                         </li>
                      ))}
                   </ul>
                )}
                {(q.type === 'fill' || q.type === 'short') && (
                   <p className="text-sm text-green-700 font-medium">Đáp án: {q.correctAnswer}</p>
                )}
             </div>
             );
           })}
        </div>
      )}
    </div>
  );
};

export default AdminQuestionManager;
