
import React, { useState, useEffect } from 'react';
import { PracticeExam, QuizQuestion, QuestionType } from '../types';
import { getPracticeExams, savePracticeExam, deletePracticeExam } from '../services/mockProvider';
import { Plus, Trash, Edit, SaveAll, ArrowLeft, FileText, CheckSquare, Clock, Info, Type, Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminExamManager: React.FC = () => {
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [editingExam, setEditingExam] = useState<PracticeExam | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshExams();
  }, []);

  const refreshExams = async () => {
    setIsLoading(true);
    try {
      const data = await getPracticeExams();
      setExams(data || []);
    } catch (error) {
      console.error("Failed to load exams", error);
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    const newExam: PracticeExam = {
      // FIX: Use 'new_' prefix to tell provider to call .add instead of .update
      id: `new_exam_${Date.now()}`,
      title: 'Đề thi mới',
      type: 'mid-term-1',
      description: 'Mô tả đề thi...',
      duration: 90,
      readingPassage: '',
      questions: []
    };
    setEditingExam(newExam);
  };

  const handleSave = async () => {
    if (editingExam) {
      if (!editingExam.title.trim()) {
        alert("Vui lòng nhập tên đề thi.");
        return;
      }
      setIsLoading(true);
      try {
        // Sanitize questions: Ensure no null/undefined items, correct types
        const cleanQuestions = (editingExam.questions || []).filter(q => !!q).map(q => ({
            ...q,
            points: Number(q.points) || 0,
            correctAnswer: q.type === 'choice' ? Number(q.correctAnswer) : String(q.correctAnswer)
        }));

        const payload = { 
            ...editingExam, 
            questions: cleanQuestions,
            duration: Number(editingExam.duration) || 0
        };
        
        await savePracticeExam(payload);
        
        setEditingExam(null);
        await refreshExams();
      } catch (error) {
        console.error("Save failed", error);
        alert("Lỗi khi lưu đề thi. Vui lòng kiểm tra kết nối mạng hoặc nội dung đề thi quá dài.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa đề thi này?')) {
      setIsLoading(true);
      try {
        await deletePracticeExam(id);
        await refreshExams();
      } catch (error) {
        console.error("Delete failed", error);
        alert("Lỗi khi xóa đề thi.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- EXCEL LOGIC ---

  const downloadTemplate = () => {
    // Flatten exams structure for Excel
    // Format: Exam Metadata on every row (redundant but easy to parse) + Question Data
    const rows: any[] = [];
    
    // If we have exams, export them. If not, create a sample.
    const sourceData = exams.length > 0 ? exams : [{
        id: 'sample', title: 'Đề mẫu Excel', type: 'mid-term-1', description: 'Mô tả...', duration: 60, readingPassage: '<p>Đoạn văn...</p>',
        questions: [
            { id: 1, type: 'choice', question: 'Câu hỏi 1?', options: ['A','B','C','D'], correctAnswer: 0, points: 0.5 },
            { id: 2, type: 'essay', question: 'Câu tự luận?', options: [], correctAnswer: '', points: 2 }
        ]
    } as PracticeExam];

    sourceData.forEach(exam => {
        if (!exam.questions || exam.questions.length === 0) {
            rows.push({
                EXAM_ID: exam.id, EXAM_TITLE: exam.title, EXAM_TYPE: exam.type, EXAM_DESC: exam.description, DURATION: exam.duration, PASSAGE_HTML: exam.readingPassage,
                Q_TYPE: '', Q_CONTENT: '', Q_OPTIONS: '', Q_CORRECT: '', Q_POINTS: ''
            });
        } else {
            exam.questions.forEach(q => {
                rows.push({
                    EXAM_ID: exam.id,
                    EXAM_TITLE: exam.title,
                    EXAM_TYPE: exam.type,
                    EXAM_DESC: exam.description,
                    DURATION: exam.duration,
                    PASSAGE_HTML: exam.readingPassage,
                    Q_TYPE: q.type,
                    Q_CONTENT: q.question,
                    Q_OPTIONS: Array.isArray(q.options) ? q.options.join('|') : '',
                    Q_CORRECT: q.correctAnswer,
                    Q_POINTS: q.points
                });
            });
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh_Sach_De_Thi");
    XLSX.writeFile(workbook, "Du_Lieu_De_Thi.xlsx");
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
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        // Group by EXAM_TITLE (Assuming ID might be missing or duplicated in new imports)
        const examsMap: Record<string, PracticeExam> = {};

        data.forEach(row => {
            const title = row.EXAM_TITLE;
            if (!title) return;

            // Generate a temporary Key based on title to group rows
            const key = title.trim();

            if (!examsMap[key]) {
                examsMap[key] = {
                    id: `new_exam_${Date.now()}_${Math.floor(Math.random()*1000)}`, // Always new ID for import
                    title: title,
                    type: (row.EXAM_TYPE || 'mid-term-1') as any,
                    description: row.EXAM_DESC || '',
                    duration: Number(row.DURATION) || 45,
                    readingPassage: row.PASSAGE_HTML || '',
                    questions: []
                };
            }

            if (row.Q_CONTENT) {
                const type = (row.Q_TYPE || 'choice').toLowerCase() as QuestionType;
                let options: string[] = [];
                let correct: string | number = row.Q_CORRECT;

                if (type === 'choice') {
                    options = row.Q_OPTIONS ? String(row.Q_OPTIONS).split('|').map(s => s.trim()) : [];
                    // Try parsing index
                    if (!isNaN(parseInt(String(correct)))) {
                        correct = parseInt(String(correct));
                    } else if (typeof correct === 'string') {
                         const charCode = correct.toUpperCase().charCodeAt(0);
                         if (charCode >= 65 && charCode <= 68) correct = charCode - 65;
                         else correct = 0;
                    }
                }

                examsMap[key].questions.push({
                    id: Date.now() + Math.random(),
                    type,
                    question: row.Q_CONTENT,
                    options: options.length > 0 ? options : undefined,
                    correctAnswer: correct,
                    points: Number(row.Q_POINTS) || 1
                });
            }
        });

        // Save all imported exams
        for (const exam of Object.values(examsMap)) {
            await savePracticeExam(exam);
        }

        await refreshExams();
        alert(`Đã nhập thành công ${Object.keys(examsMap).length} đề thi!`);
      } catch (error) {
        console.error("Import error", error);
        alert("Lỗi nhập file. Vui lòng kiểm tra định dạng Excel.");
      } finally {
        setIsLoading(false);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- END EXCEL ---

  const addQuestion = (type: QuestionType) => {
    if (!editingExam) return;
    const newQ: QuizQuestion = {
      id: Date.now(),
      type: type,
      question: '',
      options: type === 'choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'choice' ? 0 : '',
      points: type === 'choice' ? 0.5 : 2
    };
    setEditingExam({
      ...editingExam,
      questions: [...(editingExam.questions || []), newQ]
    });
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    if (!editingExam) return;
    const updatedQs = [...(editingExam.questions || [])];
    updatedQs[index] = { ...updatedQs[index], [field]: value };
    setEditingExam({ ...editingExam, questions: updatedQs });
  };
  
  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    if (!editingExam) return;
    const updatedQs = [...(editingExam.questions || [])];
    const targetQ = { ...updatedQs[qIndex] };
    
    if (targetQ.options) {
      const newOptions = [...targetQ.options];
      newOptions[oIndex] = value;
      targetQ.options = newOptions;
      updatedQs[qIndex] = targetQ;
      setEditingExam({ ...editingExam, questions: updatedQs });
    }
  };

  const removeQuestion = (index: number) => {
    if (!editingExam) return;
    const updatedQs = [...(editingExam.questions || [])];
    updatedQs.splice(index, 1);
    setEditingExam({ ...editingExam, questions: updatedQs });
  };

  // Render Edit Form
  if (editingExam) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => setEditingExam(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
             <ArrowLeft size={20} /> Quay lại
           </button>
           <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md shadow-indigo-100 disabled:opacity-50 transition-all">
             <SaveAll size={18} /> {isLoading ? 'Đang lưu...' : 'Lưu đề thi'}
           </button>
        </div>

        {/* General Info Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold mb-1.5 text-slate-700">Tên đề thi</label>
                 <input 
                    type="text" 
                    value={editingExam.title} 
                    onChange={e => setEditingExam({...editingExam, title: e.target.value})} 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" 
                    placeholder="Ví dụ: Giữa kỳ I - Đề 1"
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold mb-1.5 text-slate-700">Thời gian (phút)</label>
                 <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                       type="number" 
                       value={editingExam.duration} 
                       onChange={e => setEditingExam({...editingExam, duration: parseInt(e.target.value)})} 
                       className="w-full border border-slate-300 pl-9 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                    />
                 </div>
              </div>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold mb-1.5 text-slate-700">Loại kỳ thi</label>
                 <select 
                    value={editingExam.type} 
                    onChange={e => setEditingExam({...editingExam, type: e.target.value as any})} 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                 >
                    <option value="mid-term-1">Giữa kỳ I</option>
                    <option value="term-1">Cuối kỳ I</option>
                    <option value="mid-term-2">Giữa kỳ II</option>
                    <option value="term-2">Cuối kỳ II</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold mb-1.5 text-slate-700">Mô tả</label>
                 <div className="relative">
                    <Info size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                       type="text" 
                       value={editingExam.description} 
                       onChange={e => setEditingExam({...editingExam, description: e.target.value})} 
                       className="w-full border border-slate-300 pl-9 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       placeholder="Mô tả nội dung (VD: Kiểm tra thơ và truyện ngắn)" 
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Section 1: Reading Passage */}
        <div className="mb-8 border-t border-slate-100 pt-6">
           <h3 className="font-bold text-lg mb-1 flex items-center gap-2 text-indigo-800">
             <FileText size={20} /> Phần I: Đọc - Hiểu (Văn bản)
           </h3>
           <p className="text-xs text-slate-500 mb-3">Nhập nội dung văn bản cho phần Đọc - Hiểu. Hỗ trợ HTML cơ bản.</p>
           
           <textarea 
             value={editingExam.readingPassage || ''} 
             onChange={e => setEditingExam({...editingExam, readingPassage: e.target.value})}
             className="w-full h-56 border border-slate-300 p-4 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
             placeholder="<p>Đọc đoạn trích sau...</p>"
           />
        </div>

        {/* Section 2: Questions */}
        <div className="mb-6 border-t border-slate-100 pt-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                 <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-800">
                   <CheckSquare size={20} /> Danh sách câu hỏi
                 </h3>
                 <p className="text-xs text-slate-500">Tổng cộng: {(editingExam.questions || []).length} câu</p>
              </div>
              
              <div className="flex gap-2">
                 <button onClick={() => addQuestion('choice')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors">
                    <Plus size={14}/> Trắc nghiệm
                 </button>
                 <button onClick={() => addQuestion('short')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors">
                    <Plus size={14}/> Trả lời ngắn
                 </button>
                 <button onClick={() => addQuestion('essay')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors">
                    <Plus size={14}/> Tự luận (Viết)
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              {(editingExam.questions || []).map((q, idx) => {
                 if (!q) return null; // CRITICAL FIX: Skip null questions
                 return (
                 <div key={q.id || idx} className="border border-slate-200 rounded-xl bg-slate-50 p-4 relative group transition-all hover:border-indigo-300 hover:shadow-sm">
                    {/* Card Header */}
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-500 text-sm">Câu {idx + 1}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            q.type === 'choice' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            q.type === 'essay' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            'bg-purple-50 text-purple-600 border-purple-200'
                          }`}>
                            {q.type.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                             <span className="text-xs font-semibold text-slate-600">Điểm:</span>
                             <input 
                               type="number" step="0.25" min="0" 
                               value={q.points || 0} 
                               onChange={e => updateQuestion(idx, 'points', parseFloat(e.target.value))} 
                               className="w-12 text-xs font-bold text-center outline-none focus:text-indigo-600" 
                             />
                          </div>
                       </div>
                       <button onClick={() => removeQuestion(idx)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash size={16}/>
                       </button>
                    </div>

                    {/* Question Content */}
                    <textarea 
                       value={q.question} 
                       onChange={e => updateQuestion(idx, 'question', e.target.value)} 
                       className="w-full border border-slate-300 p-3 rounded-lg mb-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white"
                       placeholder="Nhập nội dung câu hỏi..."
                       rows={2}
                    />

                    {/* Question Options/Answer */}
                    {q.type === 'choice' && q.options && (
                       <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                             <div key={oIdx} className={`flex items-center gap-2 p-2 rounded-lg border ${q.correctAnswer === oIdx ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctAnswer === oIdx} 
                                  onChange={() => updateQuestion(idx, 'correctAnswer', oIdx)}
                                  className="w-4 h-4 text-indigo-600"
                                />
                                <input 
                                  type="text" value={opt} 
                                  onChange={e => updateOption(idx, oIdx, e.target.value)}
                                  className="flex-1 bg-transparent outline-none text-sm text-slate-700"
                                  placeholder={`Lựa chọn ${oIdx + 1}`}
                                />
                             </div>
                          ))}
                       </div>
                    )}

                    {(q.type === 'fill' || q.type === 'short') && (
                       <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Đáp án đúng:</label>
                          <input 
                             type="text" 
                             value={q.correctAnswer as string || ''}
                             onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                             className="w-full outline-none text-sm font-medium text-slate-800"
                             placeholder="Nhập câu trả lời chính xác..."
                          />
                       </div>
                    )}

                    {q.type === 'essay' && (
                       <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center gap-2 text-orange-700">
                          <Type size={16} />
                          <span className="text-xs font-medium">Học sinh sẽ trả lời bằng văn bản dài cho câu hỏi này.</span>
                       </div>
                    )}
                 </div>
                 );
              })}

              {(editingExam.questions || []).length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                   <p className="text-slate-400 text-sm">Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</p>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // Render List
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Quản lý Đề thi</h2>
           <p className="text-sm text-slate-500">Tạo đề thi trắc nghiệm & tự luận theo cấu trúc mới</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={downloadTemplate} 
             title="Tải backup Excel" 
             className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm font-medium"
           >
              <FileSpreadsheet size={18} /> Xuất Excel
           </button>
           <label 
              title="Nhập từ file Excel" 
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
           >
              <Upload size={18} /> Nhập Excel
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
           </label>
           <button 
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all font-medium text-sm"
           >
             <Plus size={18} /> Tạo đề mới
           </button>
        </div>
      </div>
      
      {isLoading ? <div className="text-center py-12 text-slate-500 flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> Đang tải dữ liệu...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {exams.length === 0 && (
             <div className="col-span-2 py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <FileText size={48} className="mx-auto text-slate-300 mb-2" />
               <p className="text-slate-500">Chưa có đề thi nào.</p>
             </div>
           )}
           {exams.map(exam => (
              <div key={exam.id} className="group border border-slate-200 p-5 rounded-xl bg-white hover:border-indigo-300 hover:shadow-md transition-all relative">
                 <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                       exam.type.includes('mid') ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                       {exam.type === 'mid-term-1' ? 'Giữa kỳ I' : exam.type === 'term-1' ? 'Cuối kỳ I' : exam.type === 'mid-term-2' ? 'Giữa kỳ II' : 'Cuối kỳ II'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setEditingExam(exam)} className="p-1.5 bg-slate-100 border rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><Edit size={16}/></button>
                       <button onClick={() => handleDelete(exam.id)} className="p-1.5 bg-slate-100 border rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"><Trash size={16}/></button>
                    </div>
                 </div>
                 <h3 className="font-bold text-lg mb-1 text-slate-800">{exam.title}</h3>
                 <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{exam.description}</p>
                 
                 <div className="flex items-center gap-4 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> {exam.duration} phút</span>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <span className="flex items-center gap-1.5"><CheckSquare size={14} className="text-slate-400"/> {(exam.questions || []).length} câu</span>
                    {exam.readingPassage && (
                      <>
                        <div className="w-px h-3 bg-slate-200"></div>
                        <span className="flex items-center gap-1.5 text-indigo-600"><FileText size={14}/> Có văn bản</span>
                      </>
                    )}
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default AdminExamManager;
