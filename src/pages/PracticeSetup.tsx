import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Target, Play } from 'lucide-react';
import { lessons, topics } from '../data';
import { cn } from '../utils/cn';

export default function PracticeSetup() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') as 'lesson' | 'topic' || 'lesson';
  
  const [mode, setMode] = useState<'lesson' | 'topic'>(initialMode);
  const [selection, setSelection] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('20');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!selection) return;
    navigate(`/quiz?mode=${mode}&filter=${encodeURIComponent(selection)}&count=${questionCount}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20 md:pb-0"
    >
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Thiết lập bài luyện tập</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Chọn chế độ luyện tập</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setMode('lesson'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'lesson' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <BookOpen className="w-6 h-6 mb-2" />
              <span className="font-medium">Theo bài học</span>
            </button>
            <button
              onClick={() => { setMode('topic'); setSelection(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                mode === 'topic' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-emerald-200 text-slate-600"
              )}
            >
              <Target className="w-6 h-6 mb-2" />
              <span className="font-medium">Theo chủ đề</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            {mode === 'lesson' ? 'Chọn bài học' : 'Chọn chủ đề'}
          </label>
          <select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow bg-white"
          >
            <option value="">-- Chọn --</option>
            {(mode === 'lesson' ? lessons : topics).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Số lượng câu hỏi
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow bg-white"
          >
            <option value="10">10 câu</option>
            <option value="20">20 câu</option>
            <option value="30">30 câu</option>
            <option value="40">40 câu</option>
            <option value="all">Tất cả</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={!selection}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          <Play className="w-5 h-5" />
          Bắt đầu làm bài
        </button>
      </div>
    </motion.div>
  );
}
