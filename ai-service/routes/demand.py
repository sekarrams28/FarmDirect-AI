from fastapi import APIRouter
from utils.schemas import DemandRequest, DemandResponse
from services import demand_model

router = APIRouter()


@router.post("/predict/demand", response_model=DemandResponse)
def predict_demand(req: DemandRequest):
    result = demand_model.predict(req.crop, req.location, req.forecast_days)
    return result
