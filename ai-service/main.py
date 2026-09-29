"""
FarmDirect AI service — Python/FastAPI

Only the Node/Express backend should call this service; it is not meant to
be exposed to the public internet directly. Run with:

    uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import demand, price, buyer, logistics, advisor

app = FastAPI(
    title="FarmDirect AI Service",
    description="Demand forecasting, price intelligence, buyer matching and route optimisation for FarmDirect AI (SIH 26033).",
    version="0.1.0",
)

# Only the backend should call this in production — keep this permissive
# only for local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "farmdirect-ai-service"}


app.include_router(demand.router, tags=["demand"])
app.include_router(price.router, tags=["price"])
app.include_router(buyer.router, tags=["buyer-matching"])
app.include_router(logistics.router, tags=["logistics"])
app.include_router(advisor.router, tags=["advisor"])
