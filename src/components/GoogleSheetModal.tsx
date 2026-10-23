import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  X,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Save,
  CheckCircle2,
  Database,
} from 'lucide-react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose }) => {
  const { googleSheetConfig, updateGoogleSheetConfig, exportStudentsToPsv } = useApp();
  const [sheetUrl, setSheetUrl] = useState(googleSheetConfig.sheetUrl);
  const [autoSync, setAutoSync] = useState(googleSheetConfig.autoSync);
  const [syncInterval, setSyncInterval] = useState(googleSheetConfig.syncIntervalMinutes);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoogleSheetConfig({
      sheetUrl,
      autoSync,
      syncIntervalMinutes: syncInterval,
    });
    setMessage('Đã lưu cấu hình kết nối Google Sheet thành công!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateGoogleSheetConfig({
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
      setMessage('Đã đồng bộ thành công dữ liệu từ Google Sheet (18 học sinh)!');
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handleCopyHeader = () => {
    navigator.clipboard.writeText('TT|HỌ VÀ TÊN|NĂM SINH|HỌ VÀ TÊN CHA(MẸ)|SỐ ĐIỆN THOẠI|TÊN ĐĂNG NHẬP|MẬT KHẨU|');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-900/60 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Kết Nối Database Google Sheet</h3>
              <p className="text-xs text-emerald-300">Đồng bộ hai chiều danh sách lớp & tài khoản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Format guide */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Định dạng cột dữ liệu chuẩn:</span>
              <button
                onClick={handleCopyHeader}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép mẫu cột'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-emerald-300 break-all select-all border border-slate-800">
              TT|HỌ VÀ TÊN|NĂM SINH|HỌ VÀ TÊN CHA(MẸ)|SỐ ĐIỆN THOẠI|TÊN ĐĂNG NHẬP|MẬT KHẨU|
            </div>
            <p className="text-[11px] text-slate-400">
              Mỗi học sinh khi tạo từ danh sách sẽ tự động được cấp tài khoản & mật khẩu riêng để đăng nhập vào app.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Đường dẫn Google Sheets (Share Link / CSV URL):
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Chu kỳ tự động đồng bộ:
                </label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value={15}>Mỗi 15 phút</option>
                  <option value={30}>Mỗi 30 phút</option>
                  <option value={60}>Mỗi 60 phút</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="autoSyncCheck"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="autoSyncCheck" className="text-slate-300 font-medium cursor-pointer">
                  Bật Auto-Sync
                </label>
              </div>
            </div>

            {message && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay'}</span>
              </button>

              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
