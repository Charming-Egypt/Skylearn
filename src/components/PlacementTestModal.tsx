import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle, Volume2, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { CEFRLevel, LanguageCode, PlacementQuestion, PlacementResult } from '../types';
import { PLACEMENT_QUESTIONS, LANGUAGES } from '../data/curriculum';
import { speakText, sounds } from '../utils/speech';

interface PlacementTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: LanguageCode;
  onSaveResult: (language: LanguageCode, result: PlacementResult) => void;
  onStartRecommendedLesson?: (language: LanguageCode, level: CEFRLevel) => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'german',
  onSaveResult,
  onStartRecommendedLesson,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(initialLanguage);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, { isCorrect: boolean; selected: string }>>({});
  const [testFinished, setTestFinished] = useState(false);

  if (!isOpen) return null;

  const questions: PlacementQuestion[] = PLACEMENT_QUESTIONS[selectedLang] || [];
  const currentQ = questions[currentIndex];
  const langMeta = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[0];

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswerSubmitted) return;
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: { isCorrect, selected: selectedAnswer },
    }));
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Calculate final results
      finishTest();
    }
  };

  const finishTest = () => {
    sounds.playCompletion();
    let score = 0;
    const catScores = { grammar: 0, vocabulary: 0, listening: 0, reading: 0 };

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans?.isCorrect) {
        score++;
        catScores[q.category] = (catScores[q.category] || 0) + 1;
      }
    });

    let assignedLevel: CEFRLevel = 'A1';
    let levelSubtype = 'A1 (المستوى التأسيسي)';

    if (score >= 8) {
      assignedLevel = 'B1';
      levelSubtype = 'B1 (مستوى متقدم - طلاقة واستقلالية)';
    } else if (score >= 5) {
      assignedLevel = 'A2';
      levelSubtype = 'A2 (مستوى متوسط - تواصل واستخدام عملي)';
    } else if (score >= 3) {
      assignedLevel = 'A1';
      levelSubtype = 'A1.2 (مبتدئ متقدم)';
    } else {
      assignedLevel = 'A1';
      levelSubtype = 'A1.1 (بداية من الصفر - الحروف والأساسيات)';
    }

    const result: PlacementResult = {
      languageId: selectedLang,
      score,
      totalQuestions: questions.length,
      assignedLevel,
      levelSubtype,
      completedAt: new Date().toISOString(),
      categoryScores: catScores,
    };

    onSaveResult(selectedLang, result);
    setTestFinished(true);
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setTestFinished(false);
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLang(lang);
    resetTest();
  };

  // Play audio for current question if applicable
  const handlePlayAudio = () => {
    speakText(currentQ.question, selectedLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">اختبار قياس وتحديد المستوى</h2>
              <p className="text-xs text-blue-200">10 أسئلة مصممة وفق الإطار الأوروبي المشترك (CEFR)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Tabs */}
        {!testFinished && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
              {LANGUAGES.map((lang) => {
                const isActive = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nameArabic}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>السؤال:</span>
              <span className="font-bold text-blue-900 tabular-nums">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {!testFinished && (
          <div className="w-full bg-slate-100 h-1.5">
            <div
              className="bg-amber-400 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6">
          {!testFinished ? (
            <div>
              {/* Question Level & Category Tags */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold border border-blue-200">
                  مستوى السؤال: {currentQ.levelTarget}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  فئة: {currentQ.category === 'grammar' ? 'قواعد' : currentQ.category === 'vocabulary' ? 'مفردات' : currentQ.category === 'listening' ? 'استماع ونطق' : 'فهم وقراءة'}
                </span>
              </div>

              {/* The Question Text */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed text-right">
                    {currentQ.question}
                  </h3>
                  {currentQ.category === 'listening' && (
                    <button
                      onClick={handlePlayAudio}
                      title="استمع إلى الجملة"
                      className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let optionStyles = 'border-slate-200 bg-white hover:border-blue-400 text-slate-800';
                  if (selectedAnswer === option) {
                    optionStyles = 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold';
                  }

                  if (isAnswerSubmitted) {
                    if (option === currentQ.correctAnswer) {
                      optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (selectedAnswer === option) {
                      optionStyles = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                    } else {
                      optionStyles = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm sm:text-base">{option}</span>
                      </div>
                      {isAnswerSubmitted && option === currentQ.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && selectedAnswer === option && option !== currentQ.correctAnswer && (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Box when submitted */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-xl mb-6 text-sm border ${
                    selectedAnswer === currentQ.correctAnswer
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {selectedAnswer === currentQ.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>إجابة صحيحة! أحسنت!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>إجابة غير دقيقة. الإجابة الصحيحة هي: "{currentQ.correctAnswer}"</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 leading-relaxed mt-1">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={resetTest}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة البدء</span>
                </button>

                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
                      selectedAnswer
                        ? 'bg-blue-900 text-white hover:bg-blue-950'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    تأكيد الإجابة
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold text-sm transition-all shadow-xs cursor-pointer"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 text-amber-700 mx-auto flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 animate-spin" />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
                تهانينا! اكتمل اختبار تحديد المستوى
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                تقييم مستواك في اللغة {langMeta.nameArabic} وفق معايير CEFR
              </p>

              {/* Score Card */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl mb-6 shadow-md text-right">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-blue-800 pb-4 mb-4">
                  <div>
                    <span className="text-xs text-blue-300">مستواك الموصى به:</span>
                    <div className="text-2xl font-black text-amber-300">
                      {Object.values(userAnswers).filter((a) => a.isCorrect).length >= 8
                        ? 'المستوى B1 (مستقل / متوسط مرتفع)'
                        : Object.values(userAnswers).filter((a) => a.isCorrect).length >= 5
                        ? 'المستوى A2 (متوسط أساسي)'
                        : 'المستوى A1 (مبتدئ / تأسيسي)'}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xs text-blue-300">مجموع الدرجات:</span>
                    <div className="text-3xl font-black tabular-nums text-white">
                      {Object.values(userAnswers).filter((a) => a.isCorrect).length} / {questions.length}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <div className="text-blue-200">القواعد</div>
                    <div className="text-lg font-bold mt-0.5">ممتاز</div>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <div className="text-blue-200">المفردات</div>
                    <div className="text-lg font-bold mt-0.5">جيد جداً</div>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <div className="text-blue-200">الاستماع</div>
                    <div className="text-lg font-bold mt-0.5">جاهز للتدريب</div>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <div className="text-blue-200">النقاط المكتسبة</div>
                    <div className="text-lg font-bold text-amber-300 mt-0.5">+75 XP</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const score = Object.values(userAnswers).filter((a) => a.isCorrect).length;
                    const assigned: CEFRLevel = score >= 8 ? 'B1' : score >= 5 ? 'A2' : 'A1';
                    if (onStartRecommendedLesson) {
                      onStartRecommendedLesson(selectedLang, assigned);
                    }
                    onClose();
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  <span>ابدأ التعلم من مستواك المحدد</span>
                </button>
                <button
                  onClick={resetTest}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  إعادة الاختبار
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
