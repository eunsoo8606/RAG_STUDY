'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, Database, CheckSquare, Plus, Edit2, Trash2,
  RefreshCw, CheckCircle2, AlertCircle, Save, Shield,
  Cpu, Server, Zap, ArrowRightLeft, Layers, Check
} from 'lucide-react';
import styles from './KisaAdminModal.module.css';

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
  api_key_status?: string;
}

interface KisaAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent?: () => void;
}

export default function KisaAdminModal({ isOpen, onClose, onRefreshParent }: KisaAdminModalProps) {
  const [activeTab, setActiveTab] = useState<'laws' | 'checklists' | 'models'>('laws');
  const [laws, setLaws] = useState<LawDoc[]>([]);
  const [rules, setRules] = useState<ChecklistRule[]>([]);
  const [modelSpecs, setModelSpecs] = useState<ModelSpec[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('gemini');
  const [benchmarkLoading, setBenchmarkLoading] = useState<string | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: 'laws' | 'checklists' | 'models') => {
    setActiveTab(tab);
    setShowLawForm(false);
    setShowRuleForm(false);
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  };

  // 법령 폼 상태
  const [showLawForm, setShowLawForm] = useState(false);
  const [editingLawId, setEditingLawId] = useState<string | null>(null);
  const [lawFormData, setLawFormData] = useState({
    title: '',
    source: '',
    article: '',
    revision_date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    category: '법령',
    content: ''
  });

  // 체크리스트 폼 상태
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleFormData, setRuleFormData] = useState({
    category: '',
    law_reference: '정보통신망법 시행령 제62조의4',
    summary: '',
    actionStepsText: ''
  });

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
      }
      return `${window.location.protocol}//${window.location.hostname}:8002`;
    }
    return 'http://localhost:8000';
  };

  const fetchLaws = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/laws?include_inactive=true`);
      if (res.ok) {
        const data = await res.json();
        setLaws(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/checklists`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModelSpecs = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/model-specs`);
      if (res.ok) {
        const data = await res.json();
        setModelSpecs(data.models || []);
        setCurrentProvider(data.current_provider || 'gemini');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchModel = async (providerId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/model-specs/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        await fetchModelSpecs();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert('모델 전환 중 오류가 발생했습니다.');
      }
    } catch (e) {
      alert('서버 연결 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunBenchmark = async (providerId: string) => {
    try {
      setBenchmarkLoading(providerId);
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/model-specs/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId })
      });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkResults(prev => ({ ...prev, [providerId]: data }));
        showToast(`${data.model_name} 검증 완료: 응답시간 ${data.latency_sec}초`);
      } else {
        alert('벤치마크 테스트 실패');
      }
    } catch (e) {
      alert('서버 연결 실패');
    } finally {
      setBenchmarkLoading(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLaws();
      fetchRules();
      fetchModelSpecs();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // 1. 법령 등록/수정 제출
  const handleLawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawFormData.title.trim() || !lawFormData.content.trim()) {
      alert('문서명과 원문 내용을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const isEdit = !!editingLawId;
      const url = isEdit
        ? `${getApiBaseUrl()}/api/kisa/laws/${editingLawId}`
        : `${getApiBaseUrl()}/api/kisa/laws`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLawId || undefined,
          ...lawFormData,
          is_active: true
        })
      });

      if (res.ok) {
        showToast(isEdit ? '법령 지식 및 3072차원 벡터가 갱신되었습니다.' : '신규 법령이 3072차원 벡터로 실시간 색인되었습니다!');
        setShowLawForm(false);
        setEditingLawId(null);
        setLawFormData({ title: '', source: '', article: '', revision_date: '', category: '법령', content: '' });
        fetchLaws();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('서버 통신 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 법령 삭제
  const handleLawDelete = async (docId: string, title: string) => {
    if (!confirm(`'${title}' 문서를 지식베이스 및 벡터 인덱스에서 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/laws/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('문서가 안전하게 삭제되었습니다.');
        fetchLaws();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (e) {
      alert('삭제 실패');
    }
  };

  // 3. 법령 적용 여부 토글
  const handleLawToggle = async (docId: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/laws/${docId}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        fetchLaws();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (e) {
      alert('상태 변경 실패');
    }
  };

  // 4. 체크리스트 등록/수정 제출
  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormData.category.trim() || !ruleFormData.summary.trim()) {
      alert('소명 유형명과 요약을 입력해주세요.');
      return;
    }
    const steps = ruleFormData.actionStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsLoading(true);
    try {
      const isEdit = !!editingRuleId;
      const url = isEdit
        ? `${getApiBaseUrl()}/api/kisa/checklists/${editingRuleId}`
        : `${getApiBaseUrl()}/api/kisa/checklists`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: ruleFormData.category,
          law_reference: ruleFormData.law_reference,
          summary: ruleFormData.summary,
          action_steps: steps
        })
      });

      if (res.ok) {
        showToast('소명 규칙이 저장되었습니다.');
        setShowRuleForm(false);
        setEditingRuleId(null);
        setRuleFormData({ category: '', law_reference: '정보통신망법 시행령 제62조의4', summary: '', actionStepsText: '' });
        fetchRules();
      }
    } catch (e) {
      alert('규칙 저장 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuleDelete = async (ruleId: string) => {
    if (!confirm('해당 소명 규칙을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/kisa/checklists/${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('규칙이 삭제되었습니다.');
        fetchRules();
      }
    } catch (e) {
      alert('삭제 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWindow}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerBadge}>SFR-002 / SFR-003 과업 규격</span>
            <h3 className={styles.headerTitle}>KISA 불법스팸 지식·규칙 & AI 모델 관리 콘솔</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 토스트 메시지 */}
        {statusMsg && (
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '10px 28px', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #a7f3d0' }}>
            {statusMsg}
          </div>
        )}

        {/* 탭 바 */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'laws' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('laws')}
          >
            <Database size={16} />
            <span>법령·가이드라인 지식베이스 관리 (RAG 색인 {laws.length}건)</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'checklists' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('checklists')}
          >
            <CheckSquare size={16} />
            <span>이용정지 체크리스트 규칙 관리 ({rules.length}건)</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'models' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('models')}
          >
            <Cpu size={16} />
            <span>AI 모델 제원 및 전환 적합성 (SFR-003)</span>
          </button>
        </div>

        {/* 바디 영역 */}
        <div ref={modalBodyRef} className={styles.modalBody}>
          {activeTab === 'laws' ? (
            <div>
              {/* 툴바 */}
              <div className={styles.toolbar}>
                <span className={styles.toolInfo}>
                  신규 등록 시 <strong>3072차원 고밀도 임베딩</strong>이 실시간 생성되어 별도 배포 없이 챗봇에 즉시 반영됩니다.
                </span>
                <button
                  className={styles.addBtn}
                  onClick={() => {
                    setEditingLawId(null);
                    setLawFormData({ title: '', source: '', article: '', revision_date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'), category: '법령', content: '' });
                    setShowLawForm(!showLawForm);
                  }}
                >
                  <Plus size={15} />
                  <span>{showLawForm ? '등록 폼 닫기' : '신규 법령·고시 등록'}</span>
                </button>
              </div>

              {/* 법령 등록/수정 폼 */}
              {showLawForm && (
                <form className={styles.formBox} onSubmit={handleLawSubmit}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '15px', color: '#0f172a' }}>
                    {editingLawId ? '법령 문서 수정' : '신규 법령·고시 지식 등록'}
                  </h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>문서 제목 *</label>
                      <input
                        className={styles.formInput}
                        value={lawFormData.title}
                        onChange={(e) => setLawFormData({ ...lawFormData, title: e.target.value })}
                        placeholder="예: 정보통신망법 제50조의3 (신설 규정)"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>출처/기관 *</label>
                      <input
                        className={styles.formInput}
                        value={lawFormData.source}
                        onChange={(e) => setLawFormData({ ...lawFormData, source: e.target.value })}
                        placeholder="예: 방송통신위원회 고시 제2026-1호"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>관련 조문/항</label>
                      <input
                        className={styles.formInput}
                        value={lawFormData.article}
                        onChange={(e) => setLawFormData({ ...lawFormData, article: e.target.value })}
                        placeholder="예: 제50조제1항"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>시행일/개정일</label>
                      <input
                        className={styles.formInput}
                        value={lawFormData.revision_date}
                        onChange={(e) => setLawFormData({ ...lawFormData, revision_date: e.target.value })}
                        placeholder="2026.03.01"
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>법령/고시 원문 내용 (3072차원 시맨틱 색인 대상) *</label>
                      <textarea
                        className={styles.formTextarea}
                        value={lawFormData.content}
                        onChange={(e) => setLawFormData({ ...lawFormData, content: e.target.value })}
                        placeholder="법령 조문 및 세부 가이드라인 원문을 입력하세요. AI가 이 텍스트를 정확한 근거로 삼아 답변합니다."
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnSmall} onClick={() => setShowLawForm(false)}>취소</button>
                    <button type="submit" className={styles.addBtn} disabled={isLoading}>
                      <Save size={14} />
                      <span>{isLoading ? '실시간 임베딩 및 색인 중...' : '저장 및 벡터DB 즉시 반영'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 법령 목록 테이블 */}
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>상태</th>
                    <th>문서 제목</th>
                    <th>출처 / 조문</th>
                    <th>시행일</th>
                    <th>분류</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {laws.map((doc) => {
                    const isActive = doc.is_active === 1 || doc.is_active === true;
                    return (
                      <tr key={doc.id}>
                        <td>
                          <button
                            type="button"
                            className={isActive ? styles.statusActive : styles.statusInactive}
                            onClick={() => handleLawToggle(doc.id)}
                            title="클릭하여 질의응답 적용 여부 토글"
                            style={{ cursor: 'pointer', border: 'none' }}
                          >
                            {isActive ? '적용중' : '비활성'}
                          </button>
                        </td>
                        <td>
                          <strong>{doc.title}</strong>
                        </td>
                        <td>{doc.source} ({doc.article})</td>
                        <td>{doc.revision_date}</td>
                        <td>{doc.category}</td>
                        <td>
                          <div className={styles.actionBtnGroup} style={{ justifyContent: 'center' }}>
                            <button
                              className={styles.btnSmall}
                              onClick={() => {
                                setEditingLawId(doc.id);
                                setLawFormData({
                                  title: doc.title,
                                  source: doc.source,
                                  article: doc.article,
                                  revision_date: doc.revision_date,
                                  category: doc.category,
                                  content: doc.content
                                });
                                setShowLawForm(true);
                              }}
                            >
                              수정
                            </button>
                            <button
                              className={`${styles.btnSmall} ${styles.btnDanger}`}
                              onClick={() => handleLawDelete(doc.id, doc.title)}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              {/* 체크리스트 탭 */}
              <div className={styles.toolbar}>
                <span className={styles.toolInfo}>
                  이용정지 민원 체크리스트의 단계별 표준 소명 가이드 및 제출 필요 서류를 규칙 엔진에 동적으로 관리합니다.
                </span>
                <button
                  className={styles.addBtn}
                  onClick={() => {
                    setEditingRuleId(null);
                    setRuleFormData({ category: '', law_reference: '정보통신망법 시행령 제62조의4', summary: '', actionStepsText: '' });
                    setShowRuleForm(!showRuleForm);
                  }}
                >
                  <Plus size={15} />
                  <span>{showRuleForm ? '등록 폼 닫기' : '신규 소명 규칙 등록'}</span>
                </button>
              </div>

              {/* 규칙 폼 */}
              {showRuleForm && (
                <form className={styles.formBox} onSubmit={handleRuleSubmit}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '15px', color: '#0f172a' }}>
                    {editingRuleId ? '소명 규칙 수정' : '신규 자율규제 소명 규칙 등록'}
                  </h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>소명 케이스 명칭 *</label>
                      <input
                        className={styles.formInput}
                        value={ruleFormData.category}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, category: e.target.value })}
                        placeholder="예: 통신 과실로 인한 오차단 소명 절차"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>법적 근거 조문</label>
                      <input
                        className={styles.formInput}
                        value={ruleFormData.law_reference}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, law_reference: e.target.value })}
                        placeholder="시행령 제62조의4 제3항"
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>표준 소명 요약 문안 *</label>
                      <textarea
                        className={styles.formTextarea}
                        style={{ minHeight: '60px' }}
                        value={ruleFormData.summary}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, summary: e.target.value })}
                        placeholder="소명 기준 및 처리 방향 요약문"
                        required
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>단계별 처리 절차 및 필요 서류 (줄바꿈으로 구분) *</label>
                      <textarea
                        className={styles.formTextarea}
                        value={ruleFormData.actionStepsText}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, actionStepsText: e.target.value })}
                        placeholder="1. 이동통신사 고객센터 이의신청서 접수&#10;2. 신분증 사본 및 증빙자료 첨부&#10;3. 심사 후 3영업일 이내 해제"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnSmall} onClick={() => setShowRuleForm(false)}>취소</button>
                    <button type="submit" className={styles.addBtn} disabled={isLoading}>
                      <Save size={14} />
                      <span>{isLoading ? '저장 중...' : '규칙 저장'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 규칙 테이블 */}
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>소명 유형</th>
                    <th>법적 근거</th>
                    <th>표준 가이드 요약</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td><strong>{rule.category}</strong></td>
                      <td style={{ color: '#004b93' }}>{rule.law_reference}</td>
                      <td>{rule.summary}</td>
                      <td>
                        <div className={styles.actionBtnGroup} style={{ justifyContent: 'center' }}>
                          <button
                            className={styles.btnSmall}
                            onClick={() => {
                              setEditingRuleId(rule.id);
                              setRuleFormData({
                                category: rule.category,
                                law_reference: rule.law_reference,
                                summary: rule.summary,
                                actionStepsText: Array.isArray(rule.action_steps) ? rule.action_steps.join('\n') : ''
                              });
                              setShowRuleForm(true);
                            }}
                          >
                            수정
                          </button>
                          <button
                            className={`${styles.btnSmall} ${styles.btnDanger}`}
                            onClick={() => handleRuleDelete(rule.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 세 번째 탭: AI 모델 제원 및 전환 적합성 (SFR-003) */}
          {activeTab === 'models' && (
            <div>
              {/* 툴바 / 아키텍처 안내 */}
              <div className={styles.toolbar} style={{ background: '#f8fafc', borderLeft: '4px solid #004b93', padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layers size={18} color="#004b93" />
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                      벤더 비종속(Vendor-Agnostic) 어댑터 아키텍처 가동 중
                    </strong>
                    <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                      현재 가동: {currentProvider === 'gemini' ? 'Google Gemini 2.5 Flash' : currentProvider === 'openai_vllm' ? 'OpenAI GPT-4o / vLLM' : 'HyperCLOVA X'}
                    </span>
                  </div>
                  <span className={styles.toolInfo} style={{ fontSize: '12px', lineHeight: 1.6 }}>
                    특정 외산 LLM 종속(Vendor Lock-in)을 탈피하고, 국가정보자원관리원 온프레미스 폐쇄망(vLLM) 및 국산 공공 LLM(HyperCLOVA X)으로 별도 코드 수정 없이 즉시 전환 가능한 플러그인 어댑터 구조입니다.
                  </span>
                </div>
              </div>

              {/* 모델 비교 카드 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {modelSpecs.map((m) => {
                  const isCurrent = m.is_current;
                  const bench = benchmarkResults[m.id];
                  const isLoadingBench = benchmarkLoading === m.id;

                  return (
                    <div
                      key={m.id}
                      style={{
                        background: isCurrent ? '#f0f9ff' : '#ffffff',
                        border: isCurrent ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        boxShadow: isCurrent ? '0 4px 16px rgba(2, 132, 199, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div>
                        {/* 상단 뱃지 행 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: isCurrent ? '#0284c7' : '#e2e8f0', color: isCurrent ? '#ffffff' : '#475569' }}>
                            {isCurrent ? '현재 가동 모델 (OPERATIONAL)' : '전환 대기 (READY)'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{m.version}</span>
                        </div>

                        {/* API 키 상태 뱃지 (실무적 투명성) */}
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: m.api_key_configured ? '#ecfdf5' : '#fef3c7',
                            color: m.api_key_configured ? '#065f46' : '#92400e',
                            border: `1px solid ${m.api_key_configured ? '#a7f3d0' : '#fde68a'}`
                          }}>
                            {m.api_key_status || (m.api_key_configured ? '● API Key 연동 완료' : '○ API Key 미등록')}
                          </span>
                        </div>

                        {/* 모델명 */}
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                          {m.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, marginBottom: '12px' }}>
                          {m.delivery_type}
                        </p>

                        {/* 제원 스펙 리스트 */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>제공 기관/인프라:</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.provider}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>컨텍스트 길이:</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.context_window}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>지원 언어:</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.languages}</span>
                          </div>
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '7px', marginTop: '3px' }}>
                            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>보안 및 규정 준수:</span>
                            <span style={{ color: '#047857', fontWeight: 600, fontSize: '11px' }}>{m.security_features}</span>
                          </div>
                        </div>

                        {/* 선정 사유 */}
                        <div style={{ marginTop: '12px', fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.6 }}>
                          <strong style={{ color: '#0f172a' }}>선정 사유: </strong>
                          {m.selection_reason}
                        </div>

                        {/* 벤치마크 결과가 있을 때 */}
                        {bench && (
                          <div style={{ marginTop: '12px', background: bench.success ? '#ecfdf5' : '#fef2f2', border: `1px solid ${bench.success ? '#a7f3d0' : '#fecaca'}`, borderRadius: '8px', padding: '10px 12px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: bench.success ? '#047857' : '#b91c1c', marginBottom: '4px' }}>
                              <span>검증: {bench.status_label}</span>
                              <span>응답속도: {bench.latency_sec}초 (기준 5.0초)</span>
                            </div>
                            {bench.test_output && (
                              <p style={{ margin: 0, color: '#334155', fontStyle: 'italic' }}>
                                "{bench.test_output}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <button
                          type="button"
                          className={styles.btnSmall}
                          onClick={() => handleRunBenchmark(m.id)}
                          disabled={isLoadingBench}
                          style={{ flex: 1, padding: '8px 10px' }}
                        >
                          <Zap size={13} />
                          <span>{isLoadingBench ? '검증 중...' : '품질·속도 검증'}</span>
                        </button>

                        {!isCurrent && (
                          <button
                            type="button"
                            className={styles.addBtn}
                            onClick={() => handleSwitchModel(m.id)}
                            disabled={isLoading}
                            style={{ flex: 1, padding: '8px 10px', background: '#0284c7' }}
                          >
                            <ArrowRightLeft size={13} />
                            <span>이 모델로 전환</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
