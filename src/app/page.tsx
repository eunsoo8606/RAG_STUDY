'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, Landmark, ShieldCheck, ArrowRight, Database,
  Lock, Zap, CheckCircle2, Server, Scale, BookOpen, Layers
} from 'lucide-react';
import GlobalNav from '@/components/GlobalNav';
import styles from './page.module.css';

interface HealthData {
  status: string;
  platform: string;
  domains?: {
    kcti?: { service: string; indexed_chunks: number };
    kisa?: { service: string; indexed_chunks: number };
  };
}

export default function DatatreeHubPage() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? `${window.location.protocol}//${window.location.hostname}:8002`
          : 'http://localhost:8000';

        const res = await fetch(`${baseUrl}/health`);
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.log('[Health Fetch Warning]:', err);
      }
    };
    fetchHealth();
  }, []);

  const kctiChunks = health?.domains?.kcti?.indexed_chunks || 819;
  const kisaChunks = health?.domains?.kisa?.indexed_chunks || 7;

  return (
    <div className={styles.mainWrapper}>
      {/* 1. 데이터트리 통합 글로벌 네비게이션 */}
      <GlobalNav currentDomain="hub" />

      {/* 2. 메인 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>대한민국 공공·엔터프라이즈 특화 AI RAG 통합 플랫폼</span>
          </div>

          <h1 className={styles.heroTitle}>
            신뢰와 보안이 검증된<br />
            <span className={styles.heroHighlight}>공공 맞춤형 생성형 AI RAG</span> 솔루션
          </h1>

          <p className={styles.heroDesc}>
            (주)데이터트리는 대한민국 공공기관의 엄격한 보안 규정과 데이터 주권을 완벽히 준수합니다.<br />
            <strong>3072차원 고밀도 시맨틱 라우터</strong>와 <strong>5중 보안 파이프라인</strong>을 기반으로, 
            각 공공 도메인에 최적화된 고신뢰 AI 서비스를 제공합니다.
          </p>

          <div className={styles.heroStatsRow}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>3,072</span>
              <span className={styles.statLbl}>고밀도 임베딩 차원수</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>0 Byte</span>
              <span className={styles.statLbl}>Zero Data Retention (ZDR)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>100%</span>
              <span className={styles.statLbl}>룰 기반 소명 일관성</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>1.18s</span>
              <span className={styles.statLbl}>평균 응답 지연 (기준 5s 이내)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 핵심 2대 공공 도메인 쇼케이스 카드 그리드 */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseGrid}>
          {/* 쇼케이스 카드 1: 한국문화관광연구원 (KCTI) */}
          <div className={styles.showcaseCard}>
            <div className={styles.cardGlowBlue}></div>
            <div className={styles.cardHeader}>
              <span className={styles.tagBadgeBlue}>🏛️ 국가 연구성과 데이터베이스</span>
              <div className={styles.iconWrapperBlue}>
                <Landmark size={24} />
              </div>
            </div>

            <h2 className={styles.cardTitle}>
              한국문화관광연구원 (KCTI)<br />
              지능형 AI 연구 비서
            </h2>

            <p className={styles.cardDesc}>
              수천 건의 문화·관광·콘텐츠 정책 보고서와 실시간 국가 통계를 3072차원 벡터로 색인하여, 
              부서별 맞춤 큐레이션 및 팩트 기반 출처 인용(각주 [1]) 브리핑을 제공하는 공공 연구 RAG입니다.
            </p>

            <div className={styles.specChips}>
              <span className={styles.specChip}>📚 <strong>{kctiChunks}개</strong> 연구단락 색인</span>
              <span className={styles.specChip}>🎯 3072차원 시맨틱 라우터</span>
              <span className={styles.specChip}>🏢 4대 부서별 가중치 검색</span>
              <span className={styles.specChip}>📝 원문 각주 팩트그라운딩</span>
            </div>

            <Link href="/kcti" className={styles.cardActionBtnBlue}>
              <span>KCTI 전용 포털 및 AI 연구비서 체험하기</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* 쇼케이스 카드 2: KISA 불법스팸대응센터 */}
          <div className={styles.showcaseCard}>
            <div className={styles.cardGlowGreen}></div>
            <div className={styles.cardHeader}>
              <span className={styles.tagBadgeGreen}>🛡️ 사이버보안 5중 가드레일</span>
              <div className={styles.iconWrapperGreen}>
                <ShieldCheck size={24} />
              </div>
            </div>

            <h2 className={styles.cardTitle}>
              한국인터넷진흥원 (KISA)<br />
              불법스팸대응센터 AI 챗봇
            </h2>

            <p className={styles.cardDesc}>
              「정보통신망법」 2026 최신 가이드라인 RAG와 법적 분쟁을 원천 차단하는 100% 규칙 기반 
              이용정지 소명 마법사, 인메모리 PII 실시간 마스킹 및 ZDR을 탑재한 보안 특화 챗봇입니다.
            </p>

            <div className={styles.specChips}>
              <span className={styles.specChip}>🛡️ 인메모리 PII 마스킹 (5종)</span>
              <span className={styles.specChip}>⚖️ 정보통신망법 최신 법령 RAG</span>
              <span className={styles.specChip}>⚡ 100% 룰 기반 소명 위저드</span>
              <span className={styles.specChip}>🔒 ZDR 디스크 미저장 (0 Byte)</span>
            </div>

            <Link href="/kisa" className={styles.cardActionBtnGreen}>
              <span>KISA 스팸대응 포털 및 챗봇 체험하기</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. 데이터트리 공통 기술 및 보안 아키텍처 그리드 */}
      <section className={styles.techSection} id="tech-stack">
        <div className={styles.sectionHeader}>
          <h2>공공·엔터프라이즈 4대 핵심 기술 축</h2>
          <p>고객사의 시스템 환경에 유연하게 대응하는 영속 온프레미스 및 제로 트러스트 아키텍처</p>
        </div>

        <div className={styles.techGrid}>
          <div className={styles.techBox}>
            <div className={styles.techIcon}>
              <Database size={22} />
            </div>
            <h3>영속 Chroma 벡터 스토어</h3>
            <p>
              외부 Oracle/Cloud DB 의존성 없는 로컬 SQLite + HNSW 인덱싱 기반 3072차원 고속 유사도 검색을 영구 보존합니다.
            </p>
          </div>

          <div className={styles.techBox}>
            <div className={styles.techIcon}>
              <Lock size={22} />
            </div>
            <h3>인메모리 PII 스크러버</h3>
            <p>
              전화번호, 주민등록번호, 계좌번호 등 5종 개인정보를 RAM 메모리 상에서 실시간 탐지·마스킹하여 외부 유출을 원천 차단합니다.
            </p>
          </div>

          <div className={styles.techBox}>
            <div className={styles.techIcon}>
              <Zap size={22} />
            </div>
            <h3>Zero Data Retention (ZDR)</h3>
            <p>
              입출력 프롬프트의 외부 AI 모델 재학습 및 클라우드 디스크 저장을 0일·0 Byte로 엄격히 통제하여 데이터 주권을 수호합니다.
            </p>
          </div>

          <div className={styles.techBox}>
            <div className={styles.techIcon}>
              <Scale size={22} />
            </div>
            <h3>1년 무결성 감사 로깅</h3>
            <p>
              국가·공공기관 보안가이드북(SER-001)에 의거하여 마스킹된 입출력 전문과 보안 검증 이력을 1년간 안전하게 암호화 보관합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 메인 푸터 */}
      <footer className={styles.mainFooter}>
        <div className={styles.footerInner}>
          <div>
            <p style={{ fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
              주식회사 데이터트리 (DATATREE Inc.) AI RAG 솔루션 사업본부
            </p>
            <p style={{ margin: 0, fontSize: '12px' }}>
              공공기관 및 엔터프라이즈 맞춤형 생성형 AI 시스템 기획 · 개발 · 보안 컴플라이언스 컨설팅
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '12px' }}>
              Dual RAG Engine (KCTI & KISA) Active
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              Copyright © 2026 DATATREE Inc. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
