import io
from pypdf import PdfReader
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

async def extract_text_from_pdf(file: UploadFile) -> str:
    # 1. MIME check
    if file.content_type not in ["application/pdf", "application/x-pdf", "binary/octet-stream"]:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF documents are supported at this time."
            )

    # 2. Read bytes & check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # 3. Extract text with pypdf
    try:
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail="Encrypted or password-protected PDF files cannot be processed."
                )

        extracted_pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_pages.append(text)

        full_text = "\n".join(extracted_pages).strip()
        if not full_text:
            full_text = "Note: Could not extract selectable text from this PDF (it may contain scanned image pages). Analysis performed based on document metadata."

        return full_text
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read or parse PDF file: {str(e)}"
        )
