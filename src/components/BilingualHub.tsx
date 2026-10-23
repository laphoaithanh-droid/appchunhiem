import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BilingualLesson } from '../types';
import {
  Languages,
  Volume2,
  Square,
  Sparkles,
  BookOpen,
  Plus,
  CheckCircle,
  FileText,
  VolumeX,
  Play,
  RotateCcw,
} from 'lucide-react';
import { translateBilingualLesson } from '../services/geminiService';

const SUBJECT_LIST = [
  'Toán bằng Tiếng Anh',
  'Tiếng Việt bằng Tiếng Anh',
  'Tin học bằng Tiếng Anh',
  'Đạo Đức bằng Tiếng Anh',
  'Công nghệ bằng Tiếng Anh',
  'Lịch sử bằng Tiếng Anh',
  'Khoa học bằng Tiếng Anh',
  'Kỹ năng sống bằng Tiếng Anh',
];

export const BilingualHub: React.FC = () => {
  const { bilingualLessons, addBilingualLesson, role } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECT_LIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9); // Normal/child friendly speed
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // New lesson creation
  const [newTitleVi, setNewTitleVi] = useState('');
  const [newUnit, setNewUnit] = useState('Chủ đề mới');
  const [newContentVi, setNewContentVi] = useState('');

  const currentLesson =
    bilingualLessons.find((l) => l.subject === selectedSubject) || bilingualLessons[0];

  // Audio playback ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount or lesson change
  useEffect(() => {
    stopReading();
  }, [selectedSubject]);

  const readAloud = async (text: string) => {
    stopReading();
    setIsPlaying(true);

    try {
      // First attempt: Gemini TTS endpoint
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'Kore',
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => fallbackWebSpeech(text);
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Gemini TTS fallback to Web Speech:', e);
    }

    // High quality fallback: Browser Web Speech API
    fallbackWebSpeech(text);
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      // Try selecting a native English voice if available
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (enVoice) {
        utterance.voice = enVoice;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API.');
    }
  };

  const stopReading = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleCreateAndTranslateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleVi || !newContentVi) return;

    setIsTranslating(true);
    try {
      const data = await translateBilingualLesson({
        subject: selectedSubject,
        lessonTitle: newTitleVi,
        vietnameseContent: newContentVi,
      });

      addBilingualLesson({
        subject: selectedSubject,
        grade: 4,
        bookSeries: 'Kết Nối Tri Thức Với Cuộc Sống',
        unit: newUnit,
        titleVi: newTitleVi,
        titleEn: data.englishTitle || `${newTitleVi} (English)`,
        contentVi: newContentVi,
        contentEn: data.englishContent || 'Translated lesson content',
        audioScript: data.audioReadingScript || data.englishContent,
        keyVocabulary: data.keyVocabulary || [],
        bilingualPhrases: data.bilingualPhrases || [],
      });

      setNewTitleVi('');
      setNewContentVi('');
      setShowAddLessonModal(false);
    } catch (e: any) {
      console.error(e);
      alert(`Lỗi chuyển ngữ bài học: ${e?.message || 'Không thể kết nối AI'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">
              Hệ Thống Học Song Ngữ (Bộ Sách Kết Nối Tri Thức Với Cuộc Sống)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chuyển ngữ bài học sang tiếng Anh chuẩn sư phạm • Có nút đọc tiếng Anh bản ngữ & nút dừng đọc
          </p>
        </div>

        {role === 'teacher' && (
          <button
            onClick={() => setShowAddLessonModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Bài Học & Dịch AI</span>
          </button>
        )}
      </div>

      {/* 8 Subjects Navigation Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECT_LIST.map((subj) => {
          const isSelected = selectedSubject === subj;
          return (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {subj}
            </button>
          );
        })}
      </div>

      {/* Current Lesson View */}
      {currentLesson ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Lesson Header & Reading Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {currentLesson.bookSeries} • Lớp {currentLesson.grade}
                </span>
                <span className="text-xs text-slate-400">{currentLesson.unit}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{currentLesson.titleVi}</h3>
              <p className="text-sm font-semibold text-cyan-400 italic">{currentLesson.titleEn}</p>
            </div>

            {/* Audio Playback Controls */}
            <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 px-2 text-xs text-slate-400">
                <span>Tốc độ:</span>
                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                >
                  <option value={0.75}>0.75x (Chậm)</option>
                  <option value={0.9}>0.9x (Chuẩn)</option>
                  <option value={1.0}>1.0x (Nhanh)</option>
                </select>
              </div>

              {!isPlaying ? (
                <button
                  onClick={() => readAloud(currentLesson.audioScript || currentLesson.contentEn)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                >
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>Đọc Tiếng Anh</span>
                </button>
              ) : (
                <button
                  onClick={stopReading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Dừng Đọc</span>
                </button>
              )}
            </div>
          </div>

          {/* Reading Wave Status Banner */}
          {isPlaying && (
            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-cyan-300">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Đang phát âm tiếng Anh bài học... Học sinh lắng nghe và nhẩm theo nhé!</span>
              </div>
              <div className="flex space-x-1">
                <span className="w-1.5 h-4 bg-cyan-400 animate-pulse rounded" />
                <span className="w-1.5 h-6 bg-cyan-300 animate-pulse delay-75 rounded" />
                <span className="w-1.5 h-3 bg-cyan-500 animate-pulse delay-150 rounded" />
              </div>
            </div>
          )}

          {/* Side-by-Side Content: Vietnamese & English */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vietnamese Original */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-slate-800/80 pb-2">
                <span>Nội Dung Gốc Tiếng Việt</span>
                <span className="text-[10px] text-slate-500">Sách Kết Nối Tri Thức</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {currentLesson.contentVi}
              </p>
            </div>

            {/* English Pedagogical Translation */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 border-b border-slate-800/80 pb-2">
                <span>Bản Dịch Tiếng Anh Chuẩn Sư Phạm</span>
                <button
                  onClick={() => readAloud(currentLesson.contentEn)}
                  className="text-[11px] text-cyan-300 hover:text-white flex items-center space-x-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Nghe đoạn này</span>
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {currentLesson.contentEn}
              </p>
            </div>
          </div>

          {/* Key Vocabulary Cards */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Từ Vựng Trọng Tâm & Phiên Âm Chuẩn Quốc Tế</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentLesson.keyVocabulary.map((vocab, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-cyan-300">{vocab.word}</span>
                      <button
                        onClick={() => readAloud(vocab.word)}
                        title="Nghe phát âm từ này"
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {vocab.phonetic}
                    </span>
                    <p className="text-xs font-medium text-slate-200 mt-1">{vocab.vietnamese}</p>
                  </div>

                  <p className="text-[10px] text-slate-400 italic border-t border-slate-800/80 pt-1.5">
                    Ví dụ: "{vocab.example}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bilingual Dialogue & Phrases */}
          {currentLesson.bilingualPhrases?.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="font-bold text-sm text-white">Mẫu Câu Giao Tiếp & Luyện Đọc Song Ngữ:</h4>
              <div className="space-y-2">
                {currentLesson.bilingualPhrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-cyan-300">{phrase.en}</div>
                      <div className="text-slate-400">{phrase.vi}</div>
                    </div>
                    <button
                      onClick={() => readAloud(phrase.en)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Nghe</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs">
          Chưa có bài học cho môn học này. Thầy cô có thể nhấn "Thêm Bài Học & Dịch AI" để tạo mới!
        </div>
      )}

      {/* Modal: Add New Lesson & AI Translation */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-200">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Thêm Bài Học Mới & Chuyển Ngữ Song Ngữ Bằng AI</span>
            </h3>

            <form onSubmit={handleCreateAndTranslateLesson} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Môn học:</label>
                <input
                  type="text"
                  value={selectedSubject}
                  disabled
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Chủ đề / Bài học:</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Ví dụ: Chủ đề 2: Khám phá thế giới động vật"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Tên bài học tiếng Việt:</label>
                <input
                  type="text"
                  value={newTitleVi}
                  onChange={(e) => setNewTitleVi(e.target.value)}
                  placeholder="Ví dụ: Vòng tuần hoàn của nước trong tự nhiên"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nội dung bài học tiếng Việt:</label>
                <textarea
                  rows={5}
                  value={newContentVi}
                  onChange={(e) => setNewContentVi(e.target.value)}
                  placeholder="Dán nội dung giáo trình theo bộ sách Kết Nối Tri Thức Với Cuộc Sống..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isTranslating}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold shadow"
                >
                  {isTranslating ? 'AI Đang Dịch Song Ngữ...' : 'AI Dịch & Tạo Giọng Đọc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
