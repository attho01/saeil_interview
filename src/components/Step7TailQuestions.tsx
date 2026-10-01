import React, { useState } from 'react';
import { GitFork, Clock, FileText, ArrowRight, RefreshCw, Sparkles, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';
import { SpeechTimerModal } from './SpeechTimerModal.tsx';

interface Step7Props {
  selectedQuestion: string;
  selectedVersionTitle: string;
  selectedVersionText: string;
  candidateData: string;
  tailQuestionsResult: string;
  setTailQuestionsResult: (val: string) => void;
  onSelectTailQuestionForLoop: (newQuestion: string) => void;
  onOpenReport: () => void;
}

export const Step7TailQuestions: React.FC<Step7Props> = ({
  selectedQuestion,
  selectedVersionTitle,
  selectedVersionText,
  candidateData,
  tailQuestionsResult,
  setTailQuestionsResult,
  onSelectTailQuestionForLoop,
  onOpenReport,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customFollowUp, setCustomFollowUp] = useState('');
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  const handleGenerateTailQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/step7-tail-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedQuestion,
          selectedVersionTitle,
          selectedVersionText,
          candidateData,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '꼬리질문 생성 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setTailQuestionsResult(data.tailQuestions);
    } catch (err: any) {
      setError(err.message || '7단계 꼬리질문 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Common high-frequency tail questions for re-employment candidates
  const sampleTailQuestions = [
    '답변에서 엑셀 서식을 개선하셨다고 했는데, 구체적으로 어떤 함수를 쓰셨고 반발하던 동료는 어떻게 설득하셨나요?',
    '5년간의 공백 기간 동안 자녀 돌봄에 문제가 생겼을 때 바로 지원받을 수 있는 비상 대책이 마련되어 있습니까?',
    '새일센터에서 180시간 훈련을 받으셨다고 했는데, 이전 실무 경험과 최신 시스템 사이에 가장 큰 차이는 무엇이었습니까?',
    '만약 지원하신 회사의 실제 업무 프로세스가 이전 직장보다 훨씬 보수적이거나 아날로그적이라면 어떻게 적응하시겠습니까?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          7단계 · 최종 대본 완성 및 꼬리질문 시뮬레이션
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          최종 다듬은 본 &amp; 면접관 압박 꼬리질문 5선 (난이도 순)
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          선택한 버전을 발화 호흡과 전달력에 맞게 최종 다듬은 본으로 확정하고,
          면접관이 물고 늘어질 만한 꼬리질문 5개(난이도 1~5순 및 발생 이유)를 도출합니다.
          꼬리질문을 선택하면 5단계와 6단계로 재순환하여 완벽한 방어 논리를 완성할 수 있습니다.
        </p>

        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-900">기준 질문:</span> "{selectedQuestion}"
          </div>
          <div>
            <span className="font-semibold text-slate-900">선택 버전:</span> {selectedVersionTitle || '버전 1'}
          </div>
        </div>
      </div>

      {/* Trigger if not generated */}
      {!tailQuestionsResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <GitFork className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            최종 다듬은 본 및 꼬리질문 5선 생성
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            면접관의 의심을 불식시킬 완성형 구어체 대본과 난이도별 꼬리질문 리스트를 구성합니다.
          </p>
          <button
            onClick={handleGenerateTailQuestions}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                최종 대본 리터칭 및 꼬리질문 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                7단계 꼬리질문 및 최종본 생성
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

      {/* Results Display */}
      {tailQuestionsResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                7단계 완성: 최종 다듬은 본 및 후속 꼬리질문 5선
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerOpen(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" /> 40~60초 발화 타이머
              </button>
              <button
                onClick={onOpenReport}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" /> 전체 종합 리포트 보기
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={tailQuestionsResult} />
          </div>

          {/* Loop Back Mechanism: Choose a tail question to analyze! */}
          <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                꼬리질문 심층 방어 루프: 추가로 분석할 꼬리질문 선택 또는 직접 입력
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                꼬리질문을 선택하시면 <strong>5단계(심층 분석)와 6단계(답변 5버전)</strong>를 해당 꼬리질문으로 즉시 다시 수행하여 빈틈없는 실전 방어벽을 구축합니다.
              </p>
            </div>

            {/* Quick Tail Question Buttons */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-indigo-900 block">
                추천 꼬리질문 선택 (클릭 시 5단계로 자동 순환):
              </span>
              {sampleTailQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectTailQuestionForLoop(q)}
                  className="w-full text-left p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-lg text-xs text-slate-800 leading-relaxed transition-colors flex items-start justify-between gap-3 group"
                >
                  <span className="flex-1 font-medium">{q}</span>
                  <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline shrink-0 flex items-center gap-1 mt-0.5">
                    이 질문으로 5단계 분석 <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>

            {/* Direct Input for real interviewer question */}
            <div className="pt-2 border-t border-indigo-100/60">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                또는 면접관이 실제로 한 압박 질문이나 추가 분석하고 싶은 질문 입력:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFollowUp}
                  onChange={(e) => setCustomFollowUp(e.target.value)}
                  placeholder="예: '나이 어린 사수가 업무 지시를 내리면 기분이 상하지 않겠습니까?'"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customFollowUp.trim()) {
                      onSelectTailQuestionForLoop(customFollowUp.trim());
                    }
                  }}
                  disabled={!customFollowUp.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> 5단계로 분석 순환
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              여성새로일하기센터 10년차 컨설턴트 7단계 프로세스 완료
            </span>
            <button
              onClick={onOpenReport}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>컨설팅 종합 리포트 인쇄 및 저장</span>
            </button>
          </div>
        </div>
      )}

      {/* Timer Modal */}
      <SpeechTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        title="최종 다듬은 본 실전 낭독 훈련 (40~60초)"
        speechText={tailQuestionsResult}
      />
    </div>
  );
};
