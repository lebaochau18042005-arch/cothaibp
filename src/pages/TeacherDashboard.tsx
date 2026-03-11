import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Upload, FileText, Users, Download, Play, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { questions } from '../data';
import { QuestionType } from '../types';

interface Student {
  id: string;
  name: string;
  className?: string;
  school?: string;
  score: number;
  progress: number;
  answers: Record<string, boolean>;
  isFinished?: boolean;
  timeSpent?: number;
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'monitor'>('create');
  const [examMethod, setExamMethod] = useState<'ai' | 'upload'>('ai');
  const [examId, setExamId] = useState<string>('');
  const [generatedExamId, setGeneratedExamId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'monitor') {
      const newSocket = io();
      setSocket(newSocket);

      newSocket.emit('teacher_join', { examId });

      newSocket.on('initial_state', (data: Student[]) => {
        setStudents(data);
      });

      newSocket.on('student_joined', (data: Student[]) => {
        setStudents(data);
      });

      newSocket.on('student_updated', (data: Student[]) => {
        setStudents(data);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [activeTab, examId]);

  const generateQuestions = () => {
    const getQs = (type: QuestionType, count: number) => {
      return questions.filter(q => q.type === type).sort(() => 0.5 - Math.random()).slice(0, count);
    };
    return [
      ...getQs('multiple_choice', 18),
      ...getQs('true_false', 4),
      ...getQs('short_answer', 6)
    ];
  };

  const handleCreateExam = async () => {
    setIsCreating(true);
    try {
      const qs = generateQuestions();
      const response = await fetch('/api/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: examMethod,
          questions: qs
        })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedExamId(data.examId);
      }
    } catch (error) {
      console.error('Lỗi khi tạo đề:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('Đang tải lên...');
      
      const formData = new FormData();
      formData.append('file', e.target.files[0]);

      try {
        const response = await fetch('/api/upload-exam', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          setUploadStatus('Tải lên thành công! Đang tạo phòng thi...');
          handleCreateExam(); // Automatically create exam after upload
        } else {
          setUploadStatus('Lỗi: ' + result.error);
        }
      } catch (error) {
        setUploadStatus('Lỗi kết nối khi tải lên.');
      }
    }
  };

  const exportCSV = () => {
    // Sort students by score descending
    const sortedStudents = [...students].sort((a, b) => b.score - a.score);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Thứ hạng,Tên học sinh,Lớp,Trường,Điểm số,Số câu đã làm,Trạng thái\n";
    
    sortedStudents.forEach((student, index) => {
      csvContent += `${index + 1},${student.name},${student.className || ''},${student.school || ''},${student.score},${student.progress},${student.isFinished ? 'Hoàn thành' : 'Đang làm'}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ket_qua_thi_${examId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sort students for display
  const sortedStudents = [...students].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeSpent && b.timeSpent) return a.timeSpent - b.timeSpent;
    return b.progress - a.progress;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Bảng Điều Khiển Giáo Viên</h1>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              activeTab === 'create' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Tạo Đề Thi
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              activeTab === 'monitor' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Theo Dõi Trực Tiếp
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Phương thức tạo đề</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setExamMethod('ai')}
              className={cn(
                "p-6 rounded-2xl border-2 text-left transition-all",
                examMethod === 'ai' ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"
              )}
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Tạo bằng AI</h3>
              <p className="text-slate-600 text-sm">Hệ thống tự động sinh đề thi theo cấu trúc chuẩn 2025 từ ngân hàng câu hỏi.</p>
            </button>

            <button
              onClick={() => setExamMethod('upload')}
              className={cn(
                "p-6 rounded-2xl border-2 text-left transition-all",
                examMethod === 'upload' ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200"
              )}
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Tải file lên</h3>
              <p className="text-slate-600 text-sm">Hỗ trợ nhận diện đề thi từ file Word (.docx), PDF, hoặc HTML.</p>
            </button>
          </div>

          {examMethod === 'upload' && !generatedExamId && (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-slate-50">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".doc,.docx,.pdf,.html"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-blue-500">
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-lg font-medium text-slate-700 mb-2">Nhấn để chọn file</span>
                <span className="text-sm text-slate-500">Hỗ trợ Word, PDF, HTML</span>
              </label>
              {uploadStatus && (
                <div className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg inline-block">
                  {uploadStatus}
                </div>
              )}
            </div>
          )}

          {examMethod === 'ai' && !generatedExamId && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-slate-700 mb-4">Hệ thống sẽ tự động tạo một đề thi gồm 28 câu hỏi (18 câu trắc nghiệm, 4 câu đúng/sai, 6 câu trả lời ngắn).</p>
              <button 
                onClick={handleCreateExam}
                disabled={isCreating}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating && <Loader2 className="w-5 h-5 animate-spin" />}
                Tạo Đề Ngay
              </button>
            </div>
          )}

          {generatedExamId && (
            <div className="mt-8 p-8 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Tạo phòng thi thành công!</h3>
              <p className="text-slate-600 mb-6">Hãy chia sẻ mã phòng thi dưới đây cho học sinh của bạn.</p>
              
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 mb-8 inline-block min-w-[300px]">
                <div className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Mã Phòng Thi</div>
                <div className="text-5xl font-black text-emerald-600 tracking-widest">{generatedExamId}</div>
              </div>

              <div>
                <button 
                  onClick={() => {
                    setExamId(generatedExamId);
                    setActiveTab('monitor');
                  }}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                >
                  Bắt đầu theo dõi
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'monitor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Đang làm bài</div>
                <div className="text-2xl font-bold text-slate-800">{students.length} <span className="text-sm font-normal text-slate-500">/ 100 max</span></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between md:col-span-2">
              <div>
                <div className="text-sm text-slate-500 font-medium mb-1">Mã phòng thi</div>
                <div className="text-2xl font-bold text-emerald-600 tracking-wider">{examId}</div>
              </div>
              <button
                onClick={exportCSV}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Xuất File Điểm
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Bảng Xếp Hạng Trực Tiếp</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Hạng</th>
                    <th className="p-4 font-medium">Học sinh</th>
                    <th className="p-4 font-medium">Lớp / Trường</th>
                    <th className="p-4 font-medium">Tiến độ</th>
                    <th className="p-4 font-medium">Thời gian</th>
                    <th className="p-4 font-medium">Điểm số</th>
                    <th className="p-4 font-medium">Chi tiết câu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-700">#{index + 1}</td>
                      <td className="p-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {student.name}
                          {student.isFinished && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Xong</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {student.className && <span className="font-medium">{student.className}</span>}
                        {student.className && student.school && <span> - </span>}
                        {student.school && <span>{student.school}</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (student.progress / 28) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600">{student.progress}/28</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600">
                        {student.isFinished ? formatTime(student.timeSpent) : 'Đang làm...'}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">{student.score.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {Array.from({ length: student.progress }).map((_, i) => {
                            const isCorrect = student.answers[`q_${i}`];
                            return (
                              <div 
                                key={i}
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  isCorrect ? "bg-emerald-500" : "bg-rose-500"
                                )}
                                title={`Câu ${i + 1}: ${isCorrect ? 'Đúng' : 'Sai'}`}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Chưa có học sinh nào tham gia phòng thi này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
