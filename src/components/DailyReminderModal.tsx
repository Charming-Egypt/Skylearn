import React, { useState } from 'react';
import { X, Bell, Clock, ShieldCheck, Check, Sparkles, Send } from 'lucide-react';
import { UserStats } from '../types';
import { requestPushNotificationPermission, triggerSimulatedReminder, updateReminderSettings } from '../utils/storage';
import { LANGUAGES } from '../data/curriculum';

interface DailyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [enabled, setEnabled] = useState(stats.reminderSettings.enabled);
  const [time, setTime] = useState(stats.reminderSettings.reminderTime || '19:00');
  const [goal, setGoal] = useState(stats.dailyGoalMinutes || 15);
  const [testSent, setTestSent] = useState(false);
  const [permissionState, setPermissionState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = updateReminderSettings({
      enabled,
      reminderTime: time,
    });
    updated.dailyGoalMinutes = goal;
    onUpdateStats(updated);
    onClose();
  };

  const handleRequestPermission = async () => {
    const granted = await requestPushNotificationPermission();
    setPermissionState(granted ? 'granted' : 'denied');
  };

  const handleSendTestNotification = () => {
    triggerSimulatedReminder(LANGUAGES[0].nameArabic);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">التذكيرات اليومية الذكية</h2>
              <p className="text-xs text-blue-200">حافظ على شعلة التعلّم والتزامك اليومي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">تفعيل التذكير اليومي التلقائي</h4>
                <p className="text-xs text-slate-500">إشعار ودود لممارسة درس اليوم وحماية السلسلة</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              وقت التذكير المفضل:
            </label>
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <Clock className="w-5 h-5 text-slate-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-base font-bold text-blue-900 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              الوقت المقترح: بعد انتهاء العمل أو الدراسة (مثال: 19:00 أو 20:30)
            </p>
          </div>

          {/* Daily Goal Target */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              الهدف اليومي الموصى به:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 10, label: '10 دقائق', badge: 'سهل ومريح' },
                { mins: 15, label: '15 دقيقة', badge: 'الموصى به' },
                { mins: 30, label: '30 دقيقة', badge: 'مكثف وسريع' },
              ].map((item) => (
                <button
                  key={item.mins}
                  onClick={() => setGoal(item.mins)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    goal === item.mins
                      ? 'border-blue-700 bg-blue-50 text-blue-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-extrabold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Push Notification Status & Test */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900">حماية سلسلة الأيام (Streak Protection)</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  يصلك تنبيه قبل انتهاء اليوم بساعتين إذا لم تكن قد أكملت تمرينك لحماية نقاطك وسلسلة تقدمك.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {permissionState !== 'granted' ? (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      تفعيل إشعارات المتصفح
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Check className="w-4 h-4" />
                      <span>الإشعارات مفعلة بالمتصفح</span>
                    </div>
                  )}

                  <button
                    onClick={handleSendTestNotification}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testSent ? 'تم الإرسال!' : 'تجربة إشعار فوري'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
