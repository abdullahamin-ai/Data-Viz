from datetime import datetime
from dateutil.parser import parse as parse_date

def _is_number(v):
    if isinstance(v, bool) or v is None or v == "":
        return False
    try:
        float(str(v).replace(",", ""))
        return True
    except (ValueError, TypeError):
        return False

def _is_datetime(v):
    if v is None or v == "":
        return False
    try:
        parse_date(str(v), fuzzy=False)
        return True
    except (ValueError, TypeError, OverflowError):
        return False

def detect_column_types(rows: list[dict]) -> dict:
    if not rows:
        return {}
    result = {}
    for col in rows[0].keys():
        values = [r.get(col) for r in rows if r.get(col) not in (None, "")]
        if not values:
            result[col] = "text"
            continue
        sample = values[:100]
        numeric_ratio = sum(_is_number(v) for v in sample) / len(sample)
        date_ratio = sum(_is_datetime(v) for v in sample) / len(sample)
        unique_ratio = len({str(v) for v in sample}) / len(sample)
        if numeric_ratio >= 0.9:
            result[col] = "numeric"
        elif date_ratio >= 0.9:
            result[col] = "datetime"
        elif unique_ratio <= 0.5 or len({str(v) for v in sample}) <= 50:
            result[col] = "categorical"
        else:
            result[col] = "text"
    return result
