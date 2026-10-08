"""Extract faithful image objects/crops; never renders a slide as a learning banner.
Requires PyMuPDF and Pillow. Usage: python scripts/extract-module4-images.py --source "path/to/3108 WARMI DIGITAL.pdf"
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import pymupdf
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("--source", required=True)
args = parser.parse_args()
source = Path(args.source).resolve()
if hashlib.sha256(source.read_bytes()).hexdigest() != "31744df4404ad0d302f57d99fb059f31f031cec8c6d98789fddf80460bad7262":
    raise ValueError("Different PDF edition: review pages and crops before changing the source.")
root = Path(__file__).resolve().parents[1]
out = root / "public/images/learning/module4"
out.mkdir(parents=True, exist_ok=True)
items = [("artesana",48,1199,(16,14,261,376)),("paisaje",48,1199,(270,214,419,374)),("manos",48,1199,(434,215,582,375)),("munecas",49,1222,None),("bolso",51,1279,None),("tejidos",51,1282,None),("qallwa",52,1306,None),("resolucion",52,1304,None),("entrega",54,1363,(0,0,400,512))]
manifest = []
with pymupdf.open(source) as pdf:
    if len(pdf) != 65:
        raise ValueError("Expected the reviewed 65-page source; do not crop a different edition blindly.")
    for key, page, xref, crop in items:
        if xref not in [image[0] for image in pdf[page - 1].get_images(full=True)]:
            raise ValueError("Image object does not belong to the reviewed source page.")
        image = Image.open(io.BytesIO(pdf.extract_image(xref)["image"])).convert("RGB")
        if crop:
            image = image.crop(crop)
        target = out / f"{key}.webp"
        image.save(target, "WEBP", quality=86, method=6)
        data = target.read_bytes()
        manifest.append({"key":key,"page":page,"xref":xref,"crop":crop,"filename":target.name,"width":image.width,"height":image.height,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()})
(out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(manifest)} WebP crops, {sum(m['bytes'] for m in manifest)} bytes. Source SHA256: {hashlib.sha256(source.read_bytes()).hexdigest()}")
