export interface StatItem {
  id: string;
  category: '생산' | '고용' | '소비' | '여가활동';
  title: string;
  value: string;
  unit: string;
  period: string;
  changeRate: string;
  isPositive: boolean;
  sourceUrl: string;
  description: string;
}

export const KCTI_STATS: StatItem[] = [
  {
    id: 'stat-01',
    category: '생산',
    title: '문화체육관광 생산자물가지수',
    value: '117.2',
    unit: 'p',
    period: '2026년 6월',
    changeRate: '+2.4%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '문화·체육·관광 산업 내 생산자 출하 가격 변동을 종합 측정한 지표'
  },
  {
    id: 'stat-02',
    category: '생산',
    title: '문화체육관광 서비스업생산지수',
    value: '180.4',
    unit: 'p',
    period: '2026년 6월',
    changeRate: '+5.1%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '문화·관광 서비스 분야의 실질 생산 및 부가가치 창출 활동 지수'
  },
  {
    id: 'stat-03',
    category: '생산',
    title: '관광산업주가지수(TS-30)',
    value: '119.9',
    unit: 'p',
    period: '2026년 6월',
    changeRate: '+1.8%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '국내 대표 30개 관광·레저 상장기업의 주가 동향 종합 지수'
  },
  {
    id: 'stat-04',
    category: '고용',
    title: '문화체육관광 종사자수',
    value: '1,065',
    unit: '천명',
    period: '2026년 6월',
    changeRate: '+3.2%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '문화예술, 관광, 콘텐츠 및 체육 관련 산업체 취업자 수 합계'
  },
  {
    id: 'stat-05',
    category: '소비',
    title: '문화·관광·콘텐츠 카드 지출액',
    value: '60,560',
    unit: '억원',
    period: '2026년 7월',
    changeRate: '+7.8%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '개인 신용카드 및 체크카드로 결제된 문화·관광 관련 총 소비액'
  },
  {
    id: 'stat-06',
    category: '소비',
    title: '여행·교통 온라인쇼핑 거래액',
    value: '27,710',
    unit: '억원',
    period: '2026년 6월',
    changeRate: '+12.4%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '항공, 철도, 숙박, 여행패키지 등의 온라인 및 모바일 결제액'
  },
  {
    id: 'stat-07',
    category: '여가활동',
    title: '방한 외래관광객 수',
    value: '1,993,128',
    unit: '명',
    period: '2026년 6월',
    changeRate: '+22.5%',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '한국을 방문한 외국인 입국자 월간 통계 (법무부 출입국 통계 연계)'
  },
  {
    id: 'stat-08',
    category: '여가활동',
    title: '한국여행 만족도',
    value: '96.5',
    unit: '점',
    period: '2025년 기준',
    changeRate: '+1.2점',
    isPositive: true,
    sourceUrl: 'https://data.kcti.re.kr/',
    description: '방한 외래관광객 실태조사 기준 전반적 체류 만족도 (100점 만점)'
  }
];
