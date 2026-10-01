import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Building2,
  File,
  FileText,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Edit3,
  HelpCircle,
} from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';
import { processUploadedFile, ParsedFileInfo } from '../utils/fileParser.ts';

interface Step2Props {
  companyName: string;
  setCompanyName: (val: string) => void;
  jobTitle: string;
  setJobTitle: (val: string) => void;
  jobFile: ParsedFileInfo | null;
  setJobFile: (val: ParsedFileInfo | null) => void;
  parsedResult: string;
  setParsedResult: (val: string) => void;
  onProceedToStep3: () => void;
  onLoadSampleJob: () => void;
}

export const Step2JobPosting: React.FC<Step2Props> = ({
  companyName,
  setCompanyName,
  jobTitle,
  setJobTitle,
  jobFile,
  setJobFile,
  parsedResult,
  setParsedResult,
  onProceedToStep3,
  onLoadSampleJob,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualEditing, setIsManualEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await processUploadedFile(files[0]);
      setJobFile(parsed);
    } catch (err) {
      console.error('Job file parsing error:', err);
      setError('파일을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files);
  };

  const handleParse = async () => {
    if (!jobFile) {
      setError('채용공고 파일(pdf, docx, img, txt)을 업로드해 주세요.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/step2-parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: jobFile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '기업 정보 분석 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setParsedResult(data.parsedJob);

      // Automatically inspect parsed markdown to see if company name was detected
      const parsedText = data.parsedJob || '';
      const companyMatch = parsedText.match(/\|\s*\*\*회사명\*\*\s*\|\s*([^|\n]+)/);
      const jobMatch = parsedText.match(/\|\s*\*\*지원 직무\*\*\s*\|\s*([^|\n]+)/);

      if (companyMatch && companyMatch[1]) {
        const rawComp = companyMatch[1].trim();
        const isUnknown =
          rawComp.includes('미기재') ||
          rawComp.includes('비공개') ||
          rawComp.includes('블라인드') ||
          rawComp.includes('확인 필요') ||
          rawComp.includes('지원 기업');

        if (!isUnknown && !companyName) {
          setCompanyName(rawComp);
        } else if (isUnknown && (!companyName || companyName.includes('미기재'))) {
          setCompanyName('');
        }
      }

      if (jobMatch && jobMatch[1] && !jobTitle) {
        const rawJob = jobMatch[1].trim();
        if (!rawJob.includes('미기재')) {
          setJobTitle(rawJob);
        }
      }
    } catch (err: any) {
      setError(err.message || '2단계 기업 분석 중 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (!companyName.trim()) {
      setIsManualEditing(true);
      setError('3단계 기출 면접 질문 조사를 위해 기업명을 입력해 주세요.');
      return;
    }
    setError(null);
    onProceedToStep3();
  };

  const isCompanyMissing =
    !companyName.trim() ||
    companyName.includes('미기재') ||
    companyName.includes('비공개') ||
    companyName.includes('블라인드') ||
    companyName.includes('추가 확인 필요');

  const getFileIcon = (ext: string) => {
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-rose-600" />;
    }
    if (ext === 'docx') {
      return <FileCode className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-indigo-600" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Title & Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              2단계 · 채용공고 파일 접수
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              지원 기업 채용정보 파일 업로드 (PDF · DOCX · IMG · TXT)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              채용공고 캡처 이미지, 공고 PDF 문서, 직무기술서 파일을 파일 형식으로 업로드해 주세요.
            </p>
          </div>

          <button
            onClick={onLoadSampleJob}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 whitespace-nowrap"
          >
            📄 채용공고 샘플 파일 로드
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          업로드된 채용공고 파일을 AI가 직접 판독하여 <strong>회사명, 직무, 주요 업무, 자격요건, 우대사항, 인재상</strong>을 표로 정리합니다.
          만약 채용공고에 기업명이 없는 경우, 3단계 기출 질문 조사를 위해 기업명을 직접 입력받습니다.
        </p>
      </div>

      {/* Dropzone */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        {!jobFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              onChange={(e) => handleFile(e.target.files)}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              채용공고 파일을 이곳에 드래그하거나 클릭하여 업로드
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              지원 형식: <strong className="text-slate-700">PDF, DOCX, 공고 캡처 이미지(PNG/JPG), TXT</strong>
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
              <span>내 컴퓨터에서 공고 파일 선택</span>
            </div>
          </div>
        ) : (
          /* File Preview Card */
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">선택된 채용공고 파일</span>
              <button
                onClick={() => setJobFile(null)}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 다른 파일로 변경
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                {getFileIcon(jobFile.extension)}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{jobFile.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="uppercase font-mono text-[10px] bg-slate-100 px-1 rounded">
                    {jobFile.extension}
                  </span>
                  <span>{formatSize(jobFile.size)}</span>
                </div>
              </div>
            </div>

            {/* Optional image preview */}
            {jobFile.previewUrl && (
              <div className="max-h-48 overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={jobFile.previewUrl}
                  alt="채용공고 미리보기"
                  className="w-full object-contain max-h-48 bg-slate-100"
                />
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="text-xs text-indigo-600 text-center flex items-center justify-center gap-1.5 py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            파일 내용 읽는 중...
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleParse}
            disabled={isLoading || !jobFile}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                채용공고 파일 정밀 분석 및 표 정리 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                2단계 기업 정보 표 정리 요청
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parsed Result Display */}
      {parsedResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                2단계 분석 완료: 지원 기업 및 직무 요건 구조화 표
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">2단계 검토 완료 대기</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={parsedResult} />
          </div>

          {/* Company Name Validation & Input Banner */}
          {isCompanyMissing ? (
            /* Missing Company Name Prompt Card */
            <div className="p-5 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>채용공고에 기업명이 확인되지 않았습니다 (블라인드 채용 또는 미기재)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                3단계에서 <strong>최근 3년 기출 면접 질문을 정확하게 조사</strong>하기 위해 지원하실 회사명(또는 기관명)을 입력해 주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="지원 기업명을 입력하세요 (예: (주)한결테크놀로지, 서울문화재단, 쿠팡 등)"
                    className="w-full px-4 py-2.5 text-sm border-2 border-amber-400 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div className="relative sm:w-48">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="직무명 (선택)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Confirmed Company Name Card with Edit option */
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3단계 기출 질문 조사 대상 확정 기업:</span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span className="text-indigo-950 text-base">{companyName}</span>
                  {jobTitle && <span className="text-xs text-slate-500">({jobTitle})</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualEditing(!isManualEditing)}
                  className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isManualEditing ? '수정 닫기' : '기업명 직접 수정'}
                </button>
              </div>
            </div>
          )}

          {/* Expanded Edit Form if requested */}
          {isManualEditing && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="text-xs font-semibold text-slate-700">기출 조사 기업 정보 직접 수정:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">회사명 / 기관명</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="기업명 입력"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">지원 직무</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="직무명 입력"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              ✓ 기업 정보 분석이 완료되었습니다. 확정된 기업명으로 3단계(최근 3년 기출 면접 질문 조사)를 진행합니다.
            </p>
            <button
              onClick={handleProceed}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
            >
              <span>확인 완료 · 3단계(기출 질문 조사) 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
