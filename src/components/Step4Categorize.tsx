import React, { useState } from 'react';
import { Layers, ArrowRight, RefreshCw, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';

interface Step4Props {
  questionsMarkdown: string;
  companyInfo: string;
  candidateInfo: string;
  categorizedAnalysis: string;
  setCategorizedAnalysis: (val: string) => void;
  selectedQuestion: string;
  setSelectedQuestion: (val: string) => void;
  onProceedToStep5: () => void;
}

export const Step4Categorize: React.FC<Step4Props> = ({
  questionsMarkdown,
  companyInfo,
  candidateInfo,
  categorizedAnalysis,
  setCategorizedAnalysis,
  selectedQuestion,
  setSelectedQuestion,
  onProceedToStep5,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuestionInput, setCustomQuestionInput] = useState('');

  const handleCategorize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/step4-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionsList: questionsMarkdown,
          companyInfo: companyInfo,
          candidateInfo: candidateInfo,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '유형 분석 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setCategorizedAnalysis(data.categorizedAnalysis);
    } catch (err: any) {
      setError(err.message || '4단계 유형 분류 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Recommended default high-frequency questions for quick 1-click selection
  const quickSelectQuestions = [
    '5년간의 경력 공백 기간 동안 무엇을 하셨고, 직무 감각 유지를 위해 어떤 노력을 기울이셨습니까?',
    '자신보다 나이가 훨씬 어린 상사나 동료와 일하게 될 텐데, 잘 융화될 수 있습니까?',
    '결산 마감 등 긴급 상황 발생 시 야근이나 추가 근무가 가능합니까? 가정과의 양립 계획은 어떻게 되십니까?',
    '이전 직장에서 가장 기억에 남는 직무상 성과와 그 과정에서 본인의 역할은 무엇이었습니까?',
    '우리 회사에 지원하게 된 결정적인 계기와 입사 후 1년 내 달성하고 싶은 목표는 무엇입니까?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          4단계 · 8대 유형 분류 및 중요도 판별
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          유형별 분석 &amp; 분석할 질문 번호 선택
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          3단계 질문을 8개 유형(자기소개·지원동기, 직무역량, 경력공백, 조직적응·협업, 상황대처, 가치관·인성, 조건·처우, 마지막 한마디)으로 분류하고,
          이 기업의 평가 경향과 경력단절여성인 구직자A에게 특히 당락을 좌우하는 핵심 유형을 분석합니다.
        </p>
      </div>

      {/* Trigger Button if not analyzed yet */}
      {!categorizedAnalysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <Layers className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            질문 유형별 분류 및 구직자A 맞춤 중요도 분석
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            질문 빈도와 기업 선호 경향, 경단녀 면접관의 핵심 관심사(공백기, 조직 적응, 체력/근태 등)를 분석합니다.
          </p>
          <button
            onClick={handleCategorize}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                8대 유형별 정밀 분석 중...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                4단계 유형별 분석 실행
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

      {/* Categorized Analysis Display */}
      {categorizedAnalysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                4단계 분석 완료: 유형별 분포 및 구직자A 핵심 질문 경향
              </h3>
            </div>
            <button
              onClick={handleCategorize}
              disabled={isLoading}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              다시 분석하기
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={categorizedAnalysis} />
          </div>

          {/* Question Selection UI */}
          <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    !
                  </span>
                  분석하고 싶은 질문 번호 또는 질문을 선택해 주세요
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  선택한 질문에 대해 5단계 심층 분석(의도, 전략, STAR 매핑)과 6단계 5가지 버전 답변 생성이 진행됩니다.
                </p>
              </div>
            </div>

            {/* Quick candidate critical questions */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-indigo-900 block">
                ⭐ 경력단절여성 구직자A에게 가장 중요한 추천 질문:
              </span>
              <div className="space-y-1.5">
                {quickSelectQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full text-left p-3 rounded-lg text-xs leading-relaxed border transition-all flex items-start gap-2.5 ${
                      selectedQuestion === q
                        ? 'bg-white border-indigo-600 text-indigo-950 font-semibold shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-500 text-[10px] flex items-center justify-center font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{q}</span>
                    {selectedQuestion === q && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Input */}
            <div className="pt-2 border-t border-indigo-100/60">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                또는 3단계 표의 질문 번호나 질문 문구를 직접 입력:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  placeholder="예: 3번 질문 또는 '경력 공백기 동안 어떤 역량을 쌓으셨습니까?'"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customQuestionInput.trim()) {
                      setSelectedQuestion(customQuestionInput.trim());
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  선택 적용
                </button>
              </div>
            </div>

            {/* Current Selection summary */}
            {selectedQuestion && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-emerald-800">선택된 질문:</span> "{selectedQuestion}"
                </div>
                <span className="text-emerald-700 font-medium">선택 완료 ✓</span>
              </div>
            )}
          </div>

          {/* Step Progress action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              ✓ 질문이 선택되었습니다. 5단계(선택한 질문 심층 분석)로 이동하여 평가 의도와 전략을 확인하세요.
            </p>
            <button
              onClick={onProceedToStep5}
              disabled={!selectedQuestion}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>선택 완료 · 5단계(심층 분석) 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
