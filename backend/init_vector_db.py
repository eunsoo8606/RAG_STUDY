import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv
import chromadb
import google.generativeai as genai

sys.stdout.reconfigure(encoding='utf-8')

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not found in .env!")
    sys.exit(1)

genai.configure(api_key=api_key)
EMBED_MODEL = "models/gemini-embedding-001"

# 1. 영속 디스크 ChromaDB 클라이언트 설정
chroma_path = Path(__file__).parent / "chroma_db"
client = chromadb.PersistentClient(path=str(chroma_path))

COLLECTION_NAME = "kcti_reports_collection"

# 기존 컬렉션 초기화 또는 생성 (Cosine Similarity 지정)
try:
    client.delete_collection(COLLECTION_NAME)
    print(f"Existing collection '{COLLECTION_NAME}' deleted for fresh indexing.")
except Exception:
    pass

collection = client.create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

# 2. 백업 데이터 로드 (40개 청크)
json_file = Path(__file__).parent / "kcti_backup_data.json"
if not json_file.exists():
    print("kcti_backup_data.json not found! Run export_oracle_to_json.py first.")
    sys.exit(1)

with open(json_file, "r", encoding="utf-8") as f:
    chunks = json.load(f)

print(f"Loaded {len(chunks)} chunks from {json_file.name}. Starting embedding generation...")

ids = []
documents = []
embeddings = []
metadatas = []

# 배치 단위 또는 청크별 임베딩 생성
for i, chunk in enumerate(chunks):
    chunk_id = chunk["chunk_id"]
    content = chunk["content"]
    title = chunk["title"]
    
    # 검색 정확도를 위해 제목과 문단을 함께 결합하여 임베딩
    embed_input = f"보고서: {title}\n내용: {content}"
    
    try:
        res = genai.embed_content(model=EMBED_MODEL, content=embed_input)
        vector = res["embedding"]
    except Exception as e:
        print(f"Embedding error on chunk {i} ({chunk_id}): {e}. Retrying after 2s...")
        time.sleep(2)
        res = genai.embed_content(model=EMBED_MODEL, content=embed_input)
        vector = res["embedding"]

    ids.append(chunk_id)
    documents.append(content)
    embeddings.append(vector)
    metadatas.append({
        "report_id": str(chunk.get("report_id", "")),
        "title": str(chunk.get("title", "")),
        "department": str(chunk.get("department", "")),
        "authors": str(chunk.get("authors", "")),
        "publish_date": str(chunk.get("publish_date", "")),
        "summary": str(chunk.get("summary", "") or "")[:1000],
        "policy_implications": str(chunk.get("policy_implications", "") or "")[:1000],
        "page_no": int(chunk.get("page_no", 1))
    })

    if (i + 1) % 5 == 0 or (i + 1) == len(chunks):
        print(f"[{i + 1}/{len(chunks)}] Embedded: {title} (p.{chunk.get('page_no')})")

# 3. ChromaDB에 일괄 적재
collection.add(
    ids=ids,
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas
)

print(f"\n[ChromaDB]: Successfully indexed {collection.count()} chunks into persistent DB at '{chroma_path}'!")
