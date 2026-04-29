-- ============================================================
-- fix_schema_fk.sql
-- Mục đích:
--   1. Xóa các cột dư thừa (books.authorId, books.categoryId,
--      user.subscriptionPlan) vì đã có bảng liên kết riêng
--   2. Chuẩn hóa kiểu dữ liệu cần thiết (createdAt/endDate → DATETIME)
--   3. Thêm toàn bộ FOREIGN KEY constraints
-- ============================================================

USE DBMS_Listenary;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- PHẦN 1: XÓA CỘT DƯ THỪA
-- ============================================================

-- 1a. books.authorId → đã có bảng authorsofbooks
ALTER TABLE books DROP COLUMN IF EXISTS authorId;

-- 1b. books.categoryId → đã có bảng categoriesofbooks
ALTER TABLE books DROP COLUMN IF EXISTS categoryId;

-- 1c. user.subscriptionPlan → đã có bảng usersubscriptions
ALTER TABLE user DROP COLUMN IF EXISTS subscriptionPlan;

-- ============================================================
-- PHẦN 2: CHUẨN HÓA KIỂU DỮ LIỆU (VARCHAR → DATETIME/INT)
-- Cần thiết để FK và so sánh ngày hoạt động đúng
-- ============================================================

-- books
ALTER TABLE books
    MODIFY COLUMN createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    MODIFY COLUMN releaseDate INT NULL;

-- audiochapter
ALTER TABLE audiochapter
    MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- comments
ALTER TABLE comments
    MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- listeningaudiobook
ALTER TABLE listeningaudiobook
    MODIFY COLUMN lastListenedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- user
ALTER TABLE user
    MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updatedAt DATETIME NULL;

-- usersubscriptions (endDate cần là DATETIME để so sánh >= NOW())
ALTER TABLE usersubscriptions
    MODIFY COLUMN startDate DATETIME NOT NULL,
    MODIFY COLUMN endDate   DATETIME NOT NULL;

-- ============================================================
-- PHẦN 3: THÊM INDEX (cần có trước khi tạo FK)
-- ============================================================

-- books
ALTER TABLE books
    ADD INDEX IF NOT EXISTS idx_books_publishinghouse (PublishingHouseId),
    ADD INDEX IF NOT EXISTS idx_books_submittedby     (submittedByUserId);

-- authorsofbooks
ALTER TABLE authorsofbooks
    ADD INDEX IF NOT EXISTS idx_aob_author (AuthorId),
    ADD INDEX IF NOT EXISTS idx_aob_book   (BookId);

-- categoriesofbooks
ALTER TABLE categoriesofbooks
    ADD INDEX IF NOT EXISTS idx_cob_category (CategoryId),
    ADD INDEX IF NOT EXISTS idx_cob_book     (BookId);

-- audiochapter
ALTER TABLE audiochapter
    ADD INDEX IF NOT EXISTS idx_ac_book (bookId);

-- comments
ALTER TABLE comments
    ADD INDEX IF NOT EXISTS idx_comments_user (userId),
    ADD INDEX IF NOT EXISTS idx_comments_book (bookId);

-- listeningaudiobook
ALTER TABLE listeningaudiobook
    ADD INDEX IF NOT EXISTS idx_lab_user    (userId),
    ADD INDEX IF NOT EXISTS idx_lab_book    (bookId),
    ADD INDEX IF NOT EXISTS idx_lab_chapter (audioChapterId);

-- userfavorites
ALTER TABLE userfavorites
    ADD INDEX IF NOT EXISTS idx_uf_user (userId),
    ADD INDEX IF NOT EXISTS idx_uf_book (bookId);

-- usersubscriptions
ALTER TABLE usersubscriptions
    ADD INDEX IF NOT EXISTS idx_us_user (userId),
    ADD INDEX IF NOT EXISTS idx_us_plan (planId);

-- user
ALTER TABLE user
    ADD INDEX IF NOT EXISTS idx_user_role   (roleId),
    ADD INDEX IF NOT EXISTS idx_user_author (authorId);

-- ============================================================
-- PHẦN 4: THÊM FOREIGN KEY CONSTRAINTS
-- ============================================================

-- ── user ──────────────────────────────────────────────────
ALTER TABLE user
    ADD CONSTRAINT fk_user_role
        FOREIGN KEY (roleId) REFERENCES role(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD CONSTRAINT fk_user_author
        FOREIGN KEY (authorId) REFERENCES author(id)
        ON UPDATE CASCADE ON DELETE SET NULL;

-- ── books ─────────────────────────────────────────────────
ALTER TABLE books
    ADD CONSTRAINT fk_books_publishinghouse
        FOREIGN KEY (PublishingHouseId) REFERENCES publishinghouse(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    ADD CONSTRAINT fk_books_submittedby
        FOREIGN KEY (submittedByUserId) REFERENCES user(id)
        ON UPDATE CASCADE ON DELETE SET NULL;

-- ── authorsofbooks (bảng liên kết N-N) ───────────────────
ALTER TABLE authorsofbooks
    ADD CONSTRAINT fk_aob_author
        FOREIGN KEY (AuthorId) REFERENCES author(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_aob_book
        FOREIGN KEY (BookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── categoriesofbooks (bảng liên kết N-N) ────────────────
ALTER TABLE categoriesofbooks
    ADD CONSTRAINT fk_cob_category
        FOREIGN KEY (CategoryId) REFERENCES category(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_cob_book
        FOREIGN KEY (BookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── audiochapter ──────────────────────────────────────────
ALTER TABLE audiochapter
    ADD CONSTRAINT fk_audiochapter_book
        FOREIGN KEY (bookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── comments ──────────────────────────────────────────────
ALTER TABLE comments
    ADD CONSTRAINT fk_comments_user
        FOREIGN KEY (userId) REFERENCES user(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_comments_book
        FOREIGN KEY (bookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── listeningaudiobook ────────────────────────────────────
ALTER TABLE listeningaudiobook
    ADD CONSTRAINT fk_lab_user
        FOREIGN KEY (userId) REFERENCES user(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_lab_book
        FOREIGN KEY (bookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_lab_chapter
        FOREIGN KEY (audioChapterId) REFERENCES audiochapter(id)
        ON UPDATE CASCADE ON DELETE SET NULL;

-- ── userfavorites ─────────────────────────────────────────
ALTER TABLE userfavorites
    ADD CONSTRAINT fk_uf_user
        FOREIGN KEY (userId) REFERENCES user(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_uf_book
        FOREIGN KEY (bookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── usersubscriptions ─────────────────────────────────────
ALTER TABLE usersubscriptions
    ADD CONSTRAINT fk_us_user
        FOREIGN KEY (userId) REFERENCES user(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_us_plan
        FOREIGN KEY (planId) REFERENCES subscriptionplans(id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFY: Kiểm tra kết quả
-- ============================================================

-- Danh sách tất cả FK đã tạo
SELECT
    TABLE_NAME                  AS `Table`,
    CONSTRAINT_NAME             AS `FK Name`,
    COLUMN_NAME                 AS `Column`,
    REFERENCED_TABLE_NAME       AS `References Table`,
    REFERENCED_COLUMN_NAME      AS `References Column`
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'DBMS_Listenary'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Kiểm tra books đã không còn authorId và categoryId
SELECT COLUMN_NAME FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'DBMS_Listenary' AND TABLE_NAME = 'books'
ORDER BY ORDINAL_POSITION;

SELECT 'fix_schema_fk.sql hoàn tất!' AS status;
