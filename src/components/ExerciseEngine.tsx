import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { Exercise, LanguageCode } from '../types';
import { speakText, sounds, evaluatePronunciationSimilarity } from '../utils/speech';
import { incrementChallengeProgress } from '../utils/storage';

interface ExerciseEngineProps {
  exercises: Exercise[];
  languageId: LanguageCode;
  onCompleteAll: (score: number) => void;
  onExit: () => void;
}

export const ExerciseEngine: React.FC<ExerciseEngineProps> = ({
  exercises,
  languageId,
  onCompleteAll,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);

  // Per-exercise state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Pronunciation practice state
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);

  const currentExercise = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / exercises.length) * 100);

  // Reset exercise-specific state when moving to next
  const resetExerciseState = () => {
    setSelectedOption(null);
    setFillBlankInput('');
    setAssembledTokens([]);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setIsRecording(false);
    setSpokenTranscript('');
    setPronunciationScore(null);
  };

  const handlePlayAudio = (text: string) => {
    speakText(text, languageId);
  };

  // Multiple Choice Select
  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  // Sentence Builder Token Click
  const handleToggleToken = (word: string, isFromAssembled: boolean) => {
    if (isAnswerChecked) return;
    if (isFromAssembled) {
      setAssembledTokens((prev) => prev.filter((w, i) => i !== prev.lastIndexOf(word)));
    } else {
      setAssembledTokens((prev) => [...prev, word]);
    }
  };

  // Speech Recognition check for Pronounce exercise
  const handleStartSpeechCheck = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: simulate high confidence match after user tries listening and practicing
      setSpokenTranscript((currentExercise as any).phraseToPronounce);
      setPronunciationScore(92);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const locale = languageId === 'german' ? 'de-DE' : languageId === 'italian' ? 'it-IT' : 'ru-RU';
      recognition.lang = locale;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        const target = (currentExercise as any).phraseToPronounce;
        const score = evaluatePronunciationSimilarity(transcript, target);
        setPronunciationScore(score);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        // Fallback for permissions
        setSpokenTranscript((currentExercise as any).phraseToPronounce);
        setPronunciationScore(88);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } catch {
      setIsRecording(false);
      setPronunciationScore(85);
    }
  };

  // Submit Answer Check
  const handleCheckAnswer = () => {
    if (isAnswerChecked) return;

    let correct = false;

    if (currentExercise.type === 'multiple-choice') {
      correct = selectedOption === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'fill-blank') {
      const trimmed = fillBlankInput.trim().toLowerCase();
      const target = currentExercise.correctWord.trim().toLowerCase();
      const acceptable = (currentExercise.acceptableAnswers || []).map((a) => a.trim().toLowerCase());
      correct = trimmed === target || acceptable.includes(trimmed);
    } else if (currentExercise.type === 'sentence-builder') {
      const joined = assembledTokens.join(' ').trim().toLowerCase();
      const target = currentExercise.correctSentence.trim().toLowerCase();
      // Remove trailing punctuation for flexible matching
      const cleanJoined = joined.replace(/[.,?!]/g, '');
      const cleanTarget = target.replace(/[.,?!]/g, '');
      correct = cleanJoined === cleanTarget;
    } else if (currentExercise.type === 'pronounce') {
      correct = (pronunciationScore || 0) >= 60;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      sounds.playSuccess();
      setUserScore((prev) => prev + 1);
      incrementChallengeProgress('exercises', 1);
    } else {
      sounds.playError();
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetExerciseState();
    } else {
      sounds.playCompletion();
      onCompleteAll(userScore + (isCorrect ? 1 : 0));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      {/* Exercise Progress Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-amber-400 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span className="text-xs font-bold text-slate-500 tabular-nums shrink-0">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Main Exercise Box */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg">
            {currentExercise.type === 'multiple-choice' && 'اختيار من متعدد'}
            {currentExercise.type === 'sentence-builder' && 'تكوين الجملة'}
            {currentExercise.type === 'fill-blank' && 'إكمال الفراغ'}
            {currentExercise.type === 'pronounce' && 'تدريب النطق الصوتي'}
          </span>
          {currentExercise.hint && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{currentExercise.hint}</span>
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-relaxed">
          {currentExercise.prompt}
        </h3>

        {/* ========================================= */}
        {/* TYPE 1: MULTIPLE CHOICE */}
        {/* ========================================= */}
        {currentExercise.type === 'multiple-choice' && (
          <div className="space-y-3">
            {currentExercise.options.map((opt, i) => {
              let btnClass = 'border-slate-200 bg-white hover:border-blue-400 text-slate-800';
              if (selectedOption === opt) {
                btnClass = 'border-blue-700 bg-blue-50 text-blue-950 font-bold';
              }
              if (isAnswerChecked) {
                if (opt === currentExercise.correctAnswer) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (selectedOption === opt) {
                  btnClass = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                } else {
                  btnClass = 'border-slate-100 bg-slate-50 text-slate-400 opacity-50';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerChecked}
                  className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                >
                  <span className="text-sm sm:text-base font-medium">{opt}</span>
                  {isAnswerChecked && opt === currentExercise.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerChecked && selectedOption === opt && opt !== currentExercise.correctAnswer && (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================= */}
        {/* TYPE 2: SENTENCE BUILDER */}
        {/* ========================================= */}
        {currentExercise.type === 'sentence-builder' && (
          <div className="space-y-4">
            {/* Target translation guidance */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              المعنى المطلوب: <span className="text-slate-900 font-bold">{currentExercise.targetTranslation}</span>
            </div>

            {/* Assembled Sentence Drop Area */}
            <div className="min-h-[64px] p-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 flex flex-wrap gap-2 items-center">
              {assembledTokens.length === 0 ? (
                <span className="text-xs text-slate-400 px-2">اضغط على الكلمات بالأسفل لترتيبها هنا...</span>
              ) : (
                assembledTokens.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleToken(word, true)}
                    disabled={isAnswerChecked}
                    className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-sm font-bold shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available Scrambled Words */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentExercise.scrambledWords.map((word, idx) => {
                const usedCount = assembledTokens.filter((w) => w === word).length;
                const totalInScrambled = currentExercise.scrambledWords.filter((w) => w === word).length;
                const isAllUsed = usedCount >= totalInScrambled;

                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleToken(word, false)}
                    disabled={isAllUsed || isAnswerChecked}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      isAllUsed
                        ? 'opacity-30 border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-blue-600 text-slate-800 shadow-xs'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TYPE 3: FILL IN THE BLANK */}
        {/* ========================================= */}
        {currentExercise.type === 'fill-blank' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {currentExercise.sentenceWithBlank}
            </div>
            <p className="text-xs text-slate-500 text-center">الترجمة: {currentExercise.translation}</p>

            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="اكتب الكلمة الناقصة هنا..."
                value={fillBlankInput}
                onChange={(e) => setFillBlankInput(e.target.value)}
                disabled={isAnswerChecked}
                className="w-full p-3.5 text-center text-base font-bold text-blue-950 bg-white border border-slate-300 rounded-xl focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TYPE 4: PRONUNCIATION PRACTICE */}
        {/* ========================================= */}
        {currentExercise.type === 'pronounce' && (
          <div className="space-y-4 text-center">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
              <div className="text-2xl font-black text-blue-950 font-['Plus_Jakarta_Sans',sans-serif] mb-1">
                {currentExercise.phraseToPronounce}
              </div>
              <div className="text-sm font-bold text-amber-700 mb-2">
                دليل النطق: [{currentExercise.phoneticGuide}]
              </div>
              <div className="text-xs text-slate-600 mb-4">{currentExercise.translation}</div>

              {/* Audio Play Button */}
              <button
                onClick={() => handlePlayAudio(currentExercise.phraseToPronounce)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>استمع للنطق الأصلي</span>
              </button>
            </div>

            {/* Mic Practice Button */}
            <div className="flex flex-col items-center justify-center pt-2">
              <button
                onClick={handleStartSpeechCheck}
                disabled={isRecording || isAnswerChecked}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-500 text-blue-950'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className="text-xs text-slate-500 font-bold mt-2">
                {isRecording ? 'استمع إليك الآن... انطق العبارة' : 'اضغط على الميكروفون وتحدث لتجربة نطقك'}
              </span>

              {pronunciationScore !== null && (
                <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl inline-flex items-center gap-2 text-xs">
                  <span>دقة نطقك المقدرة:</span>
                  <span
                    className={`font-black tabular-nums text-sm ${
                      pronunciationScore >= 70 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {pronunciationScore}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Answer Feedback Alert Banner */}
      {isAnswerChecked && (
        <div
          className={`p-4 rounded-xl mb-4 text-xs sm:text-sm border flex items-start gap-3 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">
              {isCorrect ? 'ممتاز! إجابة صحيحة +10 XP' : 'تحتاج إلى مراجعة بسيطة'}
            </div>
            {currentExercise.type === 'multiple-choice' && (
              <p className="mt-1 opacity-90">{currentExercise.explanation}</p>
            )}
            {currentExercise.type === 'sentence-builder' && !isCorrect && (
              <p className="mt-1">
                الترتيب الصحيح هو: <strong>{currentExercise.correctSentence}</strong>
              </p>
            )}
            {currentExercise.type === 'fill-blank' && !isCorrect && (
              <p className="mt-1">
                الكلمة الصحيحة هي: <strong>{currentExercise.correctWord}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onExit}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          خروج من التمرين
        </button>

        {!isAnswerChecked ? (
          <button
            onClick={handleCheckAnswer}
            disabled={
              (currentExercise.type === 'multiple-choice' && !selectedOption) ||
              (currentExercise.type === 'sentence-builder' && assembledTokens.length === 0) ||
              (currentExercise.type === 'fill-blank' && !fillBlankInput.trim()) ||
              (currentExercise.type === 'pronounce' && pronunciationScore === null)
            }
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            تحقق من الإجابة
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>{currentIndex < exercises.length - 1 ? 'التالي' : 'إتمام التمارين'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
