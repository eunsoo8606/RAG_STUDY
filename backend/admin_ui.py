"""
한국문화관광연구원(KCTI) 지능형 RAG - ChromaDB 시각화 웹 어드민 대시보드
======================================================================
1. 20종 KCTI 연구보고서 & 40개 영속 벡터 청크 탐색기
2. 3072차원 코사인 유사도 벡터 검색 플레이그라운드
3. SFR-015 SQLite 피드백 감사 로그 실시간 뷰어
"""

import sqlite3
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

import chromadb
from rag_service import collection, search_reports_from_vector_db, analyze_intent, generate_rag_answer_with_ai

admin_router = APIRouter()

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KCTI ChromaDB Vector Admin Console</title>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  <style>
    :root {
      --primary: #003366;
      --primary-light: #0284c7;
      --accent: #38bdf8;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --success: #10b981;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
    .container { max-width: 1400px; margin: 0 auto; }
    
    /* Header */
    header {
      background: linear-gradient(135deg, #002244 0%, #003366 50%, #0369a1 100%);
      color: white;
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 51, 102, 0.25);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-title h1 { font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
    .header-title p { font-size: 13px; color: #bae6fd; margin-top: 4px; }
    .badge-status {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #34d399;
      color: #a7f3d0;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }

    /* Metrics Grid */
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 18px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .metric-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .metric-value { font-size: 22px; font-weight: 800; color: var(--primary); margin-top: 6px; }
    .metric-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    /* Tabs */
    .nav-tabs { display: flex; gap: 8px; border-bottom: 2px solid var(--border); margin-bottom: 20px; }
    .tab-btn {
      background: none;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }
    .tab-btn.active { color: var(--primary-light); border-bottom-color: var(--primary-light); }
    .tab-btn:hover:not(.active) { color: var(--text); }

    /* Controls Bar */
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-chip {
      background: #ffffff;
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      color: #475569;
      transition: all 0.15s;
    }
    .filter-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
    .search-input {
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      min-width: 280px;
      outline: none;
    }
    .search-input:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(2,132,199,0.1); }

    /* Report Card & Header */
    .report-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .report-header {
      padding: 16px 20px;
      background: #ffffff;
      cursor: pointer;
      user-select: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: background 0.15s;
    }
    .report-header:hover {
      background: #f8fafc;
    }
    .report-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      width: 100%;
    }
    .report-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }
    .dept-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #eff6ff;
      color: #0369a1;
      border: 1px solid #bfdbfe;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .report-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.4;
    }
    .report-header-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .report-header-bottom {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
    }
    .page-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }
    .page-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .page-summary-badge {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      color: #0284c7;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    /* Chunks Container */
    .chunks-container {
      padding: 0 20px 18px;
      background: #fafafa;
      border-top: 1px solid var(--border);
      display: none;
    }
    .chunk-item {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px;
      margin-top: 12px;
    }
    .chunk-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .chunk-content {
      font-size: 13px;
      color: #1e293b;
      line-height: 1.6;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #f1f5f9;
      white-space: pre-wrap;
    }

    /* Playground */
    .playground-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .pg-form { display: grid; grid-template-columns: 1fr 180px 120px; gap: 12px; margin-bottom: 24px; }
    .pg-input { padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; }
    .pg-input:focus { border-color: var(--primary-light); }
    .pg-select { padding: 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 13px; font-weight: 600; outline: none; }
    .pg-btn { background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
    .pg-btn:hover { background: #002244; }

    /* Results */
    .result-card {
      border: 1.5px solid #bae6fd;
      background: #f0f9ff;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .sim-bar-wrap { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 8px 0; }
    .sim-bar { height: 100%; background: linear-gradient(90deg, #0284c7, #10b981); }

    /* Feedback Table */
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
    th, td { padding: 12px 16px; text-align: left; font-size: 13px; border-bottom: 1px solid var(--border); }
    th { background: #f8fafc; font-weight: 700; color: var(--text-muted); }
    tr:hover { background: #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <div class="header-title">
        <h1>📊 KCTI ChromaDB Vector Admin Console</h1>
        <p>한국문화관광연구원 RAG 지능형 검색 영속 벡터 데이터베이스 관리 및 실시간 뷰어</p>
      </div>
      <div class="badge-status">
        <div class="pulse-dot"></div>
        <span>Chroma Persistent Active</span>
      </div>
    </header>

    <!-- Metrics -->
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">컬렉션 명 (Collection)</div>
        <div class="metric-value" style="font-size: 17px;">kcti_reports_collection</div>
        <div class="metric-sub">HNSW 인덱싱 (Cosine Space)</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">적재 청크 수 (Indexed Chunks)</div>
        <div class="metric-value" id="totalChunks">로딩 중...</div>
        <div class="metric-sub" id="metricReportCount">KCTI 연구보고서 원문 분할</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">임베딩 차원 (Dimension)</div>
        <div class="metric-value">3,072 dims</div>
        <div class="metric-sub">models/gemini-embedding-001</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">영속 스토리지 (Storage)</div>
        <div class="metric-value" style="font-size: 17px;">Local SQLite/HNSW</div>
        <div class="metric-sub">backend/chroma_db 디렉토리</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('explorer')">📚 연구보고서 & 청크 탐색기</button>
      <button class="tab-btn" onclick="switchTab('playground')">🎯 3072차원 벡터 검색 시뮬레이터</button>
      <button class="tab-btn" onclick="switchTab('feedbacks')">💬 피드백 감사 로그 (TB_CHAT_FEEDBACK_LOG)</button>
    </div>

    <!-- Tab 1: Explorer -->
    <div id="tab-explorer">
      <div class="controls-bar">
        <div class="filter-group">
          <button class="filter-chip active" id="chipAll" onclick="filterDept('all', this)">전체보기</button>
          <button class="filter-chip" onclick="filterDept('문화', this)">문화예술</button>
          <button class="filter-chip" onclick="filterDept('관광', this)">관광정책</button>
          <button class="filter-chip" onclick="filterDept('콘텐츠', this)">콘텐츠</button>
          <button class="filter-chip" onclick="filterDept('통계', this)">통계·데이터</button>
        </div>
        <input type="text" class="search-input" id="searchFilter" placeholder="보고서 제목 또는 키워드 필터링..." oninput="filterReports()">
      </div>
      <div id="reportsList">로딩 중...</div>
    </div>

    <!-- Tab 2: Playground -->
    <div id="tab-playground" style="display: none;">
      <div class="playground-box">
        <h3 style="font-size: 16px; margin-bottom: 8px;">실시간 3072차원 시맨틱 벡터 유사도 검색 테스트</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
          입력된 질문을 Google gemini-embedding-001로 실시간 3072차원 실수 벡터화하고, ChromaDB에서 코사인 거리를 계산하여 매칭된 보고서 청크 및 페이지 번호를 검증합니다.
        </p>
        <div class="pg-form">
          <input type="text" class="pg-input" id="pgQuery" placeholder="검색할 질문을 입력하세요 (예: 방한 외국인 3천만 달성 전략, 주 4.5일제 영향, 티켓 할인 통계)">
          <select class="pg-select" id="pgDept">
            <option value="관광정책실">관광정책실</option>
            <option value="문화예술본부">문화예술본부</option>
            <option value="콘텐츠산업본부">콘텐츠산업본부</option>
            <option value="통계·정보실">통계·정보실</option>
          </select>
          <button class="pg-btn" onclick="runSearchTest()">검색 실행</button>
        </div>

        <div id="pgResults"></div>
      </div>
    </div>

    <!-- Tab 3: Feedbacks -->
    <div id="tab-feedbacks" style="display: none;">
      <div class="playground-box">
        <h3 style="font-size: 16px; margin-bottom: 16px;">TB_CHAT_FEEDBACK_LOG 적재 이력</h3>
        <div style="overflow-x: auto;">
          <table id="feedbackTable">
            <thead>
              <tr>
                <th>로그 ID</th>
                <th>일시</th>
                <th>부서</th>
                <th>사용자 질의</th>
                <th>의도 태그</th>
                <th>유사도</th>
                <th>만족도</th>
                <th>의견</th>
              </tr>
            </thead>
            <tbody id="feedbackBody">
              <tr><td colspan="8" style="text-align: center;">피드백 로딩 중...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    let allReports = [];
    let currentDeptFilter = 'all';

    async function loadData() {
      try {
        const res = await fetch('/api/admin/data');
        allReports = await res.json();
        renderReports(allReports);
      } catch (err) {
        document.getElementById('reportsList').innerHTML = '<div style="color: red; padding: 20px;">데이터를 불러오는 데 실패했습니다.</div>';
      }
    }

    function renderReports(reports) {
      // 상단 메트릭 실시간 동적 업데이트
      const totalChunks = reports.reduce((acc, rep) => acc + (rep.chunks ? rep.chunks.length : 0), 0);
      const totalChunksEl = document.getElementById('totalChunks');
      const metricReportCountEl = document.getElementById('metricReportCount');
      if (totalChunksEl) totalChunksEl.innerText = `${totalChunks} Chunks`;
      if (metricReportCountEl) metricReportCountEl.innerText = `총 ${reports.length}종 연구보고서 인덱싱 완료`;
      
      const chipAllEl = document.getElementById('chipAll');
      if (chipAllEl) chipAllEl.innerText = `전체보기 (${reports.length}종)`;

      const container = document.getElementById('reportsList');
      if (reports.length === 0) {
        container.innerHTML = '<div style="padding: 30px; text-align: center; color: #94a3b8;">검색 조건과 일치하는 보고서가 없습니다.</div>';
        return;
      }

      container.innerHTML = reports.map((rep, idx) => {
        // 중복 제거된 실제 도서 수록 페이지 목록
        const uniquePages = Array.from(new Set(rep.chunks.map(c => c.page_no))).sort((a,b) => a - b);
        const minPage = uniquePages[0] || 1;
        const maxPage = uniquePages[uniquePages.length - 1] || minPage;

        // 뱃지 미리보기 (12개 초과 시 범위 요약 뱃지)
        let badgesHtml = '';
        if (uniquePages.length > 12) {
          const previewPages = uniquePages.slice(0, 8);
          badgesHtml = `
            <span class="page-summary-badge">📖 도서 수록 범위: p.${minPage} ~ p.${maxPage} (총 ${uniquePages.length}개 페이지 / ${rep.chunks.length}개 청크)</span>
            ${previewPages.map(p => `<span class="page-badge">📄 p.${p}</span>`).join('')}
            <span class="page-badge" style="color: #64748b; font-weight: 500;">+외 ${uniquePages.length - 8}개 페이지...</span>
          `;
        } else {
          badgesHtml = uniquePages.map(p => `<span class="page-badge">📄 p.${p}</span>`).join('');
        }

        return `
          <div class="report-card" data-dept="${rep.department}" data-title="${rep.title}">
            <div class="report-header" onclick="toggleChunk('${idx}')">
              <div class="report-header-top">
                <div class="report-title-box">
                  <span class="dept-tag">${rep.department}</span>
                  <span class="report-title">${rep.title}</span>
                </div>
                <div class="report-header-meta">
                  <span style="font-size: 12px; color: #64748b; font-weight: 600;">발간: ${rep.publish_date}</span>
                  <span style="font-size: 12px; color: #0284c7; font-weight: 700; background: #f0f9ff; padding: 3px 8px; border-radius: 4px; border: 1px solid #bae6fd;">${rep.chunks.length}개 청크</span>
                  <span id="arrow-${idx}" style="font-size: 12px; color: #0284c7; font-weight: 700; margin-left: 4px;">▼ 펼치기</span>
                </div>
              </div>
              <div class="report-header-bottom">
                <span style="font-size: 11px; color: #64748b; font-weight: 700;">인덱싱 페이지:</span>
                <div class="page-badges">${badgesHtml}</div>
              </div>
            </div>
            <div class="chunks-container" id="chunks-${idx}">
              <div style="font-size: 12px; color: #475569; margin-top: 12px; margin-bottom: 8px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <strong>저자:</strong> ${rep.authors} | <strong>총 청크 수:</strong> ${rep.chunks.length}건 | <strong>수록 범위:</strong> p.${minPage} ~ p.${maxPage}
              </div>
              ${rep.chunks.map((c, cIdx) => `
                <div class="chunk-item">
                  <div class="chunk-header">
                    <span>📌 [청크 #${cIdx + 1}] ID: ${c.chunk_id}</span>
                    <span style="color: #0284c7; font-weight: 800; background: #e0f2fe; padding: 2px 8px; border-radius: 4px;">도서 수록 페이지: p.${c.page_no}</span>
                  </div>
                  <div class="chunk-content">${c.content}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    function toggleChunk(idx) {
      const box = document.getElementById(`chunks-${idx}`);
      const arrow = document.getElementById(`arrow-${idx}`);
      if (box.style.display === 'block') {
        box.style.display = 'none';
        arrow.innerText = '▼ 펼치기';
      } else {
        box.style.display = 'block';
        arrow.innerText = '▲ 접기';
      }
    }

    function filterDept(dept, el) {
      currentDeptFilter = dept;
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      filterReports();
    }

    function filterReports() {
      const query = document.getElementById('searchFilter').value.toLowerCase();
      const filtered = allReports.filter(rep => {
        const matchesDept = (currentDeptFilter === 'all') || rep.department.includes(currentDeptFilter);
        const matchesQuery = !query || rep.title.toLowerCase().includes(query) || rep.chunks.some(c => c.content.toLowerCase().includes(query));
        return matchesDept && matchesQuery;
      });
      renderReports(filtered);
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('tab-explorer').style.display = 'none';
      document.getElementById('tab-playground').style.display = 'none';
      document.getElementById('tab-feedbacks').style.display = 'none';

      if (tabId === 'explorer') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-explorer').style.display = 'block';
      } else if (tabId === 'playground') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-playground').style.display = 'block';
      } else if (tabId === 'feedbacks') {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('tab-feedbacks').style.display = 'block';
        loadFeedbacks();
      }
    }

    async function runSearchTest() {
      const q = document.getElementById('pgQuery').value.trim();
      const dept = document.getElementById('pgDept').value;
      if (!q) { alert('검색어를 입력하세요.'); return; }

      const resultsBox = document.getElementById('pgResults');
      resultsBox.innerHTML = '<div style="padding: 20px; text-align: center; color: #0284c7;">🔍 3072차원 시맨틱 벡터 변환 및 ChromaDB 코사인 유사도 연산 중...</div>';

      try {
        const res = await fetch('/api/admin/search-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, user_dept: dept })
        });
        const data = await res.json();
        
        let html = `
          <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div><strong>[SFR-012 의도 분석]:</strong> <span style="color: #0284c7; font-weight: 700;">${data.intent_info.intent} (신뢰도 ${Math.round(data.intent_info.confidence * 100)}%)</span></div>
              <div style="font-size: 12px; color: #64748b;">매칭 청크: ${data.matched_reports.length}건 발췌</div>
            </div>
            <div style="margin-top: 10px; font-size: 13px; background: #f8fafc; padding: 10px; border-radius: 6px;">
              <strong>🤖 AI 실시간 브리핑:</strong><br>
              <div style="white-space: pre-wrap; margin-top: 6px;">${data.briefing_answer}</div>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #0369a1;">
              <strong>💡 맥락 추천 후속 질문:</strong>
              ${(data.suggested_queries || []).map(sq => `<span style="display: inline-block; background: #e0f2fe; padding: 3px 8px; border-radius: 6px; margin: 3px 4px 0 0;">💬 ${sq}</span>`).join('')}
            </div>
          </div>
          <h4 style="font-size: 14px; margin-bottom: 10px;">ChromaDB 코사인 유사도 랭킹 결과</h4>
        `;

        html += data.matched_reports.map((r, i) => `
          <div class="result-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 14px; color: #0369a1;">#${i + 1}. [${r.department}] <${r.title}></span>
              <span style="font-size: 13px; font-weight: 800; color: #10b981;">유사도 ${r.similarity}% ${r.boost_score > 0 ? `(+${r.boost_score}% 부서가산)` : ''}</span>
            </div>
            <div class="sim-bar-wrap">
              <div class="sim-bar" style="width: ${r.similarity}%;"></div>
            </div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">
              <strong>발췌 페이지:</strong> <span style="background: #e0f2fe; color: #0284c7; padding: 1px 6px; border-radius: 4px; font-weight: 700;">p.${r.page_no}</span> | <strong>청크 ID:</strong> ${r.chunk_id} | <strong>코사인 거리:</strong> ${r.cosine_distance.toFixed(4)}
            </div>
            <div style="font-size: 12.5px; color: #334155; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e0f2fe;">
              ${r.content}
            </div>
          </div>
        `).join('');

        resultsBox.innerHTML = html;
      } catch (err) {
        resultsBox.innerHTML = '<div style="color: red; padding: 20px;">검색 테스트 중 오류가 발생했습니다.</div>';
      }
    }

    async function loadFeedbacks() {
      const tbody = document.getElementById('feedbackBody');
      try {
        const res = await fetch('/api/admin/feedbacks');
        const list = await res.json();
        if (list.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8;">적재된 피드백 기록이 없습니다.</td></tr>';
          return;
        }
        tbody.innerHTML = list.map(f => `
          <tr>
            <td style="font-family: monospace; font-size: 11px;">${f.LOG_ID}</td>
            <td style="font-size: 11px; color: #64748b;">${f.CREATED_AT}</td>
            <td><span class="dept-tag">${f.USER_DEPT}</span></td>
            <td style="font-weight: 600;">${f.USER_QUERY}</td>
            <td><span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${f.INTENT_TAG}</span></td>
            <td><strong>${f.SIMILARITY_SCORE}%</strong></td>
            <td style="font-size: 16px;">${f.SATISFACTION_YN === 'Y' ? '👍' : '👎'}</td>
            <td style="color: #64748b; font-size: 12px;">${f.FEEDBACK_TEXT || '-'}</td>
          </tr>
        `).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">피드백을 불러오지 못했습니다.</td></tr>';
      }
    }

    loadData();
  </script>
</body>
</html>
"""

@admin_router.get("/admin", response_class=HTMLResponse)
def get_admin_dashboard():
    """ChromaDB 시각화 웹 콘솔 대시보드 페이지"""
    return HTMLResponse(content=HTML_TEMPLATE)

@admin_router.get("/api/admin/data")
def get_all_vector_data():
    """ChromaDB에 영구 적재된 20대 보고서 및 40개 청크 목록 반환"""
    if not collection:
        return []

    data = collection.get(include=['metadatas', 'documents'])
    reports_map: Dict[str, Dict[str, Any]] = {}

    for cid, doc, meta in zip(data['ids'], data['documents'], data['metadatas']):
        title = meta.get('title', '무제')
        dept = meta.get('department', '기타')
        page_no = meta.get('page_no') or meta.get('page') or meta.get('pdf_page') or 1
        authors = meta.get('authors') or meta.get('author') or 'KCTI 연구진'
        publish_date = str(meta.get('publish_date') or meta.get('year') or '2025')
        summary = meta.get('summary', '')
        policy_implications = meta.get('policy_implications', '')

        if title not in reports_map:
            reports_map[title] = {
                'title': title,
                'department': dept,
                'authors': authors,
                'publish_date': publish_date,
                'summary': summary,
                'policy_implications': policy_implications,
                'chunks': []
            }

        reports_map[title]['chunks'].append({
            'chunk_id': cid,
            'page_no': page_no,
            'content': doc
        })

    # 페이지 번호 기준 정렬
    for rep in reports_map.values():
        rep['chunks'].sort(key=lambda c: c['page_no'])

    return list(reports_map.values())

class TestSearchRequest(BaseModel):
    query: str
    user_dept: str = "관광정책실"

@admin_router.post("/api/admin/search-test")
def run_admin_search_test(req: TestSearchRequest):
    """플레이그라운드 실시간 3072차원 벡터 검색 및 스코어 상세 조회"""
    intent_info = analyze_intent(req.query)
    matched_reports = search_reports_from_vector_db(
        intent_info["cleaned_query"],
        req.user_dept,
        query_vector=intent_info.get("query_vector")
    )
    
    primary = matched_reports[0] if matched_reports else None
    if primary:
        briefing, suggested_queries = generate_rag_answer_with_ai(req.query, primary)
    else:
        briefing = "일치하는 보고서를 찾지 못했습니다."
        suggested_queries = []

    return {
        "intent_info": intent_info,
        "matched_reports": matched_reports,
        "briefing_answer": briefing,
        "suggested_queries": suggested_queries
    }

@admin_router.get("/api/admin/feedbacks")
def get_admin_feedbacks():
    """SQLite feedback.db 감사 로그 전체 조회"""
    db_path = Path(__file__).parent / "feedback.db"
    if not db_path.exists():
        return []

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM TB_CHAT_FEEDBACK_LOG ORDER BY CREATED_AT DESC LIMIT 100")
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows
