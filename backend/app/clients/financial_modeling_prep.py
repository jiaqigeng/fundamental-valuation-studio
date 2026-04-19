from __future__ import annotations

from datetime import date
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
import os
from numbers import Real

import httpx

from app.schemas.company_workspace import RevenueSegment
from app.schemas.company_workspace import RevenueSegmentBreakdown


FMP_API_KEY_ENV = "FVS_FMP_API_KEY"
FMP_BASE_URL = "https://financialmodelingprep.com"
FMP_SEGMENT_ENDPOINT = "/stable/revenue-product-segmentation"
FMP_SEGMENT_PERIOD = "annual"
FMP_MAX_REVENUE_DRIFT = 0.15
AGGREGATE_SEGMENT_LABELS = {
    "product",
    "products",
    "total",
    "other",
    "others",
    "all other",
    "corporate and other",
    "eliminations",
}
SEGMENT_LABEL_OVERRIDES = {
    "service": "Services",
}


class FinancialModelingPrepClient:
    def __init__(self, timeout: float = 10.0) -> None:
        self._timeout = timeout
        self._api_key = os.getenv(FMP_API_KEY_ENV, "").strip()

    def fetch_revenue_segment_breakdown(
        self,
        ticker: str,
        *,
        target_revenue: float | int | None,
    ) -> RevenueSegmentBreakdown | None:
        if not self._api_key:
            return None

        try:
            with httpx.Client(base_url=FMP_BASE_URL, timeout=self._timeout) as client:
                response = client.get(
                    FMP_SEGMENT_ENDPOINT,
                    params={
                        "symbol": ticker,
                        "period": FMP_SEGMENT_PERIOD,
                        "apikey": self._api_key,
                    },
                )
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError):
            return None

        return _build_revenue_segment_breakdown_from_fmp_payload(
            payload,
            target_revenue=target_revenue,
        )


def _build_revenue_segment_breakdown_from_fmp_payload(
    payload: object,
    *,
    target_revenue: float | int | None,
) -> RevenueSegmentBreakdown | None:
    if not isinstance(payload, list) or not payload:
        return None

    candidate_entries: list[tuple[date, dict[str, float]]] = []
    for item in payload:
        if not isinstance(item, dict):
            continue

        direct_date = _parse_fiscal_date(str(item.get("date")))
        direct_data = item.get("data")
        if direct_date is not None and isinstance(direct_data, dict):
            candidate_groups = _collect_candidate_groups(direct_data)
            best_group = _select_best_group(
                candidate_groups,
                target_revenue=target_revenue,
            )
            if best_group:
                candidate_entries.append((direct_date, best_group))
            continue

        for fiscal_date_text, entry in item.items():
            fiscal_date = _parse_fiscal_date(fiscal_date_text)
            if fiscal_date is None or not isinstance(entry, dict):
                continue
            candidate_groups = _collect_candidate_groups(entry)
            best_group = _select_best_group(
                candidate_groups,
                target_revenue=target_revenue,
            )
            if best_group:
                candidate_entries.append((fiscal_date, best_group))

    if not candidate_entries:
        return None

    best_date, best_group = _select_best_entry(
        candidate_entries,
        target_revenue=target_revenue,
    )
    del best_date
    total_revenue = sum(best_group.values())
    if total_revenue <= 0:
        return None

    return RevenueSegmentBreakdown(
        total_revenue=_round_currency_value(total_revenue),
        total_revenue_display=_format_compact_currency(total_revenue),
        segments=[
            RevenueSegment(
                label=label,
                value=_round_currency_value(value),
                display_value=_format_compact_currency(value),
                share_of_total=_round_share(value / total_revenue),
            )
            for label, value in sorted(
                best_group.items(),
                key=lambda item: item[1],
                reverse=True,
            )
        ],
    )


def _select_best_entry(
    entries: list[tuple[date, dict[str, float]]],
    *,
    target_revenue: float | int | None,
) -> tuple[date, dict[str, float]]:
    def score(entry: tuple[date, dict[str, float]]) -> tuple[float, float, float]:
        fiscal_date, group = entry
        total = sum(group.values())
        drift = _relative_drift(total, target_revenue)
        return (
            drift,
            -fiscal_date.toordinal(),
            -len(group),
        )

    return min(entries, key=score)


def _select_best_group(
    groups: list[dict[str, float]],
    *,
    target_revenue: float | int | None,
) -> dict[str, float] | None:
    viable_groups = [group for group in groups if len(group) >= 1 and sum(group.values()) > 0]
    if not viable_groups:
        return None

    if target_revenue is not None:
        viable_groups = [
            group
            for group in viable_groups
            if _relative_drift(sum(group.values()), target_revenue) <= FMP_MAX_REVENUE_DRIFT
        ] or viable_groups

    return min(
        viable_groups,
        key=lambda group: (
            _relative_drift(sum(group.values()), target_revenue),
            -len(group),
        ),
    )


def _collect_candidate_groups(node: dict[str, object]) -> list[dict[str, float]]:
    candidates: list[dict[str, float]] = []
    direct_numbers = {
        _normalize_segment_label(label): float(value)
        for label, value in node.items()
        if _is_number(value) and float(value) > 0
    }
    if direct_numbers:
        candidates.append(direct_numbers)
        pruned_numbers = {
            label: value
            for label, value in direct_numbers.items()
            if not (
                label.lower() in AGGREGATE_SEGMENT_LABELS and len(direct_numbers) >= 3
            )
        }
        if pruned_numbers and pruned_numbers != direct_numbers:
            candidates.append(pruned_numbers)

    for value in node.values():
        if isinstance(value, dict):
            candidates.extend(_collect_candidate_groups(value))

    return candidates


def _normalize_segment_label(label: str) -> str:
    normalized = label.strip()
    return SEGMENT_LABEL_OVERRIDES.get(normalized.lower(), normalized)


def _parse_fiscal_date(value: str) -> date | None:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def _relative_drift(total: float, target_revenue: float | int | None) -> float:
    if target_revenue in (None, 0):
        return 0.0
    return abs(total - float(target_revenue)) / abs(float(target_revenue))


def _is_number(value: object) -> bool:
    return isinstance(value, Real) and not isinstance(value, bool)


def _round_currency_value(value: float) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _round_share(value: float) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))


def _format_compact_currency(value: float) -> str:
    absolute_value = abs(float(value))
    suffixes = (
        (1_000_000_000_000, "T"),
        (1_000_000_000, "B"),
        (1_000_000, "M"),
        (1_000, "K"),
    )
    for threshold, suffix in suffixes:
        if absolute_value >= threshold:
            scaled_value = Decimal(str(float(value) / threshold)).quantize(
                Decimal("0.1"), rounding=ROUND_HALF_UP
            )
            return f"${scaled_value}{suffix}"

    quantized = Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return f"${quantized}"
