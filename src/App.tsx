import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SeatingChart } from './components/SeatingChart';
import { DailyTracker } from './components/DailyTracker';
import { AIReportAssistant } from './components/AIReportAssistant';
import { LessonPlanner } from './components/LessonPlanner';
import { ParentMeetingKit } from './components/ParentMeetingKit';
import { FourPillarsAutomation } from './components/FourPillarsAutomation';
import { ClassroomChatbot } from './components/ClassroomChatbot';
import { BilingualHub } from './components/BilingualHub';
import { StudentPortal } from './components/StudentPortal';
import { LoginModal } from './components/LoginModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { EwsRadarModal } from './components/EwsRadarModal';
import { QuickStudentModal } from './components/QuickStudentModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getStoredApiKey } from './services/geminiService';
import { Student } from './types';

const MainAppContent: React.FC = () => {
  const { role } = useApp();
  const [activeTab, setActiveTab] = useState<string>('seating');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isEwsModalOpen, setIsEwsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMandatoryApiKey, setIsMandatoryApiKey] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Check API key presence on initial mount per AI_INSTRUCTIONS.md:
  // "Khi chưa có key, hiển thị Modal bắt buộc nhập."
  useEffect(() => {
    const key = getStoredApiKey();
    if (!key) {
      setIsMandatoryApiKey(true);
      setIsApiKeyModalOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Bar */}
      <Header
        onOpenLogin={() => setIsLoginModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEwsModal={() => setIsEwsModalOpen(true)}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
        onOpenApiKeyModal={() => {
          setIsMandatoryApiKey(false);
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {role === 'student' ? (
          <StudentPortal />
        ) : (
          <div>
            {activeTab === 'seating' && (
              <SeatingChart onSelectStudent={(s) => setSelectedStudentForModal(s)} />
            )}
            {activeTab === 'tracker' && (
              <DailyTracker onSelectStudent={(s) => setSelectedStudentForModal(s)} />
            )}
            {activeTab === 'tt27' && (
              <AIReportAssistant onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
            )}
            {activeTab === 'planner' && <LessonPlanner />}
            {activeTab === 'parent' && <ParentMeetingKit />}
            {activeTab === 'automation' && <FourPillarsAutomation />}
            {activeTab === 'chatbot' && <ClassroomChatbot />}
            {activeTab === 'bilingual' && <BilingualHub />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>
          SỔ CHỦ NHIỆM AI © 2026 • Trợ lý số hóa quản trị lớp học chuẩn Thông tư 27 Bộ GD&ĐT & Bộ sách Kết Nối Tri Thức Với Cuộc Sống
        </p>
      </footer>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <GoogleSheetModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
      />

      <EwsRadarModal
        isOpen={isEwsModalOpen}
        onClose={() => setIsEwsModalOpen(false)}
        onSelectStudent={(s) => setSelectedStudentForModal(s)}
      />

      <QuickStudentModal
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        isMandatory={isMandatoryApiKey}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
