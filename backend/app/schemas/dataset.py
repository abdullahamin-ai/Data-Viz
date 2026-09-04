from pydantic import BaseModel

class DatasetOut(BaseModel):
    id: int
    filename: str
    file_type: str
    row_count: int
    columns: dict
    suggestions: list[dict]
    preview: list[dict] = []
