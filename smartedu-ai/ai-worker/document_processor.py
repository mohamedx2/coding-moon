"""
SmartEdu AI – AI Document Processor
Extracts, chunks, and vectorizes course documents for RAG.
"""

import os
from typing import List
import logging
from pypdf import PdfReader
import chromadb
from chromadb.config import Settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, api_key: str, persist_directory: str = "./chroma_db"):
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.chroma_client = chromadb.PersistentClient(path=persist_directory)
        self.collection = self.chroma_client.get_or_create_collection(name="course_materials")
        logger.info(f"🚀 DocumentProcessor initialized with ChromaDB at {persist_directory}")

    def extract_text(self, file_path: str) -> str:
        """Extract text from a PDF file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text
        except Exception as e:
            logger.error(f"❌ Failed to extract text from {file_path}: {e}")
            raise

    def chunk_text(self, text: str, chunk_size: int = 1500, overlap: int = 300) -> List[str]:
        """Split text into overlapping chunks for better context preservation."""
        if not text:
            return []
            
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
        return chunks

    def process_document(self, doc_id: str, course_id: str, file_path: str):
        """Full pipeline: extract -> chunk -> embed -> index."""
        logger.info(f"📄 Processing document {doc_id} for course {course_id}")
        
        text = self.extract_text(file_path)
        chunks = self.chunk_text(text)
        
        if not chunks:
            logger.warning(f"⚠️ No text extracted from {file_path}")
            return 0
            
        # Prepare metadata for each chunk
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"course_id": str(course_id), "doc_id": str(doc_id), "chunk_index": i} for i in range(len(chunks))]
        
        # Batch embedding (Gemini supports multiple contents)
        embeddings_resp = self.client.models.embed_content(
            model="text-embedding-004",
            contents=chunks,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )
        
        embeddings = [e.values for e in embeddings_resp.embeddings]

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=chunks
        )
        
        logger.info(f"✅ Successfully indexed {len(chunks)} chunks for document {doc_id}")
        return len(chunks)

    def search(self, course_id: str, query_text: str, n_results: int = 3) -> str:
        """Search relevant chunks for a given query within a course's context."""
        query_embedding_resp = self.client.models.embed_content(
            model="text-embedding-004",
            contents=[query_text],
            config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
        )
        query_embedding = query_embedding_resp.embeddings[0].values

        results = self.collection.query(
            query_embeddings=[query_embedding],
            where={"course_id": str(course_id)},
            n_results=n_results
        )
        
        # Combine retrieved chunks into a context string
        context = "\n---\n".join(results["documents"][0])
        return context
