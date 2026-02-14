"""
SmartEdu AI – Document Management Routes
Upload and manage course materials for RAG processing.
"""

import os
import uuid
import shutil
from typing import List
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db
from models import Course, CourseDocument, UserRole
from schemas import CourseDocumentResponse
from auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload/{course_id}", response_model=CourseDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    course_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a course document for RAG processing."""
    # Check if course exists and user is authorized (teacher of course or admin)
    stmt = select(Course).where(Course.id == course_id)
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        
    if current_user["role"] != UserRole.admin and course.teacher_id != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload to this course")

    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Save file with unique name to prevent collisions
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not save file: {str(e)}")

    # Create database record
    doc = CourseDocument(
        id=uuid.uuid4(),
        course_id=course_id,
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=os.path.getsize(file_path),
        is_processed=False
    )
    
    db.add(doc)
    await db.flush() 

    # Trigger AI Worker processing in the background
    background_tasks.add_task(process_document_ai, doc.id, course_id, doc.file_path)
    
    return doc


async def process_document_ai(doc_id: uuid.UUID, course_id: uuid.UUID, file_path: str):
    """Notify AI worker to process and index the document."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # We need to map local path to worker container path if running in Docker,
            # but since they share a volume (usually) or the path is accessible, 
            # we send the absolute path to the file.
            response = await client.post(
                f"{settings.AI_WORKER_URL}/process-document",
                json={
                    "doc_id": str(doc_id),
                    "course_id": str(course_id),
                    "file_path": file_path
                }
            )
            if response.status_code == 200:
                data = response.json()
                from database import async_session
                async with async_session() as db:
                    stmt = select(CourseDocument).where(CourseDocument.id == doc_id)
                    res = await db.execute(stmt)
                    doc = res.scalar_one_or_none()
                    if doc:
                        doc.is_processed = True
                        doc.chunk_count = data.get("chunks", 0)
                        await db.commit()
            else:
                print(f"❌ AI Worker failed to process document: {response.text}")
        except Exception as e:
            print(f"❌ Error calling AI Worker for document processing: {e}")


@router.get("/{course_id}", response_model=List[CourseDocumentResponse])
async def list_documents(
    course_id: uuid.UUID,
    current_user: dict = Depends(get_current_user), # Any enrolled student or teacher can list
    db: AsyncSession = Depends(get_db),
):
    """List all documents for a given course."""
    # Optionally: Verify enrollment here for students
    
    stmt = select(CourseDocument).where(CourseDocument.course_id == course_id).order_by(CourseDocument.uploaded_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document and its associated file."""
    stmt = select(CourseDocument).where(CourseDocument.id == document_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    # Check authorization (course teacher or admin)
    stmt_course = select(Course).where(Course.id == doc.course_id)
    course_result = await db.execute(stmt_course)
    course = course_result.scalar_one()
    
    if current_user["role"] != UserRole.admin and course.teacher_id != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this document")

    # Remove file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    # Remove from database
    await db.delete(doc)
    return None
