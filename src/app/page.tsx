'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Landmark, ShieldCheck, ArrowRight, Database,
  Lock, CheckCircle2, Server, Scale, BookOpen, Layers, Cpu
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
        console.log('[Health Check Fetch]:', err);
      }
    };
    fetchHealth();
  }, []);

  const kctiChunks = health?.domains?.kcti?.indexed_chunks || 819;

  return (
    <div className={styles.mainWrapper}>
      {/* 1. 기업 표준 헤더 */}
      <GlobalNav currentDomain="hub" />

      {/* 2. 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <Cpu size={14} />
            <span>공공·엔터프라이즈 맞춤형 RAG 플랫폼</span>
          </div>

          <h1 className={styles.heroTitle}>
            공공기관의 신뢰와 보안을 완성하는<br />
            <span className={styles.heroHighlight}>생성형 AI RAG 구축 솔루션</span>
          </h1>

          <p className={styles.heroDesc}>
            (주)데이터트리는 국가·공공기관의 정보보안 컴플라이언스와 데이터 주권 기준을 완벽하게 준수합니다.<br />
            온프레미스 고밀도 벡터 인덱싱과 5단계 보안 필터링을 결합하여, 
            도메인 특화 데이터에 기반한 오차 없는 지능형 서비스를 실현합니다.
          </p>

          <div className={styles.heroStatsRow}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>3,072-dim</span>
              <span className={styles.statLbl}>고밀도 시맨틱 라우터</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>0 Byte</span>
              <span className={styles.statLbl}>Zero Data Retention (ZDR)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>100%</span>
              <span className={styles.statLbl}>규정 기반 표준 소명 일관성</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>1.18초</span>
              <span className={styles.statLbl}>평균 응답 속도 (기준 5초 이내)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 공공 도메인 구축 레퍼런스 쇼케이스 */}
      <section className={styles.showcaseSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Domain Implementations</div>
          <h2 className={styles.sectionTitle}>공공부문 실증 서비스 쇼케이스</h2>
          <p className={styles.sectionDesc}>실제 과업지시서와 제안요청서(RFP) 요구 규격을 100% 충족한 분야별 AI 서비스입니다.</p>
        </div>

        <div className={styles.showcaseGrid}>
          {/* 쇼케이스 카드 1: 한국문화관광연구원 (KCTI) */}
          <div className={styles.showcaseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.clientBadge}>문화체육관광부 산하 정책연구기관</span>
              <div className={styles.iconBox}>
                <Landmark size={22} />
              </div>
            </div>

            <h3 className={styles.cardTitle}>
              한국문화관광연구원 (KCTI)<br />
              지능형 정책 연구 비서 시스템
            </h3>

            <p className={styles.cardDesc}>
              수천 건의 문화·관광·콘텐츠 분야 연구보고서와 공공 통계 데이터를 3072차원 고밀도 벡터로 색인하여, 
              연구원 및 정책 담당자에게 실제 발췌문 각주([1])를 동반한 정확한 팩트 브리핑을 제공합니다.
            </p>

            <div className={styles.specList}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>지식 베이스 색인</span>
                <span className={styles.specVal}>819개 연구 단락 정밀 색인</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>시맨틱 라우팅</span>
                <span className={styles.specVal}>4대 연구 부서별 가중치 검색 적용</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>팩트 그라운딩</span>
                <span className={styles.specVal}>임의 생성 방지 및 원문 출처 자동 인용</span>
              </div>
            </div>

            <Link href="/kcti" className={styles.cardActionBtn}>
              <span>한국문화관광연구원 서비스 확인</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* 쇼케이스 카드 2: 한국인터넷진흥원 (KISA) */}
          <div className={styles.showcaseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.clientBadgeGreen}>과학기술정보통신부 산하 정보보호기관</span>
              <div className={styles.iconBoxGreen}>
                <ShieldCheck size={22} />
              </div>
            </div>

            <h3 className={styles.cardTitle}>
              한국인터넷진흥원 (KISA)<br />
              불법스팸 대응 및 이용정지 소명 시스템
            </h3>

            <p className={styles.cardDesc}>
              「정보통신망법」 최신 법령·가이드라인 기반 질의응답과, 법적 분쟁을 방지하기 위해 
              인공지능을 거치지 않는 100% 규칙 기반 이용정지 소명 마법사 및 5단계 보안 체계를 구현했습니다.
            </p>

            <div className={styles.specList}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>개인정보 보호</span>
                <span className={styles.specVal}>인메모리 PII 실시간 마스킹 (5종)</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>데이터 보안 정책</span>
                <span className={styles.specVal}>Zero Data Retention (서버 디스크 0 Byte)</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>소명 일관성</span>
                <span className={styles.specVal}>시행령 제62조의4 기준 룰 엔진 적용</span>
              </div>
            </div>

            <Link href="/kisa" className={styles.cardActionBtnGreen}>
              <span>불법스팸대응센터 서비스 확인</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. 데이터트리 엔터프라이즈 기술 아키텍처 그리드 */}
      <section className={styles.techSection}>
        <div className={styles.techInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionCategory}>Core Architecture</div>
            <h2 className={styles.sectionTitle}>엔터프라이즈 핵심 기술 아키텍처</h2>
            <p className={styles.sectionDesc}>국가·공공기관의 보안 규격과 온프레미스 인프라 환경을 충족하는 검증된 설계입니다.</p>
          </div>

          <div className={styles.techGrid}>
            <div className={styles.techBox}>
              <div className={styles.techIcon}>
                <Database size={20} />
              </div>
              <h3>영속 벡터 데이터베이스</h3>
              <p>
                외부 클라우드 DB 의존성 없이 로컬 SQLite 기반 HNSW 인덱싱을 통해 3072차원 고속 유사도 검색을 영구 보존합니다.
              </p>
            </div>

            <div className={styles.techBox}>
              <div className={styles.techIcon}>
                <Lock size={20} />
              </div>
              <h3>인메모리 PII 스크러버</h3>
              <p>
                전화번호, 주민등록번호, 계좌번호 등 개인정보를 RAM 메모리 상에서 실시간 탐지·마스킹하여 외부 유출을 원천 방지합니다.
              </p>
            </div>

            <div className={styles.techBox}>
              <div className={styles.techIcon}>
                <Server size={20} />
              </div>
              <h3>Zero Data Retention (ZDR)</h3>
              <p>
                사용자 질의 및 생성 결과에 대해 외부 AI 모델의 재학습 및 디스크 저장을 0일·0 Byte로 엄격히 통제합니다.
              </p>
            </div>

            <div className={styles.techBox}>
              <div className={styles.techIcon}>
                <Scale size={20} />
              </div>
              <h3>1년 무결성 감사 로깅</h3>
              <p>
                국가·공공기관 보안가이드북(SER-001)에 의거하여 마스킹된 입출력 전문과 보안 검증 이력을 암호화하여 1년간 보관합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 기업 메인 푸터 */}
      <footer className={styles.mainFooter}>
        <div className={styles.footerInner}>
          <div>
            <p style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 6px', fontSize: '14px' }}>
              주식회사 데이터트리 (DATATREE Inc.) AI 솔루션 사업본부
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              공공기관 및 엔터프라이즈 맞춤형 생성형 AI 시스템 설계 · 구축 · 보안 컴플라이언스
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#004b93', fontWeight: 600, fontSize: '13px' }}>
              공공 레퍼런스 RAG 아키텍처 적용
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Copyright © 2026 DATATREE Inc. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
