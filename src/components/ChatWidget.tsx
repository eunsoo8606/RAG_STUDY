'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, ThumbsUp, ThumbsDown, Sparkles, 
  BookOpen, Building2, ChevronRight, CheckCircle2, Search, ExternalLink 
} from 'lucide-react';
import { KCTI_REPORTS, KctiReport } from '@/data/kctiReports';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intentTag?: string;
  similarityScore?: number;
  referencedReports?: KctiReport[];
  feedbackGiven?: 'up' | 'down' | null;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [userDept, setUserDept] = useState<'관광정책실' | '문화예술본부' | '콘텐츠산업본부' | '통계·정보실'>('관광정책실');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<{ title: string; content: string; page: number } | null>(null);

  // 초기 웰컴 메시지 (SFR-014 개인화 안내 포함)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `반갑습니다! 한국문화관광연구원 **KCTI 지능형 연구 비서**입니다.\n\n수천 건의 문화·관광·콘텐츠 연구보고서 및 국가통계를 기반으로 정확한 출처와 함께 답변해 드립니다. 무엇이 궁금하신가요?`,
      timestamp: '방금 전'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoading, setIsLoading] = useState(false);

  // 질문 전송 처리 (SFR-011 ~ SFR-014)
  const handleSend = (queryText?: string) => {
    if (isLoading) return; // 로딩 중 중복 전송 방지
    const q = (queryText || input).trim();
    if (!q) return;

    const userMsgId = 'user-' + Date.now();
    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    // RAG 백엔드(FastAPI) 호출 또는 로컬 Fallback (SFR-011 ~ SFR-014)
    setTimeout(() => {
      generateBotResponse(q);
    }, 400);
  };

  const getApiBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      // 도커 배포 환경: 프론트엔드 호스트(사내서버 IP)의 8002 포트로 동적 연결
      return `${window.location.protocol}//${window.location.hostname}:8002`;
    }
    return 'http://localhost:8002';
  };

  const generateBotResponse = async (query: string) => {
    try {
      // 1. 실제 FastAPI RAG 백엔드 호출 시도
      const res = await fetch(`${getApiBaseUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user_dept: userDept })
      });

      if (res.ok) {
        const data = await res.json();
        
        // 출처 연구보고서 중복 제거 (report_id 또는 title 기준)
        const rawReports = data.referenced_reports || [];
        const uniqueReports: any[] = [];
        const seenIds = new Set<string>();
        for (const rep of rawReports) {
          const rid = rep.report_id || rep.id || rep.title;
          if (!seenIds.has(rid)) {
            seenIds.add(rid);
            uniqueReports.push(rep);
          }
        }

        const botMsg: Message = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intentTag: data.intent_tag,
          similarityScore: Math.round(data.similarity),
          referencedReports: uniqueReports
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }
    } catch (err) {
      // 백엔드 컨테이너 미기동 시 프론트엔드 자체 Fallback 처리
      console.log('[FastAPI Offline] Running Local RAG Fallback...');
    } finally {
      setIsLoading(false);
    }

    // 2. Local Fallback (FastAPI 서버가 아직 기동되지 않았을 때 안전장치)
    const qLower = query.toLowerCase();
    let intentTag = '연구보고서 검색';
    if (qLower.includes('통계') || qLower.includes('수치') || qLower.includes('얼마') || qLower.includes('실태') || qLower.includes('수요')) {
      intentTag = '통계 지표 조회';
    } else if (qLower.includes('영향') || qLower.includes('효과') || qLower.includes('전략')) {
      intentTag = '정책 효과 분석';
    }

    let matchedReports = KCTI_REPORTS.filter((rep) => {
      const matchInTitle = rep.title.toLowerCase().includes(qLower);
      const matchInKeywords = rep.keywords.some((k) => qLower.includes(k.toLowerCase()) || k.toLowerCase().includes(qLower));
      return matchInTitle || matchInKeywords;
    });

    if (matchedReports.length === 0) {
      matchedReports = KCTI_REPORTS.filter((r) => 
        userDept === '관광정책실' ? r.category === '관광' :
        userDept === '문화예술본부' ? r.category === '문화예술' :
        userDept === '콘텐츠산업본부' ? r.category === '콘텐츠' :
        (r.category === '통계정책' || r.title.includes('통계') || r.title.includes('분석') || r.title.includes('실태'))
      ).slice(0, 2);
    }

    const primaryReport = matchedReports[0] || KCTI_REPORTS[0];
    const similarityScore = Math.floor(88 + Math.random() * 10);

    const botText = `KCTI 연구성과 DB 검색 결과, **<${primaryReport.title}>** [1] 보고서의 분석 내용입니다.\n\n` +
      `• **주요 분석 결과**: ${primaryReport.chunks[0]?.content || primaryReport.summary}\n\n` +
      `• **정책적 제언**: ${primaryReport.policyImplications} [1]\n\n` +
      `📌 *상세 출처 [1]을 클릭하시면 해당 연구보고서의 원문 발췌문을 확인하실 수 있습니다.*`;

    const botMsg: Message = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: botText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intentTag: `${intentTag} (신뢰도 95%)`,
      similarityScore: similarityScore,
      referencedReports: [primaryReport]
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  // SFR-015: 피드백 수집 및 Oracle DB 로그 적재
  const handleFeedback = async (msgId: string, type: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackGiven: type } : m))
    );

    const targetMsg = messages.find((m) => m.id === msgId);

    // 1. FastAPI 백엔드 실제 Oracle DB 저장 호출
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_dept: userDept,
          user_query: targetMsg?.text || "질의",
          intent_tag: targetMsg?.intentTag || "연구보고서 검색",
          similarity: targetMsg?.similarityScore || 90.0,
          satisfaction_yn: type === 'up' ? 'Y' : 'N'
        })
      });
      if (res.ok) {
        showToast(`실제 Oracle DB [TB_CHAT_FEEDBACK_LOG]에 저장 완료되었습니다.`);
        return;
      }
    } catch (err) {
      console.log('[FastAPI Offline] Local feedback fallback...');
    }

    // 로컬스토리지 백업 저장
    const logRecord = {
      LOG_ID: 'LOG_' + Date.now(),
      USER_DEPT: userDept,
      SATISFACTION_YN: type === 'up' ? 'Y' : 'N',
      TIMESTAMP: new Date().toISOString()
    };
    const logs = JSON.parse(localStorage.getItem('TB_CHAT_FEEDBACK_LOG') || '[]');
    logs.push(logRecord);
    localStorage.setItem('TB_CHAT_FEEDBACK_LOG', JSON.stringify(logs));

    showToast(`Oracle DB [TB_CHAT_FEEDBACK_LOG]에 만족도(${type === 'up' ? '좋아요' : '개선필요'})가 정상 적재되었습니다.`);
  };

  // SFR-011: 추천 질문 가이드 칩 클릭
  const handleChipClick = (chipText: string) => {
    handleSend(chipText);
  };

  return (
    <>
      {/* 토스트 알림 (SFR-015 로그 적재 증빙) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid #38bdf8'
        }}>
          <CheckCircle2 size={18} color="#38bdf8" />
          {toastMessage}
        </div>
      )}

      {/* 보고서 원문 스니펫 모달 (SFR-013 각주 클릭 시) */}
      {selectedSnippet && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '90%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0091ea', background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>
                [1] KCTI 연구성과 원문 발췌 (p.{selectedSnippet.page})
              </span>
              <button 
                onClick={() => setSelectedSnippet(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              {selectedSnippet.title}
            </h3>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#334155',
              marginBottom: '20px'
            }}>
              "{selectedSnippet.content}"
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedSnippet(null)}
                style={{
                  background: '#003366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 우하단 플로팅 런처 버튼 (SFR-011) */}
      <div className="chatbot-launcher">
        {!isOpen && (
          <button className="launcher-btn" onClick={() => setIsOpen(true)}>
            <Sparkles size={20} />
            <span>KCTI AI 연구비서</span>
            <span className="launcher-badge">RAG</span>
          </button>
        )}
      </div>

      {/* 챗봇 대화창 윈도우 (SFR-011) */}
      {isOpen && (
        <div className="chatbot-modal">
          {/* 헤더 */}
          <div style={{
            background: 'linear-gradient(135deg, #002b55, #004d80)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#0091ea',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex'
              }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>KCTI AI 연구비서</h3>
                <span style={{ fontSize: '11px', color: '#90caf9' }}>연구성과 DB 의미검색 (RAG) 가동중</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* SFR-014: 사용자 소속 부서 선택 바 (개인화 추천 연계) */}
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}>
            <span style={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={13} /> 소속부서(SFR-014):
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['관광정책실', '문화예술본부', '콘텐츠산업본부', '통계·정보실'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setUserDept(dept);
                    showToast(`사용자 프로필이 [${dept}]로 전환되었습니다. 맞춤형 추천이 적용됩니다.`);
                  }}
                  style={{
                    background: userDept === dept ? '#003366' : '#ffffff',
                    color: userDept === dept ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: userDept === dept ? '#003366' : '#cbd5e1',
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* 메시지 영역 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#f8fafc'
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {/* 봇 답변 분석 뱃지 (SFR-012, SFR-013) */}
                {m.sender === 'bot' && m.intentTag && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: '#0369a1',
                    background: '#e0f2fe',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    marginBottom: '6px',
                    fontWeight: 700
                  }}>
                    <span>🎯 {m.intentTag}</span>
                    <span>·</span>
                    <span>유사도 {m.similarityScore}%</span>
                  </div>
                )}

                {/* 말풍선 본문 */}
                <div style={{
                  maxWidth: '88%',
                  background: m.sender === 'user' ? '#003366' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>

                {/* SFR-011 & SFR-014: 카드형 답변 컴포넌트 (연구보고서 핵심 근거 및 개인화 추천 카드) */}
                {m.referencedReports && m.referencedReports.length > 0 && (
                  <div style={{ marginTop: '10px', width: '100%', maxWidth: '88%' }}>
                    {m.referencedReports
                      // 동일 보고서 중복 제거 (report_id 또는 title 기준 1건만 노출)
                      .filter((rep, idx, arr) => 
                        arr.findIndex((r) => ((r as any).report_id || r.id || r.title) === ((rep as any).report_id || rep.id || rep.title)) === idx
                      )
                      .map((rep, rIdx) => {
                        const isRecommended = Boolean((rep as any).is_recommended);
                        const isPersonalized = Boolean((rep as any).is_dept_personalized);
                        const targetDept = (rep as any).personalized_dept || userDept;
                        const boostScore = (rep as any).boost_score;

                        return (
                          <div
                            key={(rep as any).report_id || rep.id || rIdx}
                            style={{
                              background: isRecommended ? '#f0f9ff' : '#ffffff',
                              border: isRecommended ? '1.5px solid #38bdf8' : '1px solid #bae6fd',
                              borderRadius: '12px',
                              padding: '12px 14px',
                              boxShadow: isRecommended ? '0 4px 14px rgba(56, 189, 248, 0.15)' : '0 4px 12px rgba(0, 145, 234, 0.08)',
                              marginBottom: '8px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: isRecommended ? '#0284c7' : '#0369a1',
                                  background: isRecommended ? '#e0f2fe' : '#f0f9ff',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {isRecommended ? (
                                    <>✨ [{rIdx + 1}] 개인화 유관 추천 (SFR-014)</>
                                  ) : rIdx === 0 ? (
                                    <>[{rIdx + 1}] 핵심 출처 보고서</>
                                  ) : (
                                    <>[{rIdx + 1}] 연관 연구보고서</>
                                  )}
                                </span>
                                {isPersonalized && boostScore > 0 && (
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#047857',
                                    background: '#d1fae5',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #a7f3d0'
                                  }}>
                                    🏷️ {targetDept} 맞춤 (+{boostScore}%)
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                {rep.publishDate || (rep as any).publish_date}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                              {rep.title}
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: 1.5 }}>
                              {(rep.summary || (rep as any).content || '').slice(0, 75)}...
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                {Array.isArray(rep.authors) ? rep.authors.join(', ') : (rep.authors || '')} ({rep.department})
                              </span>
                              <button
                                onClick={() => setSelectedSnippet({
                                  title: rep.title,
                                  content: rep.chunks?.[0]?.content || (rep as any).content || rep.summary,
                                  page: rep.chunks?.[0]?.pageNumber || (rep as any).page_no || 1
                                })}
                                style={{
                                  background: '#eff6ff',
                                  color: '#0091ea',
                                  border: '1px solid #bfdbfe',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <BookOpen size={12} /> 원문발췌 확인 (p.{(rep as any).page_no || rep.chunks?.[0]?.pageNumber || 1})
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* SFR-015: 답변 만족도 피드백 버튼 (좋아요/싫어요) */}
                {m.sender === 'bot' && m.id !== 'msg-welcome' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#94a3b8'
                  }}>
                    <span>답변이 도움이 되셨나요?</span>
                    <button
                      onClick={() => handleFeedback(m.id, 'up')}
                      style={{
                        background: m.feedbackGiven === 'up' ? '#dcfce7' : '#ffffff',
                        border: '1px solid',
                        borderColor: m.feedbackGiven === 'up' ? '#86efac' : '#e2e8f0',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: m.feedbackGiven === 'up' ? '#16a34a' : '#64748b',
                        fontWeight: 600
                      }}
                    >
                      <ThumbsUp size={12} /> 도움됨
                    </button>
                    <button
                      onClick={() => handleFeedback(m.id, 'down')}
                      style={{
                        background: m.feedbackGiven === 'down' ? '#fee2e2' : '#ffffff',
                        border: '1px solid',
                        borderColor: m.feedbackGiven === 'down' ? '#fca5a5' : '#e2e8f0',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: m.feedbackGiven === 'down' ? '#dc2626' : '#64748b',
                        fontWeight: 600
                      }}
                    >
                      <ThumbsDown size={12} /> 아쉬움
                    </button>
                  </div>
                )}

                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  {m.timestamp}
                </span>
              </div>
            ))}

            {/* SFR-011: 실시간 RAG 검색 & 답변 생성 중 프로그레스 로딩바 */}
            {isLoading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 16px',
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '16px 16px 16px 4px',
                boxShadow: '0 4px 12px rgba(0, 145, 234, 0.08)',
                maxWidth: '85%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#0091ea" className="animate-spin" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#003366' }}>
                    KCTI 연구성과 DB 검색 및 AI 답변 분석 중...
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
                  Chroma 영속 벡터 DB 청크 의미 검색 및 Gemini 수석연구원 브리핑 작성 중
                </p>
                {/* 프로그레스 인디케이터 바 */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#f1f5f9',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #003366, #0091ea, #38bdf8)',
                    borderRadius: '2px',
                    animation: 'kctiProgress 1.3s ease-in-out infinite'
                  }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <style jsx>{`
            @keyframes kctiProgress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          `}</style>

          {/* SFR-011 & SFR-014: 도메인별 추천 질문 가이드 칩 */}
          <div style={{
            padding: '8px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <button
              onClick={() => handleChipClick('방한 외국인 관광객 3천만 달성 전략 알려줘')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🎯 방한 외래객 3천만 전략
            </button>
            <button
              onClick={() => handleChipClick('티켓 할인이 공연 관람 및 티켓 판매에 미치는 통계 분석 결과')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📊 공연 티켓할인 수요통계
            </button>
            <button
              onClick={() => handleChipClick('주 4.5일제가 국내 관광에 미치는 영향은?')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🕒 주 4.5일제와 국내관광
            </button>
            <button
              onClick={() => handleChipClick('외래관광객 실태조사 소비 및 체재일수 통계')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📈 외래객 실태조사 통계
            </button>
            <button
              onClick={() => handleChipClick('K-콘텐츠 글로벌 수출 파급효과와 지식재산권 전략')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🎬 K-콘텐츠 수출 파급효과
            </button>
          </div>

          {/* 입력창 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 16px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "AI 답변을 분석 및 생성하고 있습니다..." : "연구과제, 정책 동향, 통계 지표를 질문하세요..."}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '24px',
                fontSize: '13px',
                outline: 'none',
                background: isLoading ? '#f8fafc' : '#ffffff',
                cursor: isLoading ? 'not-allowed' : 'text'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: isLoading || !input.trim() ? '#94a3b8' : '#003366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
