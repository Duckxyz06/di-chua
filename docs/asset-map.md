# Bản đồ tài nguyên (sau `prepare_assets.py`, tên đã bỏ số thứ tự)

## `assets/decor/` — dùng cho cảnh overlay
tuong_phat · hao_quang · dai_sen · ban_tho · binh_hoa_sen · den_long_treo · den_tho_chan_cao · lu_huong (đã kèm 3 nén hương + khói) · nen_huong (rời) · nen_dien_tho (nền kín, không tượng/người) · tham_do · nguoi_quy (ảnh tĩnh, sprite dùng thay) · chuong_chua · mo_go · ong_xin_xam · den_hoa_dang · mam_trai_cay.

## `assets/ui/` — dùng thế nào
| Nhóm | Ảnh | Cách dùng |
|---|---|---|
| Khung rỗng (gắn chữ HTML) | nhan_ten_trong, o_nhap_trong, the_vat_pham_trong, khung_xep_hang_trong, khung_dien_tho_trong, bang_dieu_khien, khung_am_thanh, khung_ket_noi, khung_nghi_le | `background:url() center/100% 100%` |
| Nút rỗng | nut_trong_gold / green / red | nhãn HTML; green=BẬT, red=TẮT, gold=Đại Lễ |
| **Nút có chữ in sẵn (nhãn tĩnh)** | nut_ket_noi, nut_mo_admin, nut_bat_am_thanh, nut_thap_3_nen_huong, nut_tha_den_hoa_dang, nut_go_mo, nut_thinh_chuong, nut_xin_xam, nut_dang_hoa_sen | `<button><img></button>` |
| Chữ in sẵn, **chỉ tham chiếu** | nut_giong_doc_bat, nut_nhac_nen_bat, nut_gia_lap_nguoi_xem, nut_dai_le ("Đại Lễ Kính Lạy Chư Phật" ≠ ảnh mẫu), the_dang_huong, the_cau_phuc, the_hoa_sen, thanh_am_luong_*, o_tai_khoan, o_ten_nguoi_cau, o_loi_cau, bo_dem, huy_hieu_live, nhan_ten_mau, thanh_cong_duc, bang_tam_long_thanh, tieu_de_* | thay bằng khung rỗng + HTML (vì có trạng thái/giá trị động) |

## `assets/fx/` (animation WebP, 2,4 giây, nền trong suốt)
Đang chép: 12_thap_huong, 13_tha_hoa_dang, 14_dang_hoa_sen, 15_thinh_chuong, 16_go_mo, 17_xin_xam, 18_dang_trai_cay, 19_sen_no, 22_tia_sang, 23_hat_sang, 24_khoi_huong (thêm `--all-fx` để lấy đủ 24).
**Không dùng:** 05–08 (chữ in sẵn), 09–11 (nút "THẤP HƯƠNG" in sẵn), 20–21 (4 MB mỗi file; dùng `hao_quang` + `motion-halo`/`motion-breathe`), 01–04 (dùng sprite).

## `assets/sprites/`
`walk_strip.webp`, `bow_strip.webp`: 8 khung 256×256 xếp ngang; hiển thị bằng `background-size:800% 100%` và `background-position: (n·100/7)% 0`. Khung `bow` số 2 = quỳ chờ.

## Chưa có trong bộ
Rồng Kim Long, cá chép, nến, file âm thanh, nhân vật nhiều kiểu áo.
