import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import confetti from 'canvas-confetti';
import {
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
  ShieldAlert,
  Star,
  Plus,
  Minus,
  Sparkles,
  ClipboardList,
  Calendar,
  HeartPulse,
} from 'lucide-react';

interface SeatingChartProps {
  onSelectStudent: (student: Student) => void;
}

export const SeatingChart: React.FC<SeatingChartProps> = ({ onSelectStudent }) => {
  const { students, activeDate, updateAttendance, addBehaviorLog, swapSeats } = useApp();
  const [subTab, setSubTab] = useState<'seating' | 'cadres' | 'duty'>('seating');
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
      });
    } catch (e) {
      // fallback
    }
  };

  const handleGiveStar = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    addBehaviorLog(student.id, {
      type: 'praise',
      category: 'Tuyên dương',
      note: 'Phát biểu hăng hái và có ý thức tốt trong giờ học',
      points: 1,
    });
    fireConfetti();
    showToast(`Đã cộng +1 Sao thưởng cho em ${student.fullName}!`);
  };

  const handleDemerit = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    addBehaviorLog(student.id, {
      type: 'warning',
      category: 'Kỷ luật',
      note: 'Nhắc nhở mất trật tự hoặc chưa tập trung nghe giảng',
      points: -1,
    });
    showToast(`Đã ghi nhận nhắc nhở em ${student.fullName}`);
  };

  const handleQuickAttendance = (
    e: React.MouseEvent,
    student: Student,
    status: 'present' | 'excused' | 'unexcused' | 'late'
  ) => {
    e.stopPropagation();
    updateAttendance(student.id, status);
    const labels = {
      present: 'Có mặt',
      excused: 'Có phép',
      unexcused: 'Không phép',
      late: 'Đi muộn',
    };
    showToast(`Điểm danh ${student.fullName}: ${labels[status]}`);
  };

  const handleSwapClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    if (!swapSourceId) {
      setSwapSourceId(studentId);
      showToast('Đang chọn vị trí 1. Hãy nhấn vào học sinh thứ 2 để hoán đổi chỗ!');
    } else if (swapSourceId === studentId) {
      setSwapSourceId(null);
      showToast('Đã hủy chế độ đổi chỗ.');
    } else {
      swapSeats(swapSourceId, studentId);
      setSwapSourceId(null);
      showToast('Đã hoán đổi chỗ ngồi thành công!');
    }
  };

  // Group students by group 1, 2, 3
  const getGroupStudents = (groupId: 1 | 2 | 3) => {
    return students.filter((s) => s.seat.group === groupId);
  };

  // Render a single student card in seating chart
  const renderStudentDesk = (student?: Student, groupNum?: number, tableIdx?: number, pos?: 'left' | 'right') => {
    if (!student) {
      return (
        <div className="h-28 rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-900/40 flex flex-col items-center justify-center text-slate-500 text-xs p-2">
          <span>Bàn trống</span>
          <span className="text-[10px] text-slate-600">Tổ {groupNum} • Bàn {tableIdx! + 1}</span>
        </div>
      );
    }

    const attendanceStatus = student.attendance[activeDate] || 'present';
    const isSelectedForSwap = swapSourceId === student.id;

    const attendanceColors = {
      present: 'border-emerald-500/40 bg-slate-900/90 hover:border-emerald-500',
      excused: 'border-blue-500/50 bg-blue-950/20 hover:border-blue-400',
      unexcused: 'border-rose-500/60 bg-rose-950/25 hover:border-rose-400 animate-pulse',
      late: 'border-amber-500/50 bg-amber-950/25 hover:border-amber-400',
    };

    const statusBadge = {
      present: { text: 'Có mặt', class: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' },
      excused: { text: 'Có phép', class: 'bg-blue-950/80 text-blue-400 border-blue-500/30' },
      unexcused: { text: 'Vắng KP', class: 'bg-rose-950/80 text-rose-400 border-rose-500/40 font-bold' },
      late: { text: 'Đi muộn', class: 'bg-amber-950/80 text-amber-400 border-amber-500/30' },
    };

    return (
      <div
        key={student.id}
        onClick={() => onSelectStudent(student)}
        className={`group relative rounded-xl border p-2.5 transition-all cursor-pointer shadow-md ${
          isSelectedForSwap
            ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/40 scale-[1.02]'
            : attendanceColors[attendanceStatus]
        }`}
      >
        {/* Top bar: STT, Cadre & Status */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold border border-slate-700">
              {student.stt}
            </span>
            {student.cadreRole && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate max-w-[80px]">
                {student.cadreRole}
              </span>
            )}
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border ${
              statusBadge[attendanceStatus].class
            }`}
          >
            {statusBadge[attendanceStatus].text}
          </span>
        </div>

        {/* Student Name & Stars */}
        <div className="flex items-start justify-between">
          <div className="truncate mr-1">
            <h4 className="font-semibold text-xs text-white group-hover:text-amber-300 transition truncate">
              {student.fullName}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {student.parentName} ({student.phone})
            </p>
          </div>

          <div className="flex items-center space-x-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-amber-300 text-xs font-bold flex-shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{student.stars}</span>
          </div>
        </div>

        {/* Quick medicine notice if any */}
        {student.boardingHealth?.medicineSchedule?.length > 0 && (
          <div className="mt-1 flex items-center space-x-1 text-[9px] text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">
            <HeartPulse className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
            <span className="truncate">Có thuốc uống trưa ({student.boardingHealth.medicineSchedule.length})</span>
          </div>
        )}

        {/* 1-Touch Action Controls Bar */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          {/* Quick attendance buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => handleQuickAttendance(e, student, 'present')}
              title="Có mặt"
              className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition ${
                attendanceStatus === 'present'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
              }`}
            >
              ✓
            </button>
            <button
              onClick={(e) => handleQuickAttendance(e, student, 'late')}
              title="Đi muộn"
              className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition ${
                attendanceStatus === 'late'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-amber-400'
              }`}
            >
              M
            </button>
            <button
              onClick={(e) => handleQuickAttendance(e, student, 'unexcused')}
              title="Vắng không phép"
              className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition ${
                attendanceStatus === 'unexcused'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-rose-400'
              }`}
            >
              V
            </button>
          </div>

          {/* Plus/Minus Star and Swap */}
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => handleGiveStar(e, student)}
              title="Cộng 1 sao thi đua"
              className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
            >
              <Plus className="w-3 h-3 text-amber-400" />
            </button>
            <button
              onClick={(e) => handleDemerit(e, student)}
              title="Nhắc nhở nề nếp"
              className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition"
            >
              <Minus className="w-3 h-3 text-rose-400" />
            </button>
            <button
              onClick={(e) => handleSwapClick(e, student.id)}
              title="Hoán đổi chỗ ngồi"
              className={`p-1 rounded transition ${
                isSelectedForSwap
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900 border border-indigo-500 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-sm animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Quản Trị Hồ Sơ & Sơ Đồ Lớp Học</span>
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                Sĩ số: {students.length} học sinh
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sơ đồ động 3 tổ tương tác • Chạm để điểm danh 1 chạm, thưởng sao, nhắc nhở hoặc hoán đổi chỗ ngồi
            </p>
          </div>

          {/* Sub tabs switcher */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSubTab('seating')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                subTab === 'seating'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sơ Đồ 3 Tổ Động
            </button>
            <button
              onClick={() => setSubTab('cadres')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                subTab === 'cadres'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ban Cán Sự Lớp
            </button>
            <button
              onClick={() => setSubTab('duty')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                subTab === 'duty'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Nhật Ký Trực Nhật
            </button>
          </div>
        </div>
      </div>

      {subTab === 'seating' && (
        <div className="space-y-4">
          {/* Teacher Desk / Black board representation */}
          <div className="max-w-md mx-auto bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-dashed border-slate-700 rounded-xl py-2 px-6 text-center text-xs font-semibold text-slate-300 shadow-inner">
            🏫 BẢNG LỚP & BÀN GIÁO VIÊN CHỦ NHIỆM
            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
              (Lối vào cửa lớp hướng Tổ 1 • Cửa sổ thoáng hướng Tổ 3)
            </div>
          </div>

          {/* 3 Tổ Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((groupNum) => {
              const groupStudents = getGroupStudents(groupNum as 1 | 2 | 3);
              const groupLeader = groupStudents.find((s) => s.cadreRole?.includes(`Tổ ${groupNum}`) || s.cadreRole?.includes('Tổ trưởng'));
              const totalStars = groupStudents.reduce((acc, s) => acc + s.stars, 0);

              return (
                <div
                  key={groupNum}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">TỔ {groupNum}</span>
                        <span className="text-[11px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {groupStudents.length} bạn
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Tổ trưởng: {groupLeader ? groupLeader.fullName : 'Chưa phân công'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{totalStars} sao</span>
                    </div>
                  </div>

                  {/* Desks in the Group (5 tables of double seats) */}
                  <div className="space-y-3 flex-1">
                    {[0, 1, 2].map((tableIdx) => {
                      const leftStudent = groupStudents.find(
                        (s) => s.seat.tableIndex === tableIdx && s.seat.position === 'left'
                      );
                      const rightStudent = groupStudents.find(
                        (s) => s.seat.tableIndex === tableIdx && s.seat.position === 'right'
                      );

                      return (
                        <div key={tableIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                            <span>Bàn {tableIdx + 1}</span>
                            <span className="text-[9px]">Dãy đôi</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800/60">
                            {renderStudentDesk(leftStudent, groupNum, tableIdx, 'left')}
                            {renderStudentDesk(rightStudent, groupNum, tableIdx, 'right')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'cadres' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Danh Sách Ban Cán Sự Lớp 4A1</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Phân quyền theo dõi nề nếp, học tập, văn thể mỹ và lao động vệ sinh
              </p>
            </div>
            <button
              onClick={() => showToast('Đã lưu cấu hình phân công cán sự!')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Lưu phân công
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {students
              .filter((s) => s.cadreRole)
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent(s)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white font-bold mb-3 shadow">
                    {s.fullName.slice(0, 1)}
                  </div>
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30 inline-block mb-1">
                    {s.cadreRole}
                  </span>
                  <h4 className="font-semibold text-sm text-white">{s.fullName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Tổ {s.seat.group} • STT: {s.stt}</p>
                  <p className="text-xs text-slate-500 mt-1">SĐT PH: {s.phone}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-300">
                    <span>Sao thi đua</span>
                    <span className="font-bold">{s.stars} ⭐</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {subTab === 'duty' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                <span>Nhật Ký & Phân Công Trực Nhật Tuần 10</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lịch phân công quét lớp, lau bảng, đổ rác và kê bàn ghế
              </p>
            </div>
            <span className="text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-lg">
              Đánh giá tuần: Tốt (10/10)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { day: 'Thứ Hai', group: 'Tổ 1', leader: 'Lê Hoàng Bách', task: 'Vệ sinh đầu tuần & Khăn trải bàn giáo viên', status: 'Đã hoàn thành' },
              { day: 'Thứ Ba', group: 'Tổ 2', leader: 'Vũ Đức Giang', task: 'Quét lớp, đổ rác và lau cửa sổ', status: 'Đã hoàn thành' },
              { day: 'Thứ Tư', group: 'Tổ 3', leader: 'Ngô Quang Minh', task: 'Chăm sóc chậu cây xanh hành lang & lau bảng', status: 'Đã hoàn thành' },
              { day: 'Thứ Năm', group: 'Tổ 1', leader: 'Trần Thị Mai Anh', task: 'Vệ sinh phòng học & kiểm tra bàn ghế', status: 'Hôm nay' },
              { day: 'Thứ Sáu', group: 'Cả lớp', leader: 'Lớp trưởng Nguyễn Văn An', task: 'Tổng vệ sinh cuối tuần đón tiết sinh hoạt', status: 'Sắp tới' },
            ].map((d, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{d.day}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      d.status === 'Đã hoàn thành'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : d.status === 'Hôm nay'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <div className="text-xs text-indigo-300 font-semibold">{d.group}</div>
                <div className="text-[11px] text-slate-400">Phụ trách: {d.leader}</div>
                <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  {d.task}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
