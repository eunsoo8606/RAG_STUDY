'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Database, CheckSquare, Plus, Edit2, Trash2,
  RefreshCw, CheckCircle2, AlertCircle, Save, Shield
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

interface KisaAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent?: () => void;
}

export default function KisaAdminModal({ isOpen, onClose, onRefreshParent }: KisaAdminModalProps) {
  const [activeTab, setActiveTab] = useState<'laws' | 'checklists'>('laws');
  const [laws, setLaws] = useState<LawDoc[]>([]);
  const [rules, setRules] = useState<ChecklistRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      fetchLaws();
      fetchRules();
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
            <span className={styles.headerBadge}>SFR-002 과업 규격</span>
            <h3 className={styles.headerTitle}>KISA 불법스팸 지식정보 & 체크리스트 관리 콘솔</h3>
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
            onClick={() => { setActiveTab('laws'); setShowLawForm(false); }}
          >
            <Database size={16} />
            <span>법령·가이드라인 지식베이스 관리 (RAG 색인 {laws.length}건)</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'checklists' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('checklists'); setShowRuleForm(false); }}
          >
            <CheckSquare size={16} />
            <span>이용정지 체크리스트 규칙 관리 ({rules.length}건)</span>
          </button>
        </div>

        {/* 바디 영역 */}
        <div className={styles.modalBody}>
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
        </div>
      </div>
    </div>
  );
}
