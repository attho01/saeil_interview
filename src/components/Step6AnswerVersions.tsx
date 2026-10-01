import React, { useState } from 'react';
import { MessageSquareText, Clock, Volume2, Copy, Check, ArrowRight, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';
import { SpeechTimerModal } from './SpeechTimerModal.tsx';

interface Step6Props {
  selectedQuestion: string;
  deepDiveAnalysis: string;
  storyBankText: string;
  resumeText: string;
  answerVersionsText: string;
  setAnswerVersionsText: (val: string) => void;
  selectedVersionTitle: string;
  setSelectedVersionTitle: (val: string) => void;
  selectedVersionText: string;
  setSelectedVersionText: (val: string) => void;
  onProceedToStep7: () => void;
}

export const Step6AnswerVersions: React.FC<Step6Props> = ({
  selectedQuestion,
  deepDiveAnalysis,
  storyBankText,
  resumeText,
  answerVersionsText,
  setAnswerVersionsText,
  selectedVersionTitle,
  setSelectedVersionTitle,
  selectedVersionText,
  setSelectedVersionText,
  onProceedToStep7,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTimerText, setActiveTimerText] = useState<{ title: string; text: string } | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerateAnswers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/step6-generate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedQuestion,
          deepDiveAnalysis,
          storyBankText,
          resumeText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '답변 생성 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setAnswerVersionsText(data.answers);

      // Default selection if not set
      if (!selectedVersionTitle) {
        setSelectedVersionTitle('버전 1: 두괄식 (결론 우선형)');
      }
    } catch (err: any) {
      setError(err.message || '6단계 답변 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const versionOptions = [
    { id: 'v1', title: '버전 1: 두괄식 (결론 우선형)', desc: '면접관의 주의를 단번에 사로잡는 명확한 핵심 주장 우선 배치' },
    { id: 'v2', title: '버전 2: 성과강조형 (수치·결과 중심)', desc: '과거 정량적 기여도 및 오차율 0%, 비용 절감 등 데이터 중심' },
    { id: 'v3', title: '버전 3: 스토리텔링형 (상황-갈등-해결)', desc: '어려웠던 고비와 협업 극복 과정을 생생하게 전달' },
    { id: 'v4', title: '버전 4: 직무연결형 (지원 기업 요구 매칭)', desc: '지원한 회사의 현재 직무 과제와 나의 실무 스킬을 직접 1:1 매핑' },
    { id: 'v5', title: '버전 5: 성장·태도강조형 (성찰과 준비)', desc: '경력 공백기 동안의 자격 취득, 인내심, 겸손하고 성실한 자세 부각' },
  ];

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          6단계 · 실전 구어체 5대 전략 스피치
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          답변 5가지 버전 작성 (40~60초 분량 · 실제 말하는 구어체)
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          실제 소리 내어 말할 때 40~60초(약 280~380자)에 맞춘 5가지 스타일의 모범 답변을 제공합니다.
          없는 경험을 꾸며내지 않고 오직 스토리뱅크의 사실만을 바탕으로 작성되었습니다.
        </p>

        <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-800">대상 질문:</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">"{selectedQuestion}"</div>
          </div>
          <span className="text-xs text-slate-500 font-mono">권장 분량: 40~60초</span>
        </div>
      </div>

      {/* Trigger if not generated */}
      {!answerVersionsText && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <MessageSquareText className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            5가지 버전의 실전 구어체 답변 생성
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            두괄식, 성과강조형, 스토리텔링형, 직무연결형, 성장·태도강조형과 각각 어울리는 상황을 작성합니다.
          </p>
          <button
            onClick={handleGenerateAnswers}
            disabled={isLoading || !selectedQuestion}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                40~60초 맞춤 구어체 5개 버전 작성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                6단계 5가지 버전 답변 생성
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Answers Display */}
      {answerVersionsText && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                6단계 생성 완료: 5가지 구어체 모범 답변 (각 40~60초 분량)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveTimerText({
                    title: '면접 답변 낭독 연습',
                    text: selectedVersionText || answerVersionsText,
                  })
                }
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" /> 40~60초 실전 발화 타이머 열기
              </button>
              <button
                onClick={handleGenerateAnswers}
                disabled={isLoading}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                다시 생성
              </button>
            </div>
          </div>

          {/* Full Markdown View */}
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={answerVersionsText} />
          </div>

          {/* Version Selection Box */}
          <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  ✓
                </span>
                7단계(꼬리질문 생성)에 사용할 답변 버전을 선택해 주세요
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                구직자의 성향이나 면접 분위기(보수적 기업, 압박 면접, 캐주얼 면접 등)에 가장 잘 어울리는 버전을 고릅니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {versionOptions.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedVersionTitle(opt.title);
                    // Extract corresponding snippet roughly or default to title
                    setSelectedVersionText(opt.title + '\n' + opt.desc);
                  }}
                  className={`p-3.5 rounded-lg text-left border transition-all flex flex-col justify-between ${
                    selectedVersionTitle === opt.title
                      ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                      : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{opt.title}</span>
                    {selectedVersionTitle === opt.title && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>

            {selectedVersionTitle && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-emerald-800">선택된 버전:</span> {selectedVersionTitle}
                </div>
                <button
                  onClick={() =>
                    setActiveTimerText({
                      title: selectedVersionTitle,
                      text: answerVersionsText,
                    })
                  }
                  className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" /> 이 버전으로 발화 속도 측정하기
                </button>
              </div>
            )}
          </div>

          {/* Action to Step 7 */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              ✓ 버전을 선택하셨다면 7단계(최종 다듬은 본 및 꼬리질문 5선 시뮬레이션)로 이동하세요.
            </p>
            <button
              onClick={onProceedToStep7}
              disabled={!selectedVersionTitle}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              <span>선택 완료 · 7단계(꼬리질문 생성) 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Speech Timer Modal */}
      {activeTimerText && (
        <SpeechTimerModal
          isOpen={!!activeTimerText}
          onClose={() => setActiveTimerText(null)}
          title={activeTimerText.title}
          speechText={activeTimerText.text}
        />
      )}
    </div>
  );
};
