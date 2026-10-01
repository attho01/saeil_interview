import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    candidateSummary?: string;
    jobSummary?: string;
    questionsMarkdown?: string;
    categorizedAnalysis?: string;
    selectedQuestion?: string;
    deepDive?: string;
    answerVersions?: string;
    selectedVersionTitle?: string;
    selectedVersionText?: string;
    tailQuestions?: string;
  };
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, sessionData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAll = () => {
    let text = `# 새일센터 AI면접 코치 - 종합 컨설팅 리포트 (구직자A)\n\n`;
    text += `작성일시: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}\n\n`;

    if (sessionData.candidateSummary) {
      text += `## 1단계. 구직자A 개인 데이터 분석 요약\n${sessionData.candidateSummary}\n\n`;
    }
    if (sessionData.jobSummary) {
      text += `## 2단계. 지원 기업 및 채용공고 분석\n${sessionData.jobSummary}\n\n`;
    }
    if (sessionData.questionsMarkdown) {
      text += `## 3단계. 기출 면접 질문 조사 (최근 3년)\n${sessionData.questionsMarkdown}\n\n`;
    }
    if (sessionData.categorizedAnalysis) {
      text += `## 4단계. 유형별 분석 및 평가 경향\n${sessionData.categorizedAnalysis}\n\n`;
    }
    if (sessionData.selectedQuestion) {
      text += `## 5단계. 선택 질문 심층 분석 ("${sessionData.selectedQuestion}")\n${sessionData.deepDive || ''}\n\n`;
    }
    if (sessionData.answerVersions) {
      text += `## 6단계. 5가지 구어체 답변 버전\n${sessionData.answerVersions}\n\n`;
    }
    if (sessionData.tailQuestions) {
      text += `## 7단계. 최종 다듬은 본 및 꼬리질문 5선\n${sessionData.tailQuestions}\n\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">구직자A 맞춤형 면접 컨설팅 종합 리포트</h3>
              <p className="text-xs text-slate-500">새일센터 AI면접 코치 7단계 분석 결과서</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사 완료' : '전체 텍스트 복사'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-black text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> 인쇄 / PDF 저장
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto space-y-8 print:p-0">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                여성새로일하기센터 취업상담 지원도구
              </span>
              <span className="text-xs text-slate-400">
                작성일: {new Date().toLocaleDateString('ko-KR')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">경력단절여성 구직자A 면접 코칭 솔루션 보고서</h1>
            <p className="text-sm text-slate-600 mt-1">
              본 문서는 개인정보 보호 규정에 따라 구직자 실명을 배제하고 "구직자A"로 표기하며, 실제 입력된 경험 데이터만을 기반으로 설계되었습니다.
            </p>
          </div>

          {/* Section 1 */}
          {sessionData.candidateSummary && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                1단계. 구직자 개인 데이터 분석 (핵심 강점 & 공백기 리스크)
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <MarkdownView content={sessionData.candidateSummary} />
              </div>
            </div>
          )}

          {/* Section 2 */}
          {sessionData.jobSummary && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                2단계. 지원 기업 및 채용공고 분석
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <MarkdownView content={sessionData.jobSummary} />
              </div>
            </div>
          )}

          {/* Section 3 & 4 */}
          {sessionData.questionsMarkdown && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                3~4단계. 최근 3년 기출 질문 및 유형별 경향 분석
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                <MarkdownView content={sessionData.questionsMarkdown} />
                {sessionData.categorizedAnalysis && (
                  <div className="border-t border-slate-200 pt-4">
                    <MarkdownView content={sessionData.categorizedAnalysis} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5 */}
          {sessionData.deepDive && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                5단계. 선택 질문 심층 분석 (의도, 전략, STAR 매핑)
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                {sessionData.selectedQuestion && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-md mb-3 text-sm font-semibold text-indigo-900">
                    중점 분석 질문: "{sessionData.selectedQuestion}"
                  </div>
                )}
                <MarkdownView content={sessionData.deepDive} />
              </div>
            </div>
          )}

          {/* Section 6 */}
          {sessionData.answerVersions && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                6단계. 실전 구어체 5가지 답변 버전 (40~60초)
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <MarkdownView content={sessionData.answerVersions} />
              </div>
            </div>
          )}

          {/* Section 7 */}
          {sessionData.tailQuestions && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
                7단계. 최종 다듬은 본 및 꼬리질문 5선 시뮬레이션
              </h2>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <MarkdownView content={sessionData.tailQuestions} />
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 text-center">
            여성새로일하기센터 상담사 전용 면접 솔루션 · 경력단절여성의 당당한 재도전을 응원합니다.
          </div>
        </div>
      </div>
    </div>
  );
};
