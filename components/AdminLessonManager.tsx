
import React, { useState, useEffect } from 'react';
import { Lesson, SubLesson } from '../types';
import { getLessons, saveLesson, deleteLesson, syncSampleLessons } from '../services/mockProvider';
import { Edit, Trash, Plus, Save, X, Video, FileText, BookOpen, Link as LinkIcon, CloudUpload, Loader2, ToggleLeft, ToggleRight, PenTool, RefreshCw } from 'lucide-react';

const AdminLessonManager: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    refreshLessons();
  }, []);

  const refreshLessons = async () => {
    setIsLoading(true);
    const data = await getLessons();
    setLessons(data);
    setIsLoading(false);
  };

  const handleCreateLesson = () => {
    // Generate temporary ID client side, backend might regenerate
    const newLesson: Lesson = {
      id: `new_lesson_${Date.now()}`,
      order: lessons.length + 1,
      title: 'Bài học mới',
      description: 'Mô tả bài học...',
      monthUnlock: 9,
      introductionHtml: '<p>Nội dung giới thiệu...</p>',
      subLessons: [],
      isPublished: true, // Default to Active (UI uses boolean, Provider converts to 1/0)
    };
    setEditingLesson(newLesson);
  };

  const handleSave = async () => {
    if (editingLesson) {
      setIsLoading(true);
      await saveLesson(editingLesson);
      setEditingLesson(null);
      await refreshLessons();
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bài học này?')) {
      setIsLoading(true);
      await deleteLesson(id);
      await refreshLessons();
      setIsLoading(false);
    }
  };

  // Handle Sync
  const handleSyncSample = async () => {
    if (confirm('Thao tác này sẽ tải 10 bài học mẫu lên hệ thống. Nếu bài học trùng tên đã tồn tại, nó sẽ được cập nhật. Bạn có chắc không?')) {
      setIsSyncing(true);
      try {
        const msg = await syncSampleLessons();
        alert(msg);
        await refreshLessons();
      } catch (e: any) {
        alert(e.message);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // --- Sub-Lesson Helpers ---
  const addSubLesson = () => {
    if (!editingLesson) return;
    const newSub: SubLesson = {
      id: `sub-${Date.now()}`,
      title: 'Nội dung mới',
      type: 'vb',
      description: '',
      contentHtml: '<p>Nội dung chi tiết...</p>',
      resources: []
    };
    setEditingLesson({
      ...editingLesson,
      subLessons: [...(editingLesson.subLessons || []), newSub]
    });
  };

  const updateSubLesson = (index: number, field: keyof SubLesson, value: any) => {
    if (!editingLesson) return;
    const updatedSubs = [...(editingLesson.subLessons || [])];
    updatedSubs[index] = { ...updatedSubs[index], [field]: value };
    setEditingLesson({ ...editingLesson, subLessons: updatedSubs });
  };

  const addResource = (subIndex: number) => {
      if (!editingLesson) return;
      const updatedSubs = [...(editingLesson.subLessons || [])];
      const resources = updatedSubs[subIndex].resources || [];
      resources.push({ type: 'document', title: 'Tài liệu mới', url: '#' });
      updatedSubs[subIndex].resources = resources;
      setEditingLesson({ ...editingLesson, subLessons: updatedSubs });
  };

  const updateResource = (subIndex: number, resIndex: number, field: string, value: string) => {
      if (!editingLesson) return;
      const updatedSubs = [...(editingLesson.subLessons || [])];
      if (updatedSubs[subIndex].resources) {
          // @ts-ignore
          updatedSubs[subIndex].resources[resIndex][field] = value;
      }
      setEditingLesson({ ...editingLesson, subLessons: updatedSubs });
  };
  
  const removeResource = (subIndex: number, resIndex: number) => {
      if (!editingLesson) return;
      const updatedSubs = [...(editingLesson.subLessons || [])];
      if (updatedSubs[subIndex].resources) {
          updatedSubs[subIndex].resources?.splice(resIndex, 1);
      }
      setEditingLesson({ ...editingLesson, subLessons: updatedSubs });
  };

  if (editingLesson) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Chỉnh sửa bài học</h2>
          <div className="flex gap-2">
            <button onClick={() => setEditingLesson(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Hủy</button>
            <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
              <Save size={18} /> {isLoading ? 'Đang lưu...' : 'Lưu bài học'}
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input 
                type="text" 
                value={editingLesson.title} 
                onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tháng mở khóa</label>
              <input 
                type="number" min="1" max="12"
                value={editingLesson.monthUnlock} 
                onChange={(e) => setEditingLesson({...editingLesson, monthUnlock: parseInt(e.target.value)})}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 py-2">
             <button 
                onClick={() => setEditingLesson({...editingLesson, isPublished: !editingLesson.isPublished})}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  editingLesson.isPublished
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
             >
                {editingLesson.isPublished ? <ToggleRight size={24} className="text-green-600"/> : <ToggleLeft size={24} />}
                <div className="text-left">
                  <span className="block font-bold text-sm">{editingLesson.isPublished ? 'Kích hoạt (1)' : 'Đã ẩn (0)'}</span>
                  <span className="text-[10px] opacity-70">Trạng thái đồng bộ: {editingLesson.isPublished ? 'Hiện' : 'Ẩn'}</span>
                </div>
             </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
            <textarea 
              value={editingLesson.description} 
              onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})}
              className="w-full border p-2 rounded h-20"
            />
          </div>

          <div>
             <label className="block text-sm font-medium mb-1">Nội dung giới thiệu (HTML)</label>
             <textarea 
               value={editingLesson.introductionHtml} 
               onChange={(e) => setEditingLesson({...editingLesson, introductionHtml: e.target.value})}
               className="w-full border p-2 rounded h-32 font-mono text-sm"
             />
          </div>

          <div className="border-t pt-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg">Danh sách văn bản / nội dung con</h3>
               <button onClick={addSubLesson} className="text-sm flex items-center gap-1 text-indigo-600 font-medium">
                 <Plus size={16} /> Thêm nội dung
               </button>
             </div>
             
             <div className="space-y-4">
               {/* SAFEGUARD: Array check for subLessons */}
               {(Array.isArray(editingLesson.subLessons) ? editingLesson.subLessons : []).map((sub, idx) => (
                 <div key={sub.id} className="border p-4 rounded bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                       <div>
                          <label className="block text-xs font-bold mb-1 text-slate-500">Tiêu đề mục</label>
                          <input 
                            type="text" 
                            value={sub.title} 
                            onChange={(e) => updateSubLesson(idx, 'title', e.target.value)}
                            className="w-full border p-2 rounded text-sm font-bold" 
                            placeholder="Ví dụ: Văn bản 1: ..."
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold mb-1 text-slate-500">Loại nội dung</label>
                          <select 
                            value={sub.type}
                            onChange={(e) => updateSubLesson(idx, 'type', e.target.value)}
                            className="w-full border p-2 rounded text-sm"
                          >
                            <option value="vb">📖 Văn bản chính</option>
                            <option value="connect">🔗 Đọc kết nối</option>
                            <option value="extend">📚 Đọc mở rộng</option>
                            <option value="practice">⚡ Thực hành Tiếng Việt</option>
                            <option value="write">✍️ Viết (Tập làm văn)</option>
                            <option value="review">🔄 Ôn tập / Nói & Nghe</option>
                          </select>
                       </div>
                    </div>
                    <textarea 
                       value={sub.contentHtml}
                       onChange={(e) => updateSubLesson(idx, 'contentHtml', e.target.value)}
                       className="w-full border p-2 rounded h-24 font-mono text-xs mb-2"
                       placeholder="Nội dung bài học (HTML)..."
                    />

                    {/* Resources Section */}
                    <div className="bg-white p-3 rounded border border-slate-200 mt-2">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Tài liệu & Học liệu đính kèm</span>
                          <button onClick={() => addResource(idx)} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                             <Plus size={12}/> Thêm link
                          </button>
                       </div>
                       <div className="space-y-2">
                          {(sub.resources || []).map((res, rIdx) => (
                             <div key={rIdx} className="flex gap-2 items-center">
                                <select 
                                   value={res.type}
                                   onChange={e => updateResource(idx, rIdx, 'type', e.target.value)}
                                   className="text-xs border rounded p-1"
                                >
                                   <option value="document">Tài liệu</option>
                                   <option value="video">Video</option>
                                </select>
                                <input 
                                   type="text" 
                                   value={res.title}
                                   onChange={e => updateResource(idx, rIdx, 'title', e.target.value)}
                                   placeholder="Tên tài liệu"
                                   className="text-xs border rounded p-1 flex-1"
                                />
                                <input 
                                   type="text" 
                                   value={res.url}
                                   onChange={e => updateResource(idx, rIdx, 'url', e.target.value)}
                                   placeholder="URL (Drive, Youtube...)"
                                   className="text-xs border rounded p-1 flex-1"
                                />
                                <button onClick={() => removeResource(idx, rIdx)} className="text-red-400 hover:text-red-600"><Trash size={14}/></button>
                             </div>
                          ))}
                          {(sub.resources || []).length === 0 && <p className="text-xs text-slate-400 italic">Chưa có tài liệu đính kèm.</p>}
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        const newSubs = [...(editingLesson.subLessons || [])];
                        newSubs.splice(idx, 1);
                        setEditingLesson({...editingLesson, subLessons: newSubs});
                      }}
                      className="text-xs text-red-500 mt-2 hover:underline"
                    >
                      Xóa nội dung này
                    </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Quản lý bài học</h2>
        <div className="flex gap-2">
           {/* SYNC BUTTON */}
           <button 
             onClick={handleSyncSample}
             disabled={isSyncing}
             className="flex items-center gap-2 px-3 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
             title="Đồng bộ 10 bài học mẫu lên Google Sheet"
           >
             {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
             <span className="hidden md:inline">Đồng bộ dữ liệu mẫu</span>
           </button>
           <button 
             onClick={handleCreateLesson}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
           >
             <Plus size={18} /> Thêm bài mới
           </button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-4 text-slate-500">Đang tải dữ liệu từ Google Sheets...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 font-semibold text-slate-600 text-sm">Thứ tự</th>
                <th className="p-3 font-semibold text-slate-600 text-sm">Tên bài học</th>
                <th className="p-3 font-semibold text-slate-600 text-sm">Tháng</th>
                <th className="p-3 font-semibold text-slate-600 text-sm">Trạng thái</th>
                <th className="p-3 font-semibold text-slate-600 text-sm text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, index) => (
                <tr key={lesson.id} className={`border-b hover:bg-slate-50 ${!lesson.isPublished ? 'opacity-60 bg-slate-50' : ''}`}>
                  <td className="p-3 text-sm font-bold w-16">
                     {/* FIX: If order contains JSON/String due to DB error, fallback to index + 1 */}
                     {typeof lesson.order === 'number' ? lesson.order : index + 1}
                  </td>
                  <td className="p-3 font-medium">
                    {lesson.title}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{lesson.subLessons?.length || 0} nội dung</div>
                  </td>
                  <td className="p-3 text-sm">Tháng {lesson.monthUnlock}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${lesson.isPublished ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {lesson.isPublished ? 'Hoạt động (1)' : 'Đã ẩn (0)'}
                    </span>
                  </td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingLesson(lesson)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(lesson.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLessonManager;
