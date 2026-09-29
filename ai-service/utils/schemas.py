"""Pydantic models shared across the AI service routes."""
from typing import List, Optional
from pydantic import BaseModel, Field


class DemandRequest(BaseModel):
    crop: str
    location: str
    forecast_days: int = 7


class DemandResponse(BaseModel):
    crop: str
    location: str
    predictedDemandKg: float
    trend: str  # LOW | MEDIUM | HIGH
    forecastDays: int
    modelVersion: str = "demand-baseline-v0"


class PriceRequest(BaseModel):
    crop: str
    location: str
    current_price: Optional[float] = None
    quantity: Optional[float] = None
    demand_trend: Optional[str] = None


class PriceResponse(BaseModel):
    crop: str
    location: str
    recommendedMin: float
    recommendedMax: float
    bestBuyerPrice: float
    recommendation: str  # SELL_NOW | WAIT | HOLD
    estimatedRevenue: Optional[float] = None
    modelVersion: str = "price-baseline-v0"


class BuyerCandidate(BaseModel):
    offerId: Optional[str] = None
    offeredPrice: float
    quantity: float
    deliveryDeadline: Optional[str] = None
    buyerLocation: Optional[dict] = None


class BuyerMatchRequest(BaseModel):
    crop: str
    quantity: float
    location: Optional[dict] = None
    buyers: List[BuyerCandidate] = Field(default_factory=list)


class RankedOffer(BaseModel):
    offerId: Optional[str] = None
    score: float
    reason: str


class BuyerMatchResponse(BaseModel):
    crop: str
    rankedOffers: List[RankedOffer]
    recommendedOfferId: Optional[str] = None


class RouteStop(BaseModel):
    produceId: Optional[str] = None
    latitude: float
    longitude: float
    quantityKg: float


class RouteRequest(BaseModel):
    stops: List[RouteStop]
    vehicleCapacityKg: Optional[float] = None


class RouteResponse(BaseModel):
    orderedStops: List[RouteStop]
    totalDistanceKm: float
    estimatedDurationMin: float
    modelVersion: str = "route-nearest-neighbour-v0"


class AdvisorRequest(BaseModel):
    crop: str
    quantity: float
    location: str


class AdvisorResponse(BaseModel):
    crop: str
    quantity: float
    currentPrice: float
    expectedPrice: float
    demand: str
    bestBuyer: str
    bestBuyerOffer: float
    transportCostPerKg: float
    recommendation: str
