
import React, { useState } from 'react';
import { BookOpen, UserCircle2, Lock, Loader2 } from 'lucide-react';
import { login } from '../services/mockProvider';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err: any) {
      // Show actual error from server for easier debugging
      const msg = err.message || err.toString();
      setError(msg.includes('Failed to fetch') ? 'Lỗi kết nối. Vui lòng kiểm tra mạng hoặc URL API.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-100 text-indigo-600 rounded-xl mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ngữ Văn 8 Digital</h1>
          <p className="text-slate-500 mt-2">Đăng nhập để tiếp tục học tập</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản</label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-2.5 text-slate-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-400">
          <p>Tài khoản được cung cấp bởi nhà trường.</p>
          <div className="mt-2 text-xs bg-slate-100 p-2 rounded text-slate-500 inline-block">
            <strong>Demo:</strong> GV: gv01/123 - HS: hs01/123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
