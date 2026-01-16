
import React, { useState } from 'react';
import { Lesson, SubLesson } from '../types';
import { Search, Filter, BookOpen, Video, FileText, ArrowRight, Library as LibraryIcon } from 'lucide-react';

interface StudentLibraryProps {
  lessons: Lesson[];
  onSelectSubLesson: (lesson: Lesson, sub: SubLesson) => void;
}

const StudentLibrary: React.FC<StudentLibraryProps> = ({ lessons, onSelectSubLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const publishedLessons = lessons.filter(l => l.isPublished);
  
  const allSubLessons = publishedLessons.flatMap(l => 
    (l.subLessons || []).map(sub => ({ ...sub, parentLesson: l }))
  );

  const filteredItems = allSubLessons.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <LibraryIcon className="text-indigo-600" /> Thư viện Học liệu
           </h1>
           <p className="text-slate-500 mt-1">Tra cứu nhanh các văn bản, bài giảng và tài liệu bổ trợ.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm tài liệu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              />
           </div>
           <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium text-slate-600 shadow-sm cursor-pointer"
              >
                <option value="all">Tất cả loại</option>
                <option value="vb">Văn bản chính</option>
                <option value="connect">Đọc kết nối</option>
                <option value="practice">Thực hành TV</option>
                <option value="write">Tập làm văn</option>
              </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => (
          <div 
            key={`${item.parentLesson.id}-${item.id}`}
            onClick={() => onSelectSubLesson(item.parentLesson, item)}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-3 opacity-5">
                {item.type === 'vb' ? <BookOpen size={64} /> : <Video size={64} />}
             </div>

             <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  item.type === 'vb' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                  item.type === 'practice' ? 'bg-green-50 border-green-100 text-green-700' :
                  item.type === 'write' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                  'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  {item.type === 'vb' ? 'Văn bản' : 
                   item.type === 'practice' ? 'Thực hành' : 
                   item.type === 'write' ? 'Viết' : 'Học liệu'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Chủ đề {item.parentLesson.order}
                </span>
             </div>

             <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                {item.title}
             </h3>
             <p className="text-sm text-slate-500 line-clamp-2 flex-1 mb-4">
                {item.description}
             </p>

             <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400">
                   {item.resources && item.resources.length > 0 ? (
                      <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        <Video size={14} /> {item.resources.length} tài liệu
                      </span>
                   ) : (
                      <span className="text-xs flex items-center gap-1"><FileText size={14} /> Lý thuyết</span>
                   )}
                </div>
                <div className="text-indigo-600 font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Xem ngay <ArrowRight size={16} />
                </div>
             </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
             <LibraryIcon className="mx-auto text-slate-300 mb-4" size={48} />
             <p className="text-slate-500 font-medium">Không tìm thấy học liệu phù hợp.</p>
             <button onClick={() => {setSearchTerm(''); setFilterType('all');}} className="mt-4 text-indigo-600 font-bold hover:underline">Xóa bộ lọc</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLibrary;
