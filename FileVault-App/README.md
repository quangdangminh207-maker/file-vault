# 📁 FileVault - Kho Lưu Trữ Ảnh & Tập Tin Trực Tuyến

Ứng dụng web hiện đại giúp lưu trữ, quản lý, xem trước và chia sẻ hình ảnh, tài liệu và tập tin máy tính.

---

## 🌟 Các Tính Năng Nổi Bật

- 🚀 **Tải lên kéo & thả (Drag & Drop):** Hỗ trợ kéo thả nhiều file/ảnh cùng lúc, theo dõi thanh tiến trình.
- 🖼️ **Trình xem trước đa phương tiện (Media Viewer):**
  - Xem ảnh phóng to (Zoom In / Out), xoay ảnh (Rotate), lướt qua lại giữa các file.
  - Trình phát video, nghe nhạc trực tiếp.
  - Xem tài liệu PDF nhúng trực tiếp trên trình duyệt.
- 🏷️ **Tự động phân loại:**
  - Hình ảnh (JPG, PNG, WebP, GIF...)
  - Tài liệu (PDF, Word, Excel, Code...)
  - Video & Âm thanh (MP4, MP3, WAV...)
  - Tập tin nén (ZIP, RAR, 7Z...)
  - Mục yêu thích (Favorites ⭐)
- 🔍 **Tìm kiếm & Sắp xếp tức thì:** Tìm theo tên file, lọc theo dung lượng, thời gian tải lên.
- 📦 **Tải về hàng loạt dạng ZIP:** Chọn nhiều file và tải về thành 1 tập tin nén duy nhất.
- 💾 **Thống kê dung lượng:** Biểu đồ dung lượng đã sử dụng và phân bổ chi tiết theo định dạng.
- 🌓 **Chế độ Sáng / Tối (Dark / Light Mode):** Tự động lưu theo sở thích người dùng.

---

## 🚀 Hướng Dẫn Sử Dụng

### Cách 1: Chạy trực tiếp bằng tệp `start.bat`
Chỉ cần nhấp đúp vào file `start.bat` trong thư mục dự án, sau đó mở trình duyệt tại:
👉 **`http://localhost:5000`**

### Cách 2: Chạy bằng dòng lệnh (Terminal / PowerShell)

```bash
# Di chuyển vào thư mục dự án
cd "C:\Users\quang\.gemini\antigravity\scratch\file-vault\server"

# Khởi động máy chủ
npm start
```

Mở trình duyệt truy cập: **`http://localhost:5000`**

---

## 📂 Cấu Trúc Dự Án

```
file-vault/
├── client/             # Giao diện người dùng (React 18 + Vite + Tailwind CSS + Lucide)
│   ├── src/
│   │   ├── components/ # Navbar, Sidebar, FileGrid, FileList, MediaViewer, UploadModal...
│   │   └── App.jsx
│   └── dist/           # Bản build production tối ưu
├── server/             # Máy chủ backend (Node.js + Express + Multer)
│   ├── src/
│   │   ├── server.js   # REST API & static server
│   │   └── db.js       # Quản lý cơ sở dữ liệu metadata
│   ├── uploads/        # Thư mục lưu trữ các file tải lên thực tế
│   └── data.json       # Dữ liệu lưu trữ tập tin & metadata
├── start.bat           # Phím tắt khởi động nhanh cho Windows
└── README.md
```
