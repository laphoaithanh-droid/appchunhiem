import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Users,
  Bell,
  RefreshCw,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Key,
} from 'lucide-react';
import { getStoredApiKey, getStoredModel } from '../services/geminiService';

interface HeaderProps {
  onOpenLogin: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenEwsModal: () => void;
  onOpenGoogleSheetModal: () => void;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogin,
  activeTab,
  setActiveTab,
  onOpenEwsModal,
  onOpenGoogleSheetModal,
  onOpenApiKeyModal,
}) => {
  const { currentUser, role, alerts, googleSheetConfig, logout } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const currentKey = getStoredApiKey();
  const currentModel = getStoredModel();

  const unreadAlerts = alerts.filter((a) => !a.resolved);

  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('seating')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  SỔ CHỦ NHIỆM AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  TT27 • 4.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Lớp 4A1 • TH & THCS Chu Văn An
              </p>
            </div>
          </div>

          {/* Quick status badges */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Google Sheet Sync badge */}
            <button
              onClick={onOpenGoogleSheetModal}
              title="Cấu hình và đồng bộ Google Sheet database"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đồng bộ Sheet:</span>
              <span className="font-semibold">{googleSheetConfig.lastSyncedAt || 'Đã kết nối'}</span>
              <RefreshCw
                className={`w-3 h-3 text-emerald-400 ml-1 hover:rotate-180 transition-transform ${isSyncing ? 'animate-spin' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickSync();
                }}
              />
            </button>

            {/* Radar EWS Alert Button */}
            <button
              onClick={onOpenEwsModal}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg transition ${
                unreadAlerts.length > 0
                  ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-300'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${unreadAlerts.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="font-medium">Radar EWS:</span>
              <span className="font-bold text-amber-400">{unreadAlerts.length} cảnh báo</span>
              {unreadAlerts.length > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Date badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Hôm nay: 22/10/2026</span>
            </div>
          </div>

          {/* Right Actions: Settings (API Key) & User Role */}
          <div className="flex items-center space-x-2.5">
            {/* Settings (API Key) Button with red text per AI_INSTRUCTIONS.md */}
            <button
              onClick={onOpenApiKeyModal}
              title="Cài đặt Model AI & Gemini API Key"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all shadow-sm group"
            >
              <div className="relative">
                <Key className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    currentKey ? 'bg-emerald-500 ring-2 ring-slate-900' : 'bg-rose-500 animate-ping'
                  }`}
                />
              </div>
              <div className="text-left flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-slate-200">Settings (API Key)</span>
                  <span className="hidden lg:inline text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                    {currentModel.replace('-preview', '')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-rose-400 group-hover:text-rose-300 tracking-tight">
                  Lấy API key để sử dụng app
                </span>
              </div>
            </button>

            {/* User Role & Login Switch */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                  <div className={`w-2 h-2 rounded-full ${role === 'teacher' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  <div>
                    <span className="font-semibold text-slate-200">{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {role === 'teacher' ? 'Giáo viên chủ nhiệm' : 'Học sinh / Phụ huynh'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onOpenLogin}
                  title="Chuyển tài khoản (GV / Học sinh)"
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  Đổi vai trò
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
              >
                <Users className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Only for Teacher view, student has student navigation) */}
        {role === 'teacher' && (
          <div className="flex items-center space-x-1 overflow-x-auto py-2 text-sm border-t border-slate-800 scrollbar-none">
            <button
              onClick={() => setActiveTab('seating')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'seating'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>1. Sơ đồ lớp & Cán sự</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>2. Điểm danh & Nề nếp</span>
            </button>

            <button
              onClick={() => setActiveTab('tt27')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'tt27'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>3. Trợ lý AI Nhận xét TT27</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>4. Kế hoạch & Sinh hoạt lớp</span>
            </button>

            <button
              onClick={() => setActiveTab('parent')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'parent'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>5. Họp PH & Cầu nối Zalo</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'automation'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4 Trụ cột Tự động hóa</span>
            </button>

            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'chatbot'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <span>6. AI Chatbot Lớp Học</span>
            </button>

            <button
              onClick={() => setActiveTab('bilingual')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                activeTab === 'bilingual'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              <span>7. Học Song Ngữ (8 Môn)</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
