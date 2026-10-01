import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

interface AudioWaveformMotionProps {
  initialCadence?: 40 | 48 | 60;
  onPlayStateChange?: (playing: boolean) => void;
  showControls?: boolean;
  className?: string;
  label?: string;
}

export const AudioWaveformMotion: React.FC<AudioWaveformMotionProps> = ({
  initialCadence = 48,
  onPlayStateChange,
  showControls = true,
  className = '',
  label = '40~60초 실전 발화 호흡 스펙트럼 (SPEECH CADENCE SPECTRUM)',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cadence, setCadence] = useState<40 | 48 | 60>(initialCadence);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [activeSegment, setActiveSegment] = useState<'intro' | 'star' | 'future'>('intro');

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Cadence timing segments (seconds)
  const segments = {
    40: { intro: 8, star: 26, future: 40 },
    48: { intro: 10, star: 35, future: 48 },
    60: { intro: 12, star: 45, future: 60 },
  };

  const currentDuration = cadence;

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - (progress / 100) * currentDuration * 1000;

      const loop = (now: number) => {
        if (!startTimeRef.current) return;
        const elapsed = (now - startTimeRef.current) / 1000;
        const p = Math.min((elapsed / currentDuration) * 100, 100);
        setProgress(p);

        const currentSec = (p / 100) * currentDuration;
        const seg = segments[cadence];
        if (currentSec <= seg.intro) {
          setActiveSegment('intro');
        } else if (currentSec <= seg.star) {
          setActiveSegment('star');
        } else {
          setActiveSegment('future');
        }

        if (p >= 100) {
          setIsPlaying(false);
          setProgress(0);
          startTimeRef.current = null;
          onPlayStateChange?.(false);
        } else {
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animationFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, cadence, currentDuration]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onPlayStateChange?.(next);
  };

  // 32 audio waveform bars
  const totalBars = 32;
  const currentElapsedSec = ((progress / 100) * currentDuration).toFixed(1);

  return (
    <div
      className={`border border-white/15 bg-black/60 backdrop-blur-md p-5 rounded-none shadow-2xl ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPlaying ? 'bg-emerald-400' : 'bg-slate-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isPlaying ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            />
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-300">
            {label}
          </span>
        </div>

        {/* Cadence preset switchers */}
        <div className="flex items-center gap-1.5 text-[10px] tracking-wider font-semibold">
          <span className="text-slate-500 uppercase mr-1">Rhythm:</span>
          {([40, 48, 60] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setCadence(sec);
                setProgress(0);
                setIsPlaying(false);
              }}
              className={`px-2.5 py-1 transition-all cursor-pointer ${
                cadence === sec
                  ? 'bg-white text-black font-extrabold shadow'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {sec}초 {sec === 48 ? '★황금호흡' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Main Waveform Animation Canvas */}
      <div className="relative h-20 sm:h-24 w-full flex items-end justify-between gap-[3px] sm:gap-[5px] px-2 py-3 bg-[#07090c]/90 border border-white/5 overflow-hidden">
        {/* Dynamic Scanline Progress Needle */}
        <motion.div
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-white via-emerald-400 to-transparent z-20 pointer-events-none shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          style={{ left: `${progress}%` }}
        />

        {/* 3 Segment Boundary Guides */}
        <div
          className="absolute top-1 bottom-1 w-[1px] border-r border-dashed border-white/20 pointer-events-none z-10"
          style={{ left: `${(segments[cadence].intro / cadence) * 100}%` }}
        >
          <span className="absolute -top-1 left-1 text-[8px] tracking-widest text-slate-400 uppercase font-mono">
            결론
          </span>
        </div>
        <div
          className="absolute top-1 bottom-1 w-[1px] border-r border-dashed border-white/20 pointer-events-none z-10"
          style={{ left: `${(segments[cadence].star / cadence) * 100}%` }}
        >
          <span className="absolute -top-1 left-1 text-[8px] tracking-widest text-slate-400 uppercase font-mono">
            경험
          </span>
        </div>

        {/* 32 Equalizer Bars */}
        {Array.from({ length: totalBars }).map((_, idx) => {
          const barProgress = (idx / totalBars) * 100;
          const isPassed = barProgress <= progress;

          // Natural harmonic height variation simulating Korean speech intonation
          const baseHeight = 18 + Math.sin(idx * 0.45) * 25 + Math.cos(idx * 0.8) * 20;
          const normalizedBase = Math.max(15, Math.min(95, baseHeight));

          // When playing, add dynamic oscillating movement
          const randomPulse = isPlaying ? Math.sin((idx + progress * 0.5) * 1.5) * 18 : 0;
          const finalHeight = Math.max(12, Math.min(100, normalizedBase + randomPulse));

          // Pitch emphasis nodes
          const isPitchAccent = idx === 4 || idx === 14 || idx === 22 || idx === 28;

          return (
            <div key={idx} className="relative flex-1 flex flex-col justify-end items-center h-full">
              {/* Accent dot indicator */}
              {isPitchAccent && (
                <div
                  className={`w-1 h-1 rounded-full mb-1 transition-all ${
                    isPassed ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'
                  }`}
                  title="발화 강세(Accent) 포인트"
                />
              )}

              {/* Bar */}
              <motion.div
                className={`w-full rounded-none transition-all duration-150 ${
                  isPassed
                    ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-white shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                    : 'bg-white/15'
                }`}
                style={{ height: `${finalHeight}%` }}
                animate={
                  isPlaying
                    ? {
                        scaleY: [0.85, 1.15, 0.95],
                      }
                    : { scaleY: 1 }
                }
                transition={{
                  duration: 0.4 + (idx % 4) * 0.1,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Cadence Metrics & Narrative Indicators */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          {showControls && (
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-3 py-1.5 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
                isPlaying
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-white text-black hover:bg-slate-200'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              {isPlaying ? '호흡 정지' : '발화 호흡 시뮬레이션'}
            </button>
          )}

          <div className="font-mono text-white text-xs font-semibold">
            {currentElapsedSec}s{' '}
            <span className="text-slate-500 font-normal">/ {cadence}.0s</span>
          </div>
        </div>

        {/* Current Active Phase Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-slate-500 tracking-wider">현재 발화 구간:</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
              activeSegment === 'intro'
                ? 'border-emerald-400/80 bg-emerald-950/40 text-emerald-300'
                : activeSegment === 'star'
                ? 'border-sky-400/80 bg-sky-950/40 text-sky-300'
                : 'border-purple-400/80 bg-purple-950/40 text-purple-300'
            }`}
          >
            {activeSegment === 'intro' && '01 두괄식 핵심 결론 (0~10초)'}
            {activeSegment === 'star' && '02 실전 STAR 근거 경험 (10~35초)'}
            {activeSegment === 'future' && '03 입사 후 오차율 0% 포부 (35~48초)'}
          </span>
        </div>
      </div>
    </div>
  );
};
