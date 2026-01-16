
import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { getGames, saveGame, deleteGame } from '../services/mockProvider';
import { Gamepad2, Plus, Trash, Edit, Save, X, ToggleLeft, ToggleRight, ExternalLink, Settings, Dices, Image as ImageIcon } from 'lucide-react';

const AdminGameManager: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshGames();
  }, []);

  const refreshGames = async () => {
    setIsLoading(true);
    try {
      const data = await getGames();
      setGames(data || []);
    } catch (error) {
      console.error("Failed to load games", error);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGame = () => {
    setEditingGame({
      // CRITICAL FIX: Use 'new_' prefix so saveGame service knows to call .add instead of .update
      id: `new_game_${Date.now()}`, 
      title: 'Tên trò chơi mới',
      description: 'Mô tả trò chơi...',
      level: 'medium',
      type: 'external',
      gameUrl: '',
      thumbnail: '', 
      quizConfig: {
        levelCount: 3,
        questionsPerLevel: 5,
        pointsPerLevel: 10
      },
      isActive: true
    });
  };

  const handleSave = async () => {
    if (editingGame) {
      setIsLoading(true);
      await saveGame(editingGame);
      setEditingGame(null);
      await refreshGames();
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa trò chơi này?')) {
      setIsLoading(true);
      await deleteGame(id);
      await refreshGames();
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Quản lý Trò chơi</h2>
           <p className="text-sm text-slate-500">Thêm, xóa, sửa các game giáo dục (Wordwall, Quizizz...)</p>
        </div>
        <button 
          onClick={handleAddGame}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> Thêm Game
        </button>
      </div>

      {editingGame && (
        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-indigo-200 shadow-sm animate-fade-in">
           <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-indigo-800 flex items-center gap-2">
                <Edit size={20} /> {editingGame.id.startsWith('new_') ? 'Thêm trò chơi mới' : 'Chỉnh sửa trò chơi'}
              </h3>
              <button onClick={() => setEditingGame(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Tên trò chơi</label>
                    <input 
                      type="text" 
                      value={editingGame.title} 
                      onChange={e => setEditingGame({...editingGame, title: e.target.value})} 
                      className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="Ví dụ: Đuổi hình bắt chữ"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Loại Game</label>
                    <select 
                      value={editingGame.type} 
                      onChange={e => setEditingGame({...editingGame, type: e.target.value as any})} 
                      className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-indigo-700"
                    >
                      <option value="external">Liên kết ngoài (Wordwall, Quizizz...)</option>
                      <option value="quiz">Trắc nghiệm ngẫu nhiên (Từ ngân hàng câu hỏi)</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Cấp độ</label>
                <select 
                  value={editingGame.level} 
                  onChange={e => setEditingGame({...editingGame, level: e.target.value as any})} 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="easy">Dễ (Khởi động)</option>
                  <option value="medium">Trung bình (Vận dụng)</option>
                  <option value="hard">Khó (Vận dụng cao)</option>
                </select>
              </div>

              {/* THUMBNAIL INPUT */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Link Ảnh (Thumbnail)</label>
                <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editingGame.thumbnail || ''} 
                      onChange={e => setEditingGame({...editingGame, thumbnail: e.target.value})} 
                      className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="https://imgur.com/..." 
                    />
                    <div className="w-10 h-10 shrink-0 bg-slate-200 rounded-lg overflow-hidden border">
                       {editingGame.thumbnail ? (
                          <img src={editingGame.thumbnail} className="w-full h-full object-cover" alt="preview" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20}/></div>
                       )}
                    </div>
                </div>
              </div>

              {editingGame.type === 'external' ? (
                <div className="md:col-span-2">
                   <label className="block text-sm font-bold mb-2 text-slate-700">Link Game (URL)</label>
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editingGame.gameUrl} 
                        onChange={e => setEditingGame({...editingGame, gameUrl: e.target.value})} 
                        className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" 
                        placeholder="https://wordwall.net/play/..." 
                      />
                      {editingGame.gameUrl && (
                        <a 
                          href={editingGame.gameUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2.5 bg-slate-100 border rounded-lg text-slate-600 hover:text-indigo-600"
                          title="Kiểm tra liên kết"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                   </div>
                </div>
              ) : (
                <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                   <div className="flex items-center gap-2 mb-3 text-indigo-800 font-bold border-b border-indigo-200 pb-2">
                      <Dices size={20} /> Cấu hình trò chơi ngẫu nhiên
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-slate-600">Số màn chơi (Level)</label>
                        <input 
                          type="number" min="1" max="10"
                          value={editingGame.quizConfig?.levelCount || 3} 
                          onChange={e => setEditingGame({...editingGame, quizConfig: {...editingGame.quizConfig!, levelCount: parseInt(e.target.value)}})} 
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-slate-600">Số câu hỏi / màn</label>
                        <input 
                          type="number" min="1" max="20"
                          value={editingGame.quizConfig?.questionsPerLevel || 5} 
                          onChange={e => setEditingGame({...editingGame, quizConfig: {...editingGame.quizConfig!, questionsPerLevel: parseInt(e.target.value)}})} 
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-slate-600">Điểm thưởng / màn</label>
                        <input 
                          type="number" min="0" max="100"
                          value={editingGame.quizConfig?.pointsPerLevel || 10} 
                          onChange={e => setEditingGame({...editingGame, quizConfig: {...editingGame.quizConfig!, pointsPerLevel: parseInt(e.target.value)}})} 
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                      </div>
                   </div>
                   <p className="text-xs text-indigo-600 mt-2 italic">* Hệ thống sẽ tự động lấy câu hỏi ngẫu nhiên từ Ngân hàng câu hỏi khi học sinh bắt đầu chơi.</p>
                </div>
              )}

              <div className="md:col-span-2">
                 <label className="block text-sm font-bold mb-2 text-slate-700">Mô tả ngắn</label>
                 <textarea 
                    value={editingGame.description} 
                    onChange={e => setEditingGame({...editingGame, description: e.target.value})} 
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none" 
                    placeholder="Mô tả nội dung và mục đích của trò chơi..."
                 />
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setEditingGame({...editingGame, isActive: !editingGame.isActive})}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                     editingGame.isActive 
                       ? 'bg-green-50 border-green-200 text-green-700' 
                       : 'bg-slate-50 border-slate-200 text-slate-500'
                   }`}
                 >
                   {editingGame.isActive ? <ToggleRight size={24} className="text-green-600"/> : <ToggleLeft size={24} />}
                   <span className="font-bold text-sm">{editingGame.isActive ? 'Đang kích hoạt' : 'Đã ẩn'}</span>
                 </button>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 border-t pt-4">
             <button onClick={() => setEditingGame(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy bỏ</button>
             <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md disabled:opacity-50">
               <Save size={18} /> {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
             </button>
           </div>
        </div>
      )}

      {isLoading && !games.length ? <div className="text-center py-8 text-slate-500">Đang tải dữ liệu...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {games.map(game => (
              <div 
                key={game.id} 
                className={`border rounded-lg p-4 relative group transition-all bg-white flex flex-col ${!game.isActive ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md hover:border-indigo-300'}`}
              >
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => setEditingGame(game)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(game.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash size={16} /></button>
                 </div>
                 
                 <div className="flex items-start gap-3 mb-3">
                    {/* THUMBNAIL DISPLAY */}
                    <div className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden flex items-center justify-center border ${
                      game.level === 'easy' ? 'bg-green-100 text-green-600 border-green-200' :
                      game.level === 'medium' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                      'bg-red-100 text-red-600 border-red-200'
                    }`}>
                      {game.thumbnail ? (
                          <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                          game.type === 'quiz' ? <Dices size={28} /> : <Gamepad2 size={28} />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 leading-snug mb-1 line-clamp-2">{game.title}</h3>
                      <div className="flex flex-wrap gap-2">
                         <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                           game.level === 'easy' ? 'bg-green-50 border-green-100 text-green-700' :
                           game.level === 'medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                           'bg-red-50 border-red-100 text-red-700'
                         }`}>
                           {game.level === 'easy' ? 'Dễ' : game.level === 'medium' ? 'Trung bình' : 'Khó'}
                         </span>
                         {game.type === 'quiz' && (
                           <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border bg-purple-50 border-purple-100 text-purple-700">
                             Quiz
                           </span>
                         )}
                         {!game.isActive && (
                           <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500">
                             Đã ẩn
                           </span>
                         )}
                      </div>
                    </div>
                 </div>
                 
                 <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10 flex-1">{game.description}</p>
                 
                 {game.type === 'quiz' ? (
                   <div className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium flex justify-center items-center gap-2 mt-auto">
                      <Settings size={16} /> Cấu hình tự động
                   </div>
                 ) : (
                   <a 
                     href={game.gameUrl} 
                     target="_blank" 
                     rel="noreferrer" 
                     className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-colors mt-auto ${
                       game.isActive 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                     }`}
                   >
                     <ExternalLink size={16} /> Link ngoài
                   </a>
                 )}
              </div>
           ))}
           
           {games.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                 <Gamepad2 size={48} className="mx-auto mb-2 opacity-50" />
                 <p>Chưa có trò chơi nào được thêm.</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AdminGameManager;
