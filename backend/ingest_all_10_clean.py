import os
import re
import time
from pathlib import Path
from dotenv import load_dotenv
from pypdf import PdfReader
import chromadb
import google.generativeai as genai

# 1. 환경변수 및 Gemini 설정
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in backend/.env")

genai.configure(api_key=api_key)
EMBED_MODEL = "models/gemini-embedding-001"

# 2. 텍스트 정제(Cleaning) 함수
def clean_kcti_text(text: str) -> str:
    if not text:
        return ""
    # 1) 조판용 깨진 유니코드 및 Private Use Area (PUA) 문자 제거
    text = re.sub(r'[\uE000-\uF8FF\U000F0000-\U000FFFFF]', '', text)
    # 2) 글머리 특수도형 제거 (▪, ▫, ▶, ▷, ●, ○, ■, □, ★, ◆, ◇ 등)
    text = re.sub(r'[▪▫▶▷●○■□★◆◇▲▼◁\u25aa\u25ab\u25b6\u25c0\u25cf\u25cb\u25a0\u25a1]', '', text)
    # 3) 반복되는 목차 점선 및 장식선 제거 (······, ------ 등)
    text = re.sub(r'[·.]{3,}', ' ', text)
    text = re.sub(r'[-_=]{3,}', ' ', text)
    # 4) 줄바꿈을 공백으로 합치고 다중 공백을 단일 공백으로 정리
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_printed_page_number(page_text: str, pdf_page_idx: int) -> int:
    """PDF 본문 상단 헤더 또는 텍스트에서 실제 인쇄된 도서 페이지 번호를 정밀 추출"""
    lines = [l.strip() for l in page_text.split('\n') if l.strip()]
    if not lines:
        return pdf_page_idx + 1
        
    # 첫 번째 줄 검사 (조판 규칙: '3제1장 서론', '24 티켓할인이 공연수요에 미치는 영향')
    first_line = lines[0]
    m = re.match(r'^(\d+)', first_line)
    if m:
        val = int(m.group(1))
        if 1 <= val <= 400:
            return val

    # 두 번째 줄 검사
    if len(lines) > 1:
        m2 = re.match(r'^(\d+)', lines[1])
        if m2:
            val = int(m2.group(1))
            if 1 <= val <= 400:
                return val

    # 마지막 줄(푸터) 단독 숫자 검사
    last_line = lines[-1]
    if last_line.isdigit() and 1 <= int(last_line) <= 400:
        return int(last_line)

    return max(1, pdf_page_idx - 14)

def parse_filename_metadata(filename: str) -> dict:
    """파일명에서 카테고리, 제목, 저자, 부서 자동 추출"""
    # 예: [수시연구 08] 이스포츠 박물관 조성 필요성 검토 연구(김예솔 양지훈).pdf
    name = Path(filename).stem
    
    category = "기본연구"
    cat_match = re.match(r'^\[(수시연구|현안연구|협력연구|기본연구)\s*\d*\]\s*(.*)', name)
    if cat_match:
        category = cat_match.group(1)
        rest = cat_match.group(2).strip()
    else:
        rest = name

    # 저자 추출: 괄호 안의 이름
    author_match = re.search(r'\(([^)]+)\)$', rest)
    if author_match:
        authors = author_match.group(1).strip()
        title = rest[:author_match.start()].strip()
    else:
        authors = "KCTI 연구진"
        title = rest

    # 부서 매핑
    dept = "문화예술본부"
    if any(k in title for k in ['관광', '인바운드', '여행']):
        dept = "관광정책실"
    elif any(k in title for k in ['콘텐츠', 'K콘텐츠', '이스포츠', '게임']):
        dept = "콘텐츠산업본부"
    elif any(k in title for k in ['통계', '데이터', '행정자료', '지표']):
        dept = "통계·데이터실"
    elif any(k in title for k in ['예술', '공연', '문화', '티켓', '회복']):
        dept = "문화예술본부"

    return {
        "category": category,
        "title": title,
        "authors": authors,
        "department": dept,
        "year": 2025,
        "publish_date": "2025.01"
    }

# 3. ChromaDB 연결 및 초기화
chroma_path = Path(__file__).parent / "chroma_db"
client = chromadb.PersistentClient(path=str(chroma_path))
COLLECTION_NAME = "kcti_reports_collection"

try:
    client.delete_collection(COLLECTION_NAME)
    print(f"[*] Cleared previous collection '{COLLECTION_NAME}'")
except Exception as e:
    pass

collection = client.create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)
print(f"[+] Re-created clean empty collection '{COLLECTION_NAME}'")

# 4. 대상 10개 PDF 파일 탐색
pdf_dir = Path(__file__).parent / "chroma_db" / "pdf"
pdf_files = sorted(list(pdf_dir.glob("*.pdf")))
print(f"[*] Found {len(pdf_files)} PDF files to process in {pdf_dir}")

total_global_chunks = 0
start_time = time.time()

for file_idx, pdf_path in enumerate(pdf_files, 1):
    meta = parse_filename_metadata(pdf_path.name)
    print(f"\n========================================================")
    print(f"[{file_idx}/{len(pdf_files)}] Processing: {meta['title']}")
    print(f"    - 부서: {meta['department']} | 저자: {meta['authors']} | 구분: {meta['category']}")
    print(f"========================================================")

    try:
        reader = PdfReader(str(pdf_path))
        num_pages = len(reader.pages)
        print(f"    -> Total Pages in PDF: {num_pages}")
    except Exception as e:
        print(f"[!] Error opening PDF {pdf_path.name}: {e}")
        continue

    # 핵심 챕터 지능형 추출:
    # 1) 서론 및 개요 (초반 15~35페이지 중 본문)
    # 2) 중간 실태 및 분석 (중반 15~25페이지)
    # 3) 후반 결론 및 정책제언 (후반 15~20페이지)
    if num_pages <= 50:
        target_indices = list(range(10, num_pages))
    else:
        intro_pages = list(range(12, min(32, num_pages)))
        mid_start = int(num_pages * 0.35)
        mid_pages = list(range(mid_start, min(mid_start + 18, num_pages)))
        conc_start = max(0, num_pages - 25)
        conc_pages = list(range(conc_start, num_pages))
        target_indices = sorted(list(set(intro_pages + mid_pages + conc_pages)))

    file_chunks = []
    chunk_seq = 1
    
    for p_idx in target_indices:
        try:
            page = reader.pages[p_idx]
            raw_text = page.extract_text() or ""
            # 실제 인쇄 페이지 추출
            printed_page = extract_printed_page_number(raw_text, p_idx)
            
            # 특수문자 정제
            cleaned_text = clean_kcti_text(raw_text)
            if len(cleaned_text) < 80:
                continue

            # 800자 단위 청킹 (150자 오버랩)
            chunk_size = 800
            overlap = 150
            start_char = 0

            while start_char < len(cleaned_text):
                end_char = min(start_char + chunk_size, len(cleaned_text))
                chunk_slice = cleaned_text[start_char:end_char].strip()

                if len(chunk_slice) > 60:
                    chunk_id = f"doc_{file_idx:02d}_chk_{chunk_seq:04d}_p{printed_page}"
                    doc_content = f"[{meta['title']}] [페이지: p.{printed_page}]\n{chunk_slice}"

                    file_chunks.append({
                        "chunk_id": chunk_id,
                        "content": doc_content,
                        "metadata": {
                            "report_id": f"KCTI-2025-{file_idx:02d}",
                            "title": meta["title"],
                            "author": meta["authors"],
                            "authors": meta["authors"],
                            "department": meta["department"],
                            "category": meta["category"],
                            "year": meta["year"],
                            "publish_date": meta["publish_date"],
                            "page": printed_page,
                            "page_no": printed_page,
                            "pdf_page": p_idx + 1,
                            "file_name": pdf_path.name
                        }
                    })
                    chunk_seq += 1

                if end_char == len(cleaned_text):
                    break
                start_char += (chunk_size - overlap)
        except Exception as e:
            continue

    print(f"    -> Prepared {len(file_chunks)} clean chunks from {len(target_indices)} pages.")

    # 임베딩 생성 & ChromaDB 적재 (배치 5개 단위, Rate Limit 안정 보장)
    batch_size = 5
    for b_i in range(0, len(file_chunks), batch_size):
        batch = file_chunks[b_i:b_i+batch_size]
        texts = [item["content"] for item in batch]
        ids = [item["chunk_id"] for item in batch]
        metadatas = [item["metadata"] for item in batch]
        documents = [item["content"] for item in batch]

        embeddings = []
        for txt in texts:
            for attempt in range(5):
                try:
                    res = genai.embed_content(
                        model=EMBED_MODEL,
                        content=txt,
                        task_type="retrieval_document"
                    )
                    embeddings.append(res["embedding"])
                    break
                except Exception as e:
                    print(f"       [!] Rate limit backoff (retry {attempt+1}/5): {e}")
                    time.sleep(15)

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        total_global_chunks += len(batch)
        print(f"       Ingested {b_i + len(batch)} / {len(file_chunks)} chunks (Total so far: {total_global_chunks})")
        time.sleep(0.8)

    print(f"    [OK] Finished {meta['title']} ({len(file_chunks)} chunks).")

elapsed = time.time() - start_time
print(f"\n========================================================")
print(f"[COMPLETE] Ingested all {len(pdf_files)} PDF reports!")
print(f" - Total Ingested Chunks: {collection.count()}")
print(f" - Total Time Taken: {elapsed:.1f} seconds ({elapsed/60:.1f} mins)")
print(f"========================================================")
