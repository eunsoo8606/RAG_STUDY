from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from rag_service import (
    analyze_intent, 
    search_reports_from_vector_db, 
    save_feedback_to_db, 
    generate_rag_answer_with_ai,
    collection
)

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
    - SFR-012: 특수문자 노이즈 정제 및 도메인 의도/동적 신뢰도 산출
    - SFR-013 & SFR-014: 정제된 쿼리로 3072차원 코사인 유사도 검색 및 부서별 가중치 적용
    - SFR-013: 실제 KCTI 보고서 원문 기반 팩트 브리핑 및 출처 각주 [1] 합성
    - SFR-011: 프론트엔드 카드형 렌더링에 필요한 구조화된 JSON 응답 반환
    """
    # 1. [SFR-012] 자연어 질문 전처리 및 의도 분석
    # Why: 사용자의 비정형 질의에서 특수문자 노이즈를 제거하고, 도메인 키워드 밀도 기반 동적 신뢰도(Confidence) 산출
    intent_info = analyze_intent(req.query)

    # 2. [SFR-013 & SFR-014] Chroma 영속 벡터 DB 의미 검색
    # Why: 의도 분석에서 생성된 3072차원 벡터를 재활용하여 API 지연(Latency) 0ms 및 중복 호출 비용 제로화
    matched_reports = search_reports_from_vector_db(
        intent_info["cleaned_query"], 
        req.user_dept, 
        query_vector=intent_info.get("query_vector")
    )
    primary = matched_reports[0] if matched_reports else None

    # 3. [SFR-013] 팩트 그라운딩(Fact-grounded) AI 브리핑 생성
    # Why: 임의의 외부 지식으로 지어내지 않고(할루시네이션 방지), 오직 발췌 문단 원문만을 근거로 각주 [1] 표기
    if primary:
        answer_text = generate_rag_answer_with_ai(req.query, primary)
    else:
        answer_text = "문의하신 내용과 일치하는 연구보고서를 찾지 못했습니다. 보다 구체적인 정책·통계 질문을 입력해 주세요."

    # 4. [SFR-011] 카드형 답변 및 UI 렌더링을 위한 데이터 반환
    return {
        "answer": answer_text,
        "intent_tag": f"{intent_info['intent']} (신뢰도 {int(intent_info['confidence'] * 100)}%)",
        "similarity": primary["similarity"] if primary else 85.0,
        "referenced_reports": matched_reports
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
