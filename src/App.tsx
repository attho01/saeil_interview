/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  Building2,
  HelpCircle,
  Layers,
  Target,
  MessageSquareText,
  GitFork,
  Clock,
  FileText,
  MessageCircle,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { Step1PersonalData } from './components/Step1PersonalData.tsx';
import { Step2JobPosting } from './components/Step2JobPosting.tsx';
import { Step3InterviewQuestions } from './components/Step3InterviewQuestions.tsx';
import { Step4Categorize } from './components/Step4Categorize.tsx';
import { Step5DeepDive } from './components/Step5DeepDive.tsx';
import { Step6AnswerVersions } from './components/Step6AnswerVersions.tsx';
import { Step7TailQuestions } from './components/Step7TailQuestions.tsx';
import { LandingPage } from './components/LandingPage.tsx';

import { SpeechTimerModal } from './components/SpeechTimerModal.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { ConsultantChatDrawer } from './components/ConsultantChatDrawer.tsx';

import { PRESET_CASES, PresetCase } from './data/presets.ts';
import { ConsultingStep } from './types.ts';
import { ParsedFileInfo } from './utils/fileParser.ts';

export default function App() {
  // Current Step
  const [currentStep, setCurrentStep] = useState<ConsultingStep>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<ConsultingStep>(1);

  // Helper to create virtual file from text preset
  const createVirtualPresetFiles = (preset: PresetCase): ParsedFileInfo[] => [
    {
      name: `구직신청서(이력)_${preset.id}.txt`,
      size: new Blob([preset.candidate.resumeText]).size,
      type: 'text/plain',
      extension: 'txt',
      extractedText: preset.candidate.resumeText,
    },
    {
      name: `스토리뱅크(STAR경험)_${preset.id}.txt`,
      size: new Blob([preset.candidate.storyBankText]).size,
      type: 'text/plain',
      extension: 'txt',
      extractedText: preset.candidate.storyBankText,
    },
  ];

  const createVirtualJobFile = (preset: PresetCase): ParsedFileInfo => ({
    name: `채용공고_${preset.job.companyName.replace(/[^a-zA-Z0-9가-힣]/g, '')}_${preset.job.jobTitle.replace(/[^a-zA-Z0-9가-힣]/g, '')}.txt`,
    size: new Blob([preset.job.rawInput]).size,
    type: 'text/plain',
    extension: 'txt',
    extractedText: preset.job.rawInput,
  });

  // Step 1 State (Files only - starts completely empty)
  const [step1Files, setStep1Files] = useState<ParsedFileInfo[]>([]);
  const [step1Summary, setStep1Summary] = useState('');

  // Step 2 State (File only - starts completely empty)
  const [jobFile, setJobFile] = useState<ParsedFileInfo | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [step2ParsedJob, setStep2ParsedJob] = useState('');

  // Step 3 State
  const [step3QuestionsMarkdown, setStep3QuestionsMarkdown] = useState('');

  // Step 4 State
  const [step4CategorizedAnalysis, setStep4CategorizedAnalysis] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(
    '5년간의 경력 공백 기간 동안 무엇을 하셨고, 직무 감각 유지를 위해 어떤 노력을 기울이셨습니까?'
  );

  // Step 5 State
  const [step5DeepDive, setStep5DeepDive] = useState('');

  // Step 6 State
  const [step6AnswersText, setStep6AnswersText] = useState('');
  const [selectedVersionTitle, setSelectedVersionTitle] = useState('버전 1: 두괄식 (결론 우선형)');
  const [selectedVersionText, setSelectedVersionText] = useState('');

  // Step 7 State
  const [step7TailQuestions, setStep7TailQuestions] = useState('');

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // View Mode: 'landing' or 'workspace'
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');

  // Progress Helper
  const goToStep = (step: ConsultingStep) => {
    setCurrentStep(step);
    if (step > maxReachedStep) {
      setMaxReachedStep(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Preset Case
  const handleLoadPreset = (preset: PresetCase) => {
    setStep1Files(createVirtualPresetFiles(preset));
    setJobFile(createVirtualJobFile(preset));
    setCompanyName(preset.job.companyName);
    setJobTitle(preset.job.jobTitle);
    setIndustry(preset.job.industry);

    // Reset subsequent steps
    setStep1Summary('');
    setStep2ParsedJob('');
    setStep3QuestionsMarkdown('');
    setStep4CategorizedAnalysis('');
    setStep5DeepDive('');
    setStep6AnswersText('');
    setStep7TailQuestions('');
    setCurrentStep(1);
    setMaxReachedStep(1);
  };

  const handleLoadSampleJob = () => {
    setJobFile(createVirtualJobFile(PRESET_CASES[0]));
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm('새로운 구직자 상담을 시작하시겠습니까? 업로드된 파일이 초기화됩니다.')) {
      setStep1Files([]);
      setJobFile(null);
      setCompanyName('');
      setJobTitle('');
      setIndustry('');
      setStep1Summary('');
      setStep2ParsedJob('');
      setStep3QuestionsMarkdown('');
      setStep4CategorizedAnalysis('');
      setStep5DeepDive('');
      setStep6AnswersText('');
      setStep7TailQuestions('');
      setCurrentStep(1);
      setMaxReachedStep(1);
    }
  };

  // Tail question loop back to step 5
  const handleSelectTailQuestionForLoop = (newQuestion: string) => {
    setSelectedQuestion(newQuestion);
    setStep5DeepDive('');
    setStep6AnswersText('');
    setStep7TailQuestions('');
    goToStep(5);
  };

  const stepList = [
    { num: 1 as ConsultingStep, title: '1단계 개인데이터', icon: UserCheck, desc: '파일 접수' },
    { num: 2 as ConsultingStep, title: '2단계 기업정보', icon: Building2, desc: '공고 파일' },
    { num: 3 as ConsultingStep, title: '3단계 기출조사', icon: HelpCircle, desc: '최근 3년 기출' },
    { num: 4 as ConsultingStep, title: '4단계 유형분석', icon: Layers, desc: '8대 유형 & 선택' },
    { num: 5 as ConsultingStep, title: '5단계 심층분석', icon: Target, desc: '의도 · 전략 · STAR' },
    { num: 6 as ConsultingStep, title: '6단계 답변5버전', icon: MessageSquareText, desc: '40~60초 구어체' },
    { num: 7 as ConsultingStep, title: '7단계 꼬리질문', icon: GitFork, desc: '최종본 & 방어' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Bar (Cinematic High-Contrast Editorial) */}
      <header className="sticky top-0 z-40 bg-[#08090d]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark & Navigation Switch */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => {
                setViewMode('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-sm sm:text-base font-extrabold tracking-tight uppercase text-white flex items-center gap-2.5 hover:text-slate-300 text-left cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block shrink-0" />
              <span>새일센터 AI면접 코치</span>
            </button>

            {/* Mode Segmented Switch */}
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/15 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              <button
                onClick={() => {
                  setViewMode('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  viewMode === 'landing' ? 'bg-white text-black font-bold shadow-sm' : 'hover:text-white'
                }`}
              >
                서비스 소개
              </button>
              <button
                onClick={() => {
                  setViewMode('workspace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  viewMode === 'workspace' ? 'bg-white text-black font-bold shadow-sm' : 'hover:text-white'
                }`}
              >
                7단계 실전 코칭
              </button>
            </div>
          </div>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsTimerOpen(true)}
              className="px-3.5 py-1.5 border border-white/20 text-slate-300 hover:text-white hover:border-white bg-white/5 text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">발화 타이머</span>
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="px-3.5 py-1.5 border border-white/20 text-slate-300 hover:text-white hover:border-white bg-white/5 text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>1:1 컨설턴트 자문</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-1.5 bg-white hover:bg-slate-200 text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-black" />
              <span>상담 리포트</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {viewMode === 'landing' ? (
          <LandingPage
            onStartCoaching={() => {
              setViewMode('workspace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLoadSampleAndStart={() => {
              handleLoadPreset(PRESET_CASES[0]);
              setViewMode('workspace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {/* Hero Context Banner for Saeil Counselor (Vance Barber Monochromatic Luxury) */}
            <div className="bg-[#12151c] border border-white/15 text-white p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-semibold tracking-[0.25em] uppercase">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  SAÈIL 10-YEAR VETERAN CAREER CONSULTANT WORKSTATION
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
                  새일센터 AI면접 코치 (7단계 맞춤형 면접 솔루션)
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-light">
                  1단계 이력과 2단계 채용공고는 <strong>파일(PDF, DOCX, IMG)만으로 간편하게 접수</strong>하여 실제 사실에 기반한 40~60초 구어체 답변을 완성합니다.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-white/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 상담 초기화
                </button>
              </div>
            </div>

            {/* 7-Step Horizontal Stepper Bar */}
            <div className="bg-[#12151c] border border-white/15 p-3 sm:p-4 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between min-w-[760px] gap-2">
                {stepList.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.num;
                  const isPast = maxReachedStep > s.num;
                  return (
                    <React.Fragment key={s.num}>
                      <button
                        onClick={() => goToStep(s.num)}
                        className={`relative flex items-center gap-2.5 p-2 text-left transition-all cursor-pointer ${
                          isActive
                            ? 'text-black font-bold'
                            : isPast
                            ? 'text-slate-200 hover:bg-white/10 font-medium'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="stepperActivePill"
                            className="absolute inset-0 bg-white shadow-sm"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <div
                          className={`relative z-10 w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isActive
                              ? 'bg-black text-white'
                              : isPast
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-slate-500 border border-white/10'
                          }`}
                        >
                          {isPast ? <Check className="w-3.5 h-3.5" /> : `0${s.num}`}
                        </div>
                        <div className="relative z-10">
                          <div className="text-xs uppercase tracking-wider whitespace-nowrap">{s.title}</div>
                          <div className={`text-[10px] truncate max-w-[90px] ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.desc}
                          </div>
                        </div>
                      </button>
                      {idx < stepList.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-white/20 shrink-0 select-none" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Step View Rendering with Smooth Transitions */}
            <div className="transition-all duration-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
          {currentStep === 1 && (
            <Step1PersonalData
              files={step1Files}
              setFiles={setStep1Files}
              analysisResult={step1Summary}
              setAnalysisResult={setStep1Summary}
              onProceedToStep2={() => goToStep(2)}
              onLoadPreset={handleLoadPreset}
            />
          )}

          {currentStep === 2 && (
            <Step2JobPosting
              companyName={companyName}
              setCompanyName={setCompanyName}
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              jobFile={jobFile}
              setJobFile={setJobFile}
              parsedResult={step2ParsedJob}
              setParsedResult={setStep2ParsedJob}
              onProceedToStep3={() => goToStep(3)}
              onLoadSampleJob={handleLoadSampleJob}
            />
          )}

          {currentStep === 3 && (
            <Step3InterviewQuestions
              companyName={companyName}
              setCompanyName={setCompanyName}
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              industry={industry}
              questionsMarkdown={step3QuestionsMarkdown}
              setQuestionsMarkdown={setStep3QuestionsMarkdown}
              onProceedToStep4={() => goToStep(4)}
            />
          )}

          {currentStep === 4 && (
            <Step4Categorize
              questionsMarkdown={step3QuestionsMarkdown || '15개 기출 질문 목록'}
              companyInfo={`${companyName} / ${jobTitle} (${industry})`}
              candidateInfo={step1Summary || '구직자A 이력 및 경험'}
              categorizedAnalysis={step4CategorizedAnalysis}
              setCategorizedAnalysis={setStep4CategorizedAnalysis}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              onProceedToStep5={() => goToStep(5)}
            />
          )}

          {currentStep === 5 && (
            <Step5DeepDive
              selectedQuestion={selectedQuestion}
              resumeText={step1Summary}
              storyBankText="스토리뱅크 첨부 파일 데이터"
              companyInfo={`${companyName} - ${jobTitle}`}
              deepDiveAnalysis={step5DeepDive}
              setDeepDiveAnalysis={setStep5DeepDive}
              onProceedToStep6={() => goToStep(6)}
            />
          )}

          {currentStep === 6 && (
            <Step6AnswerVersions
              selectedQuestion={selectedQuestion}
              deepDiveAnalysis={step5DeepDive}
              storyBankText="스토리뱅크 데이터"
              resumeText={step1Summary}
              answerVersionsText={step6AnswersText}
              setAnswerVersionsText={setStep6AnswersText}
              selectedVersionTitle={selectedVersionTitle}
              setSelectedVersionTitle={setSelectedVersionTitle}
              selectedVersionText={selectedVersionText}
              setSelectedVersionText={setSelectedVersionText}
              onProceedToStep7={() => goToStep(7)}
            />
          )}

          {currentStep === 7 && (
            <Step7TailQuestions
              selectedQuestion={selectedQuestion}
              selectedVersionTitle={selectedVersionTitle}
              selectedVersionText={selectedVersionText}
              candidateData={step1Summary}
              tailQuestionsResult={step7TailQuestions}
              setTailQuestionsResult={setStep7TailQuestions}
              onSelectTailQuestionForLoop={handleSelectTailQuestionForLoop}
              onOpenReport={() => setIsReportOpen(true)}
            />
          )}
                </motion.div>
              </AnimatePresence>
        </div>
        </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#07090c] py-8 px-4 sm:px-8 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-300">새일센터 AI면접 코치</span>
            <span>·</span>
            <span>10-YEAR VETERAN CAREER CONSULTANT WORKSTATION</span>
            <span>·</span>
            <span>PRIVACY SECURED ('구직자A' 가명화)</span>
          </div>
          <div className="text-slate-400 font-light tracking-normal">
            여성새로일하기센터 10년차 전문 컨설팅 프로토콜 (PDF · DOCX · IMG 파일 지원)
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SpeechTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        title={selectedQuestion ? `"${selectedQuestion}" 발화 연습` : '40~60초 실전 발화 타이머'}
        speechText={
          selectedVersionText ||
          step6AnswersText ||
          '발화할 모범 답변 대본을 선택하거나 입력해 주세요.'
        }
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        sessionData={{
          candidateSummary: step1Summary,
          jobSummary: step2ParsedJob,
          questionsMarkdown: step3QuestionsMarkdown,
          categorizedAnalysis: step4CategorizedAnalysis,
          selectedQuestion: selectedQuestion,
          deepDive: step5DeepDive,
          answerVersions: step6AnswersText,
          selectedVersionTitle: selectedVersionTitle,
          selectedVersionText: selectedVersionText,
          tailQuestions: step7TailQuestions,
        }}
      />

      <ConsultantChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={{
          currentStep,
          company: companyName,
          jobTitle: jobTitle,
          selectedQuestion: selectedQuestion,
        }}
      />
    </div>
  );
}
