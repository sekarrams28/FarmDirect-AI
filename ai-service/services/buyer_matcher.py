"""
Buyer matching service.

Implements the weighted scoring model described in the project plan
(section 12): crop fit, quantity fit, price, distance and delivery deadline
urgency are combined into a single 0-100 score per candidate buyer/offer.

This is intentionally simple and explainable -- a linear weighted sum -- so
that during a demo you can justify *why* a buyer ranked where they did.
"""
import math
from datetime import datetime, timezone


WEIGHTS = {
    "price": 0.45,
    "quantity_fit": 0.20,
    "distance": 0.20,
    "urgency": 0.15,
}


def _distance_km(loc_a: dict | None, loc_b: dict | None) -> float:
    if not loc_a or not loc_b:
        return 25.0  # unknown -> assume a moderate distance
    lat1, lon1 = loc_a.get("latitude"), loc_a.get("longitude")
    lat2, lon2 = loc_b.get("latitude"), loc_b.get("longitude")
    if None in (lat1, lon1, lat2, lon2):
        return 25.0
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def rank(crop: str, quantity: float, location: dict | None, buyers: list[dict]) -> dict:
    if not buyers:
        return {"crop": crop, "rankedOffers": [], "recommendedOfferId": None}

    max_price = max(b["offeredPrice"] for b in buyers) or 1
    scored = []

    for b in buyers:
        price_score = (b["offeredPrice"] / max_price) * 100
        qty_ratio = min(b["quantity"], quantity) / quantity if quantity else 0
        quantity_score = qty_ratio * 100
        dist_km = _distance_km(location, b.get("buyerLocation"))
        distance_score = max(0.0, 100 - dist_km * 2)  # closer is better, decays with km

        urgency_score = 50.0
        if b.get("deliveryDeadline"):
            try:
                deadline = datetime.fromisoformat(str(b["deliveryDeadline"]).replace("Z", "+00:00"))
                days_left = (deadline - datetime.now(timezone.utc)).days
                urgency_score = max(10.0, 100 - max(days_left, 0) * 10)
            except ValueError:
                pass

        total = (
            price_score * WEIGHTS["price"]
            + quantity_score * WEIGHTS["quantity_fit"]
            + distance_score * WEIGHTS["distance"]
            + urgency_score * WEIGHTS["urgency"]
        )

        reason_bits = [
            f"price {b['offeredPrice']} ({price_score:.0f}/100)",
            f"qty fit {qty_ratio*100:.0f}%",
            f"{dist_km:.0f} km away",
        ]

        scored.append(
            {
                "offerId": b.get("offerId"),
                "score": round(total, 1),
                "reason": ", ".join(reason_bits),
            }
        )

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {
        "crop": crop,
        "rankedOffers": scored,
        "recommendedOfferId": scored[0]["offerId"] if scored else None,
    }
