# Đặc tả "Chùa Online"

## Hai trang
- `/overlay.html` — khung logic **540×960** (tỉ lệ 9:16), tự co theo cửa sổ (`--s`). Tham số: `?clean=1` ẩn nút mở khoá âm thanh (dùng cho OBS 1080×1920); `?mute=1` tắt tiếng (dùng cho iframe xem trước).
- `/control.html` — trái: iframe xem trước overlay; phải: bảng điều khiển 380 px, nền `bang_dieu_khien`.
- `/admin.html` — sửa `config.json` (điểm, `giftMap`, quẻ xăm, tên giả lập); lưu là áp dụng ngay.

## Overlay (toạ độ gốc 540×960; sửa trong `overlay.js`)
| Lớp | Vị trí | Ghi chú |
|---|---|---|
| nền `nen_dien_tho` | 0,0 · 540 | ảnh kín 941×1672 |
| thảm `tham_do` | giữa · đáy 975 · rộng 640 | |
| hào quang | giữa · đáy 340 · 350 | quay `motion-halo` |
| đài sen / tượng Phật | đáy 392 / 345 · 290 / 250 | tượng ngồi trên đài |
| bàn thờ | đáy 515 · 450 | |
| bình sen ×2, đèn thờ ×2, đèn lồng treo ×2, mâm quả ×2 | hai bên đối xứng | |
| lư hương, chuông, mõ, ống xăm | trên/bên bàn thờ | có nhãn nhỏ; mõ đếm số lần gõ |
| HUD | trái: `● LIVE @user · N mắt`; phải: `🔥 hương · ✨ CĐ` | |
| phật tử | hàng đầu 7 chỗ y=590 (hạng 1 giữa, rồi trái–phải xen kẽ); 2 cột mỗi bên thảm y=642→842 | tối đa 40 |
| đáy | thanh `🙏 tên · ✨ Công đức: n`; 3 thẻ (Dâng hương 1 coin/cmt · Cầu phúc 5 coins/tim · Hoa sen 10+ coins); bảng "TẤM LÒNG THÀNH" top 5 | |

Vòng đời phật tử: xuất hiện ở đáy → `walk` (8 khung, ~10 khung/giây, tốc độ ~70 px/s) → `bow` khung 2 (quỳ chờ) → khi tương tác: `bow` 0→7 trong 3,2 giây, phát sáng 2,5 giây, "+N công đức" bay lên, bong bóng lời nguyện 5 giây.

## Nghi thức → animation
| Nghi thức | `fx/` | Vật phẩm rung | Công đức |
|---|---|---|---|
| incense | 12_thap_huong | — | 1 |
| bless | 23_hat_sang | — | 5 |
| lantern | 13_tha_hoa_dang (trôi lên) | — | 5 |
| woodfish | 16_go_mo | mõ `motion-tap` | 5 (+đếm) |
| bell | 15_thinh_chuong | chuông đung đưa | 3 |
| fortune | 17_xin_xam | ống xăm `motion-shake`; hộp quẻ 8 giây | 2 |
| lotus | 14_dang_hoa_sen | — | 10 |
| fruit | 18_dang_trai_cay | — | 15 |
| dragon (Đại Lễ) | 19_sen_no + 22_tia_sang + 23_hat_sang, flash vàng, banner 5 giây | — | 100 |
Nền lặp: 24_khoi_huong trên lư hương, 23_hat_sang quanh tượng.

## Luật sự kiện TikTok
Comment→incense (chứa "xin xăm"/"xin xam"→fortune); mỗi `likesPerBless` tim→bless; quà theo `giftMap`, nhân `repeatCount`; quà lạ: ≥100 kim cương→dragon, ≥10→lotus, còn lại→incense; quà streak (`giftType===1`) chỉ tính khi `repeatEnd`; member→phật tử + toast "vừa vào chùa".

## API & sự kiện
REST: `POST /api/connect | disconnect | trigger | simulate | audio | reset | config`, `GET /api/actions | config`. Socket.IO: `state` (merit, incense, woodfish, viewers, board, devotees, audio, connected, live), `ritual`, `join`, `toast`.
Kết nối lại: backoff 3s·2ⁿ tối đa 60s. Adapter nhận cả `WebcastPushConnection` (v1) và `TikTokLiveConnection` (v2).

## Âm thanh
Tạo bằng WebAudio (chuông, mõ, chuông gió, drone; ưu tiên file thật nếu được thêm trong assets/audio) vì bộ tài nguyên không kèm âm thanh; giọng đọc `speechSynthesis` `vi-VN`; bật/tắt riêng giọng và nhạc; 2 thanh âm lượng mặc định 89% / 86%, đồng bộ qua `state.audio`. Trình duyệt thường cần một cú bấm để mở khoá; OBS được tự thử mở khoá nhưng vẫn phụ thuộc chính sách autoplay.

## Tiêu chí xong
`npm start` sạch lỗi · overlay+control khớp ảnh mẫu · 9 nghi thức đều có animation+âm+giọng+điểm · giả lập chạy mượt với 40 phật tử · TikTok thật kích hoạt đúng (hoặc nêu rõ chưa thử được) · `node --test` xanh · README cập nhật.
