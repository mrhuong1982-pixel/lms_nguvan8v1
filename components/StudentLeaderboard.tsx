import React from 'react';
import { StudentAccount, User } from '../types';
import { Trophy, Medal, Crown, Star, Award, TrendingUp } from 'lucide-react';

interface StudentLeaderboardProps {
  students: StudentAccount[];
  currentUser: User;
}

const StudentRow: React.FC<{ student: StudentAccount; rank: number; currentUser: User }> = ({ student, rank, currentUser }) => {
  const isMe = student.id === currentUser.id;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={24} className="text-yellow-500 fill-yellow-500" />;
      case 2: return <Medal size={24} className="text-gray-400 fill-gray-400" />;
      case 3: return <Medal size={24} className="text-orange-400 fill-orange-400" />;
      default: return <span className="font-bold text-slate-500 w-6 text-center">{rank}</span>;
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg border mb-2 transition-all 
        ${rank === 1 ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 
          rank === 2 ? 'bg-gray-50 border-gray-200' :
          rank === 3 ? 'bg-orange-50 border-orange-100' :
          'bg-white border-slate-100 hover:bg-slate-50'
        }
        ${isMe ? 'ring-2 ring-indigo-500 ring-offset-1 z-10' : ''}
      `}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-8">
        {getRankIcon(rank)}
      </div>
      
      <div className="relative">
        <img 
          src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`} 
          alt="avatar" 
          className={`w-10 h-10 rounded-full border-2 bg-white ${rank === 1 ? 'border-yellow-400' : 'border-slate-200'}`}
        />
        {rank === 1 && (
           <div className="absolute -top-2 -right-1 rotate-12">
              <Crown size={12} className="text-yellow-500 fill-yellow-500" />
           </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
           <h4 className={`text-sm font-bold truncate ${isMe ? 'text-indigo-700' : 'text-slate-900'}`}>
             {student.name} {isMe && '(Bạn)'}
           </h4>
           <span className="text-sm font-bold text-indigo-600">{student.totalScore}đ</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
           <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
              student.classification === 'Xuất sắc' ? 'bg-purple-50 text-purple-700 border-purple-100' :
              student.classification === 'Giỏi' ? 'bg-green-50 text-green-700 border-green-100' :
              'bg-slate-50 text-slate-600 border-slate-100'
           }`}>
              {student.classification || 'Học viên'}
           </span>
        </div>
      </div>
    </div>
  );
};

const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({ students, currentUser }) => {
  // Ensure sorted by Score descending
  const sortedStudents = [...students].sort((a, b) => b.totalScore - a.totalScore);

  // Split into groups
  const top3 = sortedStudents.slice(0, 3);
  const top5 = sortedStudents.slice(3, 5); // Rank 4, 5
  const top10 = sortedStudents.slice(5, 10); // Rank 6 to 10

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
      {/* Header Widget */}
      <div className="p-4 bg-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
            <Trophy size={20} className="text-yellow-300" />
            <h3 className="font-bold text-lg">Bảng Vàng</h3>
            </div>
            <p className="text-indigo-100 text-xs opacity-90">Vinh danh những cá nhân xuất sắc nhất</p>
        </div>
      </div>

      <div className="p-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
        {/* TOP 3 GROUP */}
        {top3.length > 0 && (
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Crown size={16} className="text-yellow-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 3 Xuất Sắc</span>
                </div>
                {top3.map((s, i) => <StudentRow key={s.id} student={s} rank={i + 1} currentUser={currentUser} />)}
            </div>
        )}

        {/* TOP 5 GROUP */}
        {top5.length > 0 && (
            <div className="mb-4">
                 <div className="flex items-center gap-2 mb-2 px-1 border-t pt-3 border-slate-100">
                    <Star size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 5</span>
                </div>
                {top5.map((s, i) => <StudentRow key={s.id} student={s} rank={i + 4} currentUser={currentUser} />)}
            </div>
        )}

        {/* TOP 10 GROUP */}
        {top10.length > 0 && (
            <div className="mb-2">
                 <div className="flex items-center gap-2 mb-2 px-1 border-t pt-3 border-slate-100">
                    <Award size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 10</span>
                </div>
                {top10.map((s, i) => <StudentRow key={s.id} student={s} rank={i + 6} currentUser={currentUser} />)}
            </div>
        )}

        {students.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Chưa có dữ liệu xếp hạng.
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-slate-50 border-t flex items-center justify-center gap-2 text-xs text-slate-500">
         <TrendingUp size={14} /> Cập nhật liên tục theo điểm số
      </div>
    </div>
  );
};

export default StudentLeaderboard;