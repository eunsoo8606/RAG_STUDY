'use client';

import React, { useState } from 'react';
import { 
  Search, Globe, ArrowRight, TrendingUp, Users, CreditCard, 
  BookOpen, Sparkles, Building, Calendar, FileText, ChevronRight 
} from 'lucide-react';
import { KCTI_REPORTS, KctiReport } from '@/data/kctiReports';
import { KCTI_STATS } from '@/data/kctiStats';
import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | '관광' | '문화예술' | '콘텐츠'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredReports = KCTI_REPORTS.filter((rep) => {
    const matchTab = activeTab === 'all' || rep.category === activeTab;
    const matchSearch = searchKeyword === '' || 
      rep.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      rep.keywords.some((k) => k.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchTab && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      {/* 1. 대한민국 공식 전자정부 배너 */}
      <div className="gov-banner">
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>🇰🇷</span>
          <span>이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
        </div>
      </div>

      {/* 2. 메인 헤더 */}
      <header className="kcti-header">
        <div className="header-inner">
          <a href="/" className="logo-group">
            <div className="logo-badge">KCTI</div>
            <div className="logo-text">
              <h1>한국문화관광연구원</h1>
              <p>Korea Culture & Tourism Institute</p>
            </div>
          </a>

          <nav>
            <ul className="gnb-nav">
              <li><a href="#reports" className="active">KCTI 발간물</a></li>
              <li><a href="#stats">KCTI Data</a></li>
              <li><a href="#news">KCTI 소식</a></li>
              <li><a href="#about">연구원 소개</a></li>
              <li><a href="#open">열린마당</a></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="header-search-btn">
              <Search size={15} />
              <span>Keyword Search</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
              <Globe size={15} />
              <span>KR</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. 히어로 비주얼 섹션 */}
      <section className="hero-section">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>2026 문화·관광·콘텐츠 핵심 정책 아젠다</span>
            </div>
            <h2 className="hero-title">
              미래를 선도하는<br />
              문화·관광·콘텐츠 싱크탱크
            </h2>
            <p className="hero-desc">
              한국문화관광연구원은 국민의 삶의 질 향상과 국가 소프트파워 혁신을 위해<br />
              과학적 데이터와 현장 중심의 심층 연구로 국가 정책을 뒷받침합니다.
            </p>
            <button 
              className="hero-cta-btn"
              onClick={() => {
                const launcher = document.querySelector('.launcher-btn') as HTMLButtonElement;
                if (launcher) launcher.click();
              }}
            >
              <Sparkles size={18} />
              <span>AI 연구비서로 보고서 탐색하기</span>
            </button>
          </div>

          {/* 히어로 우측 하이라이트 연구보고서 */}
          <div className="hero-card">
            <div className="hero-card-tag">LATEST RESEARCH</div>
            <h3 className="hero-card-title">한-일 주요 인바운드 시장의 국가별 비교 분석</h3>
            <p className="hero-card-summary">
              방한 외국인 관광객 3천만 달성을 위한 핵심 경쟁력 분석과 체류 일수 증대,
              수도권 편중 완화형 광역 관광벨트 구축을 위한 정책 제언
            </p>
            <div className="hero-card-footer">
              <span>관광정책연구실 · 2026.01.22</span>
              <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                RAG 연계 완료 <ChevronRight size={15} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KCTI Data 핵심 지표 카드 그리드 */}
      <section className="stats-section" id="stats">
        <div className="stats-grid">
          {KCTI_STATS.slice(0, 4).map((st) => (
            <div key={st.id} className="stat-box">
              <div className="stat-top">
                <span className="stat-cat">{st.category}</span>
                <span className="stat-period">{st.period}</span>
              </div>
              <div className="stat-title" title={st.title}>{st.title}</div>
              <div className="stat-value-group">
                <span className="stat-val">{st.value}</span>
                <span className="stat-unit">{st.unit}</span>
                <span className="stat-rate">{st.changeRate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 연구보고서 발간물 섹션 */}
      <main className="content-section" id="reports">
        <div className="section-header">
          <div>
            <h2>KCTI 핵심 연구보고서</h2>
            <p>공공 연구성과 데이터베이스에 등록된 최신 정책 보고서입니다.</p>
          </div>

          {/* 카테고리 필터 탭 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', '관광', '문화예술', '콘텐츠'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#003366' : '#ffffff',
                  color: activeTab === tab ? '#ffffff' : '#64748b',
                  border: '1px solid',
                  borderColor: activeTab === tab ? '#003366' : '#cbd5e1',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab === 'all' ? '전체 보기' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* 보고서 카드 목록 */}
        <div className="reports-grid">
          {filteredReports.map((rep) => (
            <div key={rep.id} className="report-card-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="report-cat-badge">{rep.category}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>다운로드 {rep.downloadCount.toLocaleString()}</span>
              </div>
              <h3 className="report-card-title">{rep.title}</h3>
              <p className="report-card-desc">{rep.summary}</p>
              <div className="report-card-meta">
                <span>{rep.department}</span>
                <span>{rep.publishDate}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 6. 공공기관 표준 푸터 */}
      <footer className="kcti-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <ul className="footer-links">
              <li><a href="#">개인정보처리방침</a></li>
              <li><a href="#">이용약관</a></li>
              <li><a href="#">이메일무단수집거부</a></li>
              <li><a href="#">경영공시</a></li>
              <li><a href="#">오시는길</a></li>
            </ul>
            <span style={{ color: '#64748b' }}>전자정부 표준 RAG 프로토타입 v1.0</span>
          </div>
          <div className="footer-bottom">
            <div>
              <p>(07570) 서울특별시 강서구 금낭화로 154 한국문화관광연구원</p>
              <p>대표전화: 02-2669-9800 | 사업자등록번호: 109-82-06764</p>
              <p style={{ marginTop: '6px', color: '#475569' }}>
                Copyright © 2026 Korea Culture & Tourism Institute. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. 실시간 AI 챗봇 컴포넌트 (SFR-011 ~ SFR-015 탑재) */}
      <ChatWidget />
    </div>
  );
}
