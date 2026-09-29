"""
Logistics / route optimisation service.

Baseline: a nearest-neighbour heuristic starting from the first stop, which
is easy to explain in a demo and needs no external solver. For the real
MVP, swap `optimize()` for a proper OR-Tools VRP (Vehicle Routing Problem)
solve -- the project plan already lists `ortools` as a dependency for this
upgrade. Keep the same input/output shape so the FastAPI route and the
Node controller don't need to change.
"""
import math


def _distance_km(a: dict, b: dict) -> float:
    R = 6371.0
    lat1, lon1, lat2, lon2 = a["latitude"], a["longitude"], b["latitude"], b["longitude"]
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    x = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(x), math.sqrt(1 - x))


def optimize(stops: list[dict], vehicle_capacity_kg: float | None = None) -> dict:
    if not stops:
        return {"orderedStops": [], "totalDistanceKm": 0.0, "estimatedDurationMin": 0.0, "modelVersion": "route-nearest-neighbour-v0"}

    remaining = stops.copy()
    route = [remaining.pop(0)]
    total_km = 0.0

    while remaining:
        last = route[-1]
        remaining.sort(key=lambda s: _distance_km(last, s))
        nxt = remaining.pop(0)
        total_km += _distance_km(last, nxt)
        route.append(nxt)

    # Rough average speed for rural/semi-urban collection routes.
    avg_speed_kmph = 28
    duration_min = round((total_km / avg_speed_kmph) * 60 + len(route) * 8, 0)  # +8 min per stop for loading

    return {
        "orderedStops": route,
        "totalDistanceKm": round(total_km, 1),
        "estimatedDurationMin": duration_min,
        "modelVersion": "route-nearest-neighbour-v0",
    }
