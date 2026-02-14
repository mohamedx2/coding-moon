"""
SmartEdu AI – AI Worker Service
Handles quiz generation, document processing, and RAG pipeline via FastAPI.
"""

import asyncio
import json
import os
import logging
import httpx
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from document_processor import DocumentProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="SmartEdu AI Worker")

# ── Models ──

class QuizGenerationRequest(BaseModel):
    topic: str
    num_questions: int = 10
    difficulty: str = "medium"
    question_type: str = "mcq"
    context: str = ""

class CourseInitRequest(BaseModel):
    title: str
    code: Optional[str] = None

class SuggestionRequest(BaseModel):
    interests: List[str]
    recent_courses: List[str]

class ChatRequest(BaseModel):
    message: str
    course_id: Optional[str] = None
    course_context: str = ""
    chat_history: Optional[List[Dict[str, str]]] = None

class ProcessDocumentRequest(BaseModel):
    doc_id: str
    course_id: str
    file_path: str

class EmbeddingRequest(BaseModel):
    texts: List[str]

# ── Worker Logic ──

class AIWorker:
    """AI Worker for asynchronous AI processing tasks."""

    def __init__(self, gemini_api_key: Optional[str] = None, openai_api_key: Optional[str] = None):
        # Using the exact key retrieved from .env as requested by user
        self.gemini_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.openai_key = openai_api_key
        self.gemini_client = None
        self.openai_client = None
        self.doc_processor = None

    async def initialize(self):
        """Initialize the AI clients."""
        import sys
        print(f"DEBUG: Initializing AI Worker with verified gemini_key (len: {len(self.gemini_key)})...", flush=True)
        if self.gemini_key:
            try:
                from google import genai
                # genai.Client() automatically picks up GEMINI_API_KEY if not provided,
                # but we'll be explicit using self.gemini_key.
                self.gemini_client = genai.Client(api_key=self.gemini_key)
                self.doc_processor = DocumentProcessor(api_key=self.gemini_key)
                print("✅ Gemini client and DocumentProcessor initialized successfully", flush=True)
            except Exception as e:
                print(f"❌ Failed to initialize Gemini: {e}", flush=True)

        if self.openai_key:
            try:
                from openai import AsyncOpenAI
                self.openai_client = AsyncOpenAI(api_key=self.openai_key)
                print("✅ OpenAI client initialized", flush=True)
            except ImportError:
                print("⚠️ openai package not installed", flush=True)

        if not self.gemini_client and not self.openai_client:
            print("🔧 AI Worker running in mock mode (no API key)", flush=True)

    async def generate_quiz_questions(self, req: QuizGenerationRequest) -> list[dict]:
        """Generate quiz questions using AI."""
        prompt = (
            "You are an expert educator creating quiz questions. "
            f"Generate exactly {req.num_questions} {req.difficulty} difficulty {req.question_type} questions about: {req.topic}. "
            "Return valid JSON array of objects. Each object MUST have: "
            "'question_text' (string), 'options' (array of 4 strings for MCQ), "
            "'correct_answer' (string, must be one of the options), 'explanation' (string), 'difficulty' (string). "
            f"Context: {req.context}\n\n"
            "Return ONLY the JSON array."
        )

        if self.gemini_client:
            try:
                # Using gemini-2.0-flash as requested by user
                response = self.gemini_client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt
                )
                text = response.text
                print(f"DEBUG: Gemini Response text length: {len(text)}", flush=True)
                
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                
                data = json.loads(text)
                return data if isinstance(data, list) else data.get("questions", [])
            except Exception as e:
                import traceback
                print(f"❌ Gemini Quiz generation failed: {e}", flush=True)
                print(traceback.format_exc(), flush=True)

        if self.openai_client:
            # ... (OpenAI logic stays same)
            try:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=[
                        {"role": "system", "content": "You are an expert educator. Return JSON array of questions."},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=4096,
                )
                content = response.choices[0].message.content
                data = json.loads(content)
                return data.get("questions", data if isinstance(data, list) else [])
            except Exception as e:
                logger.error(f"OpenAI Quiz generation failed: {e}")

        return self._mock_questions(req.topic, req.num_questions, req.difficulty, req.question_type)

    async def initialize_course_content(self, req: CourseInitRequest) -> dict:
        """Generate course description and modules using AI."""
        prompt = (
            "You are a premium curriculum designer for an elite university. "
            f"For the course titled '{req.title}', generate a compelling and professional description (3-4 sentences) "
            "and a list of 5 key learning modules with short summaries for each. "
            "Return valid JSON with keys: 'description' (string) and 'modules' (list of strings). "
            "Return ONLY the JSON object."
        )

        if self.gemini_client:
            try:
                response = self.gemini_client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt
                )
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                return json.loads(text)
            except Exception as e:
                print(f"❌ Gemini Course Init failed: {e}", flush=True)

        return {
            "description": f"A comprehensive study of {req.title}.",
            "modules": [f"Module {i}: Advanced {req.title} Concepts" for i in range(1, 6)]
        }

    async def get_personalized_suggestions(self, req: SuggestionRequest) -> dict:
        """Generate personalized course suggestions."""
        prompt = (
            "You are an AI academic advisor. "
            f"Given the student's interests: {', '.join(req.interests)} "
            f"and their recent courses: {', '.join(req.recent_courses)}, "
            "suggest 3 new course topics they might find fascinating. "
            "Return valid JSON with key 'suggestions' as a list of objects. "
            "Each object MUST have: 'title', 'description', and 'reason'. "
            "Return ONLY the JSON object."
        )

        if self.gemini_client:
            try:
                response = self.gemini_client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt
                )
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                return json.loads(text)
            except Exception as e:
                print(f"❌ Gemini Suggestions failed: {e}", flush=True)

        return {
            "suggestions": [
                {"title": "Quantum Computing", "description": "Intro to quantum bits and gates.", "reason": "Since you like Physics."},
                {"title": "Advanced AI Ethics", "description": "Ethics in the age of LLMs.", "reason": "Based on your interest in Philosophy."},
                {"title": "Linear Algebra for ML", "description": "The math behind the models.", "reason": "Essential for your CS path."}
            ]
        }

    async def chat_with_context(self, req: ChatRequest) -> dict:
        """AI chat with RAG context from course materials."""
        system_instr = (
            "You are SmartEdu AI, an intelligent learning assistant. "
            "Help students understand course material by explaining concepts clearly. "
            "Use the provided course context when available. "
            "Be encouraging and educational."
        )

        full_prompt = f"{system_instr}\n\n"
        
        # RAG Context Retrieval
        sources = []
        if req.course_id and self.doc_processor:
            try:
                # Retrieve top chunks with metadata
                results = self.doc_processor.collection.query(
                    query_embeddings=[self.client.models.embed_content(
                        model="text-embedding-004",
                        contents=[req.message],
                        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
                    ).embeddings[0].values],
                    where={"course_id": str(req.course_id)},
                    n_results=4
                )
                
                if results["documents"][0]:
                    rag_context = "\n---\n".join(results["documents"][0])
                    full_prompt += f"Retrieved Knowledge from Course Materials:\n{rag_context}\n\n"
                    
                    # Extract sources
                    for meta in results["metadatas"][0]:
                        sources.append({
                            "doc_id": meta.get("doc_id"),
                            "index": meta.get("chunk_index")
                        })
                    
                    print(f"DEBUG: RAG context added ({len(results['documents'][0])} chunks) for course {req.course_id}", flush=True)
            except Exception as e:
                print(f"⚠️ RAG search failed: {e}", flush=True)

        if req.course_context:
            full_prompt += f"General Course Context:\n{req.course_context}\n\n"
        
        if req.chat_history:
            full_prompt += "Recent Chat History:\n"
            for m in req.chat_history[-5:]:
                full_prompt += f"{m['role'].capitalize()}: {m['content']}\n"
        
        full_prompt += f"\nUser Question: {req.message}\n\nPlease provide a clear, helpful response based on the context above."

        # Try direct REST API (v1beta) as it proved more reliable
        if self.gemini_key:
            try:
                print(f"DEBUG: Using Gemini Key: {self.gemini_key[:10]}...", flush=True)
                async with httpx.AsyncClient() as client:
                    # Try gemini-pro and gemini-1.5-flash
                    for model in ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"]:
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
                        payload = {
                            "contents": [{"parts": [{"text": full_prompt}]}]
                        }
                        try:
                            print(f"DEBUG: Trying REST API for {model}...", flush=True)
                            resp = await client.post(url, json=payload, timeout=30.0)
                            
                            if resp.status_code == 200:
                                data = resp.json()
                                # Check for valid candidates
                                if "candidates" in data and data["candidates"]:
                                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                                    print(f"✅ REST API SUCCESS with {model}", flush=True)
                                    return {
                                        "response": content,
                                        "tokens_used": 0,  # Could parse usageMetadata if needed
                                        "sources": sources
                                    }
                                else:
                                    print(f"⚠️ REST API {model} empty/blocked: {data}", flush=True)
                            else:
                                print(f"⚠️ REST API {model} failed: {resp.status_code} {resp.text}", flush=True)
                        except Exception as e:
                            print(f"⚠️ REST API {model} error: {e}", flush=True)

            except Exception as e:
                print(f"❌ REST API Main Block failed: {e}", flush=True)

        # Fallback to OpenAI if configured

        if self.openai_client:
            try:
                messages = [{"role": "system", "content": system_instr}]
                if req.course_context:
                    messages.append({"role": "system", "content": f"Context: {req.course_context}"})
                if req.chat_history:
                    messages.extend(req.chat_history[-10:])
                messages.append({"role": "user", "content": req.message})

                response = await self.openai_client.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=messages,
                    max_tokens=2048,
                )
                usage = response.usage
                return {
                    "response": response.choices[0].message.content,
                    "tokens_used": usage.total_tokens if usage else 0,
                    "input_tokens": usage.prompt_tokens if usage else 0,
                    "output_tokens": usage.completion_tokens if usage else 0,
                }
            except Exception as e:
                print(f"OpenAI Chat failed: {e}", flush=True)

        return self._mock_chat_response(req.message)

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate text embeddings using Gemini."""
        if self.gemini_client:
            try:
                result = self.gemini_client.models.embed_content(
                    model="text-embedding-004",
                    contents=texts
                )
                # google-genai returns result.embeddings list of objects
                return [e.values for e in result.embeddings]
            except Exception as e:
                print(f"❌ Gemini Embedding failed: {e}", flush=True)

        # Fallback to zeros (or OpenAI if available, but keep it simple for now)
        return [[0.0] * 768 for _ in texts]

    def _mock_questions(self, topic: str, num: int, difficulty: str, qtype: str) -> list[dict]:
        return [{"question_text": f"MOCK: Concept in {topic}?", "difficulty": difficulty, "explanation": "Mock.", "options": ["A", "B", "C", "D"], "correct_answer": "A"}]

    def _mock_chat_response(self, message: str) -> dict:
        msg = message.lower()
        if "hi" in msg or "hello" in msg:
            text = "Hello! I'm SmartEdu AI. How can I assist you with your learning today?"
        elif "course" in msg or "learn" in msg:
            text = "Our courses are designed to be interactive. I recommend checking the syllabus for detailed topics."
        elif "quiz" in msg:
            text = "Quizzes are a great way to test your knowledge! Try generating a quiz from the dashboard."
        else:
            text = f"Regarding '{message}', I recommend reviewing your course notes for more details."

        return {
            "response": text,
            "tokens_used": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "sources": []
        }

# ── Singleton ──

_worker: Optional[AIWorker] = None

@app.on_event("startup")
async def startup_event():
    global _worker
    _worker = AIWorker(
        gemini_api_key=os.getenv("GEMINI_API_KEY"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
    )
    await _worker.initialize()

# ── Routes ──

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "gemini-2.0-flash" if _worker and _worker.gemini_client else "mock"}

@app.get("/debug")
async def debug():
    return {
        "gemini_key_present": _worker.gemini_key is not None,
        "gemini_key_length": len(_worker.gemini_key) if _worker.gemini_key else 0,
        "gemini_client_status": "initialized" if _worker.gemini_client else "none",
        "openai_client_status": "initialized" if _worker.openai_client else "none",
    }

@app.post("/generate-quiz")
async def generate_quiz(req: QuizGenerationRequest):
    questions = await _worker.generate_quiz_questions(req)
    return {"questions": questions}

@app.post("/initialize-course")
async def initialize_course(req: CourseInitRequest):
    content = await _worker.initialize_course_content(req)
    return content

@app.post("/suggestions")
async def suggestions(req: SuggestionRequest):
    data = await _worker.get_personalized_suggestions(req)
    return data

@app.post("/chat")
async def chat(req: ChatRequest):
    return await _worker.chat_with_context(req)

@app.post("/process-document")
async def process_document(req: ProcessDocumentRequest):
    if not _worker or not _worker.doc_processor:
        raise HTTPException(status_code=500, detail="Document processor not initialized")
    
    try:
        # We could run this in background if files are large
        num_chunks = _worker.doc_processor.process_document(
            doc_id=req.doc_id,
            course_id=req.course_id,
            file_path=req.file_path
        )
        return {"status": "success", "chunks": num_chunks}
    except Exception as e:
        logger.error(f"Failed to process document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


