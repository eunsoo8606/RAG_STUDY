-- ========================================================
-- 한국문화관광연구원 AI 챗봇 피드백 및 학습 로그 테이블 (SFR-015)
-- Oracle 11g, 12c, 19c, 21c, 23ai 호환 DDL 스크립트
-- ========================================================

CREATE TABLE TB_CHAT_FEEDBACK_LOG (
    LOG_ID          VARCHAR2(50)    NOT NULL,  -- 로그 식별자 (UUID 또는 타임스탬프)
    USER_DEPT       VARCHAR2(50),              -- 사용자 소속부서 (SFR-014 개인화 연계)
    USER_QUERY      VARCHAR2(1000)  NOT NULL,  -- 사용자 입력 질문
    INTENT_TAG      VARCHAR2(100),             -- 자연어 의도 분석 결과 (SFR-012)
    SIMILARITY_SCORE NUMBER(5,2),              -- RAG 의미 유사도 점수 (SFR-013)
    SATISFACTION_YN CHAR(1)         DEFAULT 'Y',-- 만족도 여부 (Y:도움됨, N:개선필요)
    FEEDBACK_TEXT   VARCHAR2(1000),            -- 한 줄 개선 의견
    CREATED_AT      DATE            DEFAULT SYSDATE, -- 등록일시
    CONSTRAINT PK_TB_CHAT_FEEDBACK_LOG PRIMARY KEY (LOG_ID)
);

-- 인덱스 생성 (조회 속도 최적화)
CREATE INDEX IX_CHAT_LOG_DEPT ON TB_CHAT_FEEDBACK_LOG (USER_DEPT, CREATED_AT);
CREATE INDEX IX_CHAT_LOG_SATIS ON TB_CHAT_FEEDBACK_LOG (SATISFACTION_YN);

COMMENT ON TABLE TB_CHAT_FEEDBACK_LOG IS 'KCTI AI 챗봇 답변 만족도 및 인공지능 재학습 기초 로그 테이블 (과업 SFR-015)';
