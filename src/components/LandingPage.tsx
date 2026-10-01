import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  UploadCloud,
  Clock,
  Sparkles,
  Building2,
  HelpCircle,
  Award,
  Target,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  FileCheck,
  Play,
  RotateCcw,
  Quote,
  Activity,
  Zap,
} from 'lucide-react';

import { AudioWaveformMotion } from './AudioWaveformMotion.tsx';
import { AnimatedStatCounter } from './AnimatedStatCounter.tsx';

interface LandingPageProps {
  onStartCoaching: () => void;
  onLoadSampleAndStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCoaching,
  onLoadSampleAndStart,
}) => {
  // Reading scroll progress for top bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Testimonial slider state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Script preview tabs
  const [activeVersionTab, setActiveVersionTab] = useState<'v1' | 'v2' | 'v3'>('v1');

  const testimonials = [
    {
      quote:
        '“5년의 육아 공백 후 다시 면접장에 설 때 손이 떨릴 정도로 막막했습니다. 하지만 새일센터 AI 코치가 도출해 준 48초 두괄식 대본과 송곳 꼬리질문 5개를 달달 연습한 덕분에, 첫 질문부터 면접관의 고개를 끄덕이게 만들었고 당당히 최종 합격 통보를 받았습니다.”',
      author: '김○영',
      role: '36세 · 중견기업 경영관리팀 회계담당 최종 합격',
      bgImg: '/images/korean_candidate_review1.jpg',
    },
    {
      quote:
        '“기존 챗봇들은 있지도 않은 허위 경력을 지어내서 면접 때 들통날까 봐 늘 불안했습니다. 하지만 이 코치는 제가 실제로 제출한 이력서와 스토리뱅크 안에서만 강점을 날카롭게 엮어주어, 면접관 앞에서 1초의 망설임도 없이 당당하게 답할 수 있었습니다.”',
      author: '박○진',
      role: '34세 · 공공기관 사무행정직 공채 최종 합격',
      bgImg: '/images/korean_candidate_review2.jpg',
    },
    {
      quote:
        '“면접관이 ‘아이가 아프면 어떻게 대처할 건가요?’라고 날카롭게 물었을 때, 미리 7단계에서 시뮬레이션했던 난이도 4 꼬리질문 대응책(가족 지원 체계와 사전 루틴)을 침착하게 답변하여 면접관의 완벽한 신뢰를 얻어냈습니다.”',
      author: '이○선',
      role: '38세 · IT 스타트업 총무·인사 매니저 최종 합격',
      bgImg: '/images/korean_candidate_review3.jpg',
    },
  ];

  const versionsData = {
    v1: {
      title: '두괄식 결론형 (48초 · 약 320자)',
      seconds: 48,
      charCount: 322,
      desc: '면접 초반 면접관의 집중도가 높고 명확한 결론을 선호하는 실무진 면접에 최적화',
      script:
        '"네, 5년간의 공백은 저에게 멈춤이 아닌, 더 단단하게 실무를 준비한 재도약의 시간이었습니다. 공백기 동안 실무 감각 저하를 방지하기 위해 여성새로일하기센터의 180시간 직업훈련 과정에 하루도 빠짐없이 출석하여 전산회계 1급을 우수한 성적으로 취득했습니다. 또한 최신 오피스 프로그램을 집중 실습하며 변화된 세무 전표 처리 프로세스를 완벽히 익혔습니다. 축적된 과거 3년의 실무 노하우에 최신 전산 스킬을 더했기에, 입사 첫날부터 오차율 0%의 든든한 마감을 증명해 보이겠습니다."',
    },
    v2: {
      title: '수치·성과 강조형 (50초 · 약 340자)',
      seconds: 50,
      charCount: 338,
      desc: '직무 즉시 투입성과 꼼꼼한 마감 오차율 0%를 요구하는 경영지원·회계 직무에 최적화',
      script:
        '"네, 5년의 공백 기간을 숫자로 증명하기 위해 하루 2시간씩 총 180시간의 실무 훈련에 100% 출석하며 전산회계 1급을 88점으로 단번에 취득했습니다. 이전 직장에서도 20여 개 외주 정산 양식을 표준화하여 월말 결산 시간을 3일에서 1.5일로 50% 단축시키고, 회계감사 오기재 0건을 달성한 바 있습니다. 최근 훈련을 통해 더존 SmartA와 엑셀 피벗테이블 숙련도를 최고 수준으로 끌어올렸기에, 귀사에서도 입사 한 달 내에 마감 오차율 0%를 달성하겠습니다."',
    },
    v3: {
      title: '스토리텔링 극복형 (53초 · 약 355자)',
      seconds: 53,
      charCount: 356,
      desc: '공백기에 대한 날카로운 질문이나 압박 면접에서 진솔한 근성과 인간미를 어필할 때',
      script:
        '"네, 솔직히 처음 재취업을 결심했을 때는 5년간의 공백으로 인해 최신 업무 툴에 뒤처지면 어쩌나 하는 두려움도 있었습니다. 하지만 가만히 걱정만 하기보다 행동으로 극복하자고 마음먹었습니다. 매일 아이를 등교시킨 후 새일센터 실습실로 향했고, 야간에는 하루 2시간씩 엑셀 함수와 최신 실무를 독학했습니다. 그 결과 반에서 최고 점수로 자격증을 손에 쥐며 큰 자신감을 얻었습니다. 고비를 배움의 기회로 바꾼 이 끈기로 귀사의 어떤 업무도 묵묵히 완수해 내겠습니다."',
    },
  };

  const stepsOverview = [
    {
      num: '01',
      title: '구직자 개인 데이터 분석',
      sub: 'CANDIDATE FACT CHECK',
      desc: '이력서와 스토리뱅크 파일(PDF/DOCX/IMG)을 올려 3대 핵심 강점과 공격받을 약점 포인트를 도출합니다.',
    },
    {
      num: '02',
      title: '지원 기업 채용정보 판독',
      sub: 'JOB POSTING DECODING',
      desc: '공고 문서를 판독하여 담당 업무, 필수요건을 표로 정리하고 블라인드 공고 시 타깃 기업명을 확정합니다.',
    },
    {
      num: '03',
      title: '최근 3년 기출 질문 조사',
      sub: '3-YEAR QUESTION DATABASE',
      desc: '타깃 기업과 동종 업계의 최근 3년 실전 면접 질문 15개를 출처([확인됨]/[추정])와 함께 수집합니다.',
    },
    {
      num: '04',
      title: '8대 유형별 경향 분석',
      sub: 'CATEGORY & RISK ANALYSIS',
      desc: '경력공백, 조직적응 등 경력단절여성의 당락을 가르는 결정적 핵심 질문 2~3가지를 선별합니다.',
    },
    {
      num: '05',
      title: '선택 질문 심층 해부',
      sub: 'INTENT & STRATEGY',
      desc: '면접관이 묻는 표면적 질문 뒤 진짜 의도를 파악하고, 구직자의 실제 경험을 최적의 논리로 매핑합니다.',
    },
    {
      num: '06',
      title: '40~60초 5가지 구어체 답변',
      sub: '5 SPOKEN SPEECH SCRIPTS',
      desc: '두괄식, 성과강조, 스토리텔링, 직무연결, 성장태도 등 실제 발화 호흡에 맞춘 5개 버전을 제공합니다.',
    },
    {
      num: '07',
      title: '꼬리질문 5선 & 최종 리터칭',
      sub: '5-TIER TAIL QUESTIONS',
      desc: '난이도 1단계부터 5단계까지의 송곳 같은 후속 검증 질문과 완성 대본으로 실전 면접을 마스터합니다.',
    },
  ];

  return (
    <div className="bg-[#0b0d11] text-slate-100 min-h-screen font-sans selection:bg-white selection:text-black relative">
      {/* 1. Global Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-white to-sky-400 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* ============================================================
          1. HERO SECTION (Vance Barber Editorial Aesthetic with Motion Graphics)
          Atmospheric High-Contrast Korean 30s Woman Portrait & Tracked Headline
          ============================================================ */}
      <section className="relative w-full border-b border-white/10 overflow-hidden">
        {/* Background Image with Cinematic Ken-Burns Slow Drift */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            src="/images/hero_korean_consultant.jpg"
            alt="Hero Background - Korean 30s Career Consultant"
            className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-[0.30]"
            referrerPolicy="no-referrer"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d11] via-[#0b0d11]/75 to-[#0b0d11]/45" />

          {/* Subtle Cyber Grid Lines for Workstation Vibe */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Hero Content with Staggered Entrance Animation */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-24 sm:pt-32 sm:pb-32 flex flex-col items-center text-center">
          {/* Subtle Tracked Kicker with Live Radar Glow */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-slate-300 border border-white/20 px-3.5 py-1.5 bg-black/40 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>SAÈIL 10-YEAR VETERAN CAREER CONSULTANT ENGINE</span>
          </motion.div>

          {/* Main Huge Editorial Headline in Pretendard */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight uppercase text-white leading-[1.1] mb-6"
          >
            새일센터 AI면접 코치
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="text-sm sm:text-base tracking-[0.3em] uppercase text-slate-300 font-semibold mb-8 flex items-center gap-3"
          >
            <span className="h-[1px] w-6 sm:w-12 bg-white/30" />
            CAREER RE:START INTERVIEW COACH
            <span className="h-[1px] w-6 sm:w-12 bg-white/30" />
          </motion.div>

          {/* Editorial Philosophy Statement */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed font-normal mb-10"
          >
            “5년의 경력 공백, 변명이 아닌 당당한 전문성으로 증명하십시오.” <br />
            구직신청서와 채용공고 <strong>파일(PDF·DOCX·IMG)만 업로드</strong>하면, 100% 팩트에 기반한 40~60초 실전 구어체 합격 대본과 5단계 꼬리질문 방어책을 완성합니다.
          </motion.p>

          {/* High-Contrast Action Buttons with Magnetic Hover Animation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartCoaching}
              className="relative group overflow-hidden w-full sm:w-auto px-9 py-4 bg-white text-black hover:bg-slate-200 transition-all font-bold text-xs uppercase tracking-[0.15em] shadow-xl cursor-pointer"
            >
              {/* Button shine swipe animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                실전 코칭 시작하기 (무료)
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoadSampleAndStart}
              className="w-full sm:w-auto px-8 py-4 bg-black/40 border border-white/40 text-white hover:border-white hover:bg-white/10 transition-all font-semibold text-xs uppercase tracking-[0.15em] cursor-pointer"
            >
              1분 샘플 케이스 체험하기
            </motion.button>
          </motion.div>

          {/* Interactive Live Audio Waveform Motion Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="w-full max-w-3xl"
          >
            <AudioWaveformMotion
              initialCadence={48}
              label="실전 48초 황금 발화 호흡 시뮬레이터 (CADENCE SPECTRUM)"
              className="border-white/20"
            />
          </motion.div>

          {/* Trust Footnote */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] uppercase tracking-[0.15em] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ZERO-HALLUCINATION (허위 사실 0%)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              40~60S SPOKEN SPEECH (발화 호흡 엄수)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              PRIVACY FIRST ('구직자A' 가명화)
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS SECTION (Animated Counter Motion Graphics)
          ============================================================ */}
      <section className="bg-[#0e1218] border-b border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedStatCounter
            value={98.4}
            decimals={1}
            suffix="%"
            label="서류 팩트 적중률"
            sublabel="허위 경력 생성 0건 및 100% 제출 서류 기반 판독"
          />
          <AnimatedStatCounter
            value={48}
            suffix="초"
            label="황금 발화 호흡"
            sublabel="면접관이 가장 편안하게 몰입하는 280~380자 구어체"
          />
          <AnimatedStatCounter
            value={5}
            suffix="단계"
            label="송곳 꼬리질문 방어"
            sublabel="의심 질문부터 압박 돌발 질문까지 완벽한 방어 논리"
          />
          <AnimatedStatCounter
            value={0}
            suffix="%"
            label="할루시네이션(과장)"
            sublabel="이력서에 없는 가짜 경력을 절대 지어내지 않는 원칙"
          />
        </div>
      </section>

      {/* ============================================================
          2. SECTION "WHAT WE COACH." (3-Column Editorial Grid matching Vance Barber)
          Left B&W Photo (Korean 30s woman) | Center Framed Typography Box | Right B&W Photo (Korean 30s woman)
          ============================================================ */}
      <section className="bg-white text-black py-20 px-6 sm:px-12 border-b border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left Photo Card: Korean 30s woman in career preparation */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative group overflow-hidden border border-slate-300 min-h-[360px] lg:min-h-[420px]"
            >
              <img
                src="/images/korean_woman_prep.jpg"
                alt="Korean 30s Woman Interview Preparation"
                className="w-full h-full object-cover object-top filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm text-white p-3 text-[11px] tracking-widest uppercase font-semibold flex items-center justify-between">
                <span>01 · 실전 서류 데이터 정밀 판독</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </motion.div>

            {/* Center Framed Box: Exact Vance Barber "WHAT I TEACH." Layout in Pretendard */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="border-4 border-black p-8 sm:p-10 flex flex-col justify-between bg-white text-black relative shadow-lg"
            >
              <div className="space-y-6">
                <div className="text-[11px] tracking-[0.2em] uppercase font-bold text-slate-500 border-b border-black/20 pb-2 flex items-center justify-between">
                  <span>CONSULTING CURRICULUM</span>
                  <Activity className="w-3.5 h-3.5 text-black" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight">
                  WHAT WE COACH.
                </h2>
                <div className="space-y-4 pt-2 text-xs sm:text-sm font-semibold tracking-wide uppercase text-slate-800">
                  <div className="border-b border-slate-200 pb-2.5">
                    <span className="text-black font-extrabold mr-2">01.</span>
                    ZERO-HALLUCINATION FACT CHECK
                    <p className="text-[11px] tracking-normal text-slate-600 font-normal lowercase first-letter:uppercase mt-1">
                      없는 경력을 꾸며내지 않고, 실제 이력과 훈련에서 검증된 핵심 강점만 추출합니다.
                    </p>
                  </div>

                  <div className="border-b border-slate-200 pb-2.5">
                    <span className="text-black font-extrabold mr-2">02.</span>
                    40~60S SPOKEN SPEECH FORMULA
                    <p className="text-[11px] tracking-normal text-slate-600 font-normal lowercase first-letter:uppercase mt-1">
                      글이 아닌 실제 소리 내어 말할 때 280~380자의 최적 호흡으로 완성되는 5대 버전 대본.
                    </p>
                  </div>

                  <div className="border-b border-slate-200 pb-2.5">
                    <span className="text-black font-extrabold mr-2">03.</span>
                    5-TIER TAIL QUESTIONS DEFENSE
                    <p className="text-[11px] tracking-normal text-slate-600 font-normal lowercase first-letter:uppercase mt-1">
                      면접관의 의심을 꿰뚫는 난이도 1~5단계 후속 압박 질문과 방어 논리 완비.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStartCoaching}
                  className="w-full py-3.5 bg-black text-white hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-[0.15em] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>지금 7단계 코칭 시작하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Right Photo Card: Confident Korean 30s candidate */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="relative group overflow-hidden border border-slate-300 min-h-[360px] lg:min-h-[420px]"
            >
              <img
                src="/images/korean_woman_confident.jpg"
                alt="Confident Korean 30s Candidate"
                className="w-full h-full object-cover object-top filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm text-white p-3 text-[11px] tracking-widest uppercase font-semibold flex items-center justify-between">
                <span>02 · 40~60초 당당한 발화 완성</span>
                <Award className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. SECTION "NICE THINGS THEY SAID." (Animated Testimonials with Avatars)
          ============================================================ */}
      <section className="relative bg-[#07090c] text-white py-24 px-6 sm:px-12 border-b border-white/10 overflow-hidden">
        {/* Subtle background portrait with animated fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 pointer-events-none"
          >
            <img
              src={testimonials[currentTestimonial].bgImg}
              alt="Candidate Testimonial"
              className="w-full h-full object-cover filter grayscale contrast-150"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
          <div className="text-[11px] uppercase tracking-[0.3em] font-semibold text-slate-400 flex items-center justify-center gap-2">
            <Quote className="w-3.5 h-3.5 text-white/40" />
            NICE THINGS THEY SAID.
          </div>

          {/* Testimonial Quote in pure Pretendard with smooth AnimatePresence */}
          <div className="min-h-[170px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="text-xl sm:text-2xl md:text-3xl italic text-white leading-relaxed font-normal"
              >
                {testimonials[currentTestimonial].quote}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Author & Avatar matching uploaded reference */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center gap-3"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/40 shadow-xl group">
                <img
                  src={testimonials[currentTestimonial].bgImg}
                  alt={testimonials[currentTestimonial].author}
                  className="w-full h-full object-cover object-top filter grayscale contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-pulse pointer-events-none" />
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm uppercase tracking-[0.25em] font-bold text-white">
                  — {testimonials[currentTestimonial].author}
                </div>
                <div className="text-xs text-slate-400 font-light">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls: Prev/Next & Dots */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <button
              onClick={() =>
                setCurrentTestimonial((prev) =>
                  prev === 0 ? testimonials.length - 1 : prev - 1
                )
              }
              className="p-2.5 rounded-full border border-white/20 text-white hover:border-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentTestimonial === idx ? 'bg-white w-7' : 'bg-white/30 hover:bg-white/60 w-2'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentTestimonial((prev) =>
                  prev === testimonials.length - 1 ? 0 : prev + 1
                )
              }
              className="p-2.5 rounded-full border border-white/20 text-white hover:border-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. INTERACTIVE SCRIPT SHOWCASE (Live 40~60s Spoken Script Preview)
          Editorial Card with Tabs & Motion
          ============================================================ */}
      <section className="bg-[#11141a] py-20 px-6 sm:px-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-slate-400">
                LIVE SCRIPT BENCHMARK
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                실전 질문: "5년의 경력 공백기 동안 무엇을 하셨습니까?"
              </h3>
            </div>

            {/* Version Switcher Buttons with Animated Tab Indicator */}
            <div className="flex items-center gap-1 border border-white/20 p-1 bg-black/40 relative">
              {(['v1', 'v2', 'v3'] as const).map((tabKey) => {
                const isActive = activeVersionTab === tabKey;
                const tabTitles = {
                  v1: '두괄식 결론형',
                  v2: '성과 강조형',
                  v3: '스토리텔링형',
                };
                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveVersionTab(tabKey)}
                    className={`relative px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer z-10 ${
                      isActive ? 'text-black' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSpeechTab"
                        className="absolute inset-0 bg-white"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tabTitles[tabKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script Content Card with AnimatePresence */}
          <div className="bg-[#0b0d11] border border-white/15 p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeVersionTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-b border-white/10 pb-3">
                  <span className="font-semibold text-white tracking-wider text-sm">
                    {versionsData[activeVersionTab].title}
                  </span>
                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      {versionsData[activeVersionTab].seconds}초 낭독 호흡
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-300">
                      {versionsData[activeVersionTab].charCount}자
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-line py-2">
                  {versionsData[activeVersionTab].script}
                </p>

                <div className="pt-4 text-xs text-slate-400 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    💡 <strong className="text-white">추천 상황:</strong>{' '}
                    {versionsData[activeVersionTab].desc}
                  </div>
                  <button
                    onClick={onStartCoaching}
                    className="text-white hover:underline uppercase tracking-wider font-semibold flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <span>내 데이터로 대본 만들기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. THE 7-STEP ARCHITECTURE (Editorial Chapter Breakdown)
          Clean Monochrome Numerals & Animated Roadmaps
          ============================================================ */}
      <section className="bg-[#0b0d11] py-24 px-6 sm:px-12 border-b border-white/10 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] font-semibold text-slate-400">
              METHODOLOGICAL ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              체계적인 7단계 면접 마스터 로드맵
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-light">
              개인 서류 판독부터 송곳 꼬리질문 방어까지, 한 치의 빈틈없이 설계된 합격 파이프라인.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stepsOverview.map((item, idx) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="bg-[#11141a] border border-white/10 p-6 flex flex-col justify-between space-y-4 hover:border-white/40 transition-all relative group"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-bold text-white tracking-widest">
                      {item.num}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400">
                      {item.sub}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Final Target Card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ y: -5 }}
              className="bg-white text-black border border-white p-6 flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <span className="text-2xl font-extrabold text-black tracking-tight">
                  FINAL
                </span>
                <h3 className="text-base font-bold text-black">
                  완성형 1:1 맞춤 면접 상담 리포트
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  면접 당일 손에 쥐고 들어갈 수 있는 원페이지 종합 리포트와 40~60초 실전 발화 타이머를 제공합니다.
                </p>
              </div>
              <button
                onClick={onStartCoaching}
                className="w-full py-3 bg-black text-white hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                7단계 코칭 바로 입장하기 →
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. ABOUT SECTION (Vance Barber "ABOUT" Split Layout in Pretendard)
          Left B&W Photo (Korean 30s woman consultant) | Right Editorial Narrative Prose
          ============================================================ */}
      <section className="bg-white text-black py-20 px-6 sm:px-12 border-b border-slate-200">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Artistic Frame with Korean 30s woman career consultant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative border-2 border-black p-3 bg-white shadow-xl"
          >
            <img
              src="/images/hero_korean_consultant.jpg"
              alt="Korean 30s Career Consultant Mentor"
              className="w-full h-auto filter grayscale contrast-125 object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mt-2 text-right">
              SAÈIL MENTORSHIP · SINCE 2014
            </div>
          </motion.div>

          {/* Right Narrative Copy in Pretendard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-black/20 pb-2">
              ABOUT THE SYSTEM
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight">
              “공백을 변명하지 않고, <br />
              책임감과 성숙함으로 증명합니다.”
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              <p>
                새일센터 현장에서 10년 넘게 수천 명의 경력단절여성을 다시 일터로 이끌며 체득한 단 하나의 진실이 있습니다. 면접관은 공백 그 자체를 두려워하는 것이 아니라, <strong>‘그 시간 동안 무엇을 준비했고, 우리 조직에 얼마나 든든히 기여할 수 있는가’</strong>를 묻고 있는 것입니다.
              </p>
              <p>
                우리는 없는 사실을 지어내지 않습니다. 구직자가 겪어온 삶의 성숙함과 직업훈련에서 흘린 땀방울을 가장 설득력 있는 40~60초의 언어로 빚어냅니다.
              </p>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartCoaching}
                className="px-8 py-3.5 bg-black text-white hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-[0.15em] cursor-pointer"
              >
                내 면접 대본 만들기
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          7. BOTTOM CTA & FOOTER
          Minimalist Luxury Closing Block in Pretendard
          ============================================================ */}
      <section className="bg-[#0b0d11] py-20 px-6 text-center border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="text-[11px] uppercase tracking-[0.25em] font-semibold text-slate-400">
            START YOUR COACHING SESSION
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            지금 구직신청서와 공고 파일만 준비하세요.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
            10년 차 베테랑 컨설턴트 엔진이 7단계에 걸쳐 면접관의 불안을 완벽한 신뢰로 바꾸어 놓겠습니다.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartCoaching}
              className="w-full sm:w-auto px-10 py-4 bg-white text-black hover:bg-slate-200 transition-all font-bold text-xs uppercase tracking-[0.2em] shadow-xl cursor-pointer"
            >
              무료로 실전 코칭 시작하기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoadSampleAndStart}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white hover:border-white hover:bg-white/5 transition-all font-semibold text-xs uppercase tracking-[0.2em] cursor-pointer"
            >
              샘플 케이스로 1분 둘러보기
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Floating Quick Action Button with Smooth Floating Breathing Motion */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -6, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
          opacity: { duration: 0.5 },
        }}
        className="fixed bottom-6 right-6 z-40 hidden sm:block"
      >
        <button
          onClick={onStartCoaching}
          className="flex items-center gap-2.5 px-4 py-3 bg-white text-black hover:bg-slate-200 font-bold text-xs uppercase tracking-wider shadow-2xl border border-black/10 cursor-pointer group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span>실전 코칭 시작</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="bg-[#07090c] py-10 px-6 border-t border-white/5 text-center space-y-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
          <span>새일센터 AI면접 코치</span>
          <span>·</span>
          <span>10-YEAR VETERAN CAREER CONSULTANT PROTOCOL</span>
          <span>·</span>
          <span>PRIVACY SECURED ('구직자A' 가명화 원칙)</span>
        </div>
        <p className="text-slate-600 tracking-normal font-light">
          여성새로일하기센터 10년 경력 전문 컨설팅 프로토콜을 계승한 경력단절여성 특화 AI 솔루션입니다.
        </p>
      </footer>
    </div>
  );
};
