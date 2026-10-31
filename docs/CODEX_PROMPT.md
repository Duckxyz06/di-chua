# PROMPT CHO CODEX — "Chùa Online" (TikTok LIVE overlay + bảng điều khiển)

> Dán toàn bộ phần dưới vào Codex, mở Codex tại thư mục `chua-online/`. Đính kèm: `reference/mau_giao_dien.jpg` (ảnh mẫu giao diện). Nếu bạn dùng skill kèm theo, cứ nói: *"Dùng skill chua-online-live-builder"*.

---

## Vai trò & mục tiêu
Bạn là senior full-stack dev. Dự án `chua-online/` đã có **bản khởi đầu chạy được** (Node + Express + Socket.IO, frontend thuần, đã có tài nguyên trong `public/assets/`). Hãy **nâng cấp, không viết lại từ đầu**, để giao diện và hành vi **khớp ảnh mẫu `reference/mau_giao_dien.jpg`**: bên trái là overlay điện thờ 9:16 (Phật vàng + hào quang + đài sen + bàn thờ + thảm đỏ + phật tử quỳ + HUD + bảng "Tấm lòng thành"), bên phải là bảng điều khiển "Điều Khiển Live & RPC" nền nâu đỏ tối, viền và nút vàng đồng.

## Đọc trước khi sửa
1. `AGENTS.md` (quy ước dự án).
2. `docs/spec.md` (đặc tả giao diện, luật điểm, API) và `references/asset-map.md` (từng ảnh dùng làm gì, ảnh nào có chữ in sẵn).
3. `public/js/overlay.js` (toạ độ cảnh) và `server.js` (state, luật nghi thức, TikTok).

## Tài nguyên (đã tối ưu sang WebP trong `public/assets/`)
- `decor/` 17 element điện thờ (tượng Phật, hào quang, đài sen, bàn thờ, bình sen, đèn lồng, đèn thờ, lư hương, thảm đỏ, chuông, mõ, ống xăm, đèn hoa đăng, mâm quả, nền điện thờ…).
- `ui/` 42 element giao diện (khung, nút, ô nhập, thẻ…).
- `fx/` animation WebP nền trong suốt, 2,4 giây/chu kỳ (hương, hoa đăng, hoa sen, chuông, mõ, xin xăm, mâm quả, sen nở, tia sáng, hạt sáng, khói hương).
- `sprites/walk_strip.webp`, `bow_strip.webp`: mỗi dải 8 khung 256×256 (bước đi; đứng→quỳ→cúi lễ; khung số 2 là tư thế quỳ chờ).
- Nếu cần làm lại từ ZIP gốc: `python3 scripts/prepare_assets.py --elements <zip> --animations <zip> --out public`.

**Quy tắc vàng:** ảnh có chữ in sẵn (ví dụ `nut_thinh_chuong`, `bo_dem`, `huy_hieu_live`, `bang_tam_long_thanh`, `thanh_am_luong_*`, `o_tai_khoan`) **chỉ dùng cho nhãn tĩnh**. Mọi chữ động (tên người, số công đức, `@username`, % âm lượng, trạng thái BẬT/TẮT) phải là **HTML đè lên khung rỗng** (`nhan_ten_trong`, `nut_trong_gold/green/red`, `o_nhap_trong`, `the_vat_pham_trong`, `khung_xep_hang_trong`). Animation WebP trong nhóm "khung chữ" có chữ nằm sẵn → **không dùng**, thay bằng CSS trong `motion.css` (`motion-pop`, `motion-ticker`, `motion-contribution`).

## Việc cần làm (theo thứ tự)
1. **Chạy thử:** `npm install && npm start`; mở `/overlay.html?clean=1` (cửa sổ 540×960 và 1080×1920) và `/control.html`; bấm đủ 9 nghi thức + bật giả lập. Sửa mọi lỗi console/mạng.
2. **Khớp ảnh mẫu bằng mắt:** chụp màn hình overlay, đặt cạnh ảnh mẫu, chỉnh các số trong `LAYOUT`, `POS`, `SLOTS` (overlay.js) và CSS cho tới khi bố cục khớp: tượng Phật nằm trên đài sen giữa hào quang, 2 bình sen + 2 đèn thờ hai bên, bàn thờ có lư hương/mâm quả, chuông ở trái – mõ – ống xăm ở phải kèm nhãn nhỏ ("Thỉnh Chuông", "Gõ Mõ (n)", "Xin Xăm"), thảm đỏ chạy xuống đáy, hàng đầu 7 phật tử quỳ trước bàn thờ, hai cột phật tử hai bên thảm, thanh công đức + 3 thẻ (Dâng hương 1 coin/cmt · Cầu phúc 5 coins/tim · Hoa sen 10+ coins) và bảng "Tấm lòng thành" ở đáy.
3. **Khớp bảng điều khiển:** 3 khối đúng thứ tự trong ảnh (Âm thanh chùa & giọng đọc khấn · Kết nối phòng TikTok Live · Kích hoạt nghi thức tương tác RPC), nút "Mở Admin Đầy Đủ ↗", nút Đại Lễ Kim Long chiếm cả hàng. Responsive: màn hẹp thì xếp dọc.
4. **Hoàn thiện chuyển động** bằng bộ animation: phật tử mới đi bộ từ đáy lên chỗ quỳ (sprite `walk`), quỳ chờ (`bow` khung 2), cúi lễ khi tương tác (`bow` 0→7), phát sáng + "+N công đức" bay lên; mỗi nghi thức phát đúng animation `fx/` tại đúng vị trí vật phẩm; vật phẩm trên bàn thờ rung/đung đưa; hào quang xoay; khói hương lặp; Đại Lễ có flash vàng + banner.
5. **Âm thanh:** nút "Bật Âm Thanh" trong điều khiển + nút mở khoá ở overlay (bỏ qua khi `?clean=1`); chuông, mõ, chuông gió, nhạc nền drone bằng WebAudio (bộ tài nguyên không kèm file âm thanh; nếu có file thật trong `public/assets/audio/` thì ưu tiên); giọng đọc `speechSynthesis` `vi-VN` đọc "<tên> <nghi thức>. <lời nguyện>"; bật/tắt riêng giọng đọc và nhạc nền; hai thanh âm lượng (mặc định 89% / 86%) đồng bộ realtime qua Socket.IO; iframe xem trước trong control luôn tắt tiếng (`?mute=1`).
6. **TikTok thật:** kiểm tra `tiktok-live-connector` đã cài bản nào (`npm ls tiktok-live-connector`), đối chiếu tên sự kiện/trường dữ liệu với README của chính bản đó, sửa adapter trong `server.js` nếu lệch. Xử lý phòng chưa LIVE, rate-limit, mất kết nối bằng toast + tự kết nối lại có backoff (đã có khung). Quà streak chỉ tính khi `repeatEnd`.
7. **Kiểm thử & tài liệu:** thêm test nhỏ cho luật điểm (`node --test`): comment→dâng hương 1, "xin xăm"→2, 5 tim→cầu phúc 5, quà theo `giftMap`, quà lạ theo kim cương, quà streak. Cập nhật `README.md` (cài đặt, OBS Browser Source 1080×1920, đổi bảng quà, đổi toạ độ cảnh).

## Luật tương tác (đã có trong `config.json` — giữ nguyên trừ khi tôi yêu cầu)
| Sự kiện TikTok | Nghi thức | Công đức |
|---|---|---|
| Comment thường | Dâng hương | 1 |
| Comment chứa "xin xăm" | Xin xăm (hiện quẻ 8 giây + đọc to) | 2 |
| Mỗi 5 tim | Cầu phúc | 5 |
| Quà trong `giftMap` | theo bảng, nhân `repeatCount` | 3–100 |
| Quà lạ | ≥100 kim cương → Kim Long; ≥10 → Hoa sen; còn lại → Dâng hương | |
| Người vào phòng | thêm phật tử + thông báo "vừa vào chùa" | 0 |

Tối đa 40 phật tử hiển thị, người mới đẩy người cũ ra; top công đức quỳ hàng đầu.

## Giới hạn đã biết — đừng bịa thêm
- Bộ tài nguyên **không có** ảnh rồng Kim Long và cá chép. Đại Lễ hiện dùng sen nở + tia sáng + hạt sáng + banner. Nếu bạn muốn rồng thật, hãy để chỗ gắn `assets/decor/rong_kim_long.webp` và báo lại, đừng tự vẽ thay thế xấu.
- Nhân vật là sprite 2D (chỉ một kiểu áo xám; đang đổi màu bằng CSS filter), không có rig 3D.
- Không có file âm thanh trong bộ tài nguyên.
- Overlay mẫu/video/trang .htm tôi đưa là **tham khảo bố cục và hành vi** của sản phẩm khác; không sao chép mã hay hình của bên thứ ba.

## Ràng buộc
- Node 18+ ESM, không thêm bước build, không thêm framework. Thêm dependency chỉ khi thật cần và phải nói rõ lý do.
- Chuỗi giao diện tiếng Việt, giọng trang nghiêm; không hứa hẹn "linh nghiệm" hay gắn tiền với lời hứa tài lộc. Chế độ giả lập chỉ để test, không dùng tạo người xem ảo trên phòng LIVE công khai và tôn trọng điều khoản TikTok LIVE.

## Tiêu chí hoàn thành
1. `npm start` chạy sạch lỗi; overlay và control khớp ảnh mẫu (đính kèm ảnh chụp so sánh).
2. Từng nút RPC → có animation, âm thanh, giọng đọc, cộng điểm, bảng xếp hạng đổi.
3. Bật giả lập → phật tử ảo đi vào, quỳ, bảng nhảy số liên tục, không giật khi đủ 40 người.
4. Kết nối `@username` thật → comment/tim/quà thật kích hoạt đúng nghi thức (hoặc nói rõ nếu không thử được).
5. `node --test` xanh; README cập nhật. Báo cáo cuối: file đã sửa, việc chưa làm được, rủi ro còn lại.
