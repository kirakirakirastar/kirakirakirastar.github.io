import json
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = BASE_DIR / "backend"
UPLOADS_DIR = BASE_DIR / "uploads"
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


class Settings(BaseSettings):
    API_V1_PREFIX: str = "/api/v1"
    APP_NAME: str = "Personal Blog"

    DATABASE_URL: str = f"sqlite:///{(BACKEND_DIR / 'blog.db').as_posix()}"

    UPLOAD_DIR: str = str(UPLOADS_DIR)
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: set[str] = {"png", "jpg", "jpeg", "gif", "webp"}

    CORS_ORIGINS: list[str] = DEFAULT_CORS_ORIGINS.copy()

    # WebDAV 挂载配置预留位置
    # WEBDAV_ROOT: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if value is None or value == "":
            return DEFAULT_CORS_ORIGINS.copy()
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("["):
                return json.loads(value)
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


settings = Settings()
