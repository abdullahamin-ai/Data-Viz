import logging
from fastapi import Request
from fastapi.responses import JSONResponse

log = logging.getLogger("errors")

async def validation_exception_handler(request: Request, exc):
    log.warning("VALIDATION_ERROR | path=%s | detail=%s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": "Request validation failed.", "errors": exc.errors()})

async def generic_exception_handler(request: Request, exc):
    log.exception("UNHANDLED_ERROR | path=%s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})
