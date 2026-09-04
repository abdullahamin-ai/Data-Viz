from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Data Visualization SaaS"
    app_env: str = "development"
    debug: bool = False

    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "data_viz_saas"

    jwt_secret: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60

    redis_url: str = "redis://127.0.0.1:6379/0"
    ollama_host: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2"
    cors_origins: str = "http://localhost:5173"

    max_upload_mb: int = 25
    rate_limit_requests: int = 10
    rate_limit_window_seconds: int = 60
    log_file: str = "logs/app.log"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def database_url(self):
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def cors_list(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

@lru_cache
def get_settings():
    return Settings()

settings = get_settings()
