import React, { useState } from 'react';
import { Target, ArrowRight, RefreshCw, AlertCircle, FileSearch, Sparkles, CheckCircle2 } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';

interface Step5Props {
  selectedQuestion: string;
  resumeText: string;
  storyBankText: string;
  companyInfo: string;
  deepDiveAnalysis: string;
  setDeepDiveAnalysis: (val: string) => void;
  onProceedToStep6: () => void;
}

export const Step5DeepDive: React.FC<Step5Props> = ({
  selectedQuestion,
  resumeText,
  storyBankText,
  companyInfo,
  deepDiveAnalysis,
  setDeepDiveAnalysis,
  onProceedToStep6,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeepDive = async () => {
    if (!selectedQuestion) {
      setError('분석할 면접 질문을 먼저 선택해 주세요 (4단계).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/step5-deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedQuestion,
          resumeText,
          storyBankText,
          companyInfo,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '심층 분석 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setDeepDiveAnalysis(data.deepDive);
    } catch (err: any) {
      setError(err.message || '5단계 심층 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          5단계 · 질문 심층 해부 및 STAR 경험 매핑
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          선택한 질문 심층 분석 (평가 의도 · 전략 · 경험 연결)
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          선택한 질문에 대해 <strong>1) 면접관의 숨은 평가 의도, 2) 좋은 평가를 받는 답변 전략(구조·포함요소·피할것), 3) 스토리뱅크 중 어떤 경험을 매칭할지와 답변 설계 방식, 4) 부족 시 보완 질문</strong>을 도출합니다.
        </p>

        {/* Selected Question Target Banner */}
        <div className="mt-4 p-4 bg-indigo-50/80 border border-indigo-100 rounded-lg">
          <div className="text-xs text-indigo-800 font-semibold mb-1">선택된 타겟 질문:</div>
          <div className="text-base font-bold text-slate-900 leading-snug">
            "{selectedQuestion || '질문이 선택되지 않았습니다. 4단계에서 질문을 선택해 주세요.'}"
          </div>
        </div>
      </div>

      {/* Action if not analyzed yet */}
      {!deepDiveAnalysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <Target className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            선택 질문 심층 분석 실행
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            면접관의 진짜 리스크 체크 의도와 스토리뱅크 경험 연결 논리를 분석합니다.
          </p>
          <button
            onClick={handleDeepDive}
            disabled={isLoading || !selectedQuestion}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                10년차 컨설턴트 질문 심층 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                5단계 심층 분석 실행
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Deep Dive Result Display */}
      {deepDiveAnalysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                5단계 분석 완료: 질문 평가 의도, 답변 전략 &amp; 경험 매핑
              </h3>
            </div>
            <button
              onClick={handleDeepDive}
              disabled={isLoading}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              다시 분석하기
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={deepDiveAnalysis} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              ✓ 전략과 경험 설계가 완성되었습니다. 6단계(실전 5가지 구어체 버전 답변 작성)로 이동하세요.
            </p>
            <button
              onClick={onProceedToStep6}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
            >
              <span>확인 완료 · 6단계(답변 5가지 버전 생성) 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
