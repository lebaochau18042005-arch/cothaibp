import { GoogleGenAI } from '@google/genai';
import { Question, UserProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getExplanation(question: Question, userAnswer: any, isCorrect: boolean, profile?: UserProfile) {
  try {
    const greeting = profile?.name ? `Chào em **${profile.name}**, ` : 'Chào em, ';
    const encouragement = profile?.targetScore ? `Cố gắng ôn luyện để đạt mục tiêu **${profile.targetScore} điểm** nhé!` : 'Chúc em ôn tập thật tốt và đạt điểm cao!';
    
    let questionContext = `Câu hỏi: "${question.text}"\n`;
    
    if (question.type === 'multiple_choice') {
      questionContext += `Các đáp án:\n`;
      question.options.forEach((opt, i) => {
        questionContext += `${String.fromCharCode(65 + i)}. ${opt}\n`;
      });
      questionContext += `Học sinh đã chọn đáp án: "${question.options[userAnswer as number]}".\n`;
      questionContext += `Đáp án đúng là: "${question.options[question.correctAnswerIndex]}".\n`;
    } else if (question.type === 'true_false') {
      questionContext += `Các ý:\n`;
      question.statements.forEach(stmt => {
        questionContext += `- ${stmt.text} (Đúng/Sai)\n`;
      });
      questionContext += `Học sinh đã trả lời: ${JSON.stringify(userAnswer)}.\n`;
      questionContext += `Đáp án đúng là:\n`;
      question.statements.forEach(stmt => {
        questionContext += `- ${stmt.text}: ${stmt.isTrue ? 'ĐÚNG' : 'SAI'}\n`;
      });
    } else if (question.type === 'short_answer') {
      questionContext += `Học sinh đã điền đáp án: "${userAnswer}".\n`;
      questionContext += `Đáp án đúng là: "${question.correctAnswer}".\n`;
    }

    const performanceStatus = isCorrect ? 'làm ĐÚNG' : 'làm SAI';

    const prompt = `Học sinh đang ôn thi THPT Quốc gia môn Địa lí (theo cấu trúc đề tham khảo 2025 mới nhất và bám sát Thông tư 17/2025/TT-BGDĐT sửa đổi, bổ sung Chương trình GDPT môn Địa lí cấp THPT) và vừa ${performanceStatus} câu hỏi sau:
${questionContext}

Hãy đóng vai một giáo viên Địa lí nhiệt tình. Bắt đầu bằng "${greeting}".
YÊU CẦU BẮT BUỘC (Trình bày bằng Markdown, SỬ DỤNG GẠCH ĐẦU DÒNG (bullet points) cho TẤT CẢ các phần để dễ đọc):
${isCorrect ? '- **Lời khen:** Khen ngợi học sinh vì đã trả lời đúng.' : '- **Phân tích lỗi sai của em:** Giải thích thật chi tiết TẠI SAO đáp án em chọn lại sai. Em đang bị nhầm lẫn ở khái niệm hay hiện tượng địa lí nào?'}
- **Giải thích chi tiết kiến thức:** Phân tích cặn kẽ TẠI SAO đáp án đúng lại là đáp án chính xác. Trích dẫn kiến thức Địa lí 12 (hoặc 11) liên quan.
- **💡 Mẹo ghi nhớ / Lưu ý:** Cung cấp mẹo ghi nhớ ngắn gọn, dễ hiểu hoặc từ khóa quan trọng để lần sau không sai nữa.
- **Lời khuyên:** Dành một lời khuyên ngắn gọn và kết thúc bằng câu: "${encouragement}"

Trình bày bằng tiếng Việt, thân thiện, dễ hiểu và khích lệ.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching AI explanation:", error);
    return "Xin lỗi, thầy/cô AI đang bận chút việc. Em hãy xem lại sách giáo khoa phần này nhé!";
  }
}
