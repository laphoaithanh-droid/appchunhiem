import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Calendar,
  Sparkles,
  FileText,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  UserCheck,
  Flag,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { generateAssemblyScript } from '../services/geminiService';

export const LessonPlanner: React.FC = () => {
  const { students, generateWeeklyDigest } = useApp();
  const [activeTab, setActiveTab] = useState<'assembly' | 'intervention' | 'calendar'>('assembly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [weekNumber, setWeekNumber] = useState(10);

  const digest = generateWeeklyDigest();

  const [assemblyOutput, setAssemblyOutput] = useState<string>(`KỊCH BẢN ĐIỀU HÀNH TIẾT SINH HOẠT LỚP TUẦN ${weekNumber}
Chủ điểm: "Nhớ ơn thầy cô - Thi đua Bông hoa Điểm Mười"

I. TIẾN TRÌNH TIẾT SINH HOẠT LỚP
1. Khởi động & Ổn định tổ chức (5 phút):
   - Lớp phó Văn thể bắt nhịp bài hát: "Bụi Phấn".
   - Lớp trưởng Nguyễn Văn An báo cáo sĩ số: 18/18 học sinh có mặt.

2. Ban cán sự lớp tổng kết tuần qua (10 phút):
   - Tổ 1 (Tổ trưởng Bách): Đạt 42 sao, trực nhật sạch sẽ.
   - Tổ 2 (Tổ trưởng Giang): Đạt 46 sao, dẫn đầu phong trào phát biểu.
   - Tổ 3 (Tổ trưởng Minh): Đạt 38 sao, còn 1 bạn quên sách bài tập.
   - Lớp phó học tập Mai Anh: Đánh giá giờ tự học và việc hoàn thành bài tập về nhà.

3. Giáo viên chủ nhiệm biểu dương & chấn chỉnh (15 phút):
   - Biểu dương Top 5 ngôi sao sáng: ${digest.topPraised.map((s: Student) => `${s.fullName} (${s.stars} sao)`).join(', ')}.
   - Nhắc nhở chấn chỉnh: Khắc phục tình trạng một số bạn đi muộn và quên đồ dùng học tập.

4. Phương hướng hoạt động tuần tới (10 phút):
   - Đẩy mạnh phong trào hoa điểm mười chào mừng ngày Nhà Giáo Việt Nam 20-11.
   - Ôn tập chuẩn bị cho kỳ kiểm tra định kỳ giữa kỳ.

--------------------------------------------------
BIÊN BẢN SINH HOẠT LỚP TUẦN ${weekNumber}
- Thời gian: Tiết 5, Thứ Sáu
- Địa điểm: Phòng học Lớp 4A1, Trường TH & THCS Chu Văn An
- Thành phần: Giáo viên chủ nhiệm Lê Hoàng Thanh cùng 18/18 học sinh
- Chủ tọa: GVCN & Lớp trưởng Nguyễn Văn An
- Thư ký: Lớp phó học tập Trần Thị Mai Anh
- Quyết nghị: Tập thể lớp nhất trí biểu quyết 100% quyết tâm giữ vững danh hiệu Lớp Xuất Sắc.`);

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    try {
      const topPraisedStr = digest.topPraised.map((s: Student) => `${s.fullName} (${s.stars} sao)`).join(', ');
      const frequentIssuesStr = digest.frequentIssues.map((s: Student) => `${s.fullName} (${s.demerits} lần nhắc nhở)`).join(', ');

      const res = await generateAssemblyScript({
        weekNumber,
        topPraised: topPraisedStr,
        frequentIssues: frequentIssuesStr,
        attendanceSummary: `Tỷ lệ chuyên cần đạt ${digest.presentRate}%, vắng ${digest.totalAbsent} buổi`,
        upcomingEvents: 'Thi đua chào mừng Ngày Nhà Giáo Việt Nam 20-11, kiểm tra định kỳ môn Toán & Tiếng Việt',
      });

      if (res.content) {
        setAssemblyOutput(res.content);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Lỗi tạo kịch bản AI: ${e?.message || 'Không thể tạo kịch bản'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(assemblyOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const studentsNeedingSupport = students.filter(
    (s) => s.specialSupportPlan?.needed || s.demerits >= 2 || s.tt27Evaluation.academicLevel === 'C'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">
              Kế Hoạch Chủ Nhiệm & Tiết Sinh Hoạt Lớp Tự Động
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tự động tổng hợp số liệu tuần, 1-Click sinh kịch bản & biên bản sinh hoạt lớp, quản lý hồ sơ can thiệp sư phạm
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'assembly'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kịch Bản & Biên Bản Sinh Hoạt
          </button>
          <button
            onClick={() => setActiveTab('intervention')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'intervention'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hồ Sơ Can Thiệp ({studentsNeedingSupport.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lịch Công Tác Tuần/Tháng
          </button>
        </div>
      </div>

      {activeTab === 'assembly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Week stats summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-white">Số Liệu Tổng Hợp Tuần</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400">Tuần:</span>
                  <input
                    type="number"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white text-center"
                  />
                </div>
              </div>

              {/* Top praised */}
              <div>
                <span className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Top 5 Sao Sáng Trong Tuần:</span>
                </span>
                <div className="space-y-1.5">
                  {digest.topPraised.map((s: Student, idx: number) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{s.fullName}</span>
                      </div>
                      <span className="text-amber-400 font-bold">{s.stars} ⭐</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infractions / reminders */}
              <div>
                <span className="text-xs font-semibold text-rose-300 flex items-center space-x-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Các Tồn Tại Cần Chấn Chỉnh:</span>
                </span>
                <div className="space-y-1.5">
                  {digest.frequentIssues.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Không có vi phạm nổi bật tuần này</p>
                  ) : (
                    digest.frequentIssues.slice(0, 4).map((s: Student) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs"
                      >
                        <span className="font-semibold text-slate-200">{s.fullName}</span>
                        <span className="text-rose-400 font-bold">{s.demerits} lần nhắc nhở</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Attendance quick glance */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Chuyên cần: {digest.presentRate}%</span>
                <span>Vắng: {digest.totalAbsent} buổi</span>
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? 'AI Đang Sinh Kịch Bản...' : '1-Click AI Sinh Kịch Bản Mới'}</span>
              </button>
            </div>
          </div>

          {/* Right: Assembly Script & Minutes Content */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  Kịch Bản Tiết Sinh Hoạt & Khung Biên Bản Tuần {weekNumber}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In văn bản</span>
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={assemblyOutput}
              onChange={(e) => setAssemblyOutput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Intervention Plan */}
      {activeTab === 'intervention' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>Hồ Sơ Học Sinh Cần Hỗ Trợ Sư Phạm Đặc Biệt (Intervention Plan)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lộ trình theo dõi các em có khó khăn trong học tập hoặc biến động tâm lý, tự động kích hoạt bởi EWS
              </p>
            </div>
            <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg">
              {studentsNeedingSupport.length} học sinh đang được theo dõi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentsNeedingSupport.map((s) => {
              const plan = s.specialSupportPlan || {
                needed: true,
                reason: 'Cần củng cố thêm kiến thức môn Toán và nề nếp chuyên cần',
                triggers: ['Có buổi đi muộn', 'Chưa hoàn thành bài tập'],
                actions: [
                  'Kèm cặp 15 phút đầu giờ với Lớp phó học tập',
                  'Trao đổi Zalo riêng với phụ huynh vào chiều thứ 6',
                ],
                progress: 'đang tiến bộ',
                notes: 'Em đã có thái độ tích cực hơn khi được cô giáo động viên.',
              };

              return (
                <div
                  key={s.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{s.fullName}</h4>
                      <p className="text-xs text-slate-400">
                        Tổ {s.seat.group} • Phụ huynh: {s.parentName} ({s.phone})
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        plan.progress === 'đang tiến bộ'
                          ? 'bg-blue-950 text-blue-300 border-blue-500/30'
                          : 'bg-rose-950 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {plan.progress}
                    </span>
                  </div>

                  <div className="text-xs text-amber-200/90 bg-amber-950/25 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="font-semibold text-amber-400 block mb-0.5">Lý do can thiệp:</span>
                    {plan.reason}
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-300">Biện pháp sư phạm đã thiết lập:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 pl-1">
                      {plan.actions.map((act: string, idx: number) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 italic">
                    Ghi chú: {plan.notes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Monthly / Weekly Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Flag className="w-5 h-5 text-indigo-400" />
                <span>Kế Hoạch & Lịch Hoạt Động Tháng 10 - 11</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lịch công tác Đội, phong trào thi đua, kế hoạch kiểm tra định kỳ
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { time: '20/10 - 25/10', title: 'Hội thi làm bưu thiếp & Kể chuyện về mẹ và cô giáo', type: 'Đội Thiếu niên', status: 'Đang diễn ra' },
              { time: '01/11 - 15/11', title: 'Phát động đợt thi đua cao điểm: "Hoa Điểm Mười Dâng Thầy Cô"', type: 'Phong trào thi đua', status: 'Sắp tới' },
              { time: '10/11 - 14/11', title: 'Kiểm tra định kỳ giữa Học kỳ 1 (Toán, Tiếng Việt, Khoa học)', type: 'Chuyên môn', status: 'Kế hoạch' },
              { time: '18/11/2026', title: 'Chương trình Văn nghệ & Tri ân Ngày Nhà Giáo Việt Nam 20-11', type: 'Toàn trường', status: 'Kế hoạch' },
              { time: '28/11/2026', title: 'Họp Phụ Huynh Học Sinh Giữa Kỳ I', type: 'Chủ nhiệm', status: 'Kế hoạch' },
            ].map((ev, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-500/30">
                      {ev.time}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{ev.type}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-white">{ev.title}</h4>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded font-semibold ${
                    ev.status === 'Đang diễn ra'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
