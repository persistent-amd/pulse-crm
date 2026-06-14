from fastapi import HTTPException

from app.api.routes.audiences import parse_payload
from app.schemas.audiences import AudiencePreviewRequest


def valid_payload(field: str, op: str, value):
    return {
        "filter_json": {
            "operator": "and",
            "conditions": [{"field": field, "op": op, "value": value}],
        },
        "sample_limit": 5,
    }


def test_audience_preview_accepts_supported_filters_and_operators():
    cases = [
        ("lifetime_value", "gt", 5000),
        ("lifetime_value", "gte", 5000),
        ("total_orders", "lt", 3),
        ("total_orders", "lte", 3),
        ("last_purchase_days_ago", "between", [30, 90]),
        ("city", "eq", "Mumbai"),
        ("city", "in", ["Mumbai", "Delhi"]),
        ("persona", "eq", "Churn Risk"),
        ("persona", "in", ["Churn Risk", "High Value Loyalist"]),
    ]

    for field, op, value in cases:
        request = parse_payload(AudiencePreviewRequest, valid_payload(field, op, value))
        condition = request.filter_json.conditions[0]
        assert condition.field == field
        assert condition.op == op
        assert condition.value == value


def test_audience_preview_rejects_invalid_field_with_400():
    try:
        parse_payload(AudiencePreviewRequest, valid_payload("favorite_color", "eq", "blue"))
    except HTTPException as exc:
        assert exc.status_code == 400
        assert "Unsupported filter field" in str(exc.detail)
    else:
        raise AssertionError("Expected HTTPException")


def test_audience_preview_rejects_invalid_operator_with_400():
    try:
        parse_payload(AudiencePreviewRequest, valid_payload("persona", "contains", "Risk"))
    except HTTPException as exc:
        assert exc.status_code == 400
        assert "Unsupported filter operator" in str(exc.detail)
    else:
        raise AssertionError("Expected HTTPException")
