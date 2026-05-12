# 📊 Phân Tích Cấu Hình DBMS — Dự án DBMS-Listenary

> **Hệ thống**: MariaDB 10.4.32 trên XAMPP (Windows/Win64)  
> **Timezone**: Asia/Bangkok  
> **Nguồn dữ liệu**: `res_dbms/` — 11 file CSV xuất từ phpMyAdmin  

---

## 1. Bản đồ các file CSV

| File | Nội dung |
|------|----------|
| `res1.csv` | `SHOW VARIABLES` — trạng thái **trước** thay đổi (Snapshot A) |
| `res2.csv` | `SHOW VARIABLES` — sau khi xóa một số biến (thiếu `pseudo_*`, `identity`, `external_user`) |
| `res3.csv` | `SHOW VARIABLES` — trạng thái sau cùng (Snapshot B) |
| `res4.csv` | `max_connections = 151` |
| `res5.csv` | `innodb_buffer_pool_size = 16777216` (16 MB) |
| `res6.csv` | `sql_mode = NO_ZERO_IN_DATE, NO_ZERO_DATE, NO_ENGINE_SUBSTITUTION` |
| `res7.csv` | `SHOW STATUS` — lần đo thứ nhất (Uptime=155s) |
| `res8.csv` | `SHOW STATUS` — lần đo thứ hai (Uptime=155s, cùng session) |
| `res9.csv` | Character set — toàn bộ `utf8mb4` |
| `res10.csv` | Collation — `general_ci` (server/connection) vs `unicode_ci` (database) |
| `res11.csv` | Storage Engines — InnoDB là DEFAULT |

---

## 2. Phân Tích Cấu Hình Hiện Tại

### 2.1 🔴 Vấn đề nghiêm trọng: InnoDB Buffer Pool quá nhỏ

```
innodb_buffer_pool_size = 16,777,216  →  chỉ 16 MB  (!)
innodb_buffer_pool_instances = 1
innodb_buffer_pool_chunk_size = 16,777,216
```

**Chứng cớ từ SHOW STATUS:**
```
Innodb_buffer_pool_pages_total = 1,003
Innodb_buffer_pool_pages_data  = 422   (42% đang dùng)
Innodb_buffer_pool_pages_free  = 581   (58% còn trống)
Innodb_buffer_pool_reads       = 292   ← đọc từ disk
Innodb_buffer_pool_read_requests = 1,701
```

> **Buffer Pool Hit Rate** = 1 − (292/1701) ≈ **82.8%**  
> Ngưỡng tốt cần ≥ **99%**. Chỉ sau 155 giây uptime mà đã có 292 lần đọc disk — rất nghiêm trọng.

**Kết luận**: 16 MB là mặc định XAMPP dành cho máy yếu. Với một ứng dụng DBMS thực sự, cần ít nhất **256 MB ~ 512 MB** (phụ thuộc RAM máy).

---

### 2.2 🔴 InnoDB Log File Size quá nhỏ

```
innodb_log_file_size  = 5,242,880  →  5 MB
innodb_log_files_in_group = 2      →  Tổng redo log = 10 MB
innodb_log_buffer_size = 8,388,608 →  8 MB
```

**Chuẩn khuyến nghị**: `innodb_log_file_size` nên bằng **25% ~ 50%** của `innodb_buffer_pool_size`, và tối thiểu **64 MB** cho môi trường development.

**Rủi ro**: Log buffer flush quá thường xuyên → I/O tăng → giao dịch ghi bị bottleneck.

---

### 2.3 🟡 max_connections thấp nhưng chấp nhận được

```
max_connections = 151
Max_used_connections = 1  (thực tế chỉ có 1 kết nối)
Threads_connected = 1
```

Với dự án học thuật, 151 là đủ. Nếu mở rộng sang multi-user thì cần tăng.

---

### 2.4 🔴 Query Cache bị vô hiệu hóa nhưng vẫn cấp bộ nhớ

```
query_cache_type = OFF
query_cache_size = 1,048,576  →  1 MB (vẫn bị cấp phát!)
```

**Vấn đề**: `query_cache_size > 0` nhưng `query_cache_type = OFF` → lãng phí 1 MB RAM.  
**Bằng chứng**: `Qcache_hits = 0`, `Qcache_inserts = 0` — cache hoàn toàn không hoạt động.

Trong MariaDB 10.4+, Query Cache đã bị deprecated. Nên set về 0 để giải phóng RAM.

---

### 2.5 🟡 Performance Schema bị tắt

```
performance_schema = OFF
```

**Hệ quả**: Không thể dùng `EXPLAIN FORMAT=JSON`, không theo dõi được query chậm, không có metrics chi tiết.  
Với mục đích **học/demo DBMS**, nên bật để có thể demo monitoring.

---

### 2.6 🟡 Slow Query Log tắt

```
slow_query_log  = OFF
long_query_time = 10.000000   (10 giây — quá cao)
log_queries_not_using_indexes = OFF
```

**Hệ quả**: Không phát hiện được query không dùng index. Nếu muốn trình bày về tối ưu query, đây là công cụ quan trọng cần bật.

---

### 2.7 🟡 Collation không đồng nhất

```
collation_connection = utf8mb4_general_ci
collation_database   = utf8mb4_unicode_ci   ← khác!
collation_server     = utf8mb4_general_ci
```

**Rủi ro**: Khi JOIN hoặc so sánh string giữa các bảng có thể xảy ra **implicit conversion** → mất index, giảm hiệu năng.  
**Khuyến nghị**: Đồng bộ tất cả về `utf8mb4_unicode_ci` (chính xác hơn cho tiếng Việt).

---

### 2.8 🟡 Thread Pool cấu hình cho Windows (không phù hợp Linux)

```
thread_pool_mode = windows
thread_pool_size = 16
thread_handling  = pool-of-threads
```

Nếu XAMPP chạy trên Windows thì ok. Nếu migrate sang Linux production, cần đổi `thread_pool_mode = generic`.

---

### 2.9 🟢 Các điểm tốt

| Tham số | Giá trị | Nhận xét |
|---------|---------|----------|
| `innodb_file_per_table` | `ON` | ✅ Tốt — mỗi bảng một file riêng |
| `innodb_flush_log_at_trx_commit` | `1` | ✅ ACID-compliant |
| `innodb_deadlock_detect` | `ON` | ✅ Tự phát hiện deadlock |
| `innodb_stats_persistent` | `ON` | ✅ Optimizer có thống kê ổn định |
| `foreign_key_checks` | `ON` | ✅ Bảo toàn tham chiếu |
| `character_set_*` | `utf8mb4` | ✅ Hỗ trợ Unicode đầy đủ |
| `innodb_adaptive_hash_index` | `ON` | ✅ Tối ưu read-heavy workload |
| `tx_isolation` | `REPEATABLE-READ` | ✅ Mặc định InnoDB, phù hợp |

---

### 2.10 🔍 Quan sát từ SHOW STATUS (so sánh res7 vs res8)

| Metric | res7 | res8 | Nhận xét |
|--------|------|------|----------|
| `Created_tmp_tables` | 7 | 10 | +3 trong cùng 155s |
| `Created_tmp_disk_tables` | 0 | 0 | ✅ Chưa tràn disk |
| `Select_scan` | 7 | 10 | Full table scan tăng |
| `Handler_read_rnd_next` | 1,862 | 2,401 | Sequential scan tăng |
| `Table_open_cache_hits` | 0 | 1 | Cache miss cao |
| `Table_open_cache_misses` | 0 | 17 | 17 lần miss! |
| `Opened_tables` | 0 | 17 | Reload bảng nhiều lần |

> **Vấn đề**: `Table_open_cache_misses = 17` trong khi `table_open_cache = 2000` → Đây là bình thường với cold start, nhưng cần theo dõi.

---

## 3. Đề Xuất Phương Án Nâng Cấp

### 🚀 Phase 1: Tối ưu ngay (có thể SET trong phiên hoặc sửa my.ini)

```sql
-- Bật Slow Query Log để phát hiện query chậm
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;           -- Giảm ngưỡng xuống 1 giây
SET GLOBAL log_queries_not_using_indexes = ON;

-- Tắt Query Cache (không dùng nữa)
SET GLOBAL query_cache_size = 0;

-- Bật Performance Schema
-- (Cần restart để có hiệu lực)
```

---

### 🔧 Phase 2: Sửa my.ini / my.cnf (cần restart MariaDB)

```ini
[mysqld]

# ============================================================
# INNODB BUFFER POOL — Tăng lên 256MB (nếu RAM >= 4GB)
# ============================================================
innodb_buffer_pool_size         = 256M
innodb_buffer_pool_instances    = 2        ; 1 instance per 128MB
innodb_buffer_pool_chunk_size   = 128M

# ============================================================
# INNODB REDO LOG — Tăng log size
# ============================================================
innodb_log_file_size            = 64M      ; Tăng từ 5MB → 64MB
innodb_log_files_in_group       = 2        ; Tổng = 128MB
innodb_log_buffer_size          = 16M      ; Tăng từ 8MB → 16MB

# ============================================================
# SLOW QUERY LOG — Bật để giám sát
# ============================================================
slow_query_log                  = ON
slow_query_log_file             = mysql-slow.log
long_query_time                 = 1
log_queries_not_using_indexes   = ON

# ============================================================
# QUERY CACHE — Vô hiệu hóa hoàn toàn
# ============================================================
query_cache_type                = 0
query_cache_size                = 0

# ============================================================
# PERFORMANCE SCHEMA — Bật để demo monitoring
# ============================================================
performance_schema              = ON

# ============================================================
# COLLATION — Đồng bộ về unicode_ci
# ============================================================
collation_server                = utf8mb4_unicode_ci
collation_connection            = utf8mb4_unicode_ci

# ============================================================
# CONNECTION POOL — Điều chỉnh phù hợp với dev
# ============================================================
max_connections                 = 200      ; Tăng nhẹ cho demo
thread_cache_size               = 16

# ============================================================
# TEMP TABLE — Tăng giới hạn in-memory temp table
# ============================================================
tmp_table_size                  = 64M      ; Tăng từ 16MB
max_heap_table_size             = 64M      ; Phải bằng tmp_table_size

# ============================================================
# JOIN BUFFER — Tối ưu cho các JOIN phức tạp
# ============================================================
join_buffer_size                = 2M       ; Tăng từ 256KB

# ============================================================
# IO — Nếu dùng SSD, tắt flush neighbors
# ============================================================
innodb_flush_neighbors          = 0        ; SSD không cần
innodb_io_capacity              = 1000     ; Tăng từ 200 (SSD)
innodb_io_capacity_max          = 4000     ; Tăng từ 2000
```

---

### 📈 Phase 3: Nâng cấp kiến trúc (nâng cao)

```ini
# ============================================================
# INNODB I/O THREADS — Tận dụng đa luồng
# ============================================================
innodb_read_io_threads          = 8        ; Tăng từ 4
innodb_write_io_threads         = 8        ; Tăng từ 4
innodb_purge_threads            = 4        ; Giữ nguyên
innodb_page_cleaners            = 4        ; Tăng từ 1 (= buffer_pool_instances)

# ============================================================
# INNODB STATS — Tăng độ chính xác cho optimizer
# ============================================================
innodb_stats_persistent_sample_pages = 50  ; Tăng từ 20

# ============================================================
# TABLE CACHE
# ============================================================
table_definition_cache          = 1000     ; Tăng từ 400
table_open_cache                = 4000     ; Tăng từ 2000
```

---

## 4. Tổng Hợp Vấn Đề & Độ Ưu Tiên

| # | Vấn đề | Mức độ | Ưu tiên |
|---|--------|--------|---------|
| 1 | `innodb_buffer_pool_size` chỉ 16MB | 🔴 Nghiêm trọng | Cao nhất |
| 2 | `innodb_log_file_size` chỉ 5MB | 🔴 Nghiêm trọng | Cao |
| 3 | Query Cache bật size nhưng tắt type | 🔴 Lãng phí RAM | Cao |
| 4 | Collation không đồng nhất | 🟡 Tiềm ẩn | Trung bình |
| 5 | Slow Query Log tắt | 🟡 Không giám sát được | Trung bình |
| 6 | Performance Schema tắt | 🟡 Hạn chế debug | Trung bình |
| 7 | `tmp_table_size` chỉ 16MB | 🟡 Disk spill nếu query phức tạp | Trung bình |
| 8 | Thread pool mode = windows | 🟡 Nếu migrate Linux | Thấp |

---

## 5. SQL Demo — Kiểm Tra Sau Khi Tối Ưu

```sql
-- Kiểm tra buffer pool hit rate
SELECT
    (1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests) * 100 
    AS buffer_pool_hit_rate_pct
FROM (
    SELECT
        (SELECT VARIABLE_VALUE FROM information_schema.GLOBAL_STATUS WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') AS Innodb_buffer_pool_reads,
        (SELECT VARIABLE_VALUE FROM information_schema.GLOBAL_STATUS WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') AS Innodb_buffer_pool_read_requests
) t;

-- Kiểm tra slow queries
SHOW GLOBAL STATUS LIKE 'Slow_queries';

-- Kiểm tra temp tables tràn disk
SHOW GLOBAL STATUS LIKE 'Created_tmp_disk_tables';

-- Kiểm tra index usage
SHOW GLOBAL STATUS LIKE 'Select_full_join';
SHOW GLOBAL STATUS LIKE 'Select_scan';
```

---

## 6. Kết Luận

Cấu hình XAMPP mặc định được thiết kế cho **môi trường phát triển nhẹ** với RAM tối thiểu. Các thay đổi quan trọng nhất cần thực hiện:

1. **Tăng `innodb_buffer_pool_size` lên 256MB** — đây là thay đổi có tác động lớn nhất.
2. **Tăng `innodb_log_file_size` lên 64MB** — giảm I/O ghi log.
3. **Tắt hoàn toàn Query Cache** — giải phóng RAM, tránh cache invalidation overhead.
4. **Bật Slow Query Log** — phục vụ phân tích và báo cáo học thuật.
5. **Đồng nhất Collation** về `utf8mb4_unicode_ci` — tránh implicit conversion.

> **Lưu ý quan trọng**: Tất cả thay đổi `my.ini` yêu cầu **restart MariaDB** (không ảnh hưởng đến dữ liệu). Backup `my.ini` trước khi sửa.
