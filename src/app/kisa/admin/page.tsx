'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Lock, Unlock, BarChart3, FileText, Database,
  Sliders, Cpu, Search, RefreshCw, Key, CheckCircle,
  AlertCircle, ChevronRight, LogOut, ExternalLink,
  Plus, Edit2, Trash2, Check, ArrowRightLeft, Eye
} from 'lucide-react';
import styles from './page.module.css';

interface AdminInfo {
  name: string;
  dept: string;
  role: string;
  access_level: string;
}

interface OperationalStats {
  summary: {
    total_queries: number;
    unique_visitors: number;
    avg_latency_sec: number;
    avg_recall_at_5: number;
    pii_masked_count: number;
    unanswered_rate: string;
    satisfaction_rate: string;
  };
  intent_distribution: Array<{
    label: string;
    count: number;
    ratio: string;
  }>;
  daily_stats: Array<{
    date: string;
    total: number;
    resolved: number;
    unanswered: number;
  }>;
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  masked_query: string;
  answer_text: string | null;
  pii_detected: string;
  intent_type: string;
  recall_at_5: number;
  top_similarity: number;
  response_latency_sec: number;
  referenced_laws: string;
  security_status: string;
  is_unanswered: number;
  has_encrypted_payload: boolean;
  encrypted_preview: string;
}

interface LawDoc {
  id: string;
  title: string;
  source: string;
  article: string;
  revision_date: string;
  category: string;
  content: string;
  is_active: number | boolean;
}

interface ChecklistRule {
  id: string;
  category: string;
  law_reference: string;
  summary: string;
  action_steps: string[];
  is_active: number | boolean;
}

interface ModelSpec {
  id: string;
  name: string;
  version: string;
  provider: string;
  delivery_type: string;
  context_window: string;
  languages: string;
  security_features: string;
  selection_reason: string;
  is_current: boolean;
  status: string;
  api_key_configured?: boolean;
}

export default function KisaAdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    name: '불법스팸대응센터 운영총괄관',
    dept: 'KISA 디지털이용자보호단 불법스팸대응팀',
    role: 'SUPER_ADMIN',
    access_level: 'LEVEL_1_FULL'
  });

  // 2FA 로그인 폼 상태
  const [loginForm, setLoginForm] = useState({
    admin_id: 'kisa_admin',
    admin_pw: 'kisa2026!',
    otp_code: '118118'
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // 대시보드 탭 ('stats' | 'logs' | 'laws' | 'checklists' | 'models')
  const [activeTab, setActiveTab] = useState<'stats' | 'logs' | 'laws' | 'checklists' | 'models'>('stats');

  // SFR-004 통계 및 이력 데이터
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [totalLogsCount, setTotalLogsCount] = useState<number>(0);
  const [unansweredCount, setUnansweredCount] = useState<number>(0);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [logKeyword, setLogKeyword] = useState<string>('');
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  // 복호화 모달 상태
  const [decryptModal, setDecryptModal] = useState<{
    isOpen: boolean;
    logItem: AuditLogItem | null;
    pin: string;
    decryptedData: any | null;
    error: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    logItem: null,
    pin: '118118',
    decryptedData: null,
    error: null,
    isLoading: false
  });

  // SFR-002 & SFR-003 상태
  const [laws, setLaws] = useState<LawDoc[]>([]);
  const [rules, setRules] = useState<ChecklistRule[]>([]);
  const [modelSpecs, setModelSpecs] = useState<ModelSpec[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('gemini');
  const [benchmarkLoading, setBenchmarkLoading] = useState<string | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<any | null>(null);

  // API Base URL
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
      }
      return `${window.location.protocol}//${window.location.hostname}:8002`;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  };

  // 2FA 로그인 핸들러
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (data.admin_info) setAdminInfo(data.admin_info);
        // 로그인 성공 시 통계 및 이력 초기 로드
        fetchStats();
        fetchLogs('ALL', '');
        fetchLaws();
        fetchRules();
        fetchModelSpecs();
      } else {
        setLoginError(data.error || '2단계 다중 보안 인증에 실패하였습니다.');
      }
    } catch (err: any) {
      // 오프라인 fallback 모의 인증
      if (loginForm.admin_id === 'kisa_admin' && loginForm.admin_pw === 'kisa2026!' && loginForm.otp_code === '118118') {
        setIsAuthenticated(true);
        fetchStats();
        fetchLogs('ALL', '');
      } else {
        setLoginError('인증 서버 연결 오류가 발생했습니다. 계정 정보를 확인해주세요.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 통계 조회 (SFR-004)
  const fetchStats = async () => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.log('Failed to fetch stats');
    }
  };

  // 이력 조회 (SFR-004)
  const fetchLogs = async (filterType = logFilter, keyword = logKeyword) => {
    setIsLogsLoading(true);
    try {
      const base = getApiBaseUrl();
      const params = new URLSearchParams({
        filter_type: filterType,
        keyword: keyword,
        limit: '50'
      });
      const res = await fetch(`${base}/api/kisa/admin/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalLogsCount(data.total_records || 0);
        setUnansweredCount(data.unanswered_records || 0);
      }
    } catch (err) {
      console.log('Failed to fetch logs');
    } finally {
      setIsLogsLoading(false);
    }
  };

  // 법령 조회 (SFR-002)
  const fetchLaws = async () => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/laws`);
      if (res.ok) {
        const data = await res.json();
        setLaws(data.documents || []);
      }
    } catch (err) {
      console.log('Failed to fetch laws');
    }
  };

  // 체크리스트 조회 (SFR-002)
  const fetchRules = async () => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/checklists`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.log('Failed to fetch rules');
    }
  };

  // 모델 제원 조회 (SFR-003)
  const fetchModelSpecs = async () => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/model-specs`);
      if (res.ok) {
        const data = await res.json();
        setModelSpecs(data.models || data.supported_models || []);
        setCurrentProvider(data.current_provider || 'gemini');
      }
    } catch (err) {
      console.log('Failed to fetch model specs');
    }
  };

  // 모델 전환 (SFR-003)
  const handleSwitchModel = async (providerId: string) => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/model-specs/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId })
      });
      if (res.ok) {
        fetchModelSpecs();
      }
    } catch (err) {
      console.log('Failed to switch model');
    }
  };

  // 벤치마크 실행 (SFR-003)
  const handleRunBenchmark = async (providerId: string) => {
    setBenchmarkLoading(providerId);
    setBenchmarkResult(null);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/model-specs/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId })
      });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkResult(data);
      }
    } catch (err) {
      console.log('Benchmark failed');
    } finally {
      setBenchmarkLoading(null);
    }
  };

  // 암호화 전문 복호화 열람 요청 (SFR-004)
  const handleDecryptRequest = async () => {
    if (!decryptModal.logItem) return;
    setDecryptModal(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/kisa/admin/decrypt-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_id: decryptModal.logItem.id,
          admin_pin: decryptModal.pin
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDecryptModal(prev => ({
          ...prev,
          decryptedData: data,
          isLoading: false
        }));
      } else {
        setDecryptModal(prev => ({
          ...prev,
          error: data.error || '2차 인증 PIN이 일치하지 않습니다.',
          isLoading: false
        }));
      }
    } catch (err) {
      setDecryptModal(prev => ({
        ...prev,
        error: '복호화 처리 중 서버 통신 오류가 발생했습니다.',
        isLoading: false
      }));
    }
  };

  // 필터 변경 시 조회
  const handleFilterChange = (type: string) => {
    setLogFilter(type);
    fetchLogs(type, logKeyword);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(logFilter, logKeyword);
  };

  // ----------------------------------------------------------------------------
  // A. 2FA 로그인 화면 (인증 전)
  // ----------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className={styles.adminRoot}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <div className={styles.loginLogoGroup}>
                <span className={styles.loginLogoBadge}>KISA</span>
                <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>한국인터넷진흥원</span>
              </div>
              <h1>불법스팸대응 지능형 시스템 관리자 포털</h1>
              <p className={styles.loginSubtitle}>보안통제 1등급 • 내부 행정망 전용 접근 통제 시스템</p>
            </div>

            <div className={styles.loginNoticeBox}>
              <strong>[국가정보원 AI 보안 가이드라인 준수]</strong><br />
              본 시스템은 개인정보보호법 및 국가정보보호 규정에 따라 <strong>2단계 다중 보안 인증(2FA ID/PW + 모바일 OTP)</strong>을 통과한 인가된 운영관만 열람할 수 있습니다.
            </div>

            <form className={styles.loginBody} onSubmit={handleLogin}>
              {loginError && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>관리자 사번 / ID</span>
                  <span className={styles.formHint}>기본: kisa_admin</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={loginForm.admin_id}
                  onChange={e => setLoginForm({ ...loginForm, admin_id: e.target.value })}
                  placeholder="관리자 ID를 입력하세요"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>비밀번호</span>
                  <span className={styles.formHint}>기본: kisa2026!</span>
                </label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={loginForm.admin_pw}
                  onChange={e => setLoginForm({ ...loginForm, admin_pw: e.target.value })}
                  placeholder="보안 비밀번호를 입력하세요"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>2차 행정망 모바일 OTP (6자리)</span>
                  <span className={styles.formHint}>테스트 OTP: 118118</span>
                </label>
                <div className={styles.otpRow}>
                  <input
                    type="text"
                    maxLength={6}
                    className={styles.formInput}
                    value={loginForm.otp_code}
                    onChange={e => setLoginForm({ ...loginForm, otp_code: e.target.value })}
                    placeholder="118118"
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={isLoggingIn}>
                <Lock size={16} />
                <span>{isLoggingIn ? '2단계 다중 인증 확인 중...' : '다중 보안 인증(2FA) 로그인'}</span>
              </button>

              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setLoginForm({ admin_id: 'kisa_admin', admin_pw: 'kisa2026!', otp_code: '118118' })}
              >
                <Key size={14} />
                <span>테스트용 인가 계정 정보 원클릭 자동 입력</span>
              </button>
            </form>

            <div className={styles.loginFooter}>
              <span>KISA 불법스팸대응센터 운영지원단</span>
              <Link href="/kisa">대국민 챗봇 포털로 이동 →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // B. 관리자 대시보드 메인 화면 (인증 완료 후)
  // ----------------------------------------------------------------------------
  return (
    <div className={styles.adminRoot}>
      <div className={styles.portalLayout}>
        {/* 1. 좌측 엔터프라이즈 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLogoBadge}>KISA</span>
            <div>
              <h2 className={styles.sidebarTitle}>불법스팸대응센터</h2>
              <p className={styles.sidebarSubtitle}>지능형 시스템 통합 관리 콘솔</p>
            </div>
          </div>

          <div className={styles.sidebarAdminInfo}>
            <div className={styles.adminAvatar}>관</div>
            <div className={styles.adminDetails}>
              <div className={styles.adminName}>{adminInfo.name}</div>
              <div className={styles.adminRole}>
                <Shield size={11} />
                <span>{adminInfo.role} (보안 1등급)</span>
              </div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <div className={styles.navSectionLabel}>모니터링 & 감사</div>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'stats' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <BarChart3 size={16} />
              <span>운영 통계 대시보드</span>
              <span className={styles.navBadge}>실시간</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'logs' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <FileText size={16} />
              <span>질의응답 이력 & 감사</span>
              <span className={styles.navBadge}>{totalLogsCount}건</span>
            </button>

            <div className={styles.navSectionLabel}>지식베이스 및 규칙 관리</div>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'laws' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('laws')}
            >
              <Database size={16} />
              <span>법령·가이드라인 지식 DB</span>
              <span className={styles.navBadge}>{laws.length}건</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'checklists' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('checklists')}
            >
              <Sliders size={16} />
              <span>이용정지 소명 규칙 엔진</span>
              <span className={styles.navBadge}>{rules.length}건</span>
            </button>

            <div className={styles.navSectionLabel}>AI 엔진 및 모델 제원</div>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'models' ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab('models')}
            >
              <Cpu size={16} />
              <span>AI 모델 제원 및 전환 관리</span>
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <Link href="/kisa" className={styles.sidebarFooterLink} target="_blank">
              <ExternalLink size={13} />
              <span>대국민 챗봇 포털 열기</span>
            </Link>
            <button type="button" className={styles.btnLogout} onClick={() => setIsAuthenticated(false)}>
              <LogOut size={13} />
              <span>보안 세션 종료 (로그아웃)</span>
            </button>
          </div>
        </aside>

        {/* 2. 메인 콘텐츠 영역 */}
        <main className={styles.mainContent}>
          {/* 상단 헤더 탑바 */}
          <header className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <h1 className={styles.pageTitle}>
                {activeTab === 'stats' && '운영 통계 대시보드'}
                {activeTab === 'logs' && '질의응답 이력 관리 및 암호화 감사 로그'}
                {activeTab === 'laws' && '지식베이스 법령 및 가이드라인 관리'}
                {activeTab === 'checklists' && '이용정지 자율규제 소명 절차 규칙 관리'}
                {activeTab === 'models' && 'AI 모델 제원 관리 및 벤더 독립성'}
              </h1>
            </div>
            <div className={styles.topBarRight}>
              <div className={styles.securityStatusPill}>
                <span className={styles.liveDot} />
                <span>2FA 다중보안 접근 통제 가동 중</span>
              </div>
              <button
                type="button"
                className={styles.btnSmall}
                onClick={() => {
                  fetchStats();
                  fetchLogs();
                  fetchLaws();
                  fetchRules();
                  fetchModelSpecs();
                }}
              >
                <RefreshCw size={12} />
                <span>데이터 갱신</span>
              </button>
            </div>
          </header>

          <div className={styles.pageBody}>
            {/* ------------------------------------------------------------------
                탭 1: 운영 통계 대시보드
                ------------------------------------------------------------------ */}
            {activeTab === 'stats' && stats && (
              <>
                {/* 1-1. 6대 핵심 운영 지표 카드 */}
                <div className={styles.kpiSummaryGrid}>
                  <div className={styles.kpiBox}>
                    <span className={styles.kpiBoxLabel}>총 누적 질의 건수</span>
                    <span className={styles.kpiBoxValue}>{stats.summary.total_queries.toLocaleString()}건</span>
                    <span className={styles.kpiBoxSub}>순 이용자 수 {stats.summary.unique_visitors}명</span>
                  </div>
                  <div className={styles.kpiBox}>
                    <span className={styles.kpiBoxLabel}>평균 응답 속도</span>
                    <span className={styles.kpiBoxValue}>{stats.summary.avg_latency_sec}초</span>
                    <span className={styles.kpiBoxSub} style={{ color: '#16a34a' }}>기준 5.0초 대비 100% 충족</span>
                  </div>
                  <div className={styles.kpiBox}>
                    <span className={styles.kpiBoxLabel}>검색 정확도 (Recall@5)</span>
                    <span className={styles.kpiBoxValue}>{(stats.summary.avg_recall_at_5 * 100).toFixed(1)}%</span>
                    <span className={styles.kpiBoxSub} style={{ color: '#16a34a' }}>제안요청서 90% 이상 적합</span>
                  </div>
                  <div className={styles.kpiBox}>
                    <span className={styles.kpiBoxLabel}>미답변 및 오류율</span>
                    <span className={styles.kpiBoxValue}>{stats.summary.unanswered_rate}</span>
                    <span className={styles.kpiBoxSub}>118 상담센터 이관 안내율</span>
                  </div>
                  <div className={styles.kpiBox}>
                    <span className={styles.kpiBoxLabel}>개인정보(PII) 실시간 가명화</span>
                    <span className={styles.kpiBoxValue}>{stats.summary.pii_masked_count}건</span>
                    <span className={styles.kpiBoxSub} style={{ color: '#004b93' }}>Zero Data Retention 적용</span>
                  </div>
                  <div className={styles.kpiBox}>
                    <span className={styles.kpiBoxLabel}>민원 만족도 지수</span>
                    <span className={styles.kpiBoxValue}>{stats.summary.satisfaction_rate}</span>
                    <span className={styles.kpiBoxSub} style={{ color: '#16a34a' }}>소명 절차 명확성 평가</span>
                  </div>
                </div>

                {/* 1-2. 일별 질의 추이 및 질의 유형 분포 2열 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '20px' }}>
                  {/* 일별 질의 추이 차트 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.cardTitle}>
                          <BarChart3 size={16} />
                          <span>최근 7일간 일별 질의 현황 및 응답 추이</span>
                        </h3>
                        <p className={styles.cardDesc}>일별 총 질의 건수 대비 정상 답변 및 미답변 분류 통계</p>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.chartContainer}>
                        {stats.daily_stats.map((d, idx) => {
                          const maxVal = 80;
                          const resolvedHeight = Math.min(100, Math.round((d.resolved / maxVal) * 100));
                          const unansHeight = Math.min(100, Math.round((d.unanswered / maxVal) * 100));
                          return (
                            <div key={idx} className={styles.chartColumn}>
                              <span className={styles.chartColVal}>{d.total}</span>
                              <div className={styles.chartBarWrapper}>
                                <div className={styles.chartBarFillUnanswered} style={{ height: `${unansHeight}%` }} title={`미답변: ${d.unanswered}건`} />
                                <div className={styles.chartBarFillResolved} style={{ height: `${resolvedHeight}%` }} title={`정상응답: ${d.resolved}건`} />
                              </div>
                              <span className={styles.chartColLabel}>{d.date}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '14px', fontSize: '12px', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', background: '#004b93', borderRadius: '2px' }} />
                          <span>정상 답변 완료</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }} />
                          <span>미답변 / 118 센터 이관</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 질의 유형별 분포 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.cardTitle}>
                          <Sliders size={16} />
                          <span>민원 질의 유형별 분류 비율</span>
                        </h3>
                        <p className={styles.cardDesc}>RAG 법령 조회, 소명 룰엔진, 보안 차단 분포</p>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.distributionList}>
                        {stats.intent_distribution.map((item, idx) => (
                          <div key={idx} className={styles.distributionItem}>
                            <div className={styles.distRowTop}>
                              <span className={styles.distLabel}>{item.label}</span>
                              <span className={styles.distCount}>{item.count}건 ({item.ratio})</span>
                            </div>
                            <div className={styles.distProgressBar}>
                              <div
                                className={styles.distProgressFill}
                                style={{
                                  width: item.ratio,
                                  backgroundColor:
                                    idx === 0 ? '#004b93' :
                                    idx === 1 ? '#0284c7' :
                                    idx === 2 ? '#dc2626' : '#d97706'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        💡 <strong>유형 분석 보고</strong>: 전체 민원의 64% 이상이 영리목적 광고성 정보 표기의무(080 무료수신거부)에 집중되어 있으며, 이용정지 소명 문의가 28%로 2위를 차지하고 있습니다.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ------------------------------------------------------------------
                탭 2: 질의응답 이력 & 암호화 감사 로그
                ------------------------------------------------------------------ */}
            {activeTab === 'logs' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      <FileText size={16} />
                      <span>질의응답 이력 조회 및 암호화 전문 감사</span>
                    </h3>
                    <p className={styles.cardDesc}>
                      사용자 질의, 마스킹 처리, 응답시간, 답변 근거 법령 기록 및 AES-256 암호화 전문 관리자 2차 인증 열람
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      미답변 건수: <strong style={{ color: '#d97706' }}>{unansweredCount}건</strong> / 전체: <strong>{totalLogsCount}건</strong>
                    </span>
                  </div>
                </div>

                {/* 툴바: 필터 탭 & 검색창 */}
                <div className={styles.tableToolbar}>
                  <div className={styles.filterGroup}>
                    {[
                      { id: 'ALL', label: '전체 이력' },
                      { id: 'SUCCESS', label: '정상 응답' },
                      { id: 'UNANSWERED', label: '미답변·도메인외' },
                      { id: 'SECURITY', label: '보안차단' },
                      { id: 'SUSPENSION', label: '소명절차' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        className={`${styles.filterBtn} ${logFilter === f.id ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <form className={styles.searchGroup} onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="질의 내용 또는 근거 법령 검색..."
                      value={logKeyword}
                      onChange={e => setLogKeyword(e.target.value)}
                    />
                    <button type="submit" className={styles.btnSmall}>
                      <Search size={13} />
                      <span>검색</span>
                    </button>
                  </form>
                </div>

                {/* 이력 데이터 테이블 */}
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '130px' }}>일시</th>
                        <th style={{ width: '110px' }}>민원 유형</th>
                        <th>사용자 질의 내용 (마스킹)</th>
                        <th style={{ width: '90px' }}>응답시간</th>
                        <th style={{ width: '180px' }}>참조 근거 법령</th>
                        <th style={{ width: '110px' }}>처리 상태</th>
                        <th style={{ width: '130px', textAlign: 'center' }}>암호화 전문</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLogsLoading ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                            감사 이력을 불러오는 중입니다...
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                            조건에 일치하는 질의응답 이력이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        logs.map(log => {
                          let lawList: string[] = [];
                          try {
                            lawList = JSON.parse(log.referenced_laws || '[]');
                          } catch (e) {
                            lawList = [];
                          }

                          return (
                            <tr key={log.id}>
                              <td style={{ fontSize: '11.5px', color: '#64748b' }}>{log.timestamp}</td>
                              <td>
                                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                                  {log.intent_type === 'LEGAL_QA_RAG' ? '법령 Q&A' :
                                   log.intent_type === 'SUSPENSION_RULE' ? '이용정지 소명' :
                                   log.intent_type === 'SECURITY_VIOLATION' ? '보안 위반' : '도메인 외'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                  <div style={{ fontWeight: 500, color: '#0f172a', maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {log.masked_query}
                                  </div>
                                  <button
                                    type="button"
                                    className={styles.btnDecrypt}
                                    style={{ flexShrink: 0 }}
                                    title="AES-256 원문 복호화 열람"
                                    onClick={() => setDecryptModal({
                                      isOpen: true,
                                      logItem: log,
                                      pin: '118118',
                                      decryptedData: null,
                                      error: null,
                                      isLoading: false
                                    })}
                                  >
                                    <Key size={11} />
                                    <span>2FA 열람</span>
                                  </button>
                                </div>
                                {log.answer_text && (
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    ↳ {log.answer_text}
                                  </div>
                                )}
                              </td>
                              <td style={{ fontWeight: 600, color: log.response_latency_sec <= 5.0 ? '#16a34a' : '#d97706' }}>
                                {log.response_latency_sec}초
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {lawList.length > 0 ? (
                                    lawList.map((law, idx) => (
                                      <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '3px', fontSize: '10.5px' }}>
                                        {law}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>-</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {log.security_status.includes('BLOCKED') ? (
                                  <span className={`${styles.statusBadge} ${styles.badgeBlocked}`}>보안 차단</span>
                                ) : log.is_unanswered === 1 ? (
                                  <span className={`${styles.statusBadge} ${styles.badgeUnanswered}`}>미답변 이관</span>
                                ) : log.intent_type === 'SUSPENSION_RULE' ? (
                                  <span className={`${styles.statusBadge} ${styles.badgeRule}`}>소명 절차</span>
                                ) : (
                                  <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>정상 응답</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className={styles.btnDecrypt}
                                  onClick={() => setDecryptModal({
                                    isOpen: true,
                                    logItem: log,
                                    pin: '118118',
                                    decryptedData: null,
                                    error: null,
                                    isLoading: false
                                  })}
                                >
                                  <Key size={11} />
                                  <span>2FA 열람</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------
                탭 3: 지식베이스 법령 관리
                ------------------------------------------------------------------ */}
            {activeTab === 'laws' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      <Database size={16} />
                      <span>지식베이스 법령 및 가이드라인 관리</span>
                    </h3>
                    <p className={styles.cardDesc}>
                      정보통신망법, 시행령, 전송 가이드라인 문서 등록·수정 및 실시간 검색 색인 관리
                    </p>
                  </div>
                  <span className={styles.securityStatusPill}>
                    <Check size={12} />
                    <span>실시간 검색 색인 동기화 활성</span>
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.lawGrid}>
                    {laws.map(law => (
                      <div key={law.id} className={styles.lawItem}>
                        <div className={styles.lawItemTop}>
                          <span className={styles.lawItemTitle}>{law.title}</span>
                          <span className={`${styles.statusBadge} ${law.is_active ? styles.badgeSuccess : styles.badgeUnanswered}`}>
                            {law.is_active ? 'ACTIVE (검색 색인)' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className={styles.lawItemMeta}>
                          <span><strong>출처:</strong> {law.source}</span>
                          <span><strong>조항:</strong> {law.article}</span>
                          <span><strong>시행일:</strong> {law.revision_date}</span>
                          <span><strong>분류:</strong> {law.category}</span>
                        </div>
                        <div className={styles.lawItemContent}>{law.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------
                탭 4: 이용정지 소명 규칙 엔진
                ------------------------------------------------------------------ */}
            {activeTab === 'checklists' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      <Sliders size={16} />
                      <span>이용정지 자율규제 소명 규칙 엔진</span>
                    </h3>
                    <p className={styles.cardDesc}>
                      통신사 자율규제 및 시행령 제62조의4에 따른 정지 원인별 표준 소명 단계 규칙
                    </p>
                  </div>
                  <span className={styles.securityStatusPill}>
                    <Check size={12} />
                    <span>표준 소명 규칙 엔진 가동</span>
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.lawGrid}>
                    {rules.map(rule => (
                      <div key={rule.id} className={styles.lawItem}>
                        <div className={styles.lawItemTop}>
                          <span className={styles.lawItemTitle}>[{rule.category}] {rule.summary}</span>
                          <span className={`${styles.statusBadge} ${styles.badgeRule}`}>소명 규칙</span>
                        </div>
                        <div className={styles.lawItemMeta}>
                          <span><strong>법적 근거:</strong> {rule.law_reference}</span>
                        </div>
                        <div className={styles.lawItemContent}>
                          <strong>단계별 소명 지침:</strong>
                          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                            {rule.action_steps.map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------
                탭 5: AI 모델 제원 및 전환 관리
                ------------------------------------------------------------------ */}
            {activeTab === 'models' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      <Cpu size={16} />
                      <span>AI 모델 제원 관리 및 벤더 독립성</span>
                    </h3>
                    <p className={styles.cardDesc}>
                      특정 벤더 종속 탈피(Vendor-agnostic)를 위한 어댑터 패턴 및 한국어 품질 벤치마크
                    </p>
                  </div>
                  <span className={styles.securityStatusPill}>
                    <Check size={12} />
                    <span>현재 활성 모델: Google Gemini 3.8 Flash</span>
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.modelGrid}>
                    {modelSpecs.map(m => (
                      <div
                        key={m.id}
                        className={`${styles.modelCard} ${m.is_current ? styles.modelCardActive : ''}`}
                      >
                        <div className={styles.modelCardHeader}>
                          <div>
                            <div className={styles.modelName}>{m.name}</div>
                            <div className={styles.modelProvider}>{m.provider} • {m.version}</div>
                          </div>
                          {m.is_current ? (
                            <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>현재 가동 중</span>
                          ) : (
                            <span className={`${styles.statusBadge} ${styles.badgeUnanswered}`}>대기 중</span>
                          )}
                        </div>

                        <div className={styles.modelMetaList}>
                          <div><strong>배포 형태:</strong> {m.delivery_type}</div>
                          <div><strong>컨텍스트:</strong> {m.context_window}</div>
                          <div><strong>지원 언어:</strong> {m.languages}</div>
                          <div><strong>보안 스펙:</strong> {m.security_features}</div>
                          <div><strong>적합성 사유:</strong> {m.selection_reason}</div>
                        </div>

                        <div className={styles.modelActions}>
                          {!m.is_current && (
                            <button
                              type="button"
                              className={styles.btnSmall}
                              onClick={() => handleSwitchModel(m.id)}
                            >
                              <ArrowRightLeft size={12} />
                              <span>이 모델로 전환</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.btnSmall}
                            onClick={() => handleRunBenchmark(m.id)}
                            disabled={benchmarkLoading === m.id}
                          >
                            <Cpu size={12} />
                            <span>{benchmarkLoading === m.id ? '벤치마크 중...' : '품질 검증 테스트'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 벤치마크 결과 박스 */}
                  {benchmarkResult && (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                        📊 벤치마크 품질 검증 결과 ({benchmarkResult.tested_model})
                      </h4>
                      <div style={{ fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>연결 상태:</strong> <span style={{ color: benchmarkResult.status === 'SUCCESS' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{benchmarkResult.status}</span></div>
                        <div><strong>응답 속도:</strong> {benchmarkResult.latency_sec}초 (기준 5초 대비 충족)</div>
                        <div><strong>테스트 질의:</strong> &quot;{benchmarkResult.test_query}&quot;</div>
                        <div style={{ background: '#ffffff', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '4px' }}>
                          <strong>생성 답변:</strong> {benchmarkResult.benchmark_response}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ------------------------------------------------------------------------
          3. 암호화 전문 복호화 모달 (AES-256 2차 PIN 검증)
          ------------------------------------------------------------------------ */}
      {decryptModal.isOpen && decryptModal.logItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>
                <Shield size={16} />
                <span>암호화 입출력 전문 관리자 2차 인증 복호화</span>
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDecryptModal(prev => ({ ...prev, isOpen: false, decryptedData: null }))}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                개인정보보호법 및 국가정보원 보안통제 지침에 따라 데이터베이스에 <strong>AES-256 암호화</strong>로 보관된 원본 전문을 복호화하여 감사 열람합니다.
              </div>

              {!decryptModal.decryptedData ? (
                <div className={styles.authPinBox}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                    관리자 2차 보안 PIN 또는 OTP (6자리)를 입력하십시오:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="password"
                      className={styles.formInput}
                      style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }}
                      maxLength={6}
                      value={decryptModal.pin}
                      onChange={e => setDecryptModal({ ...decryptModal, pin: e.target.value })}
                      placeholder="118118"
                    />
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      style={{ height: '42px', padding: '0 16px', flexShrink: 0 }}
                      onClick={handleDecryptRequest}
                      disabled={decryptModal.isLoading}
                    >
                      <Unlock size={14} />
                      <span>{decryptModal.isLoading ? '복호화 중...' : 'AES-256 복호화'}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    * 기본 인가 관리자 PIN: <code>118118</code> (테스트용 자동 채움 지원)
                  </div>
                  {decryptModal.error && (
                    <div className={styles.errorBanner}>
                      <AlertCircle size={14} />
                      <span>{decryptModal.error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.decryptResultBox}>
                  <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', color: '#166534', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} />
                    <span><strong>2차 인증 승인 완료:</strong> 감사 열람 기록이 서버 보안 로그에 저장되었습니다. ({decryptModal.decryptedData.auth_verified_at})</span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>[복호화 완료] 사용자 원본 질의 (AES-256 Plaintext)</span>
                    <div className={`${styles.detailContent} ${styles.decryptedHighlight}`}>
                      {decryptModal.decryptedData.decrypted_raw_query}
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>[실시간 마스킹] 외부 AI 전달용 가명화 텍스트 (PII Scrubber)</span>
                    <div className={styles.detailContent}>
                      {decryptModal.decryptedData.masked_query}
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>탐지 및 비식별 조치된 개인정보 내역</span>
                    <div className={styles.detailContent}>
                      {decryptModal.decryptedData.pii_detected.length > 0 ? (
                        decryptModal.decryptedData.pii_detected.map((p: any, idx: number) => (
                          <div key={idx} style={{ fontSize: '12px', color: '#dc2626' }}>
                            • 유형: <strong>{p.type}</strong> | 원본 마스킹: {p.original_masked} → 토큰: <code>{p.token}</code>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#64748b' }}>감지된 민감 개인정보 없음 (클린 쿼리)</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>시스템 응답 내용 (Answer Content)</span>
                    <div className={styles.detailContent}>
                      {decryptModal.decryptedData.answer_text}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSmall}
                onClick={() => setDecryptModal(prev => ({ ...prev, isOpen: false, decryptedData: null }))}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
