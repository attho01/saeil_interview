import React, { useState, useRef } from 'react';
import { UploadCloud, File, FileText, Image as ImageIcon, Trash2, ShieldCheck, Sparkles, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { MarkdownView } from './MarkdownView.tsx';
import { processUploadedFile, ParsedFileInfo } from '../utils/fileParser.ts';
import { PRESET_CASES, PresetCase } from '../data/presets.ts';

interface Step1Props {
  files: ParsedFileInfo[];
  setFiles: React.Dispatch<React.SetStateAction<ParsedFileInfo[]>>;
  analysisResult: string;
  setAnalysisResult: (val: string) => void;
  onProceedToStep2: () => void;
  onLoadPreset: (preset: PresetCase) => void;
}

export const Step1PersonalData: React.FC<Step1Props> = ({
  files,
  setFiles,
  analysisResult,
  setAnalysisResult,
  onProceedToStep2,
  onLoadPreset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessingFiles(true);
    setError(null);

    const newFiles: ParsedFileInfo[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const parsed = await processUploadedFile(file);
        newFiles.push(parsed);
      } catch (err) {
        console.error('File parsing error:', err);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setIsProcessingFiles(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('구직신청서 또는 스토리뱅크 파일(pdf, docx, img, txt)을 최소 1개 이상 업로드해 주세요.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/step1-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '파일 분석 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      setError(err.message || '1단계 파일 분석 중 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Title & Privacy Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              1단계 · 개인 데이터 파일 접수
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              구직자 개인 데이터 파일 업로드 (PDF · DOCX · IMG · TXT)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              구직신청서(이력서)와 스토리뱅크(경험리스트) 파일을 간단히 끌어다 놓거나 선택해 주세요.
            </p>
          </div>

          {/* Quick preset loaders */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">샘플 파일 원클릭 로드:</span>
            {PRESET_CASES.map((p) => (
              <button
                key={p.id}
                onClick={() => onLoadPreset(p)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200"
              >
                {p.name.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Guard Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-emerald-800">개인정보 보호 가이드라인:</strong>
            <p className="mt-0.5 text-emerald-800/90">
              파일 내에 구직자의 실명, 전화번호, 주민번호 등이 포함되어 있더라도 시스템 결과물에서는 자동으로 <strong>"구직자A"</strong>로만 표기되며, 오직 직무 역량과 경험 사실만을 분석합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Simple File Dropzone */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
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
            multiple
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            이력서 및 스토리뱅크 파일을 이곳에 드래그하거나 클릭하여 업로드
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            지원 형식: <strong className="text-slate-700">PDF, DOCX, 이미지(PNG/JPG), TXT</strong> (여러 파일 동시 업로드 가능)
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
            <span>내 컴퓨터에서 파일 찾아보기</span>
          </div>
        </div>

        {isProcessingFiles && (
          <div className="text-xs text-indigo-600 text-center flex items-center justify-center gap-1.5 py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            파일 내용 읽는 중...
          </div>
        )}

        {/* Uploaded File List */}
        {files.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
              <span>업로드된 파일 목록 ({files.length}개)</span>
              <button
                onClick={() => setFiles([])}
                className="text-slate-400 hover:text-rose-600 text-xs font-normal"
              >
                전체 삭제
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 group hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      {getFileIcon(f.extension)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-900 truncate" title={f.name}>
                        {f.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="uppercase font-mono text-[10px] bg-slate-200/80 px-1 rounded">
                          {f.extension}
                        </span>
                        <span>{formatSize(f.size)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors shrink-0"
                    title="파일 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold whitespace-nowrap transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || files.length === 0}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                첨부 파일 정밀 역량 분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                1단계 파일 분석 요청
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                1단계 분석 완료 요약 (구직자A 핵심 강점 및 공백 리스크)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">1단계 검토 완료 대기</span>
          </div>

          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/80">
            <MarkdownView content={analysisResult} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              ✓ 1단계 분석 내용을 확인하셨다면 2단계(채용정보 파일 받기)로 이동하세요.
            </p>
            <button
              onClick={onProceedToStep2}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
            >
              <span>확인 완료 · 2단계(채용정보 파일 받기) 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
