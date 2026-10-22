'use client';

import React from 'react';
import Link from 'next/link';
import {
  Landmark, ShieldCheck, ArrowRight, ArrowDown, Database,
  Lock, CheckCircle2, Server, Scale, BookOpen, Layers,
  Cpu, FileSearch, ShieldAlert, FileText, CornerDownLeft,
  Mail, Phone, Building2
} from 'lucide-react';
import GlobalNav from '@/components/GlobalNav';
import styles from './page.module.css';

export default function DatatreeHubPage() {
  return (
    <div className={styles.mainWrapper}>
      {/* 1. 기업 표준 헤더 */}
      <GlobalNav currentDomain="hub" />

      {/* 2. 메인 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <ShieldCheck size={14} />
            <span>중앙부처 산하 공공기관 실증 레퍼런스 보유</span>
          </div>

          <h1 className={styles.heroTitle}>
            감사(Audit) 걱정 없이, 환각 없이 도입하는<br />
            <span className={styles.heroHighlight}>공공·엔터프라이즈 맞춤형 생성형 AI</span>
          </h1>

          <p className={styles.heroDesc}>
            단순한 API 챗봇이 아닙니다. 국가정보원 AI 보안 가이드라인과 공공기관 감사 기준을 충족하며,<br />
            <strong>DMZ 보안 중계 가드레일</strong>과 <strong>팩트 기반 원문 인용</strong>으로 데이터 유출 위험과 허위 답변을 원천 차단합니다.
          </p>

          <div className={styles.heroStatsRow}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>100%</span>
              <span className={styles.statLbl}>보안 컴플라이언스 준수 (ZDR & PII 마스킹)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>0건</span>
              <span className={styles.statLbl}>행정 분쟁 리스크 (규정 기반 룰 엔진)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>96.5%</span>
              <span className={styles.statLbl}>공공 문서 검색 정확도 (Recall@5)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>2대 기관</span>
              <span className={styles.statLbl}>문화체육관광부 · 과기정통부 산하 실증</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 양방향 제로 트러스트 보안 파이프라인 아키텍처 다이어그램 (핵심 보안 신뢰) */}
      <section className={styles.diagramSection}>
        <div className={styles.diagramInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionCategory}>Zero-Trust Dual-Way Security</div>
            <h2 className={styles.sectionTitle}>양방향 DMZ 중계 가드레일 아키텍처</h2>
            <p className={styles.sectionDesc}>
              대국민 채널과 외부 LLM 사이에 독립된 DMZ 보안 중계서버를 배치하여,
              인바운드(질의)와 아웃바운드(응답) 양방향에서 완벽한 데이터 주권과 보안을 보장합니다.
            </p>
          </div>

          <div className={styles.diagramContainer}>
            {/* 상행: 인바운드 보안 통제 흐름 */}
            <div className={styles.flowTrack}>
              <div className={styles.trackHeader}>
                <span className={styles.trackBadgeInbound}>
                  <ArrowRight size={13} />
                  <span>INBOUND FLOW</span>
                </span>
                <span className={styles.trackTitle}>질의 입력 및 프롬프트 보안 처리 과정</span>
              </div>

              <div className={styles.flowRow}>
                {/* 1. 대국민 웹/앱 채널 */}
                <div className={styles.flowCard}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 01</span>
                    <Building2 size={16} className={styles.flowIcon} />
                  </div>
                  <h4 className={styles.flowCardTitle}>대국민 채널 (사용자 입력)</h4>
                  <p className={styles.flowCardDesc}>
                    사용자 자연어 질의 접수 (잠재적 개인정보 및 비정형 프롬프트 포함)
                  </p>
                  <span className={styles.securityTag}>TLS 1.3 암호화</span>
                </div>

                <div className={styles.flowArrow}>
                  <ArrowRight size={20} />
                </div>

                {/* 2. 내부망 RAG 지식 검색 */}
                <div className={styles.flowCard}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 02</span>
                    <FileSearch size={16} className={styles.flowIcon} />
                  </div>
                  <h4 className={styles.flowCardTitle}>내부망 RAG 지식 검색</h4>
                  <p className={styles.flowCardDesc}>
                    폐쇄망 온프레미스 벡터 DB에서 공공 법령·보고서 발췌문 검색 및 프롬프트 조립
                  </p>
                  <span className={styles.securityTag}>3072차원 HNSW</span>
                </div>

                <div className={styles.flowArrow}>
                  <ArrowRight size={20} />
                </div>

                {/* 3. DMZ 보안 중계서버 (인바운드) */}
                <div className={`${styles.flowCard} ${styles.flowCardDmz}`}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 03 (핵심)</span>
                    <Lock size={16} color="#0284c7" />
                  </div>
                  <h4 className={styles.flowCardTitle} style={{ color: '#004b93' }}>DMZ 중계서버 (인바운드 가드레일)</h4>
                  <p className={styles.flowCardDesc}>
                    ① 인메모리 PII 실시간 마스킹 (전화번호·주민번호·계좌)<br />
                    ② 프롬프트 인젝션 및 시스템 탈옥 공격 원천 차단
                  </p>
                  <span className={styles.securityTag} style={{ background: '#e0f2fe', color: '#004b93' }}>국정원 AI보안기준</span>
                </div>

                <div className={styles.flowArrow}>
                  <ArrowRight size={20} />
                </div>

                {/* 4. 외부 LLM */}
                <div className={`${styles.flowCard} ${styles.flowCardLlm}`}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 04</span>
                    <Cpu size={16} color="#854d0e" />
                  </div>
                  <h4 className={styles.flowCardTitle}>외부 LLM 모델</h4>
                  <p className={styles.flowCardDesc}>
                    비식별 마스킹된 프롬프트만 연계 처리 (외부 모델 재학습 원천 차단)
                  </p>
                  <span className={styles.securityTag} style={{ background: '#fef08a', color: '#854d0e' }}>Zero Data Retention</span>
                </div>
              </div>
            </div>

            <div className={styles.diagramDivider}></div>

            {/* 하행: 아웃바운드 검증 및 감사 로그 흐름 */}
            <div className={styles.flowTrack}>
              <div className={styles.trackHeader}>
                <span className={styles.trackBadgeOutbound}>
                  <CornerDownLeft size={13} />
                  <span>OUTBOUND FLOW</span>
                </span>
                <span className={styles.trackTitle}>응답 검증 및 보안 감사 로깅 반환 과정</span>
              </div>

              <div className={styles.flowRow}>
                {/* 1. 외부 LLM 응답 */}
                <div className={`${styles.flowCard} ${styles.flowCardLlm}`}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 05</span>
                    <Cpu size={16} color="#854d0e" />
                  </div>
                  <h4 className={styles.flowCardTitle}>외부 LLM 응답 수신</h4>
                  <p className={styles.flowCardDesc}>
                    생성된 답변 텍스트 수신 (처리 완료 즉시 클라우드 디스크 저장 0 Byte 파기)
                  </p>
                  <span className={styles.securityTag} style={{ background: '#fef08a', color: '#854d0e' }}>RAM 상에서만 전달</span>
                </div>

                <div className={styles.flowArrow}>
                  <ArrowRight size={20} />
                </div>

                {/* 2. DMZ 보안 중계서버 (아웃바운드) */}
                <div className={`${styles.flowCard} ${styles.flowCardDmz}`}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 06 (핵심)</span>
                    <ShieldAlert size={16} color="#059669" />
                  </div>
                  <h4 className={styles.flowCardTitle} style={{ color: '#047857' }}>DMZ 중계서버 (아웃바운드 가드레일)</h4>
                  <p className={styles.flowCardDesc}>
                    ① 기밀정보·비인가 스크립트 유출 여부 정밀 필터링<br />
                    ② 침해사고 대응용 1년 무결성 암호화 감사 로그 보관
                  </p>
                  <span className={styles.securityTagGreen}>SER-001 암호화 로깅</span>
                </div>

                <div className={styles.flowArrow}>
                  <ArrowRight size={20} />
                </div>

                {/* 3. RAG 팩트그라운딩 검증 */}
                <div className={styles.flowCard}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 07</span>
                    <Scale size={16} className={styles.flowIcon} />
                  </div>
                  <h4 className={styles.flowCardTitle}>팩트그라운딩 합성</h4>
                  <p className={styles.flowCardDesc}>
                    답변 근거 원문 각주([1]) 및 유효 법조문·문서 레퍼런스 메타데이터 결합
                  </p>
                  <span className={styles.securityTag}>환각 검증 통과</span>
                </div>

                <div className={styles.flowArrow}>
                  <ArrowRight size={20} />
                </div>

                {/* 4. 대국민 채널 반환 */}
                <div className={styles.flowCard}>
                  <div className={styles.flowCardHeader}>
                    <span className={styles.stepNum}>STEP 08</span>
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <h4 className={styles.flowCardTitle}>대국민 채널 (신뢰 응답 표출)</h4>
                  <p className={styles.flowCardDesc}>
                    검증 완료된 정답과 공식 출처 열람 기능이 포함된 안전한 답변 제공
                  </p>
                  <span className={styles.securityTagGreen}>대국민 서비스 안심 표출</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 'Why DATATREE' 3대 신뢰 가치 */}
      <section className={styles.valueSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Core Value</div>
          <h2 className={styles.sectionTitle}>왜 공공기관은 데이터트리를 선택하는가</h2>
          <p className={styles.sectionDesc}>도입 결정권자의 불안 요소를 사전에 제거하는 3대 검증 기준</p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <Lock size={22} />
            </div>
            <h3 className={styles.valueTitle}>감사에 완벽 대응하는 보안 체계</h3>
            <p className={styles.valueDesc}>
              국가정보원 보안 가이드북(SER-001~009)을 100% 충족합니다. 
              디스크에 개인정보가 전혀 남지 않는 Zero Data Retention과 
              인메모리 PII 마스킹, 1년 암호화 감사 로그로 사후 보안 감사 지적을 원천 차단합니다.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <Scale size={22} />
            </div>
            <h3 className={styles.valueTitle}>환각(거짓말) 없는 팩트 그라운딩</h3>
            <p className={styles.valueDesc}>
              AI가 임의로 그럴듯하게 지어내는 환각 현상을 방지합니다. 
              오직 기관 내부의 승인된 법령과 발간 보고서 원문만을 근거로 추출하며, 
              모든 답변 문장 뒤에 원문 페이지와 각주([1])를 자동 표기합니다.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <ShieldCheck size={22} />
            </div>
            <h3 className={styles.valueTitle}>분쟁 없는 하이브리드 아키텍처</h3>
            <p className={styles.valueDesc}>
              법적 효력이나 과태료, 이용정지 등 민감한 행정 처리는 확률형 AI에 맡기지 않습니다. 
              100% 동일한 결과를 산출하는 정형화된 규칙 엔진(Rule Engine)과 결합하여 대국민 민원 분쟁을 예방합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 공공 도메인 구축 레퍼런스 쇼케이스 */}
      <section className={styles.showcaseSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>Proven References</div>
          <h2 className={styles.sectionTitle}>검증된 공공부문 구축 레퍼런스</h2>
          <p className={styles.sectionDesc}>실제 과업지시서와 제안요청서(RFP) 요구 규격을 100% 충족한 실증 사례를 직접 확인해 보세요.</p>
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
              수천 건의 문화·관광·콘텐츠 정책 보고서와 실시간 통계를 3072차원 고밀도 벡터로 색인하여, 
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
              <span>한국문화관광연구원 서비스 체험하기</span>
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
              <span>불법스팸대응센터 서비스 체험하기</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. 도입 문의 및 제안서 요청 섹션 (#contact) */}
      <section className={styles.contactSection} id="contact">
        <div className={styles.contactInner}>
          <div className={styles.contactBadge}>Enterprise Consultation</div>
          <h2 className={styles.contactTitle}>공공기관 맞춤형 AI RAG 도입 상담</h2>
          <p className={styles.contactDesc}>
            기관의 폐쇄망, 온프레미스 인프라 환경 및 보안 심사 기준에 맞추어<br />
            실제 제안서 규격과 PoC(개념검증) 구현 방안을 전문 엔지니어가 직접 상담해 드립니다.
          </p>

          <div className={styles.contactBox}>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>솔루션 도입 및 제안 문의</span>
              <span className={styles.contactValue}>contact@datatree.kr</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>기술 지원 및 PoC 상담</span>
              <span className={styles.contactValue}>02-555-1234</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>구축 지원 범위</span>
              <span className={styles.contactValue}>온프레미스 폐쇄망 · 프라이빗 클라우드</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 기업 메인 푸터 */}
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
              공공 레퍼런스 RAG 아키텍처 실증 완료
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
