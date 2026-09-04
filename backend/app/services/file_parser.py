import csv, io, json, logging
from fastapi import UploadFile
from app.core.config import settings
from app.services.column_detection import detect_column_types

log = logging.getLogger("file_parser")
ALLOWED = {".csv": "csv", ".json": "json"}

async def parse_upload(file: UploadFile):
    filename = file.filename or ""
    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if suffix not in ALLOWED:
        log.warning("FILE_ERROR | invalid_format=%s", suffix)
        raise ValueError("Only CSV and JSON files are supported.")
    content = await file.read()
    if not content:
        raise ValueError("The uploaded file is empty.")
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise ValueError(f"File exceeds the {settings.max_upload_mb} MB limit.")
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        log.warning("PARSING_ERROR | encoding=invalid_utf8 | filename=%s", filename)
        raise ValueError("File encoding must be UTF-8.")
    try:
        if suffix == ".csv":
            reader = csv.DictReader(io.StringIO(text))
            if not reader.fieldnames:
                raise ValueError("CSV is missing headers.")
            rows = [dict(r) for r in reader]
        else:
            raw = json.loads(text)
            if not isinstance(raw, list) or (raw and not isinstance(raw[0], dict)):
                raise ValueError("JSON must contain an array of objects.")
            rows = raw
        if not rows:
            raise ValueError("The dataset contains no data rows.")
        types = detect_column_types(rows)
        return suffix[1:], rows, types
    except (csv.Error, json.JSONDecodeError, ValueError) as exc:
        log.warning("PARSING_ERROR | filename=%s | detail=%s", filename, exc)
        raise ValueError(f"Could not parse dataset: {exc}")
