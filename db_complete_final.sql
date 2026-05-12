-- ================================================================
-- DBMS_Listenary — DATABASE HOÀN CHỈNH (v_final)
-- Bao gồm: fix_db + fix_autoincrement + Views + SPs + Triggers + FK
-- Chạy trực tiếp trên MySQL Workbench (schema: DBMS_Listenary)
-- ================================================================

-- ============================================================
-- MIGRATION TỔNG HỢP - DBMS_Listenary
-- Chạy file này để cập nhật database lên phiên bản mới nhất
-- Thứ tự: fix_db.sql → fix_autoincrement.sql → plan_sql.sql (Views/SPs/Triggers) → fix_comment_proc.sql
-- ============================================================

USE DBMS_Listenary;

-- Tắt safe mode và FK checks toàn cục cho toàn bộ script
SET SQL_SAFE_UPDATES  = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- BƯỚC 1: fix_db.sql — Sửa user id=0, set AUTO_INCREMENT
-- ============================================================

UPDATE userfavorites SET userId=11 WHERE userId=0;
UPDATE listeningaudiobook SET userId=11 WHERE userId=0;
UPDATE comments SET userId=11 WHERE userId=0;
UPDATE usersubscriptions SET userId=11 WHERE userId=0;
UPDATE `user` SET id=11 WHERE id=0;

ALTER TABLE `user` MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `user` AUTO_INCREMENT = 12;

-- ============================================================
-- BƯỚC 2: fix_autoincrement.sql — AUTO_INCREMENT toàn bộ bảng
-- ============================================================

ALTER TABLE audiochapter MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE author MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE books MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE category MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix comments duplicates
DELETE c1 FROM comments c1 INNER JOIN comments c2
  WHERE c1.id = c2.id AND c1.createdAt < c2.createdAt;
ALTER TABLE comments MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix listeningaudiobook id=0
SET @rownum = 100;
UPDATE listeningaudiobook SET id = (@rownum := @rownum + 1) WHERE id = 0;
ALTER TABLE listeningaudiobook MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

ALTER TABLE publishinghouse MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE role MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix userfavorites id=0
SET @rownum2 = 100;
UPDATE userfavorites SET id = (@rownum2 := @rownum2 + 1) WHERE id = 0;
ALTER TABLE userfavorites MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

ALTER TABLE usersubscriptions MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE usersubscriptions AUTO_INCREMENT = 1;

-- ============================================================
-- BƯỚC 3: VIEWS (plan_sql.sql PHASE 1A + 1D)
-- ============================================================

CREATE OR REPLACE VIEW vw_BookDetails AS
SELECT
    b.id AS bookId, b.name AS bookName, b.description, b.thumbnailUrl,
    b.country, b.language, b.pageNumber, b.releaseDate,
    b.ebookFileUrl, b.audioFileUrl, b.copyrightFileUrl,
    b.viewCount, b.weeklyViewCount, b.approvalStatus, b.isHidden,
    b.submittedByUserId, b.createdAt AS bookCreatedAt, b.updatedAt AS bookUpdatedAt,
    a.id AS authorId,
    a.firstName AS authorFirstName, a.lastName AS authorLastName,
    CONCAT(a.firstName, ' ', a.lastName) AS authorFullName,
    a.imagineUrl AS authorImageUrl,
    c.id AS categoryId, c.name AS categoryName,
    ph.id AS publishingHouseId, ph.name AS publishingHouseName,
    ROUND(AVG(cm.rating), 1) AS avgRating,
    COUNT(DISTINCT cm.id) AS totalReviews
FROM books b
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
LEFT JOIN publishinghouse ph ON ph.id = b.PublishingHouseId
LEFT JOIN comments cm        ON cm.bookId = b.id
GROUP BY
    b.id, b.name, b.description, b.thumbnailUrl, b.country,
    b.language, b.pageNumber, b.releaseDate, b.ebookFileUrl,
    b.audioFileUrl, b.copyrightFileUrl, b.viewCount,
    b.weeklyViewCount, b.approvalStatus, b.isHidden,
    b.submittedByUserId, b.createdAt, b.updatedAt,
    a.id, a.firstName, a.lastName, a.imagineUrl,
    c.id, c.name, ph.id, ph.name;

CREATE OR REPLACE VIEW vw_AuthorStats AS
SELECT
    a.id AS authorId, a.firstName, a.lastName,
    CONCAT(a.firstName, ' ', a.lastName) AS fullName,
    a.imagineUrl, a.birthday, a.description AS authorBio,
    COUNT(DISTINCT b.id) AS totalBooks,
    COALESCE(SUM(b.viewCount), 0) AS totalViews,
    COALESCE(ROUND(AVG(b.viewCount), 0), 0) AS avgViewsPerBook,
    ROUND(AVG(cm.rating), 1) AS avgRating,
    COUNT(DISTINCT cm.id) AS totalReviews
FROM author a
LEFT JOIN authorsofbooks aob ON aob.AuthorId = a.id
LEFT JOIN books b            ON b.id = aob.BookId
                             AND b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
LEFT JOIN comments cm        ON cm.bookId = b.id
GROUP BY a.id, a.firstName, a.lastName, a.imagineUrl, a.birthday, a.description;

CREATE OR REPLACE VIEW vw_UserProfile AS
SELECT
    u.id AS userId, u.username, u.firstName, u.lastName,
    CONCAT(u.firstName, ' ', u.lastName) AS fullName,
    u.email, u.emailVerifiedAt, u.phoneNumber, u.addresses, u.birthday,
    u.thumbnailUrl, u.hasLocked, u.loginFailedAttempts,
    u.createdAt AS userCreatedAt, u.roleId, r.name AS roleName,
    us.planId AS currentPlanId, sp.name AS currentPlanName,
    sp.price AS planPrice, us.startDate AS subStartDate, us.endDate AS subEndDate,
    u.authorId, a.firstName AS authorFirstName, a.lastName AS authorLastName
FROM `user` u
JOIN role r ON r.id = u.roleId
LEFT JOIN usersubscriptions us ON us.userId = u.id AND us.endDate >= NOW()
LEFT JOIN subscriptionplans sp ON sp.id = us.planId
LEFT JOIN author a              ON a.id = u.authorId;

CREATE OR REPLACE VIEW vw_NewestBooks AS
SELECT
    b.id AS bookId, b.name AS bookName, b.thumbnailUrl, b.releaseDate,
    b.viewCount, b.createdAt, b.approvalStatus, b.isHidden,
    a.id AS authorId,
    CONCAT(a.firstName, ' ', a.lastName) AS authorFullName,
    c.name AS categoryName
FROM books b
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
WHERE b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
  AND b.thumbnailUrl IS NOT NULL AND b.thumbnailUrl != ''
ORDER BY b.createdAt DESC, COALESCE(b.releaseDate, 0) DESC;

CREATE OR REPLACE VIEW vw_TrendingBooks AS
SELECT
    b.id AS bookId, b.name AS bookName, b.thumbnailUrl, b.description,
    b.viewCount, b.weeklyViewCount, b.releaseDate, b.country, b.approvalStatus,
    a.id AS authorId,
    CONCAT(a.firstName, ' ', a.lastName) AS authorFullName,
    a.imagineUrl AS authorImageUrl,
    c.name AS categoryName,
    ROUND(AVG(cm.rating), 1) AS avgRating,
    COUNT(DISTINCT cm.id) AS totalReviews
FROM books b
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
LEFT JOIN comments cm        ON cm.bookId = b.id
WHERE b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
GROUP BY
    b.id, b.name, b.thumbnailUrl, b.description, b.viewCount,
    b.weeklyViewCount, b.releaseDate, b.country, b.approvalStatus,
    a.id, a.firstName, a.lastName, a.imagineUrl, c.name
ORDER BY b.viewCount DESC;

CREATE OR REPLACE VIEW vw_PendingBooks AS
SELECT
    b.id AS bookId, b.name AS bookName, b.thumbnailUrl, b.description,
    b.copyrightFileUrl, b.approvalStatus, b.createdAt AS submittedAt,
    b.submittedByUserId,
    CONCAT(u.firstName, ' ', u.lastName) AS submittedByName,
    u.username AS submittedByUsername,
    a.id AS authorId,
    CONCAT(a.firstName, ' ', a.lastName) AS authorFullName,
    c.name AS categoryName
FROM books b
LEFT JOIN `user` u             ON u.id = b.submittedByUserId
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
WHERE b.approvalStatus = 'PENDING'
ORDER BY b.createdAt DESC;

CREATE OR REPLACE VIEW vw_ListeningHistory AS
SELECT
    lab.id AS historyId, lab.userId, lab.bookId, lab.audioChapterId,
    lab.audioTimeline, lab.isFinished, lab.lastListenedAt,
    b.name AS bookName, b.thumbnailUrl AS bookThumbnail,
    CONCAT(a.firstName, ' ', a.lastName) AS authorFullName,
    ac.chapterNumber, ac.name AS chapterName, ac.duration
FROM listeningaudiobook lab
JOIN books b        ON b.id = lab.bookId
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN audiochapter ac    ON ac.id = lab.audioChapterId
ORDER BY lab.lastListenedAt DESC;

CREATE OR REPLACE VIEW vw_UserFavoriteBooks AS
SELECT
    uf.userId, uf.bookId, b.name AS bookName, b.thumbnailUrl,
    b.viewCount, b.approvalStatus,
    a.id AS authorId,
    CONCAT(a.firstName, ' ', a.lastName) AS authorFullName,
    ROUND(AVG(cm.rating), 1) AS avgRating
FROM userfavorites uf
JOIN books b                 ON b.id = uf.bookId
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN comments cm        ON cm.bookId = b.id
WHERE b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
GROUP BY
    uf.userId, uf.bookId,
    b.id, b.name, b.thumbnailUrl, b.viewCount, b.approvalStatus,
    a.id, a.firstName, a.lastName;

CREATE OR REPLACE VIEW vw_PlatformDashboard AS
SELECT
    (SELECT COUNT(*) FROM books)                                    AS totalBooks,
    (SELECT COUNT(*) FROM `user` WHERE roleId = 2)                    AS totalUsers,
    (SELECT COUNT(*) FROM author)                                   AS totalAuthors,
    (SELECT COUNT(*) FROM books WHERE approvalStatus = 'PENDING')   AS totalPendingBooks,
    (SELECT COALESCE(SUM(viewCount), 0) FROM books)                 AS totalSystemViews,
    (SELECT COUNT(*) FROM comments)                                 AS totalComments;

-- ============================================================
-- BƯỚC 4: STORED PROCEDURES
-- ============================================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_AddNewBook $$
CREATE PROCEDURE sp_AddNewBook(
    IN p_name VARCHAR(500), IN p_description TEXT, IN p_thumbnailUrl TEXT,
    IN p_country VARCHAR(100), IN p_language VARCHAR(10), IN p_pageNumber INT,
    IN p_releaseDate INT, IN p_ebookFileUrl TEXT, IN p_audioFileUrl TEXT,
    IN p_copyrightUrl TEXT, IN p_authorId INT, IN p_categoryId INT,
    IN p_submittedBy INT, OUT p_newBookId INT, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN ROLLBACK; SET p_newBookId = -1; SET p_message = 'ERROR: Không thể thêm sách.'; END;
    START TRANSACTION;
        INSERT INTO books (name, description, thumbnailUrl, country, language, pageNumber,
            releaseDate, ebookFileUrl, audioFileUrl, copyrightFileUrl, approvalStatus,
            isHidden, submittedByUserId, viewCount, weeklyViewCount, createdAt, updatedAt)
        VALUES (p_name, p_description, p_thumbnailUrl, p_country, p_language, p_pageNumber,
            p_releaseDate, p_ebookFileUrl, p_audioFileUrl, p_copyrightUrl, 'PENDING',
            FALSE, p_submittedBy, 0, 0, NOW(), NOW());
        SET p_newBookId = LAST_INSERT_ID();
        IF p_authorId IS NOT NULL AND p_authorId > 0 THEN
            INSERT INTO authorsofbooks (AuthorId, BookId) VALUES (p_authorId, p_newBookId);
        END IF;
        IF p_categoryId IS NOT NULL AND p_categoryId > 0 THEN
            INSERT INTO categoriesofbooks (BookId, CategoryId) VALUES (p_newBookId, p_categoryId);
        END IF;
    COMMIT;
    SET p_message = CONCAT('SUCCESS: Sách đã được nộp. ID = ', p_newBookId);
END $$

DROP PROCEDURE IF EXISTS sp_UpdateBookApproval $$
CREATE PROCEDURE sp_UpdateBookApproval(
    IN p_bookId INT, IN p_status ENUM('APPROVED','REJECTED','PENDING'),
    IN p_adminId INT, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM books WHERE id = p_bookId;
    IF v_count = 0 THEN
        SET p_message = 'ERROR: Không tìm thấy sách với ID này.';
    ELSE
        UPDATE books SET approvalStatus = p_status, updatedAt = NOW() WHERE id = p_bookId;
        SET p_message = CONCAT('SUCCESS: Đã cập nhật trạng thái sách ', p_bookId, ' → ', p_status);
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_UpsertListeningHistory $$
CREATE PROCEDURE sp_UpsertListeningHistory(
    IN p_userId INT, IN p_bookId INT, IN p_chapterId INT,
    IN p_audioTimeline FLOAT, IN p_isFinished BOOLEAN, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_existing INT;
    SELECT COUNT(*) INTO v_existing FROM listeningaudiobook WHERE userId = p_userId AND bookId = p_bookId;
    IF v_existing > 0 THEN
        UPDATE listeningaudiobook
        SET audioChapterId = p_chapterId, audioTimeline = p_audioTimeline,
            isFinished = p_isFinished, lastListenedAt = NOW()
        WHERE userId = p_userId AND bookId = p_bookId;
        SET p_message = 'SUCCESS: Đã cập nhật lịch sử nghe.';
    ELSE
        INSERT INTO listeningaudiobook (userId, bookId, audioChapterId, audioTimeline, isFinished, lastListenedAt)
        VALUES (p_userId, p_bookId, p_chapterId, p_audioTimeline, p_isFinished, NOW());
        UPDATE books SET viewCount = viewCount + 1 WHERE id = p_bookId;
        SET p_message = 'SUCCESS: Đã thêm lịch sử nghe mới.';
    END IF;
END $$

-- sp_AddComment (phiên bản mới nhất từ fix_comment_proc.sql)
DROP PROCEDURE IF EXISTS sp_AddComment $$
CREATE PROCEDURE sp_AddComment(
    IN p_userId INT, IN p_bookId INT, IN p_rating INT,
    IN p_title VARCHAR(255), IN p_content TEXT, OUT p_message VARCHAR(255)
)
BEGIN
    IF p_rating < 1 OR p_rating > 5 THEN
        SET p_message = 'ERROR: Rating phải từ 1 đến 5.';
    ELSEIF p_userId IS NULL OR p_userId <= 0 THEN
        SET p_message = 'ERROR: Người dùng không hợp lệ.';
    ELSEIF p_bookId IS NULL OR p_bookId <= 0 THEN
        SET p_message = 'ERROR: Sách không hợp lệ.';
    ELSE
        INSERT INTO comments (userId, bookId, rating, title, content, createdAt)
        VALUES (p_userId, p_bookId, p_rating, p_title, p_content, NOW());
        SET p_message = 'SUCCESS: Đã thêm đánh giá thành công.';
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_UserSubscribe $$
CREATE PROCEDURE sp_UserSubscribe(
    IN p_userId INT, IN p_planId VARCHAR(20), IN p_paymentJson JSON, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_duration INT;
    DECLARE v_endDate DATETIME;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SET p_message = 'ERROR: Thanh toán thất bại.'; END;
    SELECT duration INTO v_duration FROM subscriptionplans WHERE id = p_planId;
    IF v_duration IS NULL THEN
        SET p_message = 'ERROR: Gói đăng ký không hợp lệ.';
    ELSE
        SET v_endDate = DATE_ADD(NOW(), INTERVAL v_duration DAY);
        START TRANSACTION;
            DELETE FROM usersubscriptions WHERE userId = p_userId;
            INSERT INTO usersubscriptions (userId, planId, startDate, endDate, paymentInfo)
            VALUES (p_userId, p_planId, NOW(), v_endDate, p_paymentJson);
        COMMIT;
        SET p_message = CONCAT('SUCCESS: Đăng ký gói ', p_planId, ' thành công đến ', v_endDate);
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_ToggleFavorite $$
CREATE PROCEDURE sp_ToggleFavorite(
    IN p_userId INT, IN p_bookId INT, OUT p_action VARCHAR(10), OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_existing INT;
    SELECT COUNT(*) INTO v_existing FROM userfavorites WHERE userId = p_userId AND bookId = p_bookId;
    IF v_existing > 0 THEN
        DELETE FROM userfavorites WHERE userId = p_userId AND bookId = p_bookId;
        SET p_action = 'REMOVED'; SET p_message = 'SUCCESS: Đã xóa khỏi danh sách yêu thích.';
    ELSE
        INSERT INTO userfavorites (userId, bookId) VALUES (p_userId, p_bookId);
        SET p_action = 'ADDED'; SET p_message = 'SUCCESS: Đã thêm vào danh sách yêu thích.';
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_LockUnlockUser $$
CREATE PROCEDURE sp_LockUnlockUser(
    IN p_userId INT, IN p_lock BOOLEAN, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM `user` WHERE id = p_userId;
    IF v_count = 0 THEN
        SET p_message = 'ERROR: Không tìm thấy tài khoản.';
    ELSE
        UPDATE `user` SET hasLocked = p_lock, updatedAt = NOW() WHERE id = p_userId;
        IF p_lock THEN
            SET p_message = CONCAT('SUCCESS: Đã khóa tài khoản userId = ', p_userId);
        ELSE
            SET p_message = CONCAT('SUCCESS: Đã mở khóa tài khoản userId = ', p_userId);
        END IF;
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_GetBooksByAuthor $$
CREATE PROCEDURE sp_GetBooksByAuthor(IN p_authorId INT)
BEGIN
    SELECT b.id, b.name, b.thumbnailUrl, b.viewCount, b.releaseDate, b.approvalStatus,
        ROUND(AVG(cm.rating), 1) AS avgRating, COUNT(DISTINCT cm.id) AS totalReviews
    FROM books b
    JOIN authorsofbooks aob ON aob.BookId = b.id AND aob.AuthorId = p_authorId
    LEFT JOIN comments cm   ON cm.bookId = b.id
    WHERE b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
    GROUP BY b.id, b.name, b.thumbnailUrl, b.viewCount, b.releaseDate, b.approvalStatus
    ORDER BY b.viewCount DESC;
END $$

DROP PROCEDURE IF EXISTS sp_EditBook $$
CREATE PROCEDURE sp_EditBook(
    IN p_bookId INT, IN p_userId INT, IN p_name VARCHAR(500),
    IN p_description TEXT, IN p_thumbnailUrl TEXT, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_ownerId INT;
    SELECT submittedByUserId INTO v_ownerId FROM books WHERE id = p_bookId;
    IF v_ownerId != p_userId THEN
        SET p_message = 'ERROR: Bạn không có quyền chỉnh sửa cuốn sách này.';
    ELSE
        UPDATE books SET name = p_name, description = p_description,
            thumbnailUrl = p_thumbnailUrl, approvalStatus = 'PENDING', updatedAt = NOW()
        WHERE id = p_bookId;
        SET p_message = 'SUCCESS: Sách đã được cập nhật và tự động về trạng thái chờ duyệt.';
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_DeleteBook $$
CREATE PROCEDURE sp_DeleteBook(
    IN p_bookId INT, IN p_userId INT, IN p_roleId INT, OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_ownerId INT;
    SELECT submittedByUserId INTO v_ownerId FROM books WHERE id = p_bookId;
    IF v_ownerId != p_userId AND p_roleId != 1 THEN
        SET p_message = 'ERROR: Bạn không có quyền xóa cuốn sách này.';
    ELSE
        DELETE FROM listeningaudiobook WHERE bookId = p_bookId;
        DELETE FROM comments           WHERE bookId = p_bookId;
        DELETE FROM userfavorites      WHERE bookId = p_bookId;
        DELETE FROM audiochapter       WHERE bookId = p_bookId;
        DELETE FROM authorsofbooks     WHERE bookId = p_bookId;
        DELETE FROM categoriesofbooks  WHERE bookId = p_bookId;
        DELETE FROM books WHERE id = p_bookId;
        SET p_message = 'SUCCESS: Sách và dữ liệu liên kết đã bị xóa.';
    END IF;
END $$

DROP PROCEDURE IF EXISTS sp_ResetWeeklyViews $$
CREATE PROCEDURE sp_ResetWeeklyViews(OUT p_message VARCHAR(255))
BEGIN
    UPDATE books SET weeklyViewCount = 0, updatedAt = NOW();
    SET p_message = 'SUCCESS: Đã làm mới số lượt xem tuần.';
END $$

-- ============================================================
-- BƯỚC 5: TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_BeforeBookInsert $$
CREATE TRIGGER trg_BeforeBookInsert
BEFORE INSERT ON books FOR EACH ROW
BEGIN
    IF NEW.approvalStatus IS NULL OR NEW.approvalStatus = '' THEN SET NEW.approvalStatus = 'PENDING'; END IF;
    IF NEW.createdAt IS NULL THEN SET NEW.createdAt = NOW(); END IF;
    SET NEW.updatedAt = NOW();
    IF NEW.viewCount IS NULL THEN SET NEW.viewCount = 0; END IF;
    IF NEW.weeklyViewCount IS NULL THEN SET NEW.weeklyViewCount = 0; END IF;
    IF NEW.isHidden IS NULL THEN SET NEW.isHidden = FALSE; END IF;
END $$

DROP TRIGGER IF EXISTS trg_AfterBookUpdate $$
CREATE TRIGGER trg_AfterBookUpdate
BEFORE UPDATE ON books FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END $$

DROP TRIGGER IF EXISTS trg_AfterBookApproval $$
CREATE TRIGGER trg_AfterBookApproval
BEFORE UPDATE ON books FOR EACH ROW
BEGIN
    IF OLD.approvalStatus = 'PENDING' AND NEW.approvalStatus = 'APPROVED' THEN
        IF NEW.releaseDate IS NULL OR NEW.releaseDate = 0 THEN
            SET NEW.releaseDate = YEAR(CURDATE());
        END IF;
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_AfterListeningInsert $$
CREATE TRIGGER trg_AfterListeningInsert
AFTER INSERT ON listeningaudiobook FOR EACH ROW
BEGIN
    UPDATE books SET viewCount = viewCount + 1 WHERE id = NEW.bookId;
END $$

DROP TRIGGER IF EXISTS trg_AfterCommentInsert $$
CREATE TRIGGER trg_AfterCommentInsert
AFTER INSERT ON comments FOR EACH ROW
BEGIN
    SET @last_comment_bookId = NEW.bookId;
END $$

DROP TRIGGER IF EXISTS trg_BeforeCommentInsert_CheckRate $$
CREATE TRIGGER trg_BeforeCommentInsert_CheckRate
BEFORE INSERT ON comments FOR EACH ROW
BEGIN
    IF NEW.rating > 5 THEN SET NEW.rating = 5;
    ELSEIF NEW.rating < 1 THEN SET NEW.rating = 1;
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_BeforeUserInsert $$
CREATE TRIGGER trg_BeforeUserInsert
BEFORE INSERT ON user FOR EACH ROW
BEGIN
    IF NEW.createdAt IS NULL THEN SET NEW.createdAt = NOW(); END IF;
    IF NEW.roleId IS NULL THEN SET NEW.roleId = 2; END IF;
    IF NEW.loginFailedAttempts IS NULL THEN SET NEW.loginFailedAttempts = 0; END IF;
    IF NEW.hasLocked IS NULL THEN SET NEW.hasLocked = FALSE; END IF;
    IF NEW.authorId IS NULL THEN SET NEW.authorId = 0; END IF;
END $$

DROP TRIGGER IF EXISTS trg_AfterUserDelete $$
CREATE TRIGGER trg_AfterUserDelete
AFTER DELETE ON user FOR EACH ROW
BEGIN
    DELETE FROM listeningaudiobook WHERE userId = OLD.id;
    DELETE FROM userfavorites      WHERE userId = OLD.id;
    DELETE FROM usersubscriptions  WHERE userId = OLD.id;
    DELETE FROM comments           WHERE userId = OLD.id;
END $$

DROP TRIGGER IF EXISTS trg_AfterSubscriptionInsert $$
CREATE TRIGGER trg_AfterSubscriptionInsert
AFTER INSERT ON usersubscriptions FOR EACH ROW
BEGIN
    -- Cột subscriptionPlan đã xóa; dữ liệu gói nằm trong bảng usersubscriptions
    SET @last_sub_userId = NEW.userId;
END $$

DROP TRIGGER IF EXISTS trg_AfterAudioChapterInsert $$
CREATE TRIGGER trg_AfterAudioChapterInsert
AFTER INSERT ON audiochapter FOR EACH ROW
BEGIN
    UPDATE books SET updatedAt = NOW() WHERE id = NEW.bookId;
END $$

DELIMITER ;

-- ============================================================
-- VERIFY: Kiểm tra kết quả
-- ============================================================
SELECT TABLE_NAME, AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA='DBMS_Listenary' AND TABLE_TYPE='BASE TABLE'
ORDER BY TABLE_NAME;

SELECT 'Migration hoàn tất!' AS status;


-- ================================================================
-- BƯỚC 6: CHUẨN HÓA SCHEMA & FOREIGN KEY CONSTRAINTS
-- (Nội dung từ fix_schema_fk.sql)
-- ================================================================

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
-- PHẦN 1: XÓA CỘT DƯ THỪA (dùng PREPARE/EXECUTE để tương thích MySQL 5.7+)
-- ============================================================

-- 1a. books.authorId
SET @s = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books' AND COLUMN_NAME = 'authorId') > 0,
    'ALTER TABLE books DROP COLUMN authorId', 'SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 1b. books.categoryId
SET @s = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books' AND COLUMN_NAME = 'categoryId') > 0,
    'ALTER TABLE books DROP COLUMN categoryId', 'SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 1c. user.subscriptionPlan
SET @s = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'subscriptionPlan') > 0,
    'ALTER TABLE `user` DROP COLUMN subscriptionPlan', 'SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- ============================================================
-- PHẦN 2: CHUẨN HÓA KIỂU DỮ LIỆU (VARCHAR → DATETIME/INT)
-- Cần thiết để FK và so sánh ngày hoạt động đúng
-- ============================================================

-- ── Bước 2a: Làm sạch ISO 8601 strings (có chữ T) → MySQL DATETIME ──
-- Tạm tắt strict mode để không bị lỗi "Incorrect datetime value" khi so sánh chuỗi rỗng
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='';

-- Ví dụ: '2026-04-29T17:00:00.000Z' → '2026-04-29 17:00:00'
UPDATE books             SET createdAt     = SUBSTR(REPLACE(createdAt,     'T', ' '), 1, 19) WHERE CAST(createdAt AS CHAR)     LIKE '%T%';
UPDATE books             SET updatedAt     = SUBSTR(REPLACE(updatedAt,     'T', ' '), 1, 19) WHERE CAST(updatedAt AS CHAR)     LIKE '%T%';
UPDATE audiochapter      SET createdAt     = SUBSTR(REPLACE(createdAt,     'T', ' '), 1, 19) WHERE CAST(createdAt AS CHAR)     LIKE '%T%';
UPDATE audiochapter      SET updatedAt     = SUBSTR(REPLACE(updatedAt,     'T', ' '), 1, 19) WHERE CAST(updatedAt AS CHAR)     LIKE '%T%';
UPDATE comments          SET createdAt     = SUBSTR(REPLACE(createdAt,     'T', ' '), 1, 19) WHERE CAST(createdAt AS CHAR)     LIKE '%T%';
UPDATE listeningaudiobook SET lastListenedAt = SUBSTR(REPLACE(lastListenedAt,'T', ' '), 1, 19) WHERE CAST(lastListenedAt AS CHAR) LIKE '%T%';
UPDATE `user`            SET createdAt     = SUBSTR(REPLACE(createdAt,     'T', ' '), 1, 19) WHERE CAST(createdAt AS CHAR)     LIKE '%T%';
UPDATE `user`            SET updatedAt     = SUBSTR(REPLACE(updatedAt,     'T', ' '), 1, 19) WHERE CAST(updatedAt AS CHAR)     LIKE '%T%';
UPDATE usersubscriptions SET startDate     = SUBSTR(REPLACE(startDate,     'T', ' '), 1, 19) WHERE CAST(startDate AS CHAR)     LIKE '%T%';
UPDATE usersubscriptions SET endDate       = SUBSTR(REPLACE(endDate,       'T', ' '), 1, 19) WHERE CAST(endDate AS CHAR)       LIKE '%T%';

-- ── Bước 2b: Gán NOW() cho các giá trị NULL/rỗng/0/khoảng trắng ──
UPDATE books             SET createdAt      = NOW() WHERE createdAt      IS NULL OR TRIM(CAST(createdAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE books             SET updatedAt      = NOW() WHERE updatedAt      IS NULL OR TRIM(CAST(updatedAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE audiochapter      SET createdAt      = NOW() WHERE createdAt      IS NULL OR TRIM(CAST(createdAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE audiochapter      SET updatedAt      = NOW() WHERE updatedAt      IS NULL OR TRIM(CAST(updatedAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE comments          SET createdAt      = NOW() WHERE createdAt      IS NULL OR TRIM(CAST(createdAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE listeningaudiobook SET lastListenedAt = NOW() WHERE lastListenedAt IS NULL OR TRIM(CAST(lastListenedAt AS CHAR)) IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE `user`            SET createdAt      = NOW() WHERE createdAt      IS NULL OR TRIM(CAST(createdAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE `user`            SET updatedAt      = NULL  WHERE updatedAt      IS NULL OR TRIM(CAST(updatedAt AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE usersubscriptions SET startDate      = NOW() WHERE startDate      IS NULL OR TRIM(CAST(startDate AS CHAR))      IN ('', '0', '0000-00-00 00:00:00', 'null');
UPDATE usersubscriptions SET endDate        = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE endDate IS NULL OR TRIM(CAST(endDate AS CHAR)) IN ('', '0', '0000-00-00 00:00:00', 'null');

-- ── Bước 2c: Đổi kiểu cột sang DATETIME ──
-- Giữ nguyên SQL_MODE='' khi ALTER TABLE để ép MySQL tự động convert các chuỗi dị thường
-- thành '0000-00-00 00:00:00' mà không văng lỗi (crash).

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
ALTER TABLE `user`
    MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updatedAt DATETIME NULL;

-- usersubscriptions
ALTER TABLE usersubscriptions
    MODIFY COLUMN startDate DATETIME NOT NULL,
    MODIFY COLUMN endDate   DATETIME NOT NULL;

-- Bật lại strict mode sau khi toàn bộ xử lý DATETIME kết thúc
SET SQL_MODE=@OLD_SQL_MODE;

-- ============================================================
-- PHẦN 3: THÊM INDEX (dùng PREPARE/EXECUTE để tương thích MySQL 5.7+)
-- ============================================================

-- Helper macro: chỉ tạo index nếu chưa tồn tại
-- Cú pháp: kiểm tra INFORMATION_SCHEMA.STATISTICS trước khi ADD INDEX

-- books
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='books' AND INDEX_NAME='idx_books_publishinghouse')=0,'ALTER TABLE books ADD INDEX idx_books_publishinghouse (PublishingHouseId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='books' AND INDEX_NAME='idx_books_submittedby')=0,'ALTER TABLE books ADD INDEX idx_books_submittedby (submittedByUserId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- authorsofbooks
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='authorsofbooks' AND INDEX_NAME='idx_aob_author')=0,'ALTER TABLE authorsofbooks ADD INDEX idx_aob_author (AuthorId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='authorsofbooks' AND INDEX_NAME='idx_aob_book')=0,'ALTER TABLE authorsofbooks ADD INDEX idx_aob_book (BookId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- categoriesofbooks
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoriesofbooks' AND INDEX_NAME='idx_cob_category')=0,'ALTER TABLE categoriesofbooks ADD INDEX idx_cob_category (CategoryId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoriesofbooks' AND INDEX_NAME='idx_cob_book')=0,'ALTER TABLE categoriesofbooks ADD INDEX idx_cob_book (BookId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- audiochapter
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='audiochapter' AND INDEX_NAME='idx_ac_book')=0,'ALTER TABLE audiochapter ADD INDEX idx_ac_book (bookId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- comments
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='comments' AND INDEX_NAME='idx_comments_user')=0,'ALTER TABLE comments ADD INDEX idx_comments_user (userId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='comments' AND INDEX_NAME='idx_comments_book')=0,'ALTER TABLE comments ADD INDEX idx_comments_book (bookId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- listeningaudiobook
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listeningaudiobook' AND INDEX_NAME='idx_lab_user')=0,'ALTER TABLE listeningaudiobook ADD INDEX idx_lab_user (userId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listeningaudiobook' AND INDEX_NAME='idx_lab_book')=0,'ALTER TABLE listeningaudiobook ADD INDEX idx_lab_book (bookId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listeningaudiobook' AND INDEX_NAME='idx_lab_chapter')=0,'ALTER TABLE listeningaudiobook ADD INDEX idx_lab_chapter (audioChapterId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- userfavorites
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='userfavorites' AND INDEX_NAME='idx_uf_user')=0,'ALTER TABLE userfavorites ADD INDEX idx_uf_user (userId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='userfavorites' AND INDEX_NAME='idx_uf_book')=0,'ALTER TABLE userfavorites ADD INDEX idx_uf_book (bookId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- usersubscriptions
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='usersubscriptions' AND INDEX_NAME='idx_us_user')=0,'ALTER TABLE usersubscriptions ADD INDEX idx_us_user (userId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='usersubscriptions' AND INDEX_NAME='idx_us_plan')=0,'ALTER TABLE usersubscriptions ADD INDEX idx_us_plan (planId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- user
SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='user' AND INDEX_NAME='idx_user_role')=0,'ALTER TABLE `user` ADD INDEX idx_user_role (roleId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

SET @s = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='user' AND INDEX_NAME='idx_user_author')=0,'ALTER TABLE `user` ADD INDEX idx_user_author (authorId)','SELECT 1');
PREPARE _stmt FROM @s; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- ============================================================
-- PHẦN 4: THÊM FOREIGN KEY CONSTRAINTS
-- ============================================================

-- ── user ──────────────────────────────────────────────────
ALTER TABLE `user`
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
        FOREIGN KEY (submittedByUserId) REFERENCES `user`(id)
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
        FOREIGN KEY (userId) REFERENCES `user`(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_comments_book
        FOREIGN KEY (bookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── listeningaudiobook ────────────────────────────────────
ALTER TABLE listeningaudiobook
    ADD CONSTRAINT fk_lab_user
        FOREIGN KEY (userId) REFERENCES `user`(id)
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
        FOREIGN KEY (userId) REFERENCES `user`(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_uf_book
        FOREIGN KEY (bookId) REFERENCES books(id)
        ON UPDATE CASCADE ON DELETE CASCADE;

-- ── usersubscriptions ─────────────────────────────────────
ALTER TABLE usersubscriptions
    ADD CONSTRAINT fk_us_user
        FOREIGN KEY (userId) REFERENCES `user`(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_us_plan
        FOREIGN KEY (planId) REFERENCES subscriptionplans(id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- Bật lại safe mode và FK checks
SET SQL_SAFE_UPDATES  = 1;
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
