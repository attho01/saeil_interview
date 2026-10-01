import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AudioWaveformMotion } from './AudioWaveformMotion.tsx';

interface SpeechTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  speechText: string;
}

export const SpeechTimerModal: React.FC<SpeechTimerModalProps> = ({
  isOpen,
  onClose,
  title,
  speechText,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<any>(null);

  const charCount = speechText ? speechText.replace(/\s+/g, '').length : 0;
  // Average Korean speech speed: approx. 5~6 characters per second (300~350 chars/min)
  const targetMinSeconds = 40;
  const targetMaxSeconds = 60;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Reset when text changes or closed
  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSeconds(0);
      stopTTS();
    }
  }, [isOpen]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const playTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('브라우저가 음성 합성을 지원하지 않습니다.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // slightly deliberate interview pace
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsRunning(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsRunning(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  // Pace status
  let statusText = '발화 대기 중';
  let statusColor = 'text-slate-500';
  if (seconds > 0 && seconds < targetMinSeconds) {
    statusText = `진행 중 (목표 40초까지 ${targetMinSeconds - seconds}초 남음)`;
    statusColor = 'text-blue-600';
  } else if (seconds >= targetMinSeconds && seconds <= targetMaxSeconds) {
    statusText = '최적 분량 도달! (40~60초 안착)';
    statusColor = 'text-emerald-600 font-semibold';
  } else if (seconds > targetMaxSeconds) {
    statusText = `초과 주의 (면접관 집중도 저하 위험 +${seconds - targetMaxSeconds}초)`;
    statusColor = 'text-rose-600 font-semibold';
  }

  const progressPercent = Math.min((seconds / targetMaxSeconds) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">40~60초 실전 발화 타이머 & 스피치 코칭</h3>
          </div>
          <button
            onClick={() => {
              stopTTS();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target pacing banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-indigo-800 font-medium">컨설턴트 표준 발화 지침</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                면접관이 가장 집중하기 좋은 시간은 <span className="text-indigo-600">45초~55초</span>입니다.
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 tabular-nums">
              글자 수(공백 제외): <span className="font-semibold text-slate-900">{charCount}자</span>
            </div>
          </div>

          {/* Spoken Text Script */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 relative">
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              {title || '면접 실전 구어체 대본'}
            </div>
            <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap font-sans">
              {speechText}
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-5xl font-mono font-bold tracking-tight text-slate-900 tabular-nums mb-2">
              00:{seconds < 10 ? `0${seconds}` : seconds}
            </div>

            <div className={`text-sm mb-4 ${statusColor} flex items-center gap-1.5`}>
              {seconds >= targetMinSeconds && seconds <= targetMaxSeconds ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : seconds > targetMaxSeconds ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : null}
              <span>{statusText}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-6">
              <div
                className={`h-full transition-all duration-300 ${
                  seconds < targetMinSeconds
                    ? 'bg-blue-500'
                    : seconds <= targetMaxSeconds
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Integrated Motion Audio Spectrum */}
            <div className="w-full mb-6">
              <AudioWaveformMotion
                initialCadence={48}
                showControls={false}
                label="실시간 발화 호흡 스펙트럼 (SPEECH RHYTHM WAVE)"
                className="bg-slate-950 text-white rounded-lg border-slate-800"
              />
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-black hover:bg-slate-800 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> 일시정지
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> 타이머 시작
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> 리셋
              </button>

              <button
                onClick={playTTS}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isSpeaking
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-600" /> 음성 중단
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-indigo-600" /> 모범 낭독 듣기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>팁: 첫 문장은 차분한 어조로 시작하고, 성과 수치나 해결 방안에서 명확하게 힘을 주어 발음하세요.</span>
          <button
            onClick={() => {
              stopTTS();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
