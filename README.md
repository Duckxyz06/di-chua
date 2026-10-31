# Chùa Online — TikTok LIVE & RPC

Nâng cấp trực tiếp bản Node + Express + Socket.IO có sẵn, frontend thuần, không build.
Tài nguyên WebP và sprite được giữ nguyên từ bộ do người dùng cung cấp. Ảnh trong
`reference/` chỉ dùng đối chiếu, không được tải vào giao diện.

## Chạy trong VS Code và dùng Codex

```bash
git clone https://github.com/Duckxyz06/di-chua.git
cd di-chua
code .
npm ci
npm test
npm start
```

Node 18+; dùng `npm ci` để cài đúng lockfile. Trong VS Code:
- F5: cấu hình **Chùa Online: chạy và debug**.
- Terminal → Run Task: cài đặt / chạy / kiểm thử. Không chạy F5 cùng lúc với `npm start` trên cùng cổng.
- Dừng bằng Ctrl+C trong terminal hoặc Shift+F5 khi debug.
- Mở Codex trong VS Code, chọn thư mục này; yêu cầu đọc `AGENTS.md`, `docs/spec.md`, `docs/asset-map.md` trước khi sửa.
- Ví dụ giao việc: “Giữ nguyên config.json; chỉnh LAYOUT theo ảnh reference, kiểm tra hai kích thước overlay và chạy npm test trước khi commit”.

Trang điều khiển: http://localhost:3000/control.html

Overlay: http://localhost:3000/overlay.html — mở khoá âm thanh bằng một cú bấm.

Admin: http://localhost:3000/admin.html — sửa JSON, lưu áp dụng ngay; cấu hình sai bị từ chối.

Server mặc định chỉ nghe `127.0.0.1`. Không đưa admin/API ra Internet khi chưa có xác thực.
GitHub lưu mã nguồn; **GitHub Pages không chạy được Node/Socket.IO hay TikTok connector**.

## OBS và âm thanh

Tạo Browser Source, URL `http://localhost:3000/overlay.html?clean=1`, width **1080**, height **1920**.
Giữ server chạy. `clean=1` ẩn nút mở khoá, tự thử resume AudioContext; chính sách autoplay
của môi trường OBS vẫn có thể yêu cầu tương tác. Không đảm bảo mọi máy tự phát được.

Bảng điều khiển có WebAudio và giọng `speechSynthesis` vi-VN riêng, được mở khoá tại nút âm thanh.
Iframe xem trước luôn `?clean=1&mute=1` và không phát tiếng. Khi đưa âm thanh overlay vào OBS,
tránh capture thêm âm thanh bảng điều khiển để không bị nhân đôi. Có thể mở overlay `?mute=1`
và chỉ capture âm thanh điều khiển nếu trình duyệt OBS không có giọng Việt.

Mặc định nhạc 89%, giọng 86%; trạng thái và âm lượng đồng bộ server. Giọng Việt phụ thuộc
voice đã cài trên hệ điều hành. Bộ ảnh không kèm âm thanh; mặc định chuông, mõ, chuông gió,
drone dùng WebAudio. Có thể thêm `public/assets/audio/<action>.mp3` (hoặc ogg/wav), ví dụ
`bell.mp3`, `woodfish.mp3`, `background.mp3`. File thật được ưu tiên; mở lại trang sau khi thêm.

## Điều khiển và TikTok

Có đủ 9 nghi thức: hương, cầu phúc, hoa đăng, mõ, chuông, xin xăm, hoa sen, mâm quả, Kim Long.
Nhập tên và lời nguyện rồi bấm nút. Xin xăm hiển thị 8 giây; nội dung mang tính mô phỏng/văn hoá,
không phải lời bảo đảm kết quả. Không dùng công đức hay quà để hứa hẹn tài lộc.

Nhập tài khoản TikTok **đang LIVE**, bấm Kết Nối. Khi lỗi/phòng chưa LIVE: báo trạng thái và
thử lại 3, 6, 12… tối đa 60 giây. Ngắt kết nối hủy retry. Chuyển phòng loại sự kiện kết nối cũ.
Giả lập chỉ kiểm thử cục bộ, có nhãn TEST; không tạo người xem TikTok và bị chặn khi kết nối LIVE.

Luật giữ nguyên `config.json`: comment 1; “xin xăm”/“xin xam” 2; mỗi 5 tim cộng 5 (giữ tim dư);
quà theo giftMap nhân repeatCount; streak chỉ chốt repeatEnd=true; quà lạ xét kim cương từng quà
(≥100 Kim Long, ≥10 hoa sen, còn lại hương), sau đó nhân số lượng.

Connector ghim **2.0.0** để giữ Node 18; README trong chính gói đã được đối chiếu cho chat/like/gift/member,
roomUser, ControlEvent và repeatEnd. Bản 2.5.0 yêu cầu Node 20 nên không giữ lại.
Override `@openapitools/openapi-generator-cli` 2.15.0 ngăn phụ thuộc SDK tự nâng lên bản yêu cầu Node 22;
không có bước sinh mã/build nào trong dự án. Không thêm framework hay dependency trực tiếp mới.
Connector không chính thức; có phụ thuộc deprecated và dịch vụ ký bên ngoài, có thể lỗi khi TikTok thay đổi.

## Đổi quà và bố cục

`config.json → giftMap`: tên quà chính xác → key trong actions (`Rose: incense`, `Lion: dragon`).
Sửa qua Admin hoặc sửa file rồi khởi động lại. Không đổi điểm nếu chưa chủ ý.

`public/js/overlay.js`:
- LAYOUT: `[tên ảnh, x giữa, y đáy, chiều rộng, id]`, hệ logic 540×960.
- POS: chuông, mõ, ống xăm, lư hương; nhãn/hiệu ứng dùng cùng mốc.
- FRONT/SIDE/SLOTS: hàng đầu 7 người xếp theo điểm; tổng tối đa 40 người gần đây.
- CSS trong `public/css/overlay.css`, `control.css`, `motion.css`.

Tên, điểm, trạng thái là HTML trên khung rỗng. Không dùng animation chứa chữ in sẵn.
Nhân vật 2D, 8 khung đi bộ và cúi lễ; không rig 3D. Kim Long dùng sen, tia sáng, hạt sáng và banner.
Chưa có rồng/cá chép: đường dẫn dự kiến cho tài nguyên bổ sung là
`public/assets/decor/rong_kim_long.webp`; chưa có renderer rồng khi chưa có tài nguyên.

## Kiểm thử và giới hạn đã xác minh

`npm test` chạy luật điểm và integration server: 9 RPC, Socket.IO state trước ritual, cộng điểm,
bảng xếp hạng, tối đa 40, giả lập, âm lượng, input không hợp lệ và URL tài nguyên.
Xem `docs/verification.md` cho kết quả và checklist kiểm tra bằng trình duyệt.

State công đức lưu trong RAM, khởi động lại sẽ mất. Người trùng nickname hiện được gộp điểm.
Top 5 là toàn phiên; hàng đầu xếp theo điểm trong 40 người đang hiển thị.
Chưa có đo FPS thực tế ở 40 người, ảnh chụp so sánh, nghe âm thanh hoặc kiểm thử phòng LIVE thật.
