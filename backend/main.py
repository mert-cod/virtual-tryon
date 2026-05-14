import os
import base64
import json
import tempfile
import asyncio
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
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
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Geçersiz görsel")

    img = _crop_head(img)
    img = _remove_background(img)

    _, buffer = cv2.imencode(".png", img)
    b64 = base64.b64encode(buffer).decode()
    return {"processed_image": f"data:image/png;base64,{b64}"}


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
            lambda: _replicate_tryon(person_tmp, str(garment_path), product.get("description", product["name"]), product.get("category", "ust"))
        )
        return {"result_url": result_b64}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Giydirme hatası: {str(e)}")
    finally:
        try:
            os.unlink(person_tmp)
        except Exception:
            pass


def _replicate_tryon(person_path: str, garment_path: str, description: str, category: str = "ust") -> str:
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


def _crop_head(img: np.ndarray) -> np.ndarray:
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50))

    h = img.shape[0]
    result = img.copy()

    if len(faces) > 0:
        fx, fy, fw, fh = max(faces, key=lambda f: f[2] * f[3])
        cut_y = min(fy + fh + int(fh * 0.4), h)
    else:
        cut_y = int(h * 0.22)

    result[:cut_y, :] = [255, 255, 255]
    return result


def _remove_background(img: np.ndarray) -> np.ndarray:
    from rembg import remove

    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    output = remove(pil_img)

    bg = Image.new("RGBA", output.size, (255, 255, 255, 255))
    bg.paste(output, mask=output.split()[3])

    return cv2.cvtColor(np.array(bg.convert("RGB")), cv2.COLOR_RGB2BGR)
