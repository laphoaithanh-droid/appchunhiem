/**
 * Gemini AI Service with Automatic Fallback & Retry mechanism
 * Per AI_INSTRUCTIONS.md:
 * - Model order: gemini-3-flash-preview (Default), gemini-3-pro-preview, gemini-2.5-flash
 * - Auto-retries immediately with the next fallback model if the active model encounters an error.
 * - Stores & prioritizes API key from localStorage.
 * - Exposes raw API errors (e.g. 429 RESOURCE_EXHAUSTED) if all models fail.
 */

export const GEMINI_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định • Khuyên dùng',
    description: 'Tốc độ phản hồi cực nhanh, xử lý tốt nhận xét TT27, kịch bản lớp và chatbot.',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Mạnh mẽ nhất',
    description: 'Suy luận chiều sâu, biên soạn giáo án và giải quyết các bài toán sư phạm phức tạp.',
    isDefault: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Dự phòng ổn định',
    description: 'Model ổn định cao, dự phòng tin cậy khi các model thế hệ mới hết hạn mức.',
    isDefault: false,
  },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];

export const STORAGE_KEYS = {
  API_KEY: 'sochuniem_gemini_api_key',
  SELECTED_MODEL: 'sochuniem_gemini_model',
};

export const getStoredApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  if (localKey && localKey.trim()) return localKey.trim();
  // Optional Vite env fallback
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
};

export const setStoredApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
};

export const getStoredModel = (): GeminiModelId => {
  if (typeof window === 'undefined') return 'gemini-3-flash-preview';
  const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) as GeminiModelId;
  if (saved && GEMINI_MODELS.some((m) => m.id === saved)) {
    return saved;
  }
  return 'gemini-3-flash-preview';
};

export const setStoredModel = (model: GeminiModelId): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
};

export interface GeminiCallCallbacks {
  onModelFallback?: (info: { failedModel: string; nextModel: string; error: string }) => void;
}

export interface CallGeminiOptions extends GeminiCallCallbacks {
  systemInstruction?: string;
  jsonMode?: boolean;
  temperature?: number;
}

/**
 * Call Gemini API with automatic fallback through the model chain.
 * Chain: [selectedModel, ...remainingModels]
 */
export async function callGemini(
  prompt: string,
  options: CallGeminiOptions = {}
): Promise<{ text: string; usedModel: string }> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('Chưa có API key. Vui lòng nhấn vào nút Settings trên Header hoặc nhập API key để sử dụng.');
  }

  const selectedModel = getStoredModel();
  // Build fallback order: start with selectedModel, then the other models in order
  const modelChain: GeminiModelId[] = [
    selectedModel,
    ...GEMINI_MODELS.map((m) => m.id).filter((id) => id !== selectedModel),
  ];

  let lastError: Error | null = null;
  let rawApiErrorString = '';

  for (let i = 0; i < modelChain.length; i++) {
    const currentModel = modelChain[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      const bodyPayload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
        },
      };

      if (options.systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      if (options.jsonMode) {
        bodyPayload.generationConfig.responseMimeType = 'application/json';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.error) {
        const errCode = data?.error?.code || response.status;
        const errStatus = data?.error?.status || response.statusText || 'ERROR';
        const errMsg = data?.error?.message || response.statusText || 'Lỗi không xác định';
        const formattedErr = `${errCode} ${errStatus}: ${errMsg}`;
        rawApiErrorString = formattedErr;
        throw new Error(formattedErr);
      }

      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('Model không trả về nội dung hợp lệ');
      }

      return {
        text: candidateText.trim(),
        usedModel: currentModel,
      };
    } catch (err: any) {
      lastError = err;
      const errorMsg = err?.message || String(err);
      console.warn(`[Gemini Fallback] Model ${currentModel} thất bại: ${errorMsg}`);

      // If there is another model to try, notify callback and retry
      if (i < modelChain.length - 1) {
        const nextModel = modelChain[i + 1];
        options.onModelFallback?.({
          failedModel: currentModel,
          nextModel,
          error: errorMsg,
        });
        continue;
      }
    }
  }

  // If all models failed, throw with raw API error message (e.g. 429 RESOURCE_EXHAUSTED)
  throw new Error(rawApiErrorString || lastError?.message || 'Tất cả các model Gemini đều thất bại');
}

/**
 * Validates a Gemini API key with a fast ping.
 */
export async function validateApiKey(key: string): Promise<{ valid: boolean; error?: string }> {
  if (!key || !key.trim()) {
    return { valid: false, error: 'API key không được để trống' };
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      key.trim()
    )}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
      }),
    });
    const data = await response.json();
    if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { valid: true };
    }
    const errCode = data?.error?.code || response.status;
    const errStatus = data?.error?.status || 'LỖI';
    const errMsg = data?.error?.message || 'Không thể xác thực API Key';
    return { valid: false, error: `${errCode} ${errStatus}: ${errMsg}` };
  } catch (e: any) {
    return { valid: false, error: e?.message || 'Lỗi mạng khi kiểm tra API Key' };
  }
}

/**
 * 1. AI Nhận xét học sinh theo Thông tư 27 Bộ GD&ĐT
 */
export async function generateTT27Comment(
  params: {
    studentName: string;
    gender: string;
    level: string;
    academicStats?: string;
    behaviorLogs?: string;
    competencies?: any;
    qualities?: any;
  },
  callbacks?: GeminiCallCallbacks
): Promise<{ comment: string; usedModel: string }> {
  const { studentName, gender, level, academicStats, behaviorLogs, competencies, qualities } = params;

  const prompt = `Bạn là một giáo viên chủ nhiệm mẫu mực, giàu tâm huyết tại Việt Nam, am hiểu sâu sắc Thông tư 27/2020/TT-BGDĐT của Bộ Giáo dục và Đào tạo.
Hãy viết một nhận xét học kỳ / tháng mang tính khích lệ sư phạm, chuẩn xác, nhân văn cho học sinh sau:
- Họ tên: ${studentName || 'Em'} (${gender || 'Học sinh'})
- Mức độ đánh giá chung: ${level === 'T' ? 'Hoàn thành tốt' : level === 'H' ? 'Hoàn thành' : 'Cần cố gắng'}
- Năng lực cốt lõi: Tự chủ và tự học (${competencies?.selfLearning || 'H'}), Giao tiếp và hợp tác (${competencies?.collaboration || 'H'}), Giải quyết vấn đề và sáng tạo (${competencies?.problemSolving || 'H'})
- Phẩm chất: Chăm chỉ (${qualities?.diligence || 'H'}), Trung thực (${qualities?.honesty || 'H'}), Trách nhiệm (${qualities?.responsibility || 'H'}), Nhân ái (${qualities?.kindness || 'H'})
- Tóm tắt nề nếp thi đua: ${behaviorLogs || 'Chấp hành tốt nội quy lớp học'}
- Điểm học tập: ${academicStats || 'Nắm vững kiến thức trọng tâm các môn học'}

Yêu cầu:
1. Độ dài khoảng 3-4 câu (80-120 từ), câu chữ trau chuốt, ấm áp, đúng tinh thần đổi mới của TT27 (không chê bai nặng nề, chỉ rõ ưu điểm và gợi ý hướng rèn luyện tiếp theo).
2. Viết bằng tiếng Việt chuẩn mực, chỉ trả về nội dung nhận xét, không thêm lời chào hay dẫn dắt thừa.`;

  const res = await callGemini(prompt, callbacks);
  return { comment: res.text, usedModel: res.usedModel };
}

/**
 * 2. Kịch bản & Biên bản sinh hoạt lớp tự động
 */
export async function generateAssemblyScript(
  params: {
    weekNumber: number;
    topPraised: string;
    frequentIssues: string;
    attendanceSummary: string;
    upcomingEvents: string;
  },
  callbacks?: GeminiCallCallbacks
): Promise<{ content: string; usedModel: string }> {
  const { weekNumber, topPraised, frequentIssues, attendanceSummary, upcomingEvents } = params;

  const prompt = `Đóng vai là giáo viên chủ nhiệm chuyên nghiệp. Hãy soạn thảo KỊCH BẢN ĐIỀU HÀNH TIẾT SINH HOẠT LỚP TUẦN ${weekNumber || 10} và BIÊN BẢN SINH HOẠT LỚP chuẩn mẫu sư phạm.
Dữ liệu tổng kết tuần:
- Chuyên cần: ${attendanceSummary || '100% đúng giờ, không có vắng không phép'}
- Tuyên dương (Top sao): ${topPraised || 'Các em tích cực phát biểu và giữ gìn vệ sinh'}
- Tồn tại cần chấn chỉnh: ${frequentIssues || 'Một số bạn còn quên sách bài tập, nói chuyện riêng'}
- Kế hoạch tuần tới: ${upcomingEvents || 'Thi đua chào mừng Ngày Nhà Giáo Việt Nam 20-11, kiểm tra định kỳ'}

Yêu cầu xuất ra cấu trúc rõ ràng:
1. Phần 1: KỊCH BẢN ĐIỀU HÀNH TIẾT SINH HOẠT (Chi tiết 4 bước: Ổn định - Ban cán sự nhận xét - GVCN tổng kết biểu dương & chấn chỉnh - Phương hướng tuần tới)
2. Phần 2: BIÊN BẢN SINH HOẠT LỚP (Thời gian, thành phần, nội dung đánh giá thi đua, quyết nghị khen thưởng/nhắc nhở)`;

  const res = await callGemini(prompt, callbacks);
  return { content: res.text, usedModel: res.usedModel };
}

/**
 * 3. Trợ lý Giao tiếp & Tin nhắn Phụ huynh tự động
 */
export async function generateParentMessage(
  params: {
    parentName: string;
    studentName: string;
    stars: number;
    demerits: number;
    attendanceNote?: string;
    academicProgress?: string;
    urgentType?: string;
  },
  callbacks?: GeminiCallCallbacks
): Promise<{ message: string; usedModel: string }> {
  const { parentName, studentName, stars, demerits, attendanceNote, academicProgress, urgentType } = params;

  const prompt = `Soạn tin nhắn gửi phụ huynh học sinh qua Zalo/SMS.
Thông tin:
- Phụ huynh: ${parentName}
- Học sinh: ${studentName}
- Tích lũy sao/khen thưởng: ${stars} sao
- Vi phạm/nhắc nhở: ${demerits} lần
- Điểm danh & chuyên cần: ${attendanceNote || 'Đi học đều đặn'}
- Tình hình học tập: ${academicProgress || 'Có nhiều tiến bộ'}
${urgentType ? `- Loại thông báo đặc biệt: ${urgentType}` : ''}

Yêu cầu:
- Văn phong trang trọng, thân tình, khéo léo, mang tính xây dựng và gắn kết phụ huynh với nhà trường.
- Cấu trúc: Kính gửi Phụ huynh em ${studentName} + Lời chào + Điểm sáng rèn luyện trong tuần + Vấn đề gia đình cần phối hợp nhắc nhở (nếu có) + Lời chúc cuối tuần.`;

  const res = await callGemini(prompt, callbacks);
  return { message: res.text, usedModel: res.usedModel };
}

/**
 * 4. Trợ lý AI Chatbot Lớp Học
 */
export async function generateChatReply(
  params: {
    messages: Array<{ sender: 'user' | 'assistant'; text: string }>;
    classroomMaterials: any[];
    studentContext: { fullName: string; className: string };
  },
  callbacks?: GeminiCallCallbacks
): Promise<{ reply: string; usedModel: string }> {
  const { messages, classroomMaterials, studentContext } = params;

  const materialsContext =
    classroomMaterials && classroomMaterials.length > 0
      ? `HỌC LIỆU SỐ & NỘI QUY CỦA LỚP ĐƯỢC GIÁO VIÊN ĐĂNG TẢI:\n${classroomMaterials
          .map((m: any) => `- [${m.title}]: ${m.content}`)
          .join('\n')}`
      : 'Chưa có thêm tài liệu riêng của giáo viên. Sử dụng kiến thức chuẩn chương trình Bộ GD&ĐT.';

  const systemInstruction = `Bạn là Trợ lý AI Lớp Học Thông Minh (Trợ lý Dola Học Tập) của lớp học.
Bạn luôn thân thiện, lễ phép, nói chuyện vui tươi, truyền cảm hứng và động viên học sinh học tập tốt.
Thông tin học sinh đang trò chuyện: ${studentContext?.fullName || 'Học sinh'} (${studentContext?.className || 'Lớp chủ nhiệm'}).
Quy tắc:
1. Giải đáp các câu hỏi bài học (Toán, Tiếng Việt, Khoa học, Lịch sử, Đạo đức, Kỹ năng sống...) một cách sư phạm, gợi mở tư duy chứ không chỉ đưa đáp án máy móc.
2. Hướng dẫn học sinh tra cứu nội quy, lịch thi đua, phân công trực nhật của lớp.
3. Dựa vào HỌC LIỆU SỐ nếu học sinh hỏi về tài liệu thầy cô đã gửi:
${materialsContext}
4. Giữ giọng văn tích cực, chuẩn mực đạo đức học đường Việt Nam.`;

  const conversationHistory = (messages || [])
    .map((m) => `${m.sender === 'user' ? 'Học sinh' : 'Trợ lý AI'}: ${m.text}`)
    .join('\n');

  const prompt = `${conversationHistory}\n\nTrợ lý AI trả lời:`;

  const res = await callGemini(prompt, {
    ...callbacks,
    systemInstruction,
    temperature: 0.7,
  });

  return { reply: res.text, usedModel: res.usedModel };
}

/**
 * 5. Dịch & Thiết kế Học Liệu Song Ngữ (Bộ sách Kết Nối Tri Thức Với Cuộc Sống)
 */
export async function translateBilingualLesson(
  params: {
    subject: string;
    lessonTitle: string;
    vietnameseContent: string;
  },
  callbacks?: GeminiCallCallbacks
): Promise<any> {
  const { subject, lessonTitle, vietnameseContent } = params;

  const prompt = `Bạn là chuyên gia sư phạm song ngữ chuẩn của bộ sách "Kết Nối Tri Thức Với Cuộc Sống".
Hãy chuyển ngữ và thiết kế học liệu song ngữ cho bài học sau:
- Môn học: ${subject}
- Tên bài: ${lessonTitle}
- Nội dung gốc tiếng Việt:
${vietnameseContent}

Hãy trả về kết quả dưới dạng JSON (không có markdown formatting, chỉ JSON thuần) có đúng cấu trúc sau:
{
  "englishTitle": "Tên bài học tiếng Anh",
  "englishContent": "Đoạn dịch tiếng Anh chuẩn sư phạm quốc tế, dễ đọc cho học sinh tiểu học / THCS",
  "keyVocabulary": [
    { "word": "Từ vựng tiếng Anh", "phonetic": "Phiên âm IPA", "vietnamese": "Nghĩa tiếng Việt", "example": "Câu ví dụ minh họa" }
  ],
  "bilingualPhrases": [
    { "vi": "Câu tiếng Việt", "en": "Câu tiếng Anh tương ứng" }
  ],
  "audioReadingScript": "Toàn bộ bài đọc tiếng Anh mạch lạc để học sinh bấm nghe luyện phát âm"
}`;

  const res = await callGemini(prompt, {
    ...callbacks,
    jsonMode: true,
  });

  try {
    const cleaned = res.text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Không thể phân tích dữ liệu JSON từ AI: ' + res.text.slice(0, 100));
  }
}
