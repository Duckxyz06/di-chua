# Báo cáo kiểm thử

## Đã chạy
- npm install sạch; npm start khởi động server thành công.
- 6/6 nhóm test đạt trên Node 18 và Node 24; import connector bằng Node 18 thành công.
- node --test: luật comment, xin xăm, tim dư, giftMap, kim cương, streak.
- Integration: kích hoạt đủ 9 API RPC, nhận Socket.IO, xác minh state trước ritual, tổng điểm/top.
- 45 người thử nghiệm: giới hạn 40, loại người cũ; bật/tắt giả lập và điểm tăng.
- Kiểm tra clamp âm lượng, từ chối cấu hình sai và username trống, các trang/FX trả HTTP 200.
- Kiểm tra cú pháp JS.

## Chưa xác minh trực quan hoặc trên LIVE
Trình duyệt Edge kết nối và trình duyệt đám mây đều báo ERR_CONNECTION_REFUSED khi mở
server trong workspace; không dùng ảnh ghép để giả làm ảnh chụp giao diện.
Do đó chưa đạt tiêu chí ảnh so sánh, bấm 9 nút bằng UI, kiểm tra console trình duyệt,
nghe âm thanh, đo độ mượt 40 người, hoặc xác nhận khớp ảnh mẫu bằng mắt.
Chưa có tài khoản LIVE thử nghiệm được cung cấp. Không kết nối tài khoản trong ảnh mẫu.

## Checklist trên VS Code/OBS
1. npm ci; npm test; F5. Mở control.html, kiểm tra không có lỗi console/mạng.
2. Mở overlay ở 540×960 và 1080×1920, chụp cùng reference/mau_giao_dien.jpg.
3. Bấm đủ 9 nút: hiệu ứng, tiếng, giọng, điểm/top; xin xăm 8 giây, banner 5 giây.
4. Bật giả lập đến 40 người; kiểm tra đi bộ/quỳ/cúi lễ và FPS. Tắt giả lập trước LIVE.
5. Mở hai control: âm lượng/trạng thái đồng bộ. Preview luôn mute.
6. Kết nối tài khoản của bạn đang LIVE; thử comment, 5 tim, streak rồi ngắt kết nối.
7. Chỉnh LAYOUT/POS/SLOTS nếu cần; không đổi luật điểm hay dùng chữ in sẵn cho số động.
