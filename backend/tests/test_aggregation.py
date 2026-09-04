import pytest
from app.services.aggregation import aggregate

TYPES = {"region": "categorical", "day": "datetime", "sales": "numeric"}

def test_categorical_sorts_by_value_desc():
    rows = [
        {"region": "East", "sales": "10"},
        {"region": "West", "sales": "30"},
        {"region": "North", "sales": "20"},
    ]
    out = aggregate(rows, TYPES, "region", "sales")
    assert [r["label"] for r in out] == ["West", "North", "East"]

def test_datetime_sorts_chronologically_not_by_value():
    # Deliberately out of chronological order and out of value order, so a
    # value-sort (correct for bar/pie) would visibly scramble this into a
    # zig-zag instead of a trend line.
    rows = [
        {"day": "2024-03-03", "sales": "5"},
        {"day": "2024-01-01", "sales": "50"},
        {"day": "2024-02-02", "sales": "20"},
    ]
    out = aggregate(rows, TYPES, "day", "sales")
    assert [r["label"] for r in out] == ["2024-01-01", "2024-02-02", "2024-03-03"]

def test_avg_and_count_aggregations():
    rows = [{"region": "East", "sales": "10"}, {"region": "East", "sales": "20"}]
    avg = aggregate(rows, TYPES, "region", "sales", aggregation="avg")
    assert avg[0]["value"] == 15
    count = aggregate(rows, TYPES, "region", "sales", aggregation="count")
    assert count[0]["value"] == 2

def test_rows_missing_x_value_are_skipped():
    rows = [{"region": "East", "sales": "10"}, {"region": "", "sales": "99"}, {"region": None, "sales": "1"}]
    out = aggregate(rows, TYPES, "region", "sales")
    assert len(out) == 1 and out[0]["label"] == "East"

def test_unknown_x_column_raises():
    with pytest.raises(ValueError):
        aggregate([], TYPES, "not_a_column")

def test_unknown_y_column_raises_instead_of_silently_empty():
    # Previously an unknown y column silently matched nothing on every row
    # and returned an empty chart with no indication the name was wrong.
    rows = [{"region": "East", "sales": "10"}, {"region": "West", "sales": "20"}]
    with pytest.raises(ValueError):
        aggregate(rows, TYPES, "region", "not_a_real_column")

def test_column_names_are_case_insensitive():
    # The frontend's X/Y fields are free-text, so users routinely type a
    # different case than the CSV header ("Region" vs "region") and used to
    # get an "Unknown column" error even though the column exists.
    rows = [{"region": "East", "sales": "10"}, {"region": "West", "sales": "20"}]
    exact = aggregate(rows, TYPES, "region", "sales")
    mismatched_case = aggregate(rows, TYPES, "Region", "SALES")
    assert exact == mismatched_case

def test_row_mode_uses_record_order_not_value_sort():
    # __row__ is the universal fallback used when a dataset has no
    # categorical/datetime column to anchor a trend on. It must preserve
    # file order, not sort by value (that would defeat the point of a
    # "trend across records" chart).
    rows = [{"sales": "54000"}, {"sales": "2500"}, {"sales": "39000"}]
    types = {"sales": "numeric"}
    out = aggregate(rows, types, "__row__", "sales")
    assert [r["label"] for r in out] == ["Row 1", "Row 2", "Row 3"]
    assert [r["value"] for r in out] == [54000, 2500, 39000]

def test_row_mode_requires_y_column():
    with pytest.raises(ValueError):
        aggregate([{"sales": "1"}], {"sales": "numeric"}, "__row__")