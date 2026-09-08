from sqlalchemy import Column, Integer, Float, String, DateTime
from backend.database.database import Base


class MarketFeature(Base):
    __tablename__ = "market_features"

    id = Column(Integer, primary_key=True, index=True)

    symbol = Column(String(20), nullable=False)

    timestamp = Column(DateTime, nullable=False)

    trade_count = Column(Integer)

    total_volume = Column(Float)

    average_trade_size = Column(Float)

    first_price = Column(Float)

    last_price = Column(Float)

    price_change_percent = Column(Float)

    buy_volume = Column(Float)

    sell_volume = Column(Float)

    volume_imbalance = Column(Float)