import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, KeyRound, ArrowRight, Loader2, User, School, BookOpen } from 'lucide-react';
import { cn } from '../utils/cn';
import { UserProfile } from '../types';

export default function ExamSetup() {
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    className: '',
    school: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('examGeoProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProfile = { ...profile, [e.target.name]: e.target.value };
    setProfile(newProfile);
    localStorage.setItem('examGeoProfile', JSON.stringify(newProfile));
  };

  const validateProfile = () => {
    if (!profile.name.trim()) {
      setError('Vui lòng nhập họ và tên của bạn');
      return false;
    }
    return true;
  };

  const handleStartAI = () => {
    if (!validateProfile()) return;
    navigate('/quiz?mode=exam');
  };

  const handleJoinRoom = async () => {
    if (!validateProfile()) return;
    
    if (!examCode.trim()) {
      setError('Vui lòng nhập mã đề thi');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/exam/${examCode.trim()}`);
      const data = await res.json();

      if (data.success) {
        navigate(`/quiz?mode=exam&examId=${data.exam.id}`);
      } else {
        setError(data.error || 'Mã đề thi không hợp lệ');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Chọn Chế Độ Thi Thử</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Nhập thông tin của bạn và chọn làm đề thi ngẫu nhiên do AI tạo ra, hoặc tham gia vào phòng thi do giáo viên tạo.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Thông tin học sinh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="className"
                value={profile.className}
                onChange={handleProfileChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="12A1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trường</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="school"
                value={profile.school || ''}
                onChange={handleProfileChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="THPT Chuyên..."
              />
            </div>
          </div>
        </div>
        {error && <p className="text-rose-500 text-sm font-medium mt-4 text-center">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Exam Option */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Play className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Tạo đề bằng AI</h2>
          <p className="text-slate-600 mb-8 flex-1">
            Hệ thống sẽ tự động sinh một đề thi mới gồm 28 câu hỏi (Trắc nghiệm, Đúng/Sai, Trả lời ngắn) từ ngân hàng câu hỏi.
          </p>
          <button
            onClick={handleStartAI}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            Bắt đầu ngay
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Teacher Room Option */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Nhập mã của Giáo viên</h2>
          <p className="text-slate-600 mb-6">
            Nhập mã phòng thi (6 ký tự) do giáo viên cung cấp để làm bài và được xếp hạng trực tiếp.
          </p>
          
          <div className="mt-auto space-y-4">
            <div>
              <input
                type="text"
                value={examCode}
                onChange={(e) => {
                  setExamCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Ví dụ: AB12CD"
                className={cn(
                  "w-full p-4 rounded-xl border-2 outline-none transition-shadow text-center text-2xl font-bold tracking-widest uppercase",
                  error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                )}
                maxLength={6}
              />
              {error && examCode.length > 0 && <p className="text-rose-500 text-sm font-medium mt-2 text-center">{error}</p>}
            </div>
            
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || examCode.length < 3}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang kết nối...
                </>
              ) : (
                <>
                  Vào phòng thi
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
