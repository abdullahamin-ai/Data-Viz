import time
from collections import defaultdict, deque
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.config import settings

_buckets = defaultdict(deque)

def _client_ip(request: Request) -> str:
    # Behind a reverse proxy/load balancer, request.client.host is the proxy's
    # own IP for every request, which collapses the per-client rate limit into
    # a single shared bucket for all users. Prefer X-Forwarded-For (first hop)
    # when present, falling back to the direct connection IP otherwise.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

async def rate_limit(request: Request, call_next):
    if request.url.path not in {"/api/auth/signup", "/api/auth/login", "/api/upload"}:
        return await call_next(request)
    key = f"{_client_ip(request)}:{request.url.path}"
    now = time.time()
    bucket = _buckets[key]
    while bucket and now - bucket[0] > settings.rate_limit_window_seconds:
        bucket.popleft()
    if len(bucket) >= settings.rate_limit_requests:
        return JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again later."})
    bucket.append(now)
    return await call_next(request)
