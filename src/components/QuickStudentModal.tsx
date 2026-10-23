import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  X,
  User,
  Star,
  Award,
  CalendarCheck,
  HeartPulse,
  Pill,
  Sparkles,
  Phone,
  KeyRound,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';

interface QuickStudentModalProps {
  student: Student | null;
  onClose: () => void;
}

export const QuickStudentModal: React.FC<QuickStudentModalProps> = ({ student, onClose }) => {
  const { updateAttendance, addBehaviorLog, updateTT27Evaluation, activeDate } = useApp();
  const [newNote, setNewNote] = useState('');

  if (!student) return null;

  const currentAttendance = student.attendance[activeDate] || 'present';

  const handleAddQuickNote = (type: 'praise' | 'warning') => {
    if (!newNote) return;
    addBehaviorLog(student.id, {
      type,
      category: type === 'praise' ? 'Khen ngợi' : 'Nhắc nhở',
      note: newNote,
      points: type === 'praise' ? 1 : -1,
    });
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900/80 via-slate-900 to-indigo-950/80 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {student.fullName.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">{student.fullName}</h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  STT: {student.stt}
                </span>
                {student.cadreRole && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    {student.cadreRole}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tổ {student.seat.group} • Bàn {student.seat.tableIndex + 1} ({student.seat.position === 'left' ? 'Vị trí Trái' : 'Vị trí Phải'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Sao Thi Đua</span>
              <span className="text-lg font-black text-amber-400 flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{student.stars}</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Nhắc Nhở</span>
              <span className="text-lg font-black text-rose-400">{student.demerits} lần</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Đánh Giá TT27</span>
              <span className="text-lg font-black text-indigo-400">
                Mức {student.tt27Evaluation.academicLevel}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block mb-1">Điểm Danh Nay</span>
              <span className="text-xs font-bold text-emerald-400 uppercase mt-1 block">
                {currentAttendance}
              </span>
            </div>
          </div>

          {/* Account & Family info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block font-semibold mb-1">Thông tin gia đình:</span>
              <p className="text-slate-200">Phụ huynh: {student.parentName}</p>
              <p className="text-slate-200 flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>{student.phone}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-1">Tài khoản học sinh:</span>
              <p className="text-slate-200 flex items-center space-x-1">
                <KeyRound className="w-3 h-3 text-indigo-400" />
                <span>User: <strong className="font-mono text-indigo-300">{student.username}</strong></span>
              </p>
              <p className="text-slate-400 mt-0.5">Mật khẩu: <span className="font-mono">{student.password}</span></p>
            </div>
          </div>

          {/* Boarding status & Medicine */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>Tình Trạng Bán Trú & Sức Khỏe:</span>
            </span>
            <div className="flex items-center space-x-4 text-slate-300">
              <span>Ăn trưa: <strong className="text-emerald-400 capitalize">{student.boardingHealth.lunchStatus}</strong></span>
              <span>Ngủ trưa: <strong className="text-indigo-400 capitalize">{student.boardingHealth.napStatus}</strong></span>
              <span>Thân nhiệt: <strong>{student.boardingHealth.temperature || 36.5}°C</strong></span>
            </div>

            {student.boardingHealth.medicineSchedule.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-rose-300 font-semibold">Lịch uống thuốc:</span>
                {student.boardingHealth.medicineSchedule.map((m) => (
                  <div key={m.id} className="text-slate-400">
                    • {m.medicineName} ({m.time} - {m.dosage}): {m.parentNote} ({m.taken ? 'Đã uống' : 'Chưa uống'})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Comment */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhận Xét TT27 Của Cô Giáo:</span>
            </span>
            <p className="text-slate-300 italic leading-relaxed">
              "{student.tt27Evaluation.teacherFinalComment || student.tt27Evaluation.aiComment || 'Em luôn chăm ngoan, hoàn thành tốt nhiệm vụ.'}"
            </p>
          </div>

          {/* Quick note addition */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-300 font-semibold">Thêm nhanh ghi chú hành vi:</span>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nhập ghi chú nhanh (VD: Lên bảng giải bài nhanh, trực nhật sạch...)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
              <button
                onClick={() => handleAddQuickNote('praise')}
                disabled={!newNote}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Sao</span>
              </button>
              <button
                onClick={() => handleAddQuickNote('warning')}
                disabled={!newNote}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold flex items-center space-x-1"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Nhắc nhở</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
