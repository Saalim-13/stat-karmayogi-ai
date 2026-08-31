from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Stat-Karmayogi AI"
    openai_api_key: str = ""
    openai_model: str = ""
    chroma_path: str = "./.chroma"
    chroma_collection: str = "stat_karmayogi_manuals_v2"
    database_url: str = "sqlite:///./stat_karmayogi.db"
    jwt_secret: str = "change-this-demo-secret-before-production"
    jwt_expiry_minutes: int = 480
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
