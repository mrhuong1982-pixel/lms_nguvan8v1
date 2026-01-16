
import React, { useMemo } from 'react';
import { StudentAccount, Lesson } from '../types';
import { Minus } from 'lucide-react';

interface AdminProgressMatrixProps {
  students: StudentAccount[];
  lessons: Lesson[];
  allProgress: any[]; // List of progress records from DB
}

const AdminProgressMatrix: React.FC<AdminProgressMatrixProps> = ({ students, lessons, allProgress }) => {
  // Process data
  const matrix = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    allProgress.forEach(p => {
      if (!map[p.studentId]) map[p.studentId] = {};
      map[p.studentId][p.lessonId] = p.score;
    });
    return map;
  }, [allProgress]);

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Tiến độ học tập chi tiết</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b">
                        <th className="p-3 font-bold text-slate-700 min-w-[200px] sticky left-0 bg-slate-50 border-r z-10">Học sinh</th>
                        {sortedLessons.map(l => (
                            <th key={l.id} className="p-3 font-bold text-slate-700 text-center min-w-[80px]">
                                Bài {l.order}
                            </th>
                        ))}
                        <th className="p-3 font-bold text-slate-700 text-center sticky right-0 bg-slate-50 border-l z-10">TB</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        const scores = sortedLessons.map(l => matrix[student.id]?.[l.id]);
                        const validScores = scores.filter(s => s !== undefined && s !== null) as number[];
                        const avg = validScores.length > 0 ? (validScores.reduce((a,b)=>a+b,0) / validScores.length).toFixed(1) : '-';
                        
                        return (
                            <tr key={student.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-900 border-r sticky left-0 bg-white z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200">
                                            {student.name.charAt(0)}
                                        </div>
                                        {student.name}
                                    </div>
                                </td>
                                {sortedLessons.map(l => {
                                    const score = matrix[student.id]?.[l.id];
                                    let cellClass = "text-slate-300";
                                    let content: React.ReactNode = <Minus size={14} className="mx-auto text-slate-200"/>;
                                    
                                    if (score !== undefined) {
                                        if (score >= 8) {
                                            cellClass = "text-green-600 font-bold bg-green-50 border border-green-100";
                                            content = score;
                                        } else if (score >= 5) {
                                            cellClass = "text-yellow-600 font-bold bg-yellow-50 border border-yellow-100";
                                            content = score;
                                        } else {
                                            cellClass = "text-red-600 font-bold bg-red-50 border border-red-100";
                                            content = score;
                                        }
                                    }

                                    return (
                                        <td key={l.id} className="p-2 text-center border-l border-dashed border-slate-100">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${cellClass}`}>
                                                {content}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="p-3 text-center font-bold text-indigo-700 border-l sticky right-0 bg-white z-10">{avg}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <div className="mt-4 flex gap-6 text-xs text-slate-500 justify-end">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-100 rounded"></span> Đạt (≥8)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-50 border border-yellow-100 rounded"></span> Trung bình (5-7)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 border border-red-100 rounded"></span> Yếu (&lt;5)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-slate-200 rounded"></span> Chưa học</div>
        </div>
    </div>
  );
};
export default AdminProgressMatrix;
