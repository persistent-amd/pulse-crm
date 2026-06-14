from functools import lru_cache

from pydantic import Field, HttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="Pulse CRM Channel Service", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=False, alias="DEBUG")
    database_url: PostgresDsn = Field(alias="DATABASE_URL")
    sql_echo: bool = Field(default=False, alias="SQL_ECHO")
    crm_receipt_url: HttpUrl = Field(alias="CRM_RECEIPT_URL")
    simulation_seed: int = Field(default=20260614, alias="SIMULATION_SEED")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def sqlalchemy_database_url(self) -> str:
        return str(self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()
