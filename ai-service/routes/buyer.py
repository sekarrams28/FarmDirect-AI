from fastapi import APIRouter
from utils.schemas import BuyerMatchRequest, BuyerMatchResponse
from services import buyer_matcher

router = APIRouter()


@router.post("/recommend/buyer", response_model=BuyerMatchResponse)
def recommend_buyer(req: BuyerMatchRequest):
    buyers = [b.model_dump() for b in req.buyers]
    result = buyer_matcher.rank(req.crop, req.quantity, req.location, buyers)
    return result
