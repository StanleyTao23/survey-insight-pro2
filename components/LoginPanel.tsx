import React, { useState } from 'react';
import { Mail, Lock, BarChart3, ArrowRight } from 'lucide-react';

interface LoginPanelProps {
  onLogin: () => void;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validation and API call would go here.
    // For now, we allow any input to login for demo purposes.
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-xl mb-4">
            <BarChart3 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Survey Insight Pro</h1>
          <p className="text-slate-500 mt-2 text-center">專業問卷分析與資料清理工具</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">電子郵件</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            登入系統 <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>輸入任意帳號密碼即可登入 (演示模式)</p>
        </div>
      </div>
    </div>
  );
};