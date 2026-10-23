export type Role = 'teacher' | 'student';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: Role;
  fullName: string;
  phone?: string;
  schoolName?: string;
  className: string;
  studentId?: string;
}

export interface Student {
  id: string;
  stt: number;
  fullName: string;
  birthYear: number;
  gender: 'Nam' | 'Nữ';
  parentName: string;
  phone: string;
  username: string;
  password: string;
  // Sơ đồ lớp động 3 tổ
  seat: {
    group: 1 | 2 | 3;
    tableIndex: number; // 0 to 4
    position: 'left' | 'right';
  };
  cadreRole?: string; // 'Lớp trưởng', 'Lớp phó học tập', 'Lớp phó lao động', 'Tổ trưởng tổ 1', v.v.
  stars: number; // Điểm thi đua cộng
  demerits: number; // Điểm trừ vi phạm
  // Điểm danh theo ngày YYYY-MM-DD: 'present' (Có mặt), 'excused' (Có phép), 'unexcused' (Không phép), 'late' (Đi muộn)
  attendance: Record<string, 'present' | 'excused' | 'unexcused' | 'late'>;
  behaviorLogs: BehaviorLogEntry[];
  boardingHealth: {
    lunchStatus: 'tốt' | 'bình thường' | 'kém' | 'không ăn';
    napStatus: 'ngủ ngon' | 'khó ngủ' | 'trằn trọc';
    temperature?: number;
    medicineSchedule: MedicineItem[];
  };
  tt27Evaluation: TT27Evaluation;
  specialSupportPlan?: SpecialSupportPlan;
}

export interface MedicineItem {
  id: string;
  time: string; // e.g. "11:30"
  medicineName: string;
  dosage: string;
  parentNote: string;
  taken: boolean;
}

export interface BehaviorLogEntry {
  id: string;
  date: string;
  time: string;
  type: 'praise' | 'warning';
  category: string;
  note: string;
  points: number; // +1, +2, -1, -2
}

export interface TT27Evaluation {
  academicLevel: 'T' | 'H' | 'C'; // Hoàn thành tốt, Hoàn thành, Cần cố gắng
  competencies: {
    selfLearning: 'T' | 'H' | 'C'; // Tự chủ và tự học
    collaboration: 'T' | 'H' | 'C'; // Giao tiếp và hợp tác
    problemSolving: 'T' | 'H' | 'C'; // Giải quyết vấn đề và sáng tạo
  };
  qualities: {
    patriotism: 'T' | 'H' | 'C'; // Yêu nước
    kindness: 'T' | 'H' | 'C'; // Nhân ái
    diligence: 'T' | 'H' | 'C'; // Chăm chỉ
    honesty: 'T' | 'H' | 'C'; // Trung thực
    responsibility: 'T' | 'H' | 'C'; // Trách nhiệm
  };
  subjectResults: Record<string, 'T' | 'H' | 'C'>;
  aiComment?: string;
  teacherFinalComment?: string;
  updatedAt?: string;
}

export interface SpecialSupportPlan {
  needed: boolean;
  reason: string;
  triggers: string[];
  actions: string[];
  progress: 'chưa cải thiện' | 'đang tiến bộ' | 'đã đạt mục tiêu';
  notes: string;
}

export interface ClassroomMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'doc' | 'pdf' | 'pptx' | 'link';
  content: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
}

export interface BilingualLesson {
  id: string;
  subject: string;
  grade: number;
  bookSeries: 'Kết Nối Tri Thức Với Cuộc Sống';
  unit: string;
  titleVi: string;
  titleEn: string;
  contentVi: string;
  contentEn: string;
  audioScript: string;
  keyVocabulary: Array<{
    word: string;
    phonetic: string;
    vietnamese: string;
    example: string;
  }>;
  bilingualPhrases: Array<{
    vi: string;
    en: string;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  subjectTag?: string;
}

export interface EarlyWarningAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'attendance' | 'academic' | 'psychology' | 'health';
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  suggestedAction: string;
  draftMessageToParent?: string;
  resolved: boolean;
  date: string;
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetId: string;
  apiKey?: string;
  syncIntervalMinutes: number;
  lastSyncedAt?: string;
  autoSync: boolean;
}
