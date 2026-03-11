import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Clock, Target, Calendar } from 'lucide-react';
import { QuizAttempt } from '../types';
import { cn } from '../utils/cn';

export default function History() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('examGeoHistory') || '[]');
    setHistory(data);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s}s`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto pb-20 md:pb-0"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
          <HistoryIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch sử làm bài</h1>
          <p className="text-slate-500">Xem lại kết quả các bài đã luyện tập</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HistoryIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Chưa có dữ liệu</h3>
          <p className="text-slate-500">Bạn chưa hoàn thành bài luyện tập nào. Hãy bắt đầu ngay nhé!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((attempt) => {
            const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
            return (
              <div key={attempt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                      attempt.mode === 'exam' ? "bg-rose-100 text-rose-700" :
                      attempt.mode === 'topic' ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {attempt.mode === 'exam' ? 'Thi thử' : attempt.mode === 'topic' ? 'Chủ đề' : 'Bài học'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{attempt.title}</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(attempt.date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(attempt.timeSpent)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {attempt.totalQuestions} câu
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{attempt.score}/{attempt.totalQuestions}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Điểm</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-100 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                    <span className="text-xs font-bold text-slate-700">{percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
