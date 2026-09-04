from app.services.column_detection import detect_column_types

def test_column_detection():
    rows = [
        {"name": "A", "sales": "10", "date": "2026-01-01", "region": "North"},
        {"name": "B", "sales": "20", "date": "2026-01-02", "region": "South"},
    ]
    result = detect_column_types(rows)
    assert result["sales"] == "numeric"
    assert result["date"] == "datetime"
    assert result["region"] == "categorical"
