import React, { useState } from 'react';
import { Search, HelpCircle, ArrowRight, RefreshCw, CheckCircle2, ShieldAlert, Building2, Edit3 } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';

interface Step3Props {
  companyName: string;
  setCompanyName: (val: string) => void;
  jobTitle: string;
  setJobTitle: (val: string) => void;
  industry: string;
  questionsMarkdown: string;
  setQuestionsMarkdown: (val: string) => void;
  onProceedToStep4: () => void;
}

export const Step3InterviewQuestions: React.FC<Step3Props> = ({
  companyName,
  setCompanyName,
  jobTitle,
  setJobTitle,
  industry,
  questionsMarkdown,
  setQuestionsMarkdown,
  onProceedToStep4,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const handleSearchQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/step3-search-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName || '지원 대상 기업',
          jobTitle: jobTitle || '해당 지원 직무',
          industry: industry || '동종 업계',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '질문 조사 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setQuestionsMarkdown(data.questionsMarkdown);
    } catch (err: any) {
      setError(err.message || '3단계 기출 질문 조사 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          3단계 · 최근 3년 실전 기출 데이터베이스
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          기출 면접 질문 조사 (기업 및 동종 업계 최근 3년)
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          해당 기업(또는 동종 업종·유사 직무)의 최근 3년 이내 기출 질문을 최소 15개 이상 목표로 조사합니다.
          정보가 부족한 경우 억지로 채우지 않고 정직하게 밝히며, 질문마다 <strong>출처, 시기, 확인 여부([확인됨] / [추정])</strong>를 투명하게 표기합니다.
        </p>

        {/* Target Info summary chip with edit trigger */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-900">조사 대상 기업:</span>
              <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-100">
                {companyName || '(기업명 직접 입력 필요)'}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="font-semibold text-slate-900">직무:</span> {jobTitle || '담당 실무'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-medium flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingTarget ? '완료' : '조사 기업명 변경'}
          </button>
        </div>

        {/* Editing Banner */}
        {isEditingTarget && (
          <div className="mt-3 p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="조사할 회사명 (예: (주)카카오, 한결테크놀로지 등)"
              className="flex-1 px-3 py-1.5 text-xs border border-indigo-300 rounded bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="직무명 (예: 총무회계, 사무행정)"
              className="sm:w-44 px-3 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setIsEditingTarget(false)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold"
            >
              적용
            </button>
          </div>
        )}
      </div>

      {/* Action Box if no questions yet */}
      {!questionsMarkdown && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <HelpCircle className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-90" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            "{companyName || '지원 대상 기업'}" 최근 3년 기출 면접 질문 조사
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            취업포털(잡코리아, 사람인, 잡플래닛 등)과 공공 공시 자료, 동종 업계의 최신 면접 트렌드를 반영하여 15개 이상의 질문을 표로 도출합니다.
          </p>
          <button
            onClick={handleSearchQuestions}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                기출 질문 및 동종 업계 데이터베이스 조사 중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                3단계 기출 면접 질문 조사 실행
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Questions Result Display */}
      {questionsMarkdown && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                3단계 조사 완료: 최근 3년 기출 면접 질문 표 (최소 15문항)
              </h3>
            </div>
            <button
              onClick={handleSearchQuestions}
              disabled={isLoading}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              다시 조사하기
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={questionsMarkdown} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              ✓ 기출 질문 조사가 완료되었습니다. 4단계(유형별 분석 및 경향 파악)로 이동해 분류를 진행하세요.
            </p>
            <button
              onClick={onProceedToStep4}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
            >
              <span>확인 완료 · 4단계(유형별 분석) 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
