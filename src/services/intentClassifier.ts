/**
 * SFR-012: 대화형 자연어 질문 분석 기능
 * - 사용자 입력 전처리 (특수문자/노이즈 정제)
 * - 도메인 사전 기반 키워드/엔티티 추출
 * - 질의 의도(Intent) 분석 및 신뢰도 산출
 */

export type IntentType = 'REPORT_SEARCH' | 'STAT_QUERY' | 'POLICY_INSIGHT' | 'GENERAL_QA';

export interface PreprocessingLog {
  rawQuery: string;
  cleanedQuery: string;
  removedChars: string[];
}

export interface IntentAnalysisResult {
  intent: IntentType;
  intentLabel: string;
  confidence: number;
  extractedKeywords: string[];
  detectedDomain: '관광' | '문화예술' | '콘텐츠' | '통계정책' | '종합';
  preprocessing: PreprocessingLog;
}

// KCTI 도메인 사전
const DOMAIN_DICTIONARY = {
  관광: ['관광', '외래객', '인바운드', '주4.5일제', '여행', '숙박', '워케이션', '산불', '지역관광', '방한', '3천만', '호텔'],
  문화예술: ['공연', '티켓', '할인', '예술', '문화예술', '꿈꾸는예술터', '바우처', '예술인', '창작', '관람료', '뮤지컬'],
  콘텐츠: ['콘텐츠', 'k콘텐츠', 'k팝', '케이팝', 'e스포츠', '이스포츠', '게임', '애니메이션', 'ott', '수출', '아이돌', 'ip'],
  통계정책: ['통계', '지수', '물가', '생산자물가', '카드지출', '행정자료', '빅데이터', '종사자', '증감률', '국가통계']
};

export function analyzeQuery(query: string): IntentAnalysisResult {
  // 1. 전처리 (불필요한 특수문자 및 예외 문자열 정제)
  const specialCharsRegex = /[~!@#$%^&*()_+`={}[\]:;"'<>,.?/\\|]/g;
  const removedChars = query.match(specialCharsRegex) || [];
  const cleanedQuery = query.replace(specialCharsRegex, ' ').replace(/\s+/g, ' ').trim();

  const lowerQuery = cleanedQuery.toLowerCase();

  // 2. 도메인 사전 기반 키워드 추출
  const extractedKeywords: string[] = [];
  const domainScore: Record<'관광' | '문화예술' | '콘텐츠' | '통계정책', number> = {
    관광: 0,
    문화예술: 0,
    콘텐츠: 0,
    통계정책: 0
  };

  (Object.keys(DOMAIN_DICTIONARY) as Array<keyof typeof DOMAIN_DICTIONARY>).forEach((domain) => {
    DOMAIN_DICTIONARY[domain].forEach((keyword) => {
      if (lowerQuery.includes(keyword)) {
        extractedKeywords.push(keyword);
        domainScore[domain] += 1;
      }
    });
  });

  // 주 도메인 결정
  let detectedDomain: '관광' | '문화예술' | '콘텐츠' | '통계정책' | '종합' = '종합';
  let maxDomainScore = 0;
  (Object.keys(domainScore) as Array<keyof typeof domainScore>).forEach((domain) => {
    if (domainScore[domain] > maxDomainScore) {
      maxDomainScore = domainScore[domain];
      detectedDomain = domain;
    }
  });

  // 3. 의도(Intent) 판별
  let intent: IntentType = 'REPORT_SEARCH';
  let intentLabel = '연구보고서 검색';
  let confidence = 0.88;

  if (
    lowerQuery.includes('통계') ||
    lowerQuery.includes('수치') ||
    lowerQuery.includes('지수') ||
    lowerQuery.includes('얼마') ||
    lowerQuery.includes('명수') ||
    lowerQuery.includes('지출액') ||
    lowerQuery.includes('관람률')
  ) {
    intent = 'STAT_QUERY';
    intentLabel = '통계 및 수치 지표 조회';
    confidence = 0.95;
  } else if (
    lowerQuery.includes('영향') ||
    lowerQuery.includes('효과') ||
    lowerQuery.includes('시사점') ||
    lowerQuery.includes('대응') ||
    lowerQuery.includes('방안') ||
    lowerQuery.includes('전략')
  ) {
    intent = 'POLICY_INSIGHT';
    intentLabel = '정책 효과 및 시사점 분석';
    confidence = 0.93;
  } else if (
    lowerQuery.includes('원장') ||
    lowerQuery.includes('소개') ||
    lowerQuery.includes('연혁') ||
    lowerQuery.includes('조직') ||
    lowerQuery.includes('위치') ||
    lowerQuery.includes('오시는길')
  ) {
    intent = 'GENERAL_QA';
    intentLabel = '기관 및 포털 일반 안내';
    confidence = 0.96;
  } else {
    intent = 'REPORT_SEARCH';
    intentLabel = '연구과제 및 보고서 탐색';
    confidence = 0.91;
  }

  return {
    intent,
    intentLabel,
    confidence,
    extractedKeywords: Array.from(new Set(extractedKeywords)),
    detectedDomain,
    preprocessing: {
      rawQuery: query,
      cleanedQuery,
      removedChars
    }
  };
}
