from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Inventory, Pharmacy, Medicine
from app.schemas.schemas import InventoryUpdateStatusRequest, InternalInventoryItemOut, PosSyncResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.patch("/{id}", response_model=InternalInventoryItemOut)
def update_inventory_item(
    id: str,
    payload: InventoryUpdateStatusRequest,
    db: Session = Depends(get_db)
):
    inv = db.query(Inventory).filter(Inventory.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    if payload.availability_status not in ["available", "unavailable", "uncertain"]:
        raise HTTPException(status_code=400, detail="Invalid availability status. Must be available, unavailable, or uncertain.")

    inv.availability_status = payload.availability_status
    if payload.internal_stock_quantity is not None:
        inv.internal_stock_quantity = payload.internal_stock_quantity
    inv.last_updated = datetime.now(timezone.utc)

    db.commit()
    db.refresh(inv)
    return inv

@router.post("/sync", response_model=PosSyncResponse)
def simulate_pos_sync(
    pharmacy_id: str,
    db: Session = Depends(get_db)
):
    """
    Simulates real-time synchronization between pharmacy Point of Sale / ERP system
    and the AyuLink network.
    """
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == pharmacy_id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    items = db.query(Inventory).filter(Inventory.pharmacy_id == pharmacy_id).all()
    now_str = datetime.now().strftime("%I:%M %p")

    # Update timestamps of items
    for item in items:
        item.last_updated = datetime.now(timezone.utc)
    db.commit()

    total_count = len(items)
    unavail_count = sum(1 for item in items if item.availability_status == "unavailable")
    updated_count = total_count - unavail_count

    return PosSyncResponse(
        last_synchronization=now_str,
        medicines_processed=total_count,
        updated=updated_count,
        unavailable=unavail_count,
        status="success",
        message="Simulated POS/ERP synchronization cycle completed successfully. Availability feeds updated across AyuLink network."
    )
