from fastapi import APIRouter
from utils.schemas import RouteRequest, RouteResponse
from services import route_optimizer

router = APIRouter()


@router.post("/optimize/route", response_model=RouteResponse)
def optimize_route(req: RouteRequest):
    stops = [s.model_dump() for s in req.stops]
    result = route_optimizer.optimize(stops, req.vehicleCapacityKg)
    return result
