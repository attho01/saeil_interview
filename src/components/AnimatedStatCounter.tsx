import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface AnimatedStatCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  label: string;
  sublabel?: string;
  className?: string;
}

export const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  value,
  suffix = '',
  decimals = 0,
  duration = 1.6,
  label,
  sublabel,
  className = '',
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      // easeOutExpo
      const progress = frame === totalFrames ? 1 : 1 - Math.pow(2, -10 * (frame / totalFrames));
      const current = start + (end - start) * progress;
      setDisplayValue(current);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setDisplayValue(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [isInView, value, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`text-center p-6 border border-white/10 bg-[#0d1017]/80 backdrop-blur-sm relative group hover:border-white/30 transition-all ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-mono mb-2">
        {displayValue.toFixed(decimals)}
        <span className="text-white/80 font-sans text-2xl sm:text-3xl ml-0.5">{suffix}</span>
      </div>

      <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-300 mb-1">
        {label}
      </div>

      {sublabel && (
        <div className="text-[11px] text-slate-400 font-normal leading-relaxed">
          {sublabel}
        </div>
      )}
    </motion.div>
  );
};
