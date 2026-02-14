"""
SmartEdu AI – AI Worker Service
Handles quiz generation, document processing, and RAG pipeline via FastAPI.
"""

import asyncio
import json
import logging
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

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

class ChatRequest(BaseModel):
    message: str
    course_context: str = ""
    chat_history: Optional[List[Dict[str, str]]] = None

class EmbeddingRequest(BaseModel):
    texts: List[str]

# ── Worker Logic ──

class AIWorker:
    """AI Worker for asynchronous AI processing tasks."""

    def __init__(self, gemini_api_key: Optional[str] = None, openai_api_key: Optional[str] = None):
        # Using the exact key retrieved from .env as requested by user
        self.gemini_key = "AIzaSyA6r-HgX5wdeW_28EUoAVuE4knSs9reJmI"
        self.openai_key = openai_api_key
        self.gemini_client = None
        self.openai_client = None

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
                print("✅ Gemini client (google-genai) initialized successfully", flush=True)
            except Exception as e:
                print(f"❌ Failed to initialize Gemini: {e}", flush=True)

        if self.openai_key and not self.gemini_client:
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
                # Using gemini-1.5-flash as it's highly compatible and fast
                response = self.gemini_client.models.generate_content(
                    model="gemini-1.5-flash",
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

    async def chat_with_context(self, req: ChatRequest) -> dict:
        """AI chat with RAG context from course materials."""
        system_instr = (
            "You are SmartEdu AI, an intelligent learning assistant. "
            "Help students understand course material by explaining concepts clearly. "
            "Use the provided course context when available. "
            "Be encouraging and educational."
        )

        full_prompt = f"{system_instr}\n\n"
        if req.course_context:
            full_prompt += f"Course Material Context:\n{req.course_context}\n\n"
        
        if req.chat_history:
            for m in req.chat_history[-5:]:
                full_prompt += f"{m['role'].capitalize()}: {m['content']}\n"
        
        full_prompt += f"User: {req.message}"

        if self.gemini_client:
            # Verified models from raw API listing (v1)
            # Prioritizing the latest 2.5 and 2.0 variants
            models_to_try = [
                "gemini-2.5-flash",
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-1.5-flash",
                "gemini-pro"
            ]
            
            last_error = None
            for model_name in models_to_try:
                try:
                    print(f"DEBUG: Trying Gemini model: {model_name}", flush=True)
                    response = self.gemini_client.models.generate_content(
                        model=model_name,
                        contents=full_prompt
                    )
                    print(f"✅ Gemini SUCCESS with {model_name}", flush=True)
                    return {
                        "response": response.text,
                        "tokens_used": 0,
                        "input_tokens": 0,
                        "output_tokens": 0,
                    }
                except Exception as e:
                    last_error = e
                    err_str = str(e)
                    print(f"⚠️ Gemini {model_name} failed: {err_str}", flush=True)
                    # If it's a 404 or unsupported, we continue.
                    if "404" in err_str or "not found" in err_str.lower() or "not supported" in err_str.lower():
                        continue
                    break
            
            if last_error:
                print(f"❌ All Gemini models failed. Final error: {last_error}", flush=True)

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
        return {"response": f"MOCK: {message}", "tokens_used": 0, "input_tokens": 0, "output_tokens": 0}

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
    return {"status": "healthy", "model": "gemini-1.5-flash" if _worker and _worker.gemini_client else "mock"}

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

@app.post("/chat")
async def chat(req: ChatRequest):
    return await _worker.chat_with_context(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


