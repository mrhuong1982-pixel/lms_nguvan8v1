
import React, { useState, useEffect } from 'react';
import { StudentAccount } from '../types';
import { getStudents, saveStudent, deleteStudent, importStudentsFromCSV } from '../services/mockProvider';
import { Plus, Trash, Edit, Save, Upload, Download, Search, User, Trophy } from 'lucide-react';

const AdminStudentManager: React.FC = () => {
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshStudents();
  }, []);

  const refreshStudents = async () => {
    setIsLoading(true);
    const data = await getStudents();
    setStudents(data);
    setIsLoading(false);
  };

  const handleCreate = () => {
    setEditingStudent({
      id: '', // Empty ID tells saveStudent to use 'add'
      username: '',
      password: '',
      name: '',
      parentName: '',
      phone: '',
      role: 'student',
      totalScore: 0,
      studyTime: 0
    });
    setIsFormOpen(true);
  };

  const handleEdit = (student: StudentAccount) => {
    setEditingStudent({ ...student });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (editingStudent && editingStudent.username && editingStudent.name) {
      setIsLoading(true);
      await saveStudent(editingStudent);
      setIsFormOpen(false);
      setEditingStudent(null);
      await refreshStudents();
      setIsLoading(false);
    } else {
        alert('Vui lòng nhập Tên đăng nhập và Tên hiển thị');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa học sinh này?')) {
      setIsLoading(true);
      await deleteStudent(id);
      await refreshStudents();
      setIsLoading(false);
    }
  };

  // --- Import / Export Logic (Keep largely same, just async wrap) ---
  const downloadTemplate = () => {
    const headers = "username,password,name,parentName,phone";
    const example = "hs05,123,Nguyen Van E,Nguyen Van F,0912345678";
    const csvContent = "data:text/csv;charset=utf-8," + [headers, example].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_hoc_sinh_mau.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (evt) => {
            if (evt.target?.result) {
                setIsLoading(true);
                await importStudentsFromCSV(evt.target.result as string);
                await refreshStudents();
                alert('Đã nhập danh sách thành công!');
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Quản lý Học sinh</h2>
           <p className="text-sm text-slate-500">Thêm, sửa, xóa và theo dõi thứ hạng học tập</p>
        </div>
        
        <div className="flex gap-2">
           <button onClick={downloadTemplate} className="px-3 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 text-sm flex items-center gap-1">
             <Download size={16} /> Tải mẫu
           </button>
           <label className="px-3 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 text-sm flex items-center gap-1 cursor-pointer">
             <Upload size={16} /> Nhập Excel/CSV
             <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
           </label>
           <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-1">
             <Plus size={16} /> Thêm học sinh
           </button>
        </div>
      </div>

      <div className="mb-4 relative">
         <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
         <input 
           type="text" 
           placeholder="Tìm kiếm theo tên hoặc tài khoản..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
         />
      </div>

      {/* Form Overlay */}
      {isFormOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editingStudent.id ? 'Sửa thông tin' : 'Thêm học sinh mới'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold mb-1">Tài khoản (Username) *</label>
                    <input type="text" value={editingStudent.username} onChange={e => setEditingStudent({...editingStudent, username: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold mb-1">Mật khẩu *</label>
                    <input type="text" value={editingStudent.password} onChange={e => setEditingStudent({...editingStudent, password: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold mb-1">Tên hiển thị *</label>
                    <input type="text" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
                 {/* Other fields... */}
                 <div>
                    <label className="block text-xs font-bold mb-1">Phụ huynh</label>
                    <input type="text" value={editingStudent.parentName || ''} onChange={e => setEditingStudent({...editingStudent, parentName: e.target.value})} className="w-full border p-2 rounded" />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                 <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
                 <button onClick={handleSave} disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700">
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {isLoading && !students.length ? <div className="text-center py-4">Đang tải...</div> : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3">Thứ hạng</th>
                <th className="p-3">Học sinh</th>
                <th className="p-3">Tài khoản</th>
                <th className="p-3 text-center">Điểm</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st, index) => (
                <tr key={st.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                     <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'text-slate-500'}`}>
                        {index + 1}
                     </div>
                  </td>
                  <td className="p-3 font-medium flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700"><User size={16}/></div>
                     {st.name}
                  </td>
                  <td className="p-3 text-slate-500">{st.username}</td>
                  <td className="p-3 text-center font-bold text-indigo-600">{st.totalScore}</td>
                  <td className="p-3 text-right flex justify-end gap-1">
                    <button onClick={() => handleEdit(st)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(st.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash size={16} /></button>
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

export default AdminStudentManager;
