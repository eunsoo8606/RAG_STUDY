'use client';

import React from 'react';
import Link from 'next/link';
import {
  Landmark, ShieldCheck, ArrowRight, Database,
  Lock, CheckCircle2, Server, Scale, BookOpen, Layers,
  Cpu, FileSearch, ShieldAlert, FileText, CornerDownLeft,
  XCircle, AlertTriangle, CheckCircle, HelpCircle, Building2
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
            <HelpCircle size={14} />
            <span>공공기관 생성형 AI 도입의 현실적 한계 해결</span>
          </div>

          <h1 className={styles.heroTitle}>
            자체 LLM 구축 예산은 부족하고,<br />
            <span className={styles.heroHighlight}>외부 LLM은 보안 감사가 두려우십니까?</span>
          </h1>

          <p className={styles.heroDesc}>
            수억 원대 고가 GPU 인프라 투자 없이도, <strong>DMZ 양방향 보안 중계 가드레일(ZDR & PII 마스킹)</strong>을 통해<br />
            합리적인 예산 내에서 최신 상용 LLM을 국가정보원 보안 기준에 맞춰 안전하게 도입할 수 있습니다.
          </p>

          <div className={styles.heroStatsRow}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>0원</span>
              <span className={styles.statLbl}>별도 고가 GPU 서버 구매 비용</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>100%</span>
              <span className={styles.statLbl}>국정원 보안가이드라인(SER-001~009) 충족</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>0 Byte</span>
              <span className={styles.statLbl}>Zero Data Retention (디스크 미저장)</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>실제 RFP</span>
              <span className={styles.statLbl}>공공기관 과업지시서 기반 실증 프로토타입</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 현실적 딜레마 섹션 (The Public AI Dilemma) */}
      <section className={styles.dilemmaSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>The Public AI Dilemma</div>
          <h2 className={styles.sectionTitle}>공공기관이 직면한 AI 도입의 3가지 현실</h2>
          <p className={styles.sectionDesc}>
            많은 공공기관이 생성형 AI 도입을 검토하다가 번번이 예산 한계와 보안 규제 장벽에 가로막힙니다.
          </p>
        </div>

        <div className={styles.dilemmaGrid}>
          {/* 한계 1: 자체 LLM 구축 */}
          <div className={styles.dilemmaCardLimit}>
            <span className={styles.dilemmaBadgeRed}>한계 1. 자체 온프레미스 LLM</span>
            <h3 className={styles.dilemmaTitle}>수억 원대 GPU 인프라 예산 장벽</h3>
            <ul className={styles.dilemmaPoints}>
              <li className={styles.dilemmaPointItem}>
                <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>H100/A100 고가 GPU 서버 도입비만 수억~십수억 원 소요</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>공공기관 일반 용역 예산(수천만~1억 원대)으로는 도입 불가</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>무리한 경량 모델(sLLM) 채택 시 한국어 답변 품질 급락</span>
              </li>
            </ul>
          </div>

          {/* 한계 2: 외부 LLM 단순 연동 */}
          <div className={styles.dilemmaCardRisk}>
            <span className={styles.dilemmaBadgeOrange}>한계 2. 상용 외부 LLM 단순 연동</span>
            <h3 className={styles.dilemmaTitle}>개인정보 유출 및 보안 감사 지적</h3>
            <ul className={styles.dilemmaPoints}>
              <li className={styles.dilemmaPointItem}>
                <AlertTriangle size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>대국민 질의에 포함된 전화번호, 계좌, 주민번호 외부 유출 위험</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <AlertTriangle size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>클라우드 제공자의 프롬프트 재학습 위험으로 데이터 주권 상실</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <AlertTriangle size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>국가정보원 보안성 검토 및 감사원 지적으로 사업 전면 중단 리스크</span>
              </li>
            </ul>
          </div>

          {/* 해답: 데이터트리 모델 */}
          <div className={styles.dilemmaCardSolution}>
            <span className={styles.dilemmaBadgeGreen}>해답. 데이터트리 DMZ 가드레일</span>
            <h3 className={styles.dilemmaTitle} style={{ color: '#15803d' }}>저비용 고성능 + 무결점 공공 보안</h3>
            <ul className={styles.dilemmaPoints}>
              <li className={styles.dilemmaPointItem}>
                <CheckCircle size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>GPU 서버 구매 0원</strong>: 합리적인 소프트웨어 구축 예산 내 완료</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <CheckCircle size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>인메모리 PII 마스킹</strong>: 민감 개인정보 외부 반출 원천 차단</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <CheckCircle size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Zero Data Retention</strong>: 서버 디스크 미저장(0 Byte) 및 재학습 방지</span>
              </li>
              <li className={styles.dilemmaPointItem}>
                <CheckCircle size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>1년 암호화 감사 로깅</strong>: 국가정보원 AI 보안 가이드라인 100% 충족</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. 양방향 제로 트러스트 보안 파이프라인 아키텍처 다이어그램 */}
      <section className={styles.diagramSection}>
        <div className={styles.diagramInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionCategory}>The Datatree Architecture</div>
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
                    <span className={styles.stepNum}>STEP 03 (핵심 보안)</span>
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
                    <span className={styles.stepNum}>STEP 06 (감사 대응)</span>
                    <ShieldAlert size={16} color="#059669" />
                  </div>
                  <h4 className={styles.flowCardTitle} style={{ color: '#047857' }}>DMZ 중계서버 (아웃바운드 가드레일)</h4>
                  <p className={styles.flowCardDesc}>
                    ① 기밀정보·비인가 스크립트 유출 여부 정밀 필터링<br />
                    ② 침해사고 대응용 1년 무결성 암호화 감사 로그 보관
                  </p>
                  <span className={styles.securityTagGreen}>국정원 규격 암호화 로깅</span>
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

      {/* 5. 실제 공공기관 도입 실증 프로토타입 쇼케이스 */}
      <section className={styles.showcaseSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionCategory}>AI PoC Showcase</div>
          <h2 className={styles.sectionTitle}>공공기관 지능형 AI 실증 프로토타입</h2>
          <p className={styles.sectionDesc}>
            실제 공공기관의 업무 기준과 보안 규격을 정밀 분석하여,<br />
            실제 구축 시 발생할 수 있는 모든 기술적·보안적 쟁점을 사전 검증하기 위해 직접 개발한 동작 모델입니다.
          </p>
        </div>

        <div className={styles.showcaseGrid}>
          {/* 쇼케이스 카드 1: 한국문화관광연구원 (KCTI) 실증 모델 */}
          <div className={styles.showcaseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.clientBadge}>KCTI 정책 연구 비서 검증 PoC</span>
              <div className={styles.iconBox}>
                <Landmark size={22} />
              </div>
            </div>

            <h3 className={styles.cardTitle}>
              한국문화관광연구원 (KCTI)<br />
              지능형 정책 연구 비서 실증 모델
            </h3>

            <p className={styles.cardDesc}>
              수천 권의 방대한 정책 연구보고서에서 외부 LLM을 활용하되 환각을 방지하고 보안성을 입증하기 위해,
              819개 실제 연구단락을 3072차원 시맨틱 라우터로 색인하고 원문 각주([1]) 표출을 실증했습니다.
            </p>

            <div className={styles.specList}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>업무 규격 대응</span>
                <span className={styles.specVal}>연구보고서 RAG 분석 요건 100% 충족</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>시맨틱 라우팅</span>
                <span className={styles.specVal}>3072차원 고밀도 부서별 가중치 검색</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>팩트 그라운딩</span>
                <span className={styles.specVal}>오직 원문 기반 각주([1]) 출처 표기</span>
              </div>
            </div>

            <Link href="/kcti" className={styles.cardActionBtn}>
              <span>KCTI 실증 프로토타입 체험하기</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* 쇼케이스 카드 2: 한국인터넷진흥원 (KISA) 실증 모델 */}
          <div className={styles.showcaseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.clientBadgeGreen}>KISA 보안가이드라인 검증 PoC</span>
              <div className={styles.iconBoxGreen}>
                <ShieldCheck size={22} />
              </div>
            </div>

            <h3 className={styles.cardTitle}>
              한국인터넷진흥원 (KISA)<br />
              불법스팸 대응 및 소명 마법사 실증 모델
            </h3>

            <p className={styles.cardDesc}>
              국가정보원 AI 보안 가이드라인 준수를 입증하기 위해, 인메모리 PII 실시간 마스킹과
              분쟁 원천 차단을 위한 100% 규칙 기반(시행령 제62조의4) 소명 위저드를 구현한 실증 모델입니다.
            </p>

            <div className={styles.specList}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>보안 요건 충족</span>
                <span className={styles.specVal}>국가정보원 AI 보안 가이드라인 100% 준수</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>개인정보 통제</span>
                <span className={styles.specVal}>인메모리 PII 실시간 마스킹 (5종)</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>행정 일관성</span>
                <span className={styles.specVal}>LLM 미경유 100% 룰 기반 표준 소명</span>
              </div>
            </div>

            <Link href="/kisa" className={styles.cardActionBtnGreen}>
              <span>KISA 실증 프로토타입 체험하기</span>
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
              공공 RFP 규격 실증 검증 완료
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
