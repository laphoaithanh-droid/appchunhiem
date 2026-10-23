import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Role,
  UserAccount,
  ClassroomMaterial,
  BilingualLesson,
  EarlyWarningAlert,
  GoogleSheetConfig,
  ChatMessage,
  TT27Evaluation,
  BehaviorLogEntry,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSROOM_MATERIALS,
  BILINGUAL_LESSONS,
  INITIAL_ALERTS,
} from '../data/mockData';

interface AppContextType {
  currentUser: UserAccount | null;
  role: Role;
  students: Student[];
  materials: ClassroomMaterial[];
  bilingualLessons: BilingualLesson[];
  alerts: EarlyWarningAlert[];
  chatMessages: ChatMessage[];
  googleSheetConfig: GoogleSheetConfig;
  activeDate: string; // 'YYYY-MM-DD'
  // Actions
  loginAsTeacher: () => void;
  loginAsStudent: (student: Student) => void;
  loginWithCredentials: (username: string, pass: string, selectedRole: Role) => boolean;
  logout: () => void;
  updateAttendance: (studentId: string, status: 'present' | 'excused' | 'unexcused' | 'late') => void;
  addBehaviorLog: (studentId: string, log: Omit<BehaviorLogEntry, 'id' | 'date' | 'time'>) => void;
  updateSeatPosition: (studentId: string, group: 1 | 2 | 3, tableIndex: number, position: 'left' | 'right') => void;
  swapSeats: (studentId1: string, studentId2: string) => void;
  updateTT27Evaluation: (studentId: string, evaluation: Partial<TT27Evaluation>) => void;
  updateBoardingHealth: (studentId: string, health: Partial<Student['boardingHealth']>) => void;
  toggleMedicineTaken: (studentId: string, medicineId: string) => void;
  addMedicineReminder: (studentId: string, item: { time: string; medicineName: string; dosage: string; parentNote: string }) => void;
  addMaterial: (material: Omit<ClassroomMaterial, 'id' | 'createdAt'>) => void;
  deleteMaterial: (id: string) => void;
  addBilingualLesson: (lesson: Omit<BilingualLesson, 'id'>) => void;
  resolveAlert: (alertId: string) => void;
  addAlert: (alert: Omit<EarlyWarningAlert, 'id' | 'date'>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateGoogleSheetConfig: (config: Partial<GoogleSheetConfig>) => void;
  importStudentsFromPsv: (text: string) => { success: boolean; count: number; error?: string };
  exportStudentsToPsv: () => string;
  generateWeeklyDigest: () => any;
  triggerMorningAbsenteeNotification: () => { count: number; students: Student[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'sochuniem_students_v1',
  MATERIALS: 'sochuniem_materials_v1',
  LESSONS: 'sochuniem_lessons_v1',
  ALERTS: 'sochuniem_alerts_v1',
  USER: 'sochuniem_user_v1',
  SHEET: 'sochuniem_sheet_config_v1',
};

const DEFAULT_TEACHER: UserAccount = {
  id: 'gv-01',
  username: 'thanh.lh',
  fullName: 'Cô Lê Hoàng Thanh',
  role: 'teacher',
  phone: '0901234567',
  schoolName: 'Trường Tiểu học & THCS Chu Văn An',
  className: 'Lớp 4A1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TEACHER;
      }
    }
    return DEFAULT_TEACHER;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STUDENTS;
      }
    }
    return INITIAL_STUDENTS;
  });

  const [materials, setMaterials] = useState<ClassroomMaterial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLASSROOM_MATERIALS;
      }
    }
    return INITIAL_CLASSROOM_MATERIALS;
  });

  const [bilingualLessons, setBilingualLessons] = useState<BilingualLesson[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return BILINGUAL_LESSONS;
      }
    }
    return BILINGUAL_LESSONS;
  });

  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ALERTS;
      }
    }
    return INITIAL_ALERTS;
  });

  const [googleSheetConfig, setGoogleSheetConfig] = useState<GoogleSheetConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // default
      }
    }
    return {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1XyZ9.../edit?usp=sharing',
      sheetId: '1XyZ9_ExampleSheetId_SoChuNiemAI',
      syncIntervalMinutes: 30,
      lastSyncedAt: 'Hôm nay lúc 07:15',
      autoSync: true,
    };
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Chào bạn! Mình là Trợ lý AI Lớp Học Thông Minh. Mình có thể giúp giải đáp bài học theo sách Kết Nối Tri Thức, tra cứu nội quy, phân công trực nhật và hỗ trợ học tập!',
      timestamp: '08:00',
    },
  ]);

  const activeDate = '2026-10-22'; // Current date context

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(bilingualLessons));
  }, [bilingualLessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHEET, JSON.stringify(googleSheetConfig));
  }, [googleSheetConfig]);

  // Auth actions
  const loginAsTeacher = () => {
    setCurrentUser(DEFAULT_TEACHER);
  };

  const loginAsStudent = (student: Student) => {
    const account: UserAccount = {
      id: student.id,
      username: student.username,
      fullName: student.fullName,
      role: 'student',
      className: 'Lớp 4A1',
      studentId: student.id,
      phone: student.phone,
    };
    setCurrentUser(account);
  };

  const loginWithCredentials = (username: string, pass: string, selectedRole: Role): boolean => {
    if (selectedRole === 'teacher') {
      if ((username === 'thanh.lh' || username === 'admin' || username === 'giaovien') && (pass === '123456' || pass === 'admin123' || pass === 'teacher')) {
        setCurrentUser(DEFAULT_TEACHER);
        return true;
      }
      // Allow fallback login with name
      setCurrentUser({
        id: 'gv-custom',
        username,
        fullName: username,
        role: 'teacher',
        className: 'Lớp 4A1',
        schoolName: 'Trường Chu Văn An',
      });
      return true;
    } else {
      const match = students.find(
        (s) => (s.username.toLowerCase() === username.toLowerCase() || s.fullName.toLowerCase() === username.toLowerCase()) && (s.password === pass || pass === '123456')
      );
      if (match) {
        loginAsStudent(match);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Student Attendance
  const updateAttendance = (studentId: string, status: 'present' | 'excused' | 'unexcused' | 'late') => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [activeDate]: status,
          },
        };
      })
    );
  };

  // Behavior & Stars
  const addBehaviorLog = (studentId: string, log: Omit<BehaviorLogEntry, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: BehaviorLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: activeDate,
      time: timeStr,
      ...log,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const starDiff = log.type === 'praise' ? Math.max(0, log.points) : 0;
        const demeritDiff = log.type === 'warning' ? Math.abs(log.points) : 0;
        return {
          ...s,
          stars: s.stars + starDiff,
          demerits: s.demerits + demeritDiff,
          behaviorLogs: [newEntry, ...s.behaviorLogs],
        };
      })
    );
  };

  // Seating
  const updateSeatPosition = (studentId: string, group: 1 | 2 | 3, tableIndex: number, position: 'left' | 'right') => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            seat: { group, tableIndex, position },
          };
        }
        return s;
      })
    );
  };

  const swapSeats = (studentId1: string, studentId2: string) => {
    setStudents((prev) => {
      const s1 = prev.find((s) => s.id === studentId1);
      const s2 = prev.find((s) => s.id === studentId2);
      if (!s1 || !s2) return prev;

      const seat1 = { ...s1.seat };
      const seat2 = { ...s2.seat };

      return prev.map((s) => {
        if (s.id === studentId1) return { ...s, seat: seat2 };
        if (s.id === studentId2) return { ...s, seat: seat1 };
        return s;
      });
    });
  };

  // TT27 Evaluation
  const updateTT27Evaluation = (studentId: string, evaluation: Partial<TT27Evaluation>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          tt27Evaluation: {
            ...s.tt27Evaluation,
            ...evaluation,
            updatedAt: new Date().toISOString(),
          },
        };
      })
    );
  };

  // Boarding & Health
  const updateBoardingHealth = (studentId: string, health: Partial<Student['boardingHealth']>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          boardingHealth: {
            ...s.boardingHealth,
            ...health,
          },
        };
      })
    );
  };

  const toggleMedicineTaken = (studentId: string, medicineId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          boardingHealth: {
            ...s.boardingHealth,
            medicineSchedule: s.boardingHealth.medicineSchedule.map((m) =>
              m.id === medicineId ? { ...m, taken: !m.taken } : m
            ),
          },
        };
      })
    );
  };

  const addMedicineReminder = (
    studentId: string,
    item: { time: string; medicineName: string; dosage: string; parentNote: string }
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newMed = {
          id: `med-${Date.now()}`,
          ...item,
          taken: false,
        };
        return {
          ...s,
          boardingHealth: {
            ...s.boardingHealth,
            medicineSchedule: [...s.boardingHealth.medicineSchedule, newMed],
          },
        };
      })
    );
  };

  // Classroom Materials
  const addMaterial = (material: Omit<ClassroomMaterial, 'id' | 'createdAt'>) => {
    const newMat: ClassroomMaterial = {
      id: `mat-${Date.now()}`,
      createdAt: activeDate,
      ...material,
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Bilingual Lessons
  const addBilingualLesson = (lesson: Omit<BilingualLesson, 'id'>) => {
    const newLesson: BilingualLesson = {
      id: `bl-${Date.now()}`,
      ...lesson,
    };
    setBilingualLessons((prev) => [newLesson, ...prev]);
  };

  // EWS Alerts
  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const addAlert = (alert: Omit<EarlyWarningAlert, 'id' | 'date'>) => {
    const newAlert: EarlyWarningAlert = {
      id: `alert-${Date.now()}`,
      date: activeDate,
      ...alert,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Chatbot
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      timestamp: timeStr,
      ...msg,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Google Sheet Config & Sync
  const updateGoogleSheetConfig = (config: Partial<GoogleSheetConfig>) => {
    setGoogleSheetConfig((prev) => ({
      ...prev,
      ...config,
      lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }));
  };

  // Import / Export according to TT|HỌ VÀ TÊN|NĂM SINH|HỌ VÀ TÊN CHA(MẸ)|SỐ ĐIỆN THOẠI|TÊN ĐĂNG NHẬP|MẬT KHẨU|
  const importStudentsFromPsv = (text: string) => {
    try {
      const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        return { success: false, count: 0, error: 'Dữ liệu trống' };
      }

      const parsed: Student[] = [];
      let sttCounter = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip header if present
        if (line.toLowerCase().includes('họ và tên') || line.toLowerCase().includes('tên đăng nhập')) {
          continue;
        }

        // Split by pipe '|' or tab or comma
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length >= 7) {
          // Format: TT|HỌ VÀ TÊN|NĂM SINH|HỌ VÀ TÊN CHA(MẸ)|SỐ ĐIỆN THOẠI|TÊN ĐĂNG NHẬP|MẬT KHẨU|
          const stt = parseInt(parts[0], 10) || sttCounter;
          const fullName = parts[1] || `Học sinh ${stt}`;
          const birthYear = parseInt(parts[2], 10) || 2015;
          const parentName = parts[3] || 'Phụ huynh';
          const phone = parts[4] || '0900000000';
          const username = parts[5] || `hs.${stt}`;
          const password = parts[6] || `pass@${stt}`;

          // Distribute into 3 groups automatically
          const group = ((sttCounter - 1) % 3 + 1) as 1 | 2 | 3;
          const tableIndex = Math.floor((sttCounter - 1) / 6);
          const position = (sttCounter % 2 === 1 ? 'left' : 'right') as 'left' | 'right';

          parsed.push({
            id: `hs-imported-${sttCounter}`,
            stt,
            fullName,
            birthYear,
            gender: fullName.toLowerCase().includes('thị') || fullName.toLowerCase().includes('mai') || fullName.toLowerCase().includes('ngọc') ? 'Nữ' : 'Nam',
            parentName,
            phone,
            username,
            password,
            seat: { group, tableIndex: Math.min(tableIndex, 4), position },
            stars: 10,
            demerits: 0,
            attendance: { [activeDate]: 'present' },
            behaviorLogs: [],
            boardingHealth: {
              lunchStatus: 'tốt',
              napStatus: 'ngủ ngon',
              temperature: 36.5,
              medicineSchedule: [],
            },
            tt27Evaluation: {
              academicLevel: 'H',
              competencies: { selfLearning: 'H', collaboration: 'H', problemSolving: 'H' },
              qualities: { patriotism: 'T', kindness: 'T', diligence: 'H', honesty: 'T', responsibility: 'H' },
              subjectResults: { Toán: 'H', 'Tiếng Việt': 'H', 'Khoa học': 'H', 'Tiếng Anh': 'H' },
              aiComment: `Em ${fullName} ngoan ngoãn, hòa đồng với bạn bè và hoàn thành nhiệm vụ học tập.`,
            },
          });
          sttCounter++;
        }
      }

      if (parsed.length > 0) {
        setStudents(parsed);
        return { success: true, count: parsed.length };
      } else {
        return { success: false, count: 0, error: 'Không tìm thấy dòng nào đúng định dạng TT|HỌ VÀ TÊN|NĂM SINH|HỌ VÀ TÊN CHA(MẸ)|SỐ ĐIỆN THOẠI|TÊN ĐĂNG NHẬP|MẬT KHẨU|' };
      }
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  };

  const exportStudentsToPsv = (): string => {
    const header = 'TT|HỌ VÀ TÊN|NĂM SINH|HỌ VÀ TÊN CHA(MẸ)|SỐ ĐIỆN THOẠI|TÊN ĐĂNG NHẬP|MẬT KHẨU|';
    const rows = students.map(
      (s) => `${s.stt}|${s.fullName}|${s.birthYear}|${s.parentName}|${s.phone}|${s.username}|${s.password}|`
    );
    return [header, ...rows].join('\n');
  };

  // Weekly digest helper
  const generateWeeklyDigest = () => {
    const sortedByStars = [...students].sort((a, b) => b.stars - a.stars);
    const topPraised = sortedByStars.slice(0, 5);
    const sortedByDemerits = [...students].filter((s) => s.demerits > 0).sort((a, b) => b.demerits - a.demerits);

    const totalAbsent = students.filter(
      (s) => s.attendance[activeDate] === 'unexcused' || s.attendance[activeDate] === 'excused'
    ).length;
    const totalLate = students.filter((s) => s.attendance[activeDate] === 'late').length;

    return {
      topPraised,
      frequentIssues: sortedByDemerits,
      totalStudents: students.length,
      presentRate: Math.round(((students.length - totalAbsent) / (students.length || 1)) * 100),
      totalAbsent,
      totalLate,
      alertsCount: alerts.filter((a) => !a.resolved).length,
    };
  };

  // Morning absentee alert trigger (7:30 AM)
  const triggerMorningAbsenteeNotification = () => {
    const absentees = students.filter(
      (s) => s.attendance[activeDate] === 'unexcused' || s.attendance[activeDate] === 'late'
    );
    return {
      count: absentees.length,
      students: absentees,
    };
  };

  const role = currentUser?.role || 'teacher';

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        students,
        materials,
        bilingualLessons,
        alerts,
        chatMessages,
        googleSheetConfig,
        activeDate,
        loginAsTeacher,
        loginAsStudent,
        loginWithCredentials,
        logout,
        updateAttendance,
        addBehaviorLog,
        updateSeatPosition,
        swapSeats,
        updateTT27Evaluation,
        updateBoardingHealth,
        toggleMedicineTaken,
        addMedicineReminder,
        addMaterial,
        deleteMaterial,
        addBilingualLesson,
        resolveAlert,
        addAlert,
        addChatMessage,
        updateGoogleSheetConfig,
        importStudentsFromPsv,
        exportStudentsToPsv,
        generateWeeklyDigest,
        triggerMorningAbsenteeNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
