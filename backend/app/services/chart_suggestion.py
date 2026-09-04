def suggest_charts(types):
    categorical = [c for c,t in types.items() if t == "categorical"]
    numeric = [c for c,t in types.items() if t == "numeric"]
    dates = [c for c,t in types.items() if t == "datetime"]
    suggestions = []
    if categorical and numeric:
        suggestions.append({"type": "bar", "x": categorical[0], "y": numeric[0], "title": f"{numeric[0]} by {categorical[0]}"})
        suggestions.append({"type": "pie", "x": categorical[0], "y": numeric[0], "title": f"{numeric[0]} distribution"})
    if dates and numeric:
        suggestions.append({"type": "line", "x": dates[0], "y": numeric[0], "title": f"{numeric[0]} over time"})
    if numeric and not dates:
        # No date/categorical column exists to anchor a trend on. Plotting a
        # numeric column against itself (previous behavior) produces a
        # meaningless "value by itself" chart. Use the dataset's own row
        # order instead -- a universal x-axis that works for any file,
        # independent of column names.
        suggestions.append({"type": "area", "x": "__row__", "y": numeric[0], "title": f"{numeric[0]} across records"})
    return suggestions[:6]
