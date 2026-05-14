import os
import base64
import json
import tempfile
import asyncio
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCTS_DIR = Path("products")
app.mount("/products", StaticFiles(directory=str(PRODUCTS_DIR)), name="products")

executor = ThreadPoolExecutor(max_workers=2)


@app.get("/api/products")
async def get_products():
    with open(PRODUCTS_DIR / "products.json", "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/status")
async def status():
    return {"ok": True}


@app.post("/api/process-photo")
async def process_photo(photo: UploadFile = File(...)):
    contents = await photo.read()
    b64 = base64.b64encode(contents).decode()
    return {"processed_image": f"data:image/jpeg;base64,{b64}"}


@app.post("/api/try-on")
async def try_on(
    person_image: str = Form(...),
    product_id: str = Form(...),
    size: str = Form(...),
):
    with open(PRODUCTS_DIR / "products.json", "r", encoding="utf-8") as f:
        products = json.load(f)

    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    if "," in person_image:
        person_image = person_image.split(",")[1]
    person_bytes = base64.b64decode(person_image)

    garment_path = PRODUCTS_DIR / product["image"]
    if not garment_path.exists():
        raise HTTPException(status_code=404, detail="Ürün görseli bulunamadı")

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        f.write(person_bytes)
        person_tmp = f.name

    try:
        loop = asyncio.get_event_loop()
        result_b64 = await loop.run_in_executor(
            executor,
            lambda: _tryon(person_tmp, str(garment_path))
        )
        return {"result_url": result_b64}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Giydirme hatası: {str(e)}")
    finally:
        try:
            os.unlink(person_tmp)
        except Exception:
            pass


def _tryon(person_path: str, garment_path: str) -> str:
    import fal_client
    import urllib.request

    os.environ["FAL_KEY"] = "b91cafa6-f676-4a98-8df1-b3be050540b1:574d85964a9abec22c0aa2ecd3951396"

    human_url = fal_client.upload_file(person_path)
    garment_url = fal_client.upload_file(garment_path)

    result = fal_client.subscribe(
        "fal-ai/kling/v1-5/kolors-virtual-try-on",
        arguments={
            "human_image_url": human_url,
            "garment_image_url": garment_url,
        }
    )

    result_url = result["images"][0]["url"]
    with urllib.request.urlopen(result_url) as resp:
        img_data = resp.read()

    return "data:image/png;base64," + base64.b64encode(img_data).decode()
