import pytest
from app.services.file_parser import parse_upload

class FakeFile:
    def __init__(self, filename, content):
        self.filename = filename
        self._content = content
    async def read(self):
        return self._content

@pytest.mark.asyncio
async def test_rejects_bad_file():
    with pytest.raises(ValueError):
        await parse_upload(FakeFile("data.exe", b"bad"))

@pytest.mark.asyncio
async def test_accepts_csv():
    t, rows, types = await parse_upload(FakeFile("data.csv", b"name,sales\nA,10\nB,20\n"))
    assert t == "csv"
    assert len(rows) == 2
    assert types["sales"] == "numeric"
