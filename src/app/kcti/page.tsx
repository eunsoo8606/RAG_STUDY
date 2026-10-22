'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Globe, ChevronRight, Sparkles, BookOpen, BarChart3, ShieldCheck, ArrowLeft } from 'lucide-react';
import GlobalNav from '@/components/GlobalNav';
import KctiChatWidget from '@/components/KctiChatWidget';
import { KCTI_REPORTS, KctiReport } from '@/data/kctiReports';
import { KCTI_STATS } from '@/data/kctiStats';

export default function KctiPage() {
  const [activeTab, setActiveTab] = useState<'all' | '관광' | '문화예술' | '콘텐츠'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 보고서 필터링 (탭 및 검색어)
  const filteredReports = KCTI_REPORTS.filter((rep) => {
    const matchTab = activeTab === 'all' || rep.category === activeTab;
    const matchSearch = !searchKeyword.trim() || 
      rep.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      rep.summary.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* 1. 데이터트리 통합 네비게이션 */}
      <GlobalNav currentDomain="kcti" />

      {/* 2. 대한민국 공식 전자정부 배너 */}
      <div className="gov-banner" style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '6px 0', fontSize: '12px', color: '#64748b' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🇰🇷</span>
            <span>이 누리집은 대한민국 문화체육관광부 산하 <strong>한국문화관광연구원(KCTI)</strong> 정책 데이터 공식 포털입니다.</span>
          </div>
          <Link href="/kisa" style={{ color: '#0369a1', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>KISA 불법스팸대응센터 전환</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* 3. 메인 KCTI 헤더 */}
      <header className="kcti-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: '#003366', color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px' }}>
              KCTI
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>한국문화관광연구원</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Korea Culture & Tourism Institute</p>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#reports" style={{ fontSize: '14px', fontWeight: 700, color: '#003366', textDecoration: 'none' }}>KCTI 발간물</a>
            <a href="#stats" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', textDecoration: 'none' }}>KCTI Data</a>
            <a href="#about" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', textDecoration: 'none' }}>연구원 소개</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <Search size={14} color="#64748b" />
              <input 
                type="text" 
                placeholder="보고서 키워드 검색..." 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '130px' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 4. 히어로 비주얼 섹션 */}
      <section style={{ background: 'linear-gradient(135deg, #002244 0%, #003366 50%, #0f2c4c 100%)', color: '#ffffff', padding: '48px 0 56px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', color: '#38bdf8', fontWeight: 700, marginBottom: '16px' }}>
              <Sparkles size={14} />
              <span>3072차원 고밀도 시맨틱 RAG 적용 연구 포털</span>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.3, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              데이터로 미래를 여는<br />
              문화·관광·콘텐츠 싱크탱크
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
              한국문화관광연구원은 국민 삶의 질 향상과 국가 소프트파워 혁신을 위해<br />
              수천 건의 정책 보고서와 실시간 통계를 기반으로 지능형 RAG 연구 비서를 지원합니다.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => {
                  const btn = document.querySelector('.launcher-btn') as HTMLButtonElement;
                  if (btn) btn.click();
                }}
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)' }}
              >
                <Sparkles size={16} />
                <span>AI 연구비서로 보고서 탐색하기</span>
              </button>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>우측 하단 챗봇 위젯 클릭</span>
            </div>
          </div>

          {/* 히어로 우측 하이라이트 연구보고서 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px', marginBottom: '8px' }}>FEATURED RESEARCH</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px', lineHeight: 1.4 }}>
              한-일 주요 인바운드 시장의 국가별 비교 분석
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              방한 외국인 관광객 3천만 달성을 위한 핵심 경쟁력 분석과 체류 일수 증대, 수도권 편중 완화형 관광벨트 정책 제언
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
              <span>관광정책연구실 · 2026.01</span>
              <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                819개 청크 색인 완료 <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KCTI Data 핵심 지표 카드 그리드 */}
      <section style={{ maxWidth: '1240px', margin: '-24px auto 0', width: '100%', padding: '0 20px', zIndex: 10 }} id="stats">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {KCTI_STATS.slice(0, 4).map((st) => (
            <div key={st.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#003366' }}>{st.category}</span>
                <span>{st.period}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={st.title}>
                {st.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{st.value}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{st.unit}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: st.changeRate.startsWith('+') ? '#dc2626' : '#2563eb' }}>{st.changeRate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. 연구보고서 발간물 섹션 */}
      <main style={{ maxWidth: '1240px', margin: '40px auto 60px', width: '100%', padding: '0 20px', flex: 1 }} id="reports">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '2px solid #003366', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>KCTI 핵심 연구보고서</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Chroma 벡터 DB(3072차원)에 색인되어 AI 연구비서가 실시간 팩트 브리핑하는 발간물입니다.</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {filteredReports.map((rep) => (
            <div key={rep.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0284c7' }}>{rep.category}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>다운로드 {rep.downloadCount.toLocaleString()}</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', lineHeight: 1.4 }}>{rep.title}</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.6, flex: 1, marginBottom: '16px' }}>{rep.summary}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span>{rep.department}</span>
                <span>{rep.publishDate}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 7. 공공기관 표준 푸터 */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '36px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px', color: '#cbd5e1', fontWeight: 600 }}>한국문화관광연구원 (KCTI) × (주)데이터트리 AI 연구포털</p>
            <p style={{ margin: 0 }}>(07570) 서울특별시 강서구 금낭화로 154 | 대표전화: 02-2669-9800</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>ChromaDB 3072차원 시맨틱 라우터 가동 중</span>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>Copyright © 2026 Korea Culture & Tourism Institute. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* 8. KCTI 전용 AI 챗봇 컴포넌트 */}
      <KctiChatWidget />
    </div>
  );
}
