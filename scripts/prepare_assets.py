#!/usr/bin/env python3
"""Giải nén + tối ưu 2 bộ tài nguyên điện thờ thành public/assets/ (WebP nhẹ, tên ngắn).
Dùng:  python3 prepare_assets.py --elements Bo_element_dien_tho_59_PNG.zip \
                                  --animations Bo_animation_dien_tho_24_hieu_ung.zip \
                                  --out ../../chua-online/public
Cần: pip install pillow
"""
import argparse, json, re, shutil, tempfile, zipfile
from pathlib import Path
from PIL import Image

MAX_SIDE = {"tuong_phat":640,"hao_quang":700,"dai_sen":800,"ban_tho":1000,"binh_hoa_sen":420,"den_long_treo":300,
            "den_tho_chan_cao":300,"lu_huong":520,"nen_huong":200,"tham_do":1000,"nguoi_quy":300,"chuong_chua":420,
            "mo_go":420,"ong_xin_xam":260,"den_hoa_dang":420,"mam_trai_cay":420}
UI_SCALE = 0.4                     # PNG giao diện thiết kế ở 3x -> 0.4 là đủ nét cho màn 2x
FX_USED = ["12_thap_huong","13_tha_hoa_dang","14_dang_hoa_sen","15_thinh_chuong","16_go_mo","17_xin_xam",
           "18_dang_trai_cay","19_sen_no","22_tia_sang","23_hat_sang","24_khoi_huong"]

def unzip(z, tmp):
    if Path(z).is_dir(): return Path(z)
    d = Path(tmp) / Path(z).stem
    zipfile.ZipFile(z).extractall(d); return d

def save(im, dst, q=88):
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "WEBP", quality=q, method=4)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--elements", required=True); ap.add_argument("--animations", required=True)
    ap.add_argument("--out", required=True, help="thư mục public/ của dự án")
    ap.add_argument("--all-fx", action="store_true", help="chép cả 24 animation (≈19MB)")
    a = ap.parse_args(); out = Path(a.out) / "assets"; manifest = {"decor":{}, "ui":{}, "fx":{}, "sprites":{}}
    with tempfile.TemporaryDirectory() as tmp:
        el = unzip(a.elements, tmp); an = unzip(a.animations, tmp)
        for p in sorted(el.rglob("*.png")):
            name = re.sub(r"^\d+_", "", p.stem); im = Image.open(p)
            if p.parent.name == "01_trang_tri":
                if im.mode != "RGB":
                    m = MAX_SIDE.get(name, 640); im.thumbnail((m, m), Image.LANCZOS)
                save(im, out/"decor"/f"{name}.webp"); manifest["decor"][name] = list(im.size)
            else:
                im = im.resize((round(im.width*UI_SCALE), round(im.height*UI_SCALE)), Image.LANCZOS)
                save(im, out/"ui"/f"{name}.webp", 92); manifest["ui"][name] = list(im.size)
        pack = next(an.rglob("animations")).parent
        for p in sorted((pack/"animations").glob("*.webp")):
            if a.all_fx or p.stem in FX_USED:
                (out/"fx").mkdir(parents=True, exist_ok=True); shutil.copy(p, out/"fx"/p.name)
                manifest["fx"][p.stem] = p.stat().st_size
        for k in ("walk","bow"):
            im = Image.open(pack/"sprites"/f"{k}_strip.png"); save(im, out/"sprites"/f"{k}_strip.webp", 90)
            manifest["sprites"][k] = {"frames": 8, "frame_px": 256}
        (Path(a.out)/"css").mkdir(parents=True, exist_ok=True); shutil.copy(pack/"motion.css", Path(a.out)/"css"/"motion.css")
    (out/"manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
    print("OK ->", out, "|", sum(f.stat().st_size for f in out.rglob('*') if f.is_file())//1024, "KB")

if __name__ == "__main__": main()
