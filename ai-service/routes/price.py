from fastapi import APIRouter
from utils.schemas import PriceRequest, PriceResponse
from services import price_model

router = APIRouter()


@router.post("/predict/price", response_model=PriceResponse)
def predict_price(req: PriceRequest):
    result = price_model.predict(
        crop=req.crop,
        location=req.location,
        current_price=req.current_price,
        quantity=req.quantity,
        demand_trend=req.demand_trend,
    )
    return result
