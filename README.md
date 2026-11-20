# 🕶️ Website Bán Mắt Kính Trực Tuyến & Kính Thông Minh (Smart Glasses E-Commerce)

> **Dự án Thương mại Điện tử Ngành Mắt Kính & Thiết bị Đeo Thông minh**
> 
> *Được phát triển bởi Đội nhóm 5 Sinh viên Năm 1 với sự hỗ trợ của Hệ sinh thái AI (GitHub Copilot, DeepSeek, ChatGPT, Gemini 3.5 Flash Lite & Gemini 3.6 Vision).*

---

## 📋 Giới Thiệu Dự Án

Hệ thống website thương mại điện tử bán mắt kính trực tuyến kết hợp giữa **tính năng bán hàng thương mại điện tử cốt lõi**, **phân hệ quản trị Admin PIM/ERP** và các **tính năng đặc thù y khoa nhãn khoa** (nhập độ cận SPH/CYL/AXIS/PD, thử kính ảo VTO AR, đọc ảnh đơn kính bằng AI OCR, đặt lịch đo mắt O2O).

---

## 🛠️ Công Nghệ & Trợ Lý AI Sử Dụng

| Hạng Mục | Công Nghệ / Công Cụ AI | Vai Trò & Ứng Dụng Trong Dự Án |
| :--- | :--- | :--- |
| **Front-End / Back-End** | Next.js / WooCommerce / Node.js | Mã nguồn tự xây Custom Code full-stack TMĐT, quản lý CSDL y tế |
| **Database** | MySQL / PostgreSQL | Lưu trữ CSDL sản phẩm, độ cận y khoa, đơn hàng & lịch hẹn đo mắt |
| **Trợ lý Code IDE** | **GitHub Copilot** | Trợ lý sinh mã nguồn thời gian thực trực tiếp trong VS Code |
| **Tối ưu Thuật toán** | **DeepSeek (V3/R1)** | Tối ưu thuật toán SQL CSDL và logic tính giá tròng kính cận |
| **Biên tập Content & UI** | **ChatGPT (GPT-4o)** | Thiết kế Wireframe UI/UX & biên tập bài viết tư vấn sức khỏe mắt |
| **Chatbot AI 24/7** | **Gemini 3.5 Flash Lite** | Live Chat Widget tự động tư vấn kiểu gọng kính & giá tròng 24/7 |
| **Quét Đơn Kính OCR** | **Gemini 3.6 Vision API** | Đọc tự động ảnh chụp toa kính bác sĩ và trích xuất độ cận OD/OS |
| **Thử Kính AR (VTO)** | WebAR / MediaPipe Face Mesh | Mô phỏng ướm thử gọng kính 3D trên mặt qua camera theo thời gian thực |

---

## 👥 Đội Nhóm Thực Hiện & Phân Công Nhiệm Vụ

- 👨‍💻 **SV 1 (Lead Back-End & DB):** Thiết kế CSDL SQL, dựng Admin Dashboard (PIM Sản phẩm, Đơn hàng, Lịch hẹn đo mắt, Phân quyền Admin).
- 🎨 **SV 2 (Lead Front-End & UI):** Dựng giao diện trang chủ, Mega-menu danh mục, trang chi tiết PDP, Giỏ hàng, Cổng thanh toán & Responsive.
- 🔬 **SV 3 (Dev Y Khoa & AI Vision):** Phát triển Bộ lọc cá nhân hóa (dáng mặt/tròng kính), Form điền toa kính y khoa & nhúng Gemini Vision OCR.
- 👓 **SV 4 (Dev Smart Glass & VTO):** Module Kính thông minh (Audio/AR/AI), So sánh thông số đối đầu, Form đặt lịch đo mắt O2O & WebAR VTO.
- 📝 **SV 5 (Tester, Content & Chatbot):** Nhập 30 dữ liệu sản phẩm PIM, viết bài blog tư vấn, nhúng Gemini Chatbot 24/7 & kiểm thử hệ thống (QA).

---

## 📅 Lộ Trình Triển Khai 4 Tuần (4-Week Roadmap)

### 🔹 Tuần 1: Thiết Kế CSDL & Dựng Khung Giao Diện (Wireframes)
- **SV1:** Thiết kế Database Schema (Products, EyewearAttributes, Orders, Appointments, Users).
- **SV2:** Dựng Wireframe Mega-menu, Trang chủ, Trang danh mục & PDP.
- **SV3:** Chuẩn hóa bảng thuộc tính độ cận y khoa (SPH, CYL, AXIS, PD).
- **SV4:** Tổng hợp thông số kỹ thuật Kính thông minh (Mijia, Rokid, Xreal) & Form đặt lịch.
- **SV5:** Biên tập 20 bài mô tả mẫu sản phẩm & thiết lập VS Code + GitHub Copilot.

### 🔹 Tuần 2: Phát Triển Nền Tảng TMĐT Cốt Lõi (Core E-Commerce)
- **SV1:** Dựng Admin Back-End Quản lý Sản phẩm PIM & Quản lý Đơn hàng.
- **SV2:** Dựng thanh tìm kiếm thông minh, Mega-menu & trang PDP slide zoom đa góc.
- **SV3:** Lập trình Giỏ hàng & trang Checkout (COD, QR Bank, Momo/VNPAY).
- **SV4:** Đăng ký/Đăng nhập tài khoản, Tra cứu đơn hàng Order Tracking & Admin Lịch hẹn.
- **SV5:** Nhập 30 sản phẩm thật, dựng module Đánh giá 5 sao & Danh sách yêu thích (Wishlist).

### 🔹 Tuần 3: Chức Năng Đặc Thù Ngành Mắt Kính & Tích Hợp AI
- **SV1:** Phân hệ Admin Quản lý Phân quyền & Đồng bộ Lịch sử toa kính cá nhân.
- **SV2:** Lập trình Bộ lọc cá nhân hóa (Lọc dáng mặt, lọc tính năng tròng Bluecut/UV/Transitions).
- **SV3:** Lập trình Form nhập toa kính y khoa & nhúng API Gemini 3.6 Vision đọc ảnh toa kính.
- **SV4:** Dựng danh mục Kính thông minh & Bảng so sánh thông số đối đầu (Side-by-Side).
- **SV5:** Nhúng Gemini 3.5 Flash Lite API làm Chatbot tư vấn gọng/tròng 24/7.

### 🔹 Tuần 4: Thử Kính Ảo VTO AR, QA, Security & Đóng Gói
- **SV4 & SV2:** Tích hợp WebAR VTO thử kính 3D qua camera theo thời gian thực.
- **SV3:** Trang Store Locator định vị showroom & Chính sách bảo mật y tế HIPAA.
- **SV1 & SV5:** Kiểm thử 8 luồng đặt hàng, mã hóa HTTPS SSL/TLS & tối ưu SQL với DeepSeek.
- **Cả nhóm:** Đóng gói mã nguồn Git, hoàn thiện README.md, xuất báo cáo & slide thuyết trình.

---

## ⚡ Ứng Dụng AI Nổi Bật Trong Hệ Thống

1. **Gemini 3.6 Vision OCR (Đọc Toa Kính Bác Sĩ):**
   - Khách hàng chụp ảnh giấy đo mắt -> Tải lên hệ thống -> Gemini Vision tự động nhận diện và trích xuất chỉ số SPH, CYL, AXIS, PD điền trực tiếp vào form đặt cắt tròng.
2. **Gemini 3.5 Flash Lite Chatbot 24/7:**
   - Tự động tư vấn mẫu gọng kính phù hợp với từng dáng mặt (tròn, vuông, trái xoan).
   - Giải đáp thắc mắc về tính năng tròng kính (chống ánh sáng xanh, đổi màu, tròng siêu mỏng) với tốc độ phản hồi ngắn.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Installation)

### 1. Tải Mã Nguồn (Clone Repository)
```bash
git clone <URL_REPOSITORY_CUA_NHOM>
cd eyewear-ecommerce
```

### 2. Cấu Hình Biến Môi Trường
Tạo file môi trường cục bộ tại thư mục gốc và thêm các cấu hình cần thiết:
- URL kết nối Cơ sở dữ liệu
- Khóa API cho các dịch vụ AI (Gemini / ChatGPT)

### 3. Cài Đặt Dependencies & Khởi Chạy
```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy ứng dụng ở chế độ Development
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 📄 Giấy Phép & Tài Liệu Tham Khảo (License & References)
- **Tài liệu tham khảo dự án:** Trích xuất từ 11 nguồn tài liệu khảo sát (Mắt Kính Shady, CellphoneS, Persol, Tâm Đức, Gemini AI App, Google Sites vs Claude Code).
- **Giấy phép:** Được phát triển cho mục đích học tập và báo cáo đồ án Thương mại Điện tử.
