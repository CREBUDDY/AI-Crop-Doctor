import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.analysis import image_repo
from app.infrastructure.database.models.analysis import ImageMetadata
from app.infrastructure.database.models.enums import ImageSource

UPLOAD_DIR = "uploads/images"

class UploadService:
    def __init__(self):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    async def upload_image(self, db: AsyncSession, file: UploadFile, user_id: uuid.UUID) -> ImageMetadata:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # Read file to memory to get size
        content = await file.read()
        file_size = len(content)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as out_file:
            await out_file.write(content)
            
        # Create DB record
        obj_in = {
            "user_id": user_id,
            "storage_path": file_path,
            "download_url": f"/api/v1/upload/images/{file_name}",
            "file_size_bytes": file_size,
            "mime_type": file.content_type,
            "source": ImageSource.UPLOAD
        }
        
        return await image_repo.create(db, obj_in=obj_in)

upload_service = UploadService()
