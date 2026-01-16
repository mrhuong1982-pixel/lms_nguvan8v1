import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { getGames } from '../services/mockProvider';
import { Gamepad2, ExternalLink, Zap, Brain, Flame, Play } from 'lucide-react';

interface GameListProps {
  onPlayGame?: (game: Game) => void;
}

const GameList: React.FC<GameListProps> = ({ onPlayGame }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    // Only show active games to students
    const fetchGames = async () => {
        const data = await getGames();
        setGames(data.filter(g => g.isActive));
    };
    fetchGames();
  }, []);

  const filteredGames = filter === 'all' ? games : games.filter(g => g.level === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-purple-100 text-purple-600 rounded-full mb-4">
           <Gamepad2 size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Góc Giải Trí & Luyện Tập</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Vừa chơi vừa học với các trò chơi tương tác thú vị. Ôn luyện kiến thức Ngữ Văn một cách nhẹ nhàng và hiệu quả.
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-2 mb-8">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setFilter('easy')}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'easy' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          <Zap size={14} /> Dễ
        </button>
        <button 
          onClick={() => setFilter('medium')}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          <Brain size={14} /> Trung bình
        </button>
        <button 
          onClick={() => setFilter('hard')}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'hard' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          <Flame size={14} /> Khó
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => (
           <div key={game.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className={`h-32 flex items-center justify-center ${
                 game.level === 'easy' ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                 game.level === 'medium' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                 'bg-gradient-to-br from-red-500 to-pink-600'
              }`}>
                 <Gamepad2 size={48} className="text-white opacity-90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded shadow-sm ${
                         game.level === 'easy' ? 'bg-green-100 text-green-700' :
                         game.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-red-100 text-red-700'
                    }`}>
                      {game.level === 'easy' ? 'Khởi động' : game.level === 'medium' ? 'Vận dụng' : 'Thử thách'}
                    </span>
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                   {game.title}
                 </h3>
                 <p className="text-slate-500 text-sm mb-6 flex-1">
                   {game.description}
                 </p>
                 
                 {game.type === 'quiz' ? (
                   <button 
                     onClick={() => onPlayGame && onPlayGame(game)}
                     className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                   >
                      <Play size={18} /> Bắt đầu
                   </button>
                 ) : (
                   <a 
                     href={game.gameUrl} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                   >
                      Chơi ngay <ExternalLink size={18} />
                   </a>
                 )}
              </div>
           </div>
        ))}
      </div>
      
      {filteredGames.length === 0 && (
         <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed">
            <p className="text-slate-500">Chưa có trò chơi nào ở cấp độ này.</p>
         </div>
      )}
    </div>
  );
};

export default GameList;