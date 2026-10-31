# AGENTS.md — Chùa Online (TikTok LIVE overlay)

- Node 18+ ESM, Express + Socket.IO. Frontend thuần HTML/CSS/JS, **không build step**. State nằm ở `server.js`, không dùng localStorage cho dữ liệu quan trọng.
- Chạy: `npm install && npm start` (cổng 3000, đổi bằng `PORT`). Trang: `/overlay.html?clean=1` (OBS 1080×1920), `/control.html`, `/admin.html`.
- Tài nguyên: `public/assets/{decor,ui,fx,sprites}`. Sinh lại bằng `scripts/prepare_assets.py` từ 2 file ZIP gốc. Đừng sửa tay file trong `assets/`.
- **Chữ động (tên, số, username) phải là HTML đè lên khung rỗng.** Ảnh UI có chữ in sẵn chỉ dùng cho nhãn tĩnh. Xem `docs/asset-map.md`.
- Toạ độ cảnh (540×960) nằm ở `LAYOUT`/`POS`/`SLOTS` trong `public/js/overlay.js`; chỉnh số ở đó, không rải style inline.
- Mọi chuỗi giao diện bằng tiếng Việt, giọng trang nghiêm; không hứa hẹn "linh nghiệm" hay gắn tiền với lời hứa tài lộc.
- Chế độ giả lập chỉ để test, không dùng tạo người xem ảo trên phòng LIVE công khai.
- Trước khi báo xong: `node --check` mọi file JS, chạy server, bấm đủ 9 nghi thức, chụp màn hình overlay 1080×1920 so với `reference/mau_giao_dien.jpg`.
