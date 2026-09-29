from fastapi import APIRouter
from utils.schemas import AdvisorRequest, AdvisorResponse
from services import advisor_service

router = APIRouter()


@router.post("/advisor", response_model=AdvisorResponse)
def farm_advisor(req: AdvisorRequest):
    result = advisor_service.advise(req.crop, req.quantity, req.location)
    return result
