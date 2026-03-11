import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Save, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', className: '', school: '', targetScore: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('examGeoProfile');
    if (savedProfile) {
      setProfile({ ...{ name: '', className: '', school: '', targetScore: '' }, ...JSON.parse(savedProfile) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('examGeoProfile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20 md:pb-0"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cấu hình học sinh</h1>
          <p className="text-slate-500">Cập nhật thông tin và mục tiêu học tập (Theo TT 17/BGD)</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              placeholder="Nhập tên của bạn..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lớp</label>
            <input
              type="text"
              value={profile.className}
              onChange={e => setProfile({...profile, className: e.target.value})}
              placeholder="Ví dụ: 12A1"
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trường THPT</label>
            <input
              type="text"
              value={profile.school || ''}
              onChange={e => setProfile({...profile, school: e.target.value})}
              placeholder="Ví dụ: THPT Chuyên..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mục tiêu điểm số (Địa lí)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="10"
              value={profile.targetScore || ''}
              onChange={e => setProfile({...profile, targetScore: e.target.value})}
              placeholder="Ví dụ: 8.5"
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm mt-4"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Đã lưu thành công!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu cấu hình
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
