from collections import defaultdict
from datetime import datetime
from dateutil.parser import parse as parse_date

def _num(v):
    try:
        return float(str(v).replace(",", ""))
    except (ValueError, TypeError):
        return None

def _resolve_column(name, types):
    # The frontend's X/Y fields are free-text, not a dropdown of real column
    # names, so users routinely type a different case than the CSV header
    # ("Region" vs "region") and get a confusing "Unknown column" error even
    # though the column exists. Resolve case-insensitively against the real
    # (correctly-cased) column names before validating.
    if name in types:
        return name
    lowered = {c.lower(): c for c in types}
    return lowered.get(name.lower())

def aggregate(rows, types, x_column, y_column=None, aggregation="sum"):
    if x_column == "__row__":
        # Universal "trend across records" mode. No categorical or datetime
        # column exists to anchor a real x-axis, so use the dataset's own
        # row order (its natural sequence) instead of resolving a real
        # column name. Order is preserved, never sorted by value -- record
        # sequence IS the meaning of this chart.
        if not y_column:
            raise ValueError("A y column is required for a row-based chart.")
        resolved_y = _resolve_column(y_column, types)
        if resolved_y is None:
            raise ValueError("Unknown y column")
        y_column = resolved_y
        out = []
        for i, row in enumerate(rows, start=1):
            value = _num(row.get(y_column))
            if value is not None:
                out.append({"label": f"Row {i}", "value": round(value, 4)})
        return out[:200]

    resolved_x = _resolve_column(x_column, types)
    if resolved_x is None:
        raise ValueError("Unknown x column")
    x_column = resolved_x
    # x_column was already validated above; y_column needs the same check.
    # Without it, a typo'd/unknown y just silently matches nothing on every
    # row and this returns an empty chart with no indication the column name
    # was wrong (the frontend then shows a misleading "no data" state).
    if y_column:
        resolved_y = _resolve_column(y_column, types)
        if resolved_y is None:
            raise ValueError("Unknown y column")
        y_column = resolved_y
    groups = defaultdict(list)
    for row in rows:
        x = row.get(x_column)
        if x in (None, ""):
            continue
        key = str(x)
        if y_column:
            value = _num(row.get(y_column))
            if value is not None:
                groups[key].append(value)
        else:
            groups[key].append(1)
    out = []
    for key, vals in groups.items():
        if not vals:
            continue
        if aggregation == "avg":
            value = sum(vals) / len(vals)
        elif aggregation == "count":
            value = len(vals)
        else:
            value = sum(vals)
        out.append({"label": key, "value": round(value, 4)})
    if types.get(x_column) == "datetime":
        # Chronological order matters for time-series/line charts; sorting by
        # value here would scramble a "sales over time" chart into a zig-zag
        # instead of a trend line.
        def _sort_key(item):
            try:
                return parse_date(item["label"])
            except (ValueError, TypeError, OverflowError):
                return datetime.min
        out.sort(key=_sort_key)
    else:
        out.sort(key=lambda x: x["value"], reverse=True)
    return out[:100]