from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from rag_service import (
    analyze_intent, 
    search_reports_from_vector_db, 
    save_feedback_to_db, 
    generate_rag_answer_with_ai,
    collection,
    QuotaExceededException
)
import re

app = FastAPI(
    title="KCTI AI Vector RAG Backend Service",
    description="한국문화관광연구원 과업지시서(SFR-011~015) 대응 Chroma Vector DB 단독 마이크로서비스",
    version="2.0.0"
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChromaDB 웹 어드민 콘솔 라우터 등록 (/admin)
from admin_ui import admin_router
app.include_router(admin_router)

class ChatRequest(BaseModel):
    query: str
    user_dept: Optional[str] = "관광정책실"

class FeedbackRequest(BaseModel):
    user_dept: str
    user_query: str
    intent_tag: str
    similarity: float
    satisfaction_yn: str  # 'Y' or 'N'
    feedback_text: Optional[str] = ""

def check_domain_guardrail(query: str) -> Optional[Dict[str, Any]]:
    """
    [품질/보안 가드레일] KCTI 도메인 무관 질의, 일상 잡담, 거부 의도 사전 차단 (Zero-latency & Zero-API)
    Why: API 쿼터 소모 및 엉뚱한 환각 답변을 원천 차단하고, 공공 연구원 고유 도메인 전문성을 보장
    """
    q = query.strip()
    q_compact = re.sub(r'\s+', '', q)

    # 1. 답변 거부 / 중단 / 비속어 가드레일
    rejection_keywords = [
        "답변하지마", "말하지마", "대답하지마", "하지마", "하지마라", 
        "그만", "그만해", "닥쳐", "조용히", "조용히해", "꺼져", "쉿", "됐어", "필요없어", "취소"
    ]
    if any(kw in q_compact for kw in rejection_keywords):
        return {
            "answer": "요청하신 의사를 반영하여 추가 답변 및 연구보고서 검색을 진행하지 않습니다.\n\n한국문화관광연구원(KCTI)의 문화·관광·콘텐츠 연구보고서나 국가승인 통계 분석이 필요하실 때 언제든 편하게 질문해 주시기 바랍니다.",
            "intent_tag": "답변 중단 요청",
            "similarity": 0.0,
            "referenced_reports": [],
            "suggested_queries": []
        }

    # 2. 일상 잡담 및 타 도메인(IT 코딩, 의학, 주식/가상화폐 등) 가드레일
    irrelevant_patterns = [
        r'(?:오늘|내일|주말)?\s*날씨', r'(?:점심|저녁|아침|밥|식사|메뉴)\s*(?:추천|뭐먹)',
        r'(?:심심해|심심하다|놀아줘|놀자)', r'(?:몇\s*살|나이\s*가|누구야|너\s*이름|자기소개)',
        r'(?:사랑해|좋아해|바보|멍청이|메롱)',
        r'(?:파이썬|자바스크립트|리액트|코딩|코드\s*짜|c\+\+|html|css)',
        r'(?:주식|코인|비트코인|부동산|아파트\s*시세|청약)',
        r'(?:감기약|두통|병원|진료|처방)'
    ]
    if any(re.search(pat, q, re.IGNORECASE) for pat in irrelevant_patterns):
        return {
            "answer": (
                "입력하신 내용은 한국문화관광연구원(KCTI)의 고유 연구 영역과 무관한 질의로 확인되었습니다.\n\n"
                "KCTI AI 지능형 비서는 **문화예술 진흥, 국내외 관광 정책, K-콘텐츠 산업, 국가승인 관광통계**를 전문으로 분석하는 연구지원 시스템입니다.\n\n"
                "궁금하신 문화·관광 정책 주제(예: '주 4.5일제 관광 영향', '방한 외래객 3천만 전략', 'K-콘텐츠 글로벌 수출' 등)로 질문해 주시면 정확한 원문과 함께 안내해 드리겠습니다."
            ),
            "intent_tag": "연구 도메인 외 질의",
            "similarity": 0.0,
            "referenced_reports": [],
            "suggested_queries": [
                "주 4.5일제가 국내 관광에 미치는 영향은?",
                "방한 외래관광객 유치 전략 보고서",
                "문화예술 향유 실태조사 결과"
            ]
        }

    # 3. 무의미 단순 자모음 및 단문 가드레일
    q_letters = re.sub(r'[\s\.\?!~^,]', '', q)
    if re.fullmatch(r'[ㄱ-ㅎㅏ-ㅣ]+', q_letters) or len(q_letters) <= 1:
        return {
            "answer": "질문 내용을 명확히 인식하기 어렵습니다.\n\n구체적인 문화·관광·콘텐츠 연구 주제나 정책 과제를 단어 또는 문장으로 입력해 주시기 바랍니다.",
            "intent_tag": "단문/기호 질의",
            "similarity": 0.0,
            "referenced_reports": [],
            "suggested_queries": []
        }

    return None

@app.get("/health")
def health_check():
    """Chroma Vector DB 상태 및 시스템 헬스 체크 (외부 오라클 의존성 제로)"""
    if collection:
        count = collection.count()
        return {
            "status": "healthy",
            "engine": "Chroma Vector DB (Persistent SQLite/HNSW)",
            "indexed_chunks": count,
            "embedding_model": "gemini-embedding-001 (3072 dims)",
            "llm_model": "gemini-3.6-flash"
        }
    return {
        "status": "degraded",
        "engine": "Chroma Vector DB not initialized"
    }

@app.post("/api/chat")
def handle_chat(req: ChatRequest):
    """
    SFR-011, 012, 013, 014 통합 Chroma Vector RAG 엔드투엔드 파이프라인
    - 도메인 가드레일: 비도메인 질의 및 거부 의도 0ms 사전 차단
    - 429 Quota 가드레일: Gemini API 일일 한도 초과 시 친절한 시스템 안내 반환
    - SFR-012: 특수문자 노이즈 정제 및 도메인 의도/동적 신뢰도 산출
    - SFR-013 & SFR-014: 정제된 쿼리로 3072차원 코사인 유사도 검색 및 부서별 가중치 적용
    - SFR-013: 실제 KCTI 보고서 원문 기반 팩트 브리핑 및 출처 각주 [1] 합성
    - SFR-011: 프론트엔드 카드형 렌더링에 필요한 구조화된 JSON 응답 반환
    """
    # 0. [품질/도메인 가드레일] 비도메인/거부/단순잡담 질의 0ms 사전 필터
    guardrail_result = check_domain_guardrail(req.query)
    if guardrail_result:
        return guardrail_result

    try:
        # 1. [SFR-012] 자연어 질문 전처리 및 의도 분석
        intent_info = analyze_intent(req.query)

        # 2. [SFR-013 & SFR-014] Chroma 영속 벡터 DB 의미 검색
        matched_reports = search_reports_from_vector_db(
            intent_info["cleaned_query"], 
            req.user_dept, 
            query_vector=intent_info.get("query_vector")
        )
        primary = matched_reports[0] if matched_reports else None

        # 3. [SFR-011 & SFR-013] 팩트 그라운딩 AI 브리핑 및 답변 맥락 추천 질문 생성
        if primary:
            answer_text, suggested_queries = generate_rag_answer_with_ai(req.query, primary)
            intent_tag = f"{intent_info['intent']} (신뢰도 {int(intent_info['confidence'] * 100)}%)"
            similarity = primary["similarity"]
            referenced = matched_reports
        else:
            answer_text = (
                "입력하신 질문과 직접적으로 관련된 KCTI 연구보고서나 통계 자료를 찾지 못했습니다.\n\n"
                "KCTI AI 지능형 비서는 **문화·관광·콘텐츠 정책 연구보고서 및 국가 승인 통계**를 전문으로 분석해 드립니다.\n\n"
                "궁금하신 연구 주제나 정책 과제(예: '방한 외래객 3천만 달성 전략', '주 4.5일제가 국내 관광에 미치는 영향', '공연 티켓 할인 수요 통계' 등)로 질문해 주시면 정확한 원문 출처와 함께 안내해 드리겠습니다."
            )
            suggested_queries = []
            intent_tag = ""
            similarity = 0.0
            referenced = []

        return {
            "answer": answer_text,
            "intent_tag": intent_tag,
            "similarity": similarity,
            "referenced_reports": referenced,
            "suggested_queries": suggested_queries
        }

    except QuotaExceededException:
        # [SFR-011 429 Quota 가드레일] API 일일/분당 허용량 초과 시 정중한 공식 안내 표기
        return {
            "answer": (
                "⚠️ **AI 서비스 요청 한도(API Quota)가 일시적으로 초과되었습니다.**\n\n"
                "현재 구글 Gemini API의 무료 분당/일일 호출 허용량(429 Rate Limit)에 도달하여 일시적으로 신규 AI 브리핑 생성이 제한됩니다.\n\n"
                "• **권장 조치**: 약 30초~1분 후 다시 질문해 주시기 바랍니다.\n"
                "• **보고서 직접 확인**: 상단 **[연구성과]** 메뉴 또는 **[통합검색]**을 통해 KCTI 발간 연구보고서 원문(PDF)을 바로 열람하실 수 있습니다."
            ),
            "intent_tag": "API 요청 한도 초과 (429)",
            "similarity": 0.0,
            "referenced_reports": [],
            "suggested_queries": ["30초 후 다시 시도하기"]
        }

@app.post("/api/feedback")
def handle_feedback(req: FeedbackRequest):
    """
    SFR-015 답변 만족도 피드백 및 재학습 로그 저장 (로컬 영속 SQLite)
    """
    success = save_feedback_to_db(
        user_dept=req.user_dept,
        user_query=req.user_query,
        intent_tag=req.intent_tag,
        similarity=req.similarity,
        satisfaction_yn=req.satisfaction_yn,
        feedback_text=req.feedback_text
    )

    return {
        "success": success,
        "message": "로컬 영속 DB [TB_CHAT_FEEDBACK_LOG]에 정상 저장되었습니다." if success else "피드백 저장 중 오류가 발생했습니다."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
