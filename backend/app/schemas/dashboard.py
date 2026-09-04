from pydantic import BaseModel, Field

class DashboardCreate(BaseModel):
    dataset_id: int
    name: str = Field(min_length=1, max_length=255)
    chart_configs: list[dict] = Field(default_factory=list)

class DashboardUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    chart_configs: list[dict] = Field(default_factory=list)

class DashboardOut(BaseModel):
    id: int
    dataset_id: int
    name: str
    chart_configs: list[dict]
    created_at: str
    updated_at: str
