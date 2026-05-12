# DBMS-Listenary: Nền Tảng Thư Viện Sách Nói & Ebook Trực Tuyến

## 📖 Giới Thiệu Dự Án
DBMS-Listenary là một hệ thống quản lý thư viện sách nói và ebook chuyên nghiệp. Ứng dụng cung cấp cho người dùng một nền tảng đọc truyện, nghe sách nói cao cấp với các tính năng như thanh toán gói cước (Subscription), theo dõi lịch sử đọc/nghe, quản lý đánh giá, và phân quyền người dùng đa cấp (User, Author, Admin).

Dự án được xây dựng với mục tiêu tối ưu hóa hiệu năng cơ sở dữ liệu (Database Performance Optimization) ở mức cao nhất, đảm bảo tính ổn định, tốc độ truy vấn nhanh chóng và toàn vẹn dữ liệu cho hàng ngàn người dùng tương tác cùng lúc.

---

## 🚀 Các Tính Năng Nổi Bật

### 1. Phân Quyền Đa Cấp (Role-based Access Control)
- **Người dùng thường (User):** Đăng ký/đăng nhập, xem sách mới, sách thịnh hành, thêm vào mục yêu thích, bình luận đánh giá, theo dõi lịch sử nghe, và nâng cấp gói cước (Free/Basic/Premium).
- **Tác giả (Author):** Sở hữu trang hồ sơ riêng (Author Profile), có thể tải lên tác phẩm mới (Audio/Ebook) và theo dõi thống kê lượt xem/nghe.
- **Quản trị viên (Admin):** Bảng điều khiển riêng (Admin Dashboard), quản lý tài khoản người dùng (khóa/mở khóa), xét duyệt sách của tác giả (Approve/Reject/Pending), theo dõi thống kê toàn hệ thống.

### 2. Gói Cước & Thanh Toán (Subscriptions)
- Hệ thống hỗ trợ nhiều gói cước (Free, Basic, Premium).
- Tích hợp logic xử lý quyền lợi nội dung dựa trên gói cước hiện tại của người dùng. Tự động kiểm tra thời hạn gói cước.

### 3. Trình Phát Nhạc Tích Hợp (Audio Player & History)
- Trình phát sách nói liên tục, lưu vị trí nghe (Audio Timeline) trực tiếp vào database theo thời gian thực.
- Giao diện đọc PDF toàn màn hình mượt mà tích hợp qua `pdf.js`.

---

## 🛠 Kiến Trúc & Công Nghệ

- **Frontend:** Vanilla JavaScript, HTML5, CSS3, Vite Bundler, PDF.js.
- **Backend:** Node.js, Express.js (RESTful APIs).
- **Database:** MariaDB (10.4+) / MySQL với InnoDB Engine.

---

## 🗄 Cấu Trúc Cơ Sở Dữ Liệu Chuyên Sâu (Database Architecture)

Cơ sở dữ liệu của Listenary đã được chuẩn hóa (Normalization) và thiết kế để đạt hiệu năng tối đa:

### Chuẩn Hóa & Toàn Vẹn Dữ Liệu
- **13 Bảng Dữ Liệu** với `AUTO_INCREMENT` Primary Keys (trừ bảng gói cước).
- Hệ thống **17 Khóa Ngoại (Foreign Keys)** thiết lập `ON DELETE CASCADE` & `ON UPDATE CASCADE`, giúp ngăn chặn rác dữ liệu hoàn toàn.
- **Bỏ các cột dư thừa:** Loại bỏ quan hệ N-N lưu trữ sai cách, chuyển sang các bảng trung gian (`authorsofbooks`, `categoriesofbooks`).

### Triggers & Stored Procedures Đóng Gói Logic
Hệ thống sử dụng các thủ tục lưu trữ (SP) và Trigger để đảm bảo logic ACID và giảm tải cho backend:
- `sp_AddNewBook`, `sp_UpdateBookApproval`: Quản lý quy trình đăng sách và duyệt sách.
- `sp_UpsertListeningHistory`: Cập nhật tự động/thêm mới tiến độ nghe.
- `sp_UserSubscribe`: Xử lý giao dịch mua gói cước.
- Các **Triggers** tự động gán timestamps (`createdAt`, `updatedAt`), cập nhật `viewCount`, và dọn dẹp dữ liệu khi xóa User.

### Hệ Thống Views 
Sử dụng **Views** để tính toán sẵn (Pre-compute) các truy vấn phức tạp:
- `vw_BookDetails`: JOIN 6 bảng để lấy thông tin chi tiết sách, tác giả, nhà XB, rating.
- `vw_TrendingBooks`, `vw_NewestBooks`, `vw_AuthorStats`: Phục vụ các API thống kê nhanh trên Dashboard.

---

## ⚡ Tối Ưu Hóa Hiệu Năng (Performance Optimization)

Dự án đã trải qua quá trình phân tích và tối ưu hóa chuyên sâu (Refactoring & Tuning) cho MariaDB:

### 1. Chỉ Mục Ghép (Composite Indexes)
- `idx_books_status_hidden_viewcount` và `idx_books_status_hidden_created`: Giúp truy vấn danh sách Trending/Explore đạt tốc độ tức thời (tránh Table Scan).
- `idx_lab_user_listened`: Truy xuất lịch sử nghe cực nhanh.

### 2. Tinh Chỉnh Cấu Hình MariaDB (`my.ini`)
Để phá bỏ giới hạn của XAMPP mặc định, cấu hình server đã được đẩy lên mức Production:
- **`innodb_buffer_pool_size = 256M`**: Cấp phát lại RAM, giúp tăng Hit Rate lên >99%.
- **`innodb_log_file_size = 64M`**: Tránh nghẽn cổ chai I/O khi lưu trữ lịch sử nghe liên tục.
- **`innodb_flush_log_at_trx_commit = 2`**: Cân bằng hoàn hảo giữa hiệu năng ghi và độ an toàn ACID.
- **Tắt Query Cache (`query_cache_type = 0`)**: Tránh Invalidation Overhead vì dữ liệu (viewCount, timeline) thay đổi từng giây.
- **`tmp_table_size = 64M`**: Xử lý mượt mà các truy vấn JOIN phức tạp từ Views mà không bị tràn bộ nhớ tạm ra ổ cứng.

---

## 📂 Tổ Chức Thư Mục

- `/src`: Mã nguồn Frontend (Pages, Components, Services, Styles).
- `/server`: Mã nguồn Backend (API Routes, Controllers, Database Connection).
- `/public`: Các tài sản tĩnh (Hình ảnh, audio, file mẫu).
- `DBMS_Listenary_Final_Master.sql`: File cơ sở dữ liệu chính để import (Bao gồm cấu trúc và dữ liệu mẫu).

---

## 🚀 Hướng Dẫn Cài Đặt

1. **Khởi tạo Database:**
   - Cài đặt XAMPP hoặc MariaDB/MySQL Server.
   - Import file `DBMS_Listenary_Final_Master.sql` vào database.
   - *(Khuyến nghị)*: Tùy chỉnh file cấu hình `my.ini` theo các thông số tối ưu ở trên để có trải nghiệm tốt nhất.

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường (Backend):**
   - Đảm bảo cấu hình thông tin kết nối database trong phần backend phù hợp với máy của bạn (user: `root`, mật khẩu rỗng, port `3306`).

4. **Chạy ứng dụng:**
   - Mở 2 terminal.
   - Chạy Frontend (Vite):
     ```bash
     npm run dev
     ```
   - Chạy Backend (Node.js):
     ```bash
     node server/index.js
     ```

5. **Truy cập:**
   - Mở trình duyệt và truy cập vào đường dẫn: `http://localhost:5173`
   - Tài khoản Admin mặc định: `admin` / `admin123` (nếu có).

---
*Dự án là tâm huyết nhằm đem lại một nền tảng sách nói hiện đại, nhanh chóng và chuẩn mực về mặt thiết kế cơ sở dữ liệu.*
