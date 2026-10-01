import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

import {
  extractTextFromCandidateInput,
  generateStep1Fallback,
  generateStep2Fallback,
  generateStep3Fallback,
  generateStep4Fallback,
  generateStep5Fallback,
  generateStep6Fallback,
  generateStep7Fallback,
} from './src/utils/saeilFallbackEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_PROMPT = `
당신은 여성새로일하기센터(새일센터)에서 10년 이상 경력을 쌓은 베테랑 면접 전문 컨설턴트입니다.
경력단절여성의 취업 면접과 재취업 역량 강화를 전담하며, 동료 상담사가 구직자 상담에 활용하는 전문 도구 역할을 수행합니다.

[철저한 기본 원칙]
1. 허위 사실 및 과장 절대 금지: 구직자가 제공하지 않은 경험, 수치, 성과는 절대 지어내지 마십시오. 만약 답변 구성에 필요한 구체적 사실이 부족하면 반드시 "[추가 확인 필요]"라고 명시하고 상담사에게 확인할 보완 질문을 남기십시오.
2. 개인정보 보호: 지원자의 실명, 전화번호, 주민번호, 상세 주소는 일절 언급하지 않고 오직 "구직자A"로 호칭합니다.
3. 기출 질문 객관성: 검색 및 조사 출처(취업포털 잡코리아/원티드/사람인/잡플래닛/공공기관 공시 등)와 시기를 밝히고, 확인 여부를 [확인됨] 또는 [추정]으로 반드시 구분하십시오.
4. 구어체 답변 구현: 면접 답변은 실제 소리 내어 말할 때 40~60초(약 280~380자) 분량이 되도록 실제 한국어 면접 구어체(~습니다, ~했습니다)로 작성하십시오.
5. 경력단절여성 특화 조언: 육아, 돌봄, 가사 등 공백 기간을 변명하기보다 재취업을 위한 준비 과정(자격증, 직업훈련, 재정비, 봉사활동 등) 및 인생 경험에서 체득한 성숙함·책임감과 직무 역량을 자신감 있게 연결하십시오.
`;

// Circuit breaker for quota exhaustion
let quotaExhaustedUntil = 0;

// Helper: Formats friendly error message instead of raw JSON
function formatFriendlyErrorMessage(err: any): string {
  const raw = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
  if (
    raw.includes('503') ||
    raw.includes('high demand') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('temporarily unavailable')
  ) {
    return '현재 AI 분석 서버 트래픽이 일시적으로 급증했습니다. 분석 버튼을 다시 한 번 눌러주시면 즉시 정상 처리됩니다.';
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return '일시적으로 요청이 많아 지연되었습니다. 1~2초 후 다시 시도해 주세요.';
  }
  return raw || '분석 처리 중 일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
}

// Timeout wrapper for snappy responses
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
    ),
  ]);
}

// Resilient, ultra-fast Gemini generator with circuit breaker
async function generateContentWithRetry(
  contents: any,
  customInstruction?: string,
  timeoutMs: number = 10000
): Promise<string | null> {
  // If quota was already exhausted recently, skip slow network failures instantly
  if (Date.now() < quotaExhaustedUntil) {
    return null;
  }

  // Use fastest model first
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  for (const model of candidateModels) {
    try {
      const callPromise = ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: customInstruction || SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      const response = await withTimeout(callPromise, timeoutMs);
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      const msg = err?.message || '';
      const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
      if (isQuota) {
        // Activate circuit breaker for 60 seconds
        quotaExhaustedUntil = Date.now() + 60000;
        return null;
      }
      // If timeout or other issue, switch to built-in consulting engine seamlessly
      return null;
    }
  }

  return null;
}

// Helper for string prompts
async function callGemini(prompt: string, customInstruction?: string, timeoutMs: number = 9000) {
  return generateContentWithRetry(prompt, customInstruction, timeoutMs);
}

// 1단계: 개인 데이터 분석 (파일 및 텍스트 지원)
app.post('/api/step1-analyze', async (req, res) => {
  try {
    const { files, resumeText, storyBankText } = req.body;
    const fileList = Array.isArray(files) ? files : [];

    if (fileList.length === 0 && !resumeText && !storyBankText) {
      return res.status(400).json({ error: '구직신청서와 스토리뱅크 파일(pdf, docx, img, txt)을 업로드해 주세요.' });
    }

    const parts: any[] = [];

    // Add inlineData for PDF & images
    for (const f of fileList) {
      if (f.inlineData && f.inlineData.data) {
        parts.push({
          inlineData: {
            mimeType: f.inlineData.mimeType,
            data: f.inlineData.data,
          },
        });
      }
      if (f.extractedText) {
        parts.push({
          text: `[첨부 파일 (${f.name}) 추출 내용]:\n${f.extractedText}`,
        });
      }
    }

    if (resumeText) {
      parts.push({ text: `[구직신청서(이력) 내용]:\n${resumeText}` });
    }
    if (storyBankText) {
      parts.push({ text: `[스토리뱅크 내용]:\n${storyBankText}` });
    }

    const prompt = `
[요청: 1단계 구직자 개인 데이터 파일 정밀 분석]
첨부된 파일(구직신청서 및 스토리뱅크)을 꼼꼼하게 검토하여 구직자A의 핵심 역량을 분석하십시오.

원칙:
- 절대 제공되지 않은 사실을 지어내지 말 것.
- 구직자는 "구직자A"로만 지칭.
- 반드시 다음 형식으로 명확하게 요약할 것:
1. 구직자A의 핵심 강점 3가지 (각 강점별 근거와 활용 포인트)
2. 경력 공백이나 약점으로 면접관에게 질문받을 만한 지점 요약 (공백 기간, 직무 변경, 기술 트렌드 갭 등)
3. 스토리뱅크 보완이 필요한 부분(경험의 구체성, 수치 등 없는 경우 "[추가 확인 필요]" 질문 포함)
`;

    parts.push({ text: prompt });

    const result = await generateContentWithRetry({ parts }, SYSTEM_PROMPT, 12000);
    if (result) {
      return res.json({ analysis: result });
    }

    const extracted = extractTextFromCandidateInput(fileList, resumeText, storyBankText);
    const fallbackAnalysis = generateStep1Fallback(extracted);
    return res.json({ analysis: fallbackAnalysis });
  } catch (err: any) {
    console.error('Step 1 unexpected exception:', err?.message || err);
    const extracted = extractTextFromCandidateInput(req.body.files, req.body.resumeText, req.body.storyBankText);
    res.json({ analysis: generateStep1Fallback(extracted) });
  }
});

// 2단계: 지원 기업 정보 분석 (파일 및 텍스트 지원)
app.post('/api/step2-parse-job', async (req, res) => {
  try {
    const { file, jobData, inputType } = req.body;

    if (!file && !jobData) {
      return res.status(400).json({ error: '채용공고 파일(pdf, docx, img, txt)을 업로드해 주세요.' });
    }

    const parts: any[] = [];

    if (file) {
      if (file.inlineData && file.inlineData.data) {
        parts.push({
          inlineData: {
            mimeType: file.inlineData.mimeType,
            data: file.inlineData.data,
          },
        });
      }
      if (file.extractedText) {
        parts.push({
          text: `[채용공고 파일 (${file.name}) 내용]:\n${file.extractedText}`,
        });
      }
    }

    if (jobData) {
      parts.push({ text: `[채용공고 추가 정보]:\n${jobData}` });
    }

    const prompt = `
[요청: 2단계 지원 기업 정보 파일 정리]
첨부된 채용공고 파일(이미지, PDF, 문서 등)의 내용을 판독하고 정밀 분석하여 아래 항목들을 깔끔하고 읽기 쉬운 표 및 요약 형식으로 정리하십시오:
- 회사명 (또는 기관명)
- 지원 직무 및 부서
- 주요 업무
- 필수 자격요건
- 우대사항
- 기업 인재상 및 핵심 가치 (공고에 없으면 "공고 미기재(추가 확인 필요)" 표기)
- 경력단절여성(구직자A) 관점에서의 직무 적합도 포인트 한 줄 코멘트
`;

    parts.push({ text: prompt });

    const result = await generateContentWithRetry({ parts }, SYSTEM_PROMPT, 12000);
    if (result) {
      return res.json({ parsedJob: result });
    }

    const fallbackJob = generateStep2Fallback(file?.extractedText || jobData || '');
    return res.json({ parsedJob: fallbackJob });
  } catch (err: any) {
    console.error('Step 2 unexpected exception:', err?.message || err);
    res.json({ parsedJob: generateStep2Fallback(req.body?.jobData || '') });
  }
});

// 3단계: 기출 면접 질문 조사
app.post('/api/step3-search-questions', async (req, res) => {
  try {
    const { companyName, jobTitle, industry } = req.body;

    const prompt = `
[요청: 3단계 기출 면접 질문 조사]
지원 기업명: ${companyName || '지원 대상 기업'}
직무: ${jobTitle || '지원 직무'}
업종/분야: ${industry || '해당 분야'}

지침:
1. 해당 기업(또는 동종 업계/유사 직무)의 최근 3년 이내 면접 기출 질문을 최소 15개 이상 목표로 조사 및 도출하십시오.
2. 만약 특정 기업의 실제 기출 자료가 부족하다면, "해당 기업의 직접적인 공개 기출 정보가 제한적이므로 동종 업계 동일 직무의 실전 빈출 질문을 포함했습니다"라고 정직하게 밝히십시오.
3. 반드시 아래 표 형식(마크다운 테이블)으로 정리하십시오:
| 번호 | 면접 질문 | 출처(사이트명/경로) | 시기 | 구분(확인됨/추정) |
4. 질문 번호는 1번부터 15번 이상까지 순번을 매기십시오.
5. 경력단절여성이 실제로 마주치게 되는 공백기 질문, 조직 적응 질문, 실무 역량 검증 질문이 고르게 포함되도록 하십시오.
`;

    const result = await callGemini(prompt, undefined, 9000);
    if (result) {
      return res.json({ questionsMarkdown: result });
    }

    const fallbackQuestions = generateStep3Fallback(companyName, jobTitle);
    return res.json({ questionsMarkdown: fallbackQuestions });
  } catch (err: any) {
    console.error('Step 3 unexpected exception:', err?.message || err);
    res.json({ questionsMarkdown: generateStep3Fallback(req.body?.companyName, req.body?.jobTitle) });
  }
});

// 4단계: 유형별 분석
app.post('/api/step4-categorize', async (req, res) => {
  try {
    const { questionsList, companyInfo, candidateInfo } = req.body;

    const prompt = `
[요청: 4단계 면접 질문 유형별 분류 및 경향 분석]
3단계에서 조사된 면접 질문 목록:
${questionsList}

지원 기업/직무:
${companyInfo}

구직자A 정보 요약:
${candidateInfo}

지침:
1. 위 질문들을 8개 핵심 유형으로 명확히 분류하십시오:
   1) 자기소개·지원동기
   2) 직무역량 (실무 스킬, 업무 프로세스)
   3) 경력공백 (공백 사유, 재취업 동기, 극복 노력)
   4) 조직적응·협업 (나이 차이 동료, 조직 문화, 갈등 관리)
   5) 상황대처 (업무 과중, 돌발 변수, 실수 대처)
   6) 가치관·인성 (직업관, 스트레스 관리, 책임감)
   7) 조건·처우 (야근 가능 여부, 가정과 일 양립, 통근)
   8) 마지막 한마디 (마무리 어필, 회사에 대한 질문)

2. 유형별 분석 내용:
   - 각 유형별 해당 질문 번호 및 질문 개수
   - 이 기업/직무가 중시하는 평가 경향 분석 (예: 실무 즉시투입성, 인성 및 융화도 등)
   - 특히 경력단절여성인 '구직자A'에게 당락을 가를 만큼 중요한 핵심 유형 2~3가지 선정 및 그 이유

3. 마지막 안내 문구:
   "분석하고 싶은 질문 번호를 선택해 주세요."를 명확히 남길 것.
`;

    const result = await callGemini(prompt, undefined, 9000);
    if (result) {
      return res.json({ categorizedAnalysis: result });
    }

    const fallbackCat = generateStep4Fallback();
    return res.json({ categorizedAnalysis: fallbackCat });
  } catch (err: any) {
    console.error('Step 4 unexpected exception:', err?.message || err);
    res.json({ categorizedAnalysis: generateStep4Fallback() });
  }
});

// 5단계: 선택 질문 심층 분석
app.post('/api/step5-deep-dive', async (req, res) => {
  try {
    const { selectedQuestion, resumeText, storyBankText, companyInfo } = req.body;

    const prompt = `
[요청: 5단계 선택 질문 심층 분석]
선택한 면접 질문:
"${selectedQuestion}"

구직자A 이력 및 스토리뱅크:
이력: ${resumeText}
스토리뱅크: ${storyBankText}

지원 기업/직무:
${companyInfo}

지침:
반드시 다음 4가지 순서로 깊이 있게 분석하여 상담사에게 브리핑하십시오:
1) 이 질문의 평가 의도:
   - 면접관이 표면적인 질문 뒤에서 실제로 검증하려는 진짜 심리 및 리스크 평가 기준 (경력단절여성 관점 반영)
2) 좋은 평가를 받는 답변 전략:
   - 권장 답변 구조 (예: 두괄식 주장 -> 근거 STAR -> 직무 기여 연결)
   - 반드시 포함해야 할 핵심 요소
   - 절대 피해야 할 부정적 요소나 흔한 실수 (변명조, 과도한 감정 호소 등)
3) 경험 연결 (스토리뱅크 매핑):
   - 구직자A의 스토리뱅크 중 어떤 경험을 매칭할지와 그 구체적인 이유
   - 답변을 어떻게 설계해야 설득력이 생기는지 설계 논리
4) 경험 부족 시 보완 질문:
   - 만약 제공된 데이터 중 매칭할 경험이 부족하거나 구체적 성과 수치가 부족하다면 정직하게 명시하고, "[추가 확인 필요]" 태그와 함께 구직자에게 물어볼 구체적 보완 질문 작성
`;

    const result = await callGemini(prompt, undefined, 9000);
    if (result) {
      return res.json({ deepDive: result });
    }

    const fallbackDeep = generateStep5Fallback(selectedQuestion || '경력 공백기 질문');
    return res.json({ deepDive: fallbackDeep });
  } catch (err: any) {
    console.error('Step 5 unexpected exception:', err?.message || err);
    res.json({ deepDive: generateStep5Fallback(req.body?.selectedQuestion || '경력 공백기 질문') });
  }
});

// 6단계: 답변 5가지 버전 생성
app.post('/api/step6-generate-answers', async (req, res) => {
  try {
    const { selectedQuestion, deepDiveAnalysis, storyBankText, resumeText } = req.body;

    const prompt = `
[요청: 6단계 면접 답변 5가지 버전 작성]
선택한 질문: "${selectedQuestion}"
5단계 분석 내용 요약: ${deepDiveAnalysis}
구직자A 경험 데이터: ${storyBankText} / ${resumeText}

지침:
1. 실제 면접관 앞에서 말하는 자연스러운 100% 구어체(~했습니다, ~라고 생각합니다)로 작성하십시오.
2. 각 버전은 낭독 시 **40~60초 분량(공백 포함 약 280자 ~ 380자 내외)**을 엄격히 준수하십시오.
3. 구직자가 제공하지 않은 허위 경험이나 거짓 수치는 절대로 만들지 마십시오. 만약 구체적 수치가 없다면 직무 역량과 태도 중심으로 풀거나 [수치 확인 필요]로 표기하십시오.
4. 아래 5가지 버전을 모두 작성하십시오:

- 버전 1: 두괄식 (결론 먼저 명확히 제시하고 근거 요약)
- 버전 2: 성과강조형 (프로세스 개선, 기여도, 결과 중심)
- 버전 3: 스토리텔링형 (상황 - 갈등/도전 - 극복 및 해결 흐름)
- 버전 4: 직무연결형 (지원 기업의 현재 니즈 및 직무 요구사항과 직접 매핑)
- 버전 5: 성장·태도강조형 (경력 공백기 동안의 배움, 성찰, 앞으로의 헌신적 자세)

5. 각 버전마다:
   - 예상 소요 시간 (초) 및 글자 수 표시
   - 끝에 "💡 어울리는 상황: (한 줄 요약)" 반드시 기재
6. 맨 마지막에 "사용할 버전을 선택해 주세요."라고 안내하십시오.
`;

    const result = await callGemini(prompt, undefined, 9000);
    if (result) {
      return res.json({ answers: result });
    }

    const fallbackAnswers = generateStep6Fallback(selectedQuestion || '경력 공백기 질문');
    return res.json({ answers: fallbackAnswers });
  } catch (err: any) {
    console.error('Step 6 unexpected exception:', err?.message || err);
    res.json({ answers: generateStep6Fallback(req.body?.selectedQuestion || '경력 공백기 질문') });
  }
});

// 7단계: 꼬리질문 및 다듬은 본 생성
app.post('/api/step7-tail-questions', async (req, res) => {
  try {
    const { selectedQuestion, selectedVersionTitle, selectedVersionText, candidateData } = req.body;

    const prompt = `
[요청: 7단계 선택 답변 최종 다듬기 및 꼬리질문 5개 생성]
질문: "${selectedQuestion}"
선택한 버전: ${selectedVersionTitle}
선택한 원문:
${selectedVersionText}

구직자A 배경: ${candidateData}

지침:
반드시 다음 3가지 항목을 구성하십시오:

1) [선택한 답변의 최종 다듬은 본]:
   - 발화 호흡, 문장 길이, 군더더기 단어 제거, 면접관 귀에 쏙 들어오는 전달력 높은 완성형 구어체 대본으로 리터칭 (40~60초 분량 유지).

2) [면접관의 후속 꼬리질문 5개 (난이도 1~5 순)]:
   - 난이도 1 (기본 확인): 답변에서 언급된 내용의 사실 관계나 디테일 확인
   - 난이도 2 (실행 과정): 문제 해결 과정에서 구체적으로 취한 행동 질문
   - 난이도 3 (갈등 및 변수): 다른 의견을 가진 사람과의 협업이나 예기치 못한 돌발 상황
   - 난이도 4 (공백/적응 리스크 압박): 경력단절이나 최신 툴 적응, 체력/환경에 관한 민감한 검증
   - 난이도 5 (심층 가치관/스트레스 대처): 압박 상황이나 실패 경험에 대한 심층 질문
   * 각 꼬리질문마다 "👉 이 질문이 나오는 이유: (면접관의 의심 또는 확인 포인트 한 줄)"을 명시할 것.

3) [안내 문구]:
   "추가로 분석하고 싶은 꼬리질문을 선택하거나, 면접관이 실제로 한 질문을 입력해 주세요."
`;

    const result = await callGemini(prompt, undefined, 9000);
    if (result) {
      return res.json({ tailQuestions: result });
    }

    const fallbackTail = generateStep7Fallback(selectedQuestion || '질문', selectedVersionTitle);
    return res.json({ tailQuestions: fallbackTail });
  } catch (err: any) {
    console.error('Step 7 unexpected exception:', err?.message || err);
    res.json({ tailQuestions: generateStep7Fallback(req.body?.selectedQuestion || '질문') });
  }
});

// 자유 상담사 대화 인터페이스
app.post('/api/chat-consultant', async (req, res) => {
  try {
    const { message, history, context } = req.body;

    const prompt = `
현재 면접 컨설팅 컨텍스트:
${JSON.stringify(context || {}, null, 2)}

대화 내역:
${(history || []).map((h: any) => `${h.role === 'user' ? '동료 상담사' : '컨설턴트'}: ${h.text}`).join('\n')}

동료 상담사의 새로운 질문/입력:
"${message}"

지침:
10년차 새일센터 면접 컨설턴트로서 친절하면서도 전문적이고 단호한 태도로 조언하십시오. 
구직자A의 데이터를 바탕으로 거짓을 지어내지 않고, 7단계 절차에 맞춰 바로 활용할 수 있는 실질적인 면접 팁과 대안을 제시하십시오.
`;

    const result = await callGemini(prompt);
    res.json({ response: result });
  } catch (err: any) {
    console.error('Chat Error:', err);
    res.status(500).json({ error: formatFriendlyErrorMessage(err) });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`새일센터 면접 컨설턴트 서버 실행 중: http://localhost:${PORT}`);
  });
}

startServer();
