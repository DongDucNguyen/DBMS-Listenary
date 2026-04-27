# Plan: Nang cap He thong len MySQL - Listenary

## Tong quan
Chuyen doi tu database.json sang MySQL, uu tien View, Stored Procedure, Trigger.

## Tien do
| Giai doan | Noi dung | Trang thai |
|---|---|---|
| 1A | Views (7 view) | HOAN THANH |
| 1B | Stored Procedures (8 SP) | HOAN THANH |
| 1C | Triggers (8 trigger) | HOAN THANH |
| 2 | Node.js Backend API | CO HUONG DAN |
| 3 | Tich hop Frontend | CHO |
| 4 | Migration JSON to MySQL | CHO |

## Cau truc Views
- vw_BookDetails: Chi tiet sach + tac gia + the loai + rating
- vw_AuthorStats: Thong ke tac gia (Admin Dashboard)
- vw_UserProfile: Ho so user + Role + Subscription
- vw_NewestBooks: Sach moi (sort createdAt -> releaseDate)
- vw_TrendingBooks: Sach trending theo luot xem
- vw_PendingBooks: Sach cho Admin duyet
- vw_ListeningHistory: Lich su nghe

## Cau truc Stored Procedures
- sp_AddNewBook: Tac gia nop sach moi (PENDING)
- sp_UpdateBookApproval: Admin duyet/tu choi sach
- sp_UpsertListeningHistory: Ghi lich su nghe
- sp_AddComment: Them danh gia sach
- sp_UserSubscribe: Mua goi Premium/Basic
- sp_ToggleFavorite: Them/xoa yeu thich
- sp_LockUnlockUser: Admin khoa/mo khoa tai khoan
- sp_GetBooksByAuthor: Lay sach cua tac gia

## Cau truc Triggers
- trg_BeforeBookInsert: Auto set approvalStatus=PENDING, timestamps
- trg_AfterBookUpdate: Auto update updatedAt
- trg_AfterListeningInsert: Tang viewCount khi nghe moi
- trg_AfterCommentInsert: San sang cache avgRating
- trg_BeforeUserInsert: Auto set roleId=2, timestamps
- trg_AfterUserDelete: Cascade xoa du lieu lien quan
- trg_AfterSubscriptionInsert: Sync subscriptionPlan vao user
- trg_AfterAudioChapterInsert: Update updatedAt cua sach

---


## PHASE 1A: VIEWS SQL
```sql
-- ============================================================
-- PHASE 1A: VIEWS - dbms_listenary
-- Chạy file này trong MySQL Workbench (schema: dbms_listenary)
-- ============================================================

USE dbms_listenary;

-- ─────────────────────────────────────────────────────────────
-- VIEW 1: vw_BookDetails
-- Mục đích: Lấy toàn bộ thông tin sách kèm tên tác giả,
--           thể loại, nhà XB, và rating trung bình
-- Dùng cho: BookDetailPage, tất cả trang danh sách sách
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_BookDetails AS
SELECT
    b.id                                        AS bookId,
    b.name                                      AS bookName,
    b.description,
    b.thumbnailUrl,
    b.country,
    b.language,
    b.pageNumber,
    b.releaseDate,
    b.ebookFileUrl,
    b.audioFileUrl,
    b.copyrightFileUrl,
    b.viewCount,
    b.weeklyViewCount,
    b.approvalStatus,
    b.isHidden,
    b.submittedByUserId,
    b.createdAt                                 AS bookCreatedAt,
    b.updatedAt                                 AS bookUpdatedAt,
    -- Tác giả chính (lấy từ bảng authorsofbooks)
    a.id                                        AS authorId,
    a.firstName                                 AS authorFirstName,
    a.lastName                                  AS authorLastName,
    CONCAT(a.firstName, ' ', a.lastName)        AS authorFullName,
    a.imagineUrl                                AS authorImageUrl,
    -- Thể loại (lấy tên thể loại đầu tiên)
    c.id                                        AS categoryId,
    c.name                                      AS categoryName,
    -- Nhà xuất bản
    ph.id                                       AS publishingHouseId,
    ph.name                                     AS publishingHouseName,
    -- Rating trung bình từ bảng comments
    ROUND(AVG(cm.rating), 1)                    AS avgRating,
    COUNT(DISTINCT cm.id)                       AS totalReviews
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


-- ─────────────────────────────────────────────────────────────
-- VIEW 2: vw_AuthorStats
-- Mục đích: Thống kê tác giả cho Admin Dashboard
--           (số tác phẩm, tổng lượt xem, avg views, avg rating)
-- Dùng cho: AdminPage tab "Tác giả"
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_AuthorStats AS
SELECT
    a.id                                        AS authorId,
    a.firstName,
    a.lastName,
    CONCAT(a.firstName, ' ', a.lastName)        AS fullName,
    a.imagineUrl,
    a.birthday,
    a.description                               AS authorBio,
    -- Thống kê sách
    COUNT(DISTINCT b.id)                        AS totalBooks,
    COALESCE(SUM(b.viewCount), 0)               AS totalViews,
    COALESCE(ROUND(AVG(b.viewCount), 0), 0)     AS avgViewsPerBook,
    -- Rating trung bình từ tất cả bình luận về sách của tác giả
    ROUND(AVG(cm.rating), 1)                    AS avgRating,
    COUNT(DISTINCT cm.id)                       AS totalReviews
FROM author a
LEFT JOIN authorsofbooks aob ON aob.AuthorId = a.id
LEFT JOIN books b            ON b.id = aob.BookId
                             AND b.approvalStatus = 'APPROVED'
                             AND b.isHidden = FALSE
LEFT JOIN comments cm        ON cm.bookId = b.id
GROUP BY a.id, a.firstName, a.lastName, a.imagineUrl, a.birthday, a.description;


-- ─────────────────────────────────────────────────────────────
-- VIEW 3: vw_UserProfile
-- Mục đích: Thông tin người dùng kèm tên Role và Subscription
-- Dùng cho: UserPage, AdminPage tab "Tài khoản", AuthService
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_UserProfile AS
SELECT
    u.id                                        AS userId,
    u.username,
    u.firstName,
    u.lastName,
    CONCAT(u.firstName, ' ', u.lastName)        AS fullName,
    u.email,
    u.emailVerifiedAt,
    u.phoneNumber,
    u.addresses,
    u.birthday,
    u.thumbnailUrl,
    u.hasLocked,
    u.loginFailedAttempts,
    u.createdAt                                 AS userCreatedAt,
    u.roleId,
    r.name                                      AS roleName,
    -- Subscription hiện tại (chưa hết hạn)
    us.planId                                   AS currentPlanId,
    sp.name                                     AS currentPlanName,
    sp.price                                    AS planPrice,
    us.startDate                                AS subStartDate,
    us.endDate                                  AS subEndDate,
    -- Tác giả liên kết (nếu có)
    u.authorId,
    a.firstName                                 AS authorFirstName,
    a.lastName                                  AS authorLastName
FROM user u
JOIN role r ON r.id = u.roleId
LEFT JOIN usersubscriptions us ON us.userId = u.id
                               AND us.endDate >= NOW()
LEFT JOIN subscriptionplans sp ON sp.id = us.planId
LEFT JOIN author a              ON a.id = u.authorId;


-- ─────────────────────────────────────────────────────────────
-- VIEW 4: vw_NewestBooks
-- Mục đích: Danh sách sách mới nhất cho trang Khám phá
--           Ưu tiên: createdAt mới nhất → releaseDate mới nhất
-- Dùng cho: ExplorePage mục "Mới Phát Hành"
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_NewestBooks AS
SELECT
    b.id                                        AS bookId,
    b.name                                      AS bookName,
    b.thumbnailUrl,
    b.releaseDate,
    b.viewCount,
    b.createdAt,
    b.approvalStatus,
    b.isHidden,
    a.id                                        AS authorId,
    CONCAT(a.firstName, ' ', a.lastName)        AS authorFullName,
    c.name                                      AS categoryName
FROM books b
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
WHERE b.approvalStatus = 'APPROVED'
  AND b.isHidden = FALSE
  AND b.thumbnailUrl IS NOT NULL
  AND b.thumbnailUrl != ''
ORDER BY b.createdAt DESC, COALESCE(b.releaseDate, 0) DESC;


-- ─────────────────────────────────────────────────────────────
-- VIEW 5: vw_TrendingBooks
-- Mục đích: Sách trending theo lượt xem
-- Dùng cho: ExplorePage mục "Nổi bật", TrendingPage
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_TrendingBooks AS
SELECT
    b.id                                        AS bookId,
    b.name                                      AS bookName,
    b.thumbnailUrl,
    b.description,
    b.viewCount,
    b.weeklyViewCount,
    b.releaseDate,
    b.country,
    b.approvalStatus,
    a.id                                        AS authorId,
    CONCAT(a.firstName, ' ', a.lastName)        AS authorFullName,
    a.imagineUrl                                AS authorImageUrl,
    c.name                                      AS categoryName,
    ROUND(AVG(cm.rating), 1)                    AS avgRating,
    COUNT(DISTINCT cm.id)                       AS totalReviews
FROM books b
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
LEFT JOIN comments cm        ON cm.bookId = b.id
WHERE b.approvalStatus = 'APPROVED'
  AND b.isHidden = FALSE
GROUP BY
    b.id, b.name, b.thumbnailUrl, b.description, b.viewCount,
    b.weeklyViewCount, b.releaseDate, b.country, b.approvalStatus,
    a.id, a.firstName, a.lastName, a.imagineUrl, c.name
ORDER BY b.viewCount DESC;


-- ─────────────────────────────────────────────────────────────
-- VIEW 6: vw_PendingBooks
-- Mục đích: Sách đang chờ Admin duyệt
-- Dùng cho: AdminPage tab "Duyệt sách"
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_PendingBooks AS
SELECT
    b.id                                        AS bookId,
    b.name                                      AS bookName,
    b.thumbnailUrl,
    b.description,
    b.copyrightFileUrl,
    b.approvalStatus,
    b.createdAt                                 AS submittedAt,
    b.submittedByUserId,
    CONCAT(u.firstName, ' ', u.lastName)        AS submittedByName,
    u.username                                  AS submittedByUsername,
    a.id                                        AS authorId,
    CONCAT(a.firstName, ' ', a.lastName)        AS authorFullName,
    c.name                                      AS categoryName
FROM books b
LEFT JOIN user u             ON u.id = b.submittedByUserId
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN categoriesofbooks cob ON cob.BookId = b.id
LEFT JOIN category c         ON c.id = cob.CategoryId
WHERE b.approvalStatus = 'PENDING'
ORDER BY b.createdAt DESC;


-- ─────────────────────────────────────────────────────────────
-- VIEW 7: vw_ListeningHistory
-- Mục đích: Lịch sử nghe của từng user kèm thông tin sách/chương
-- Dùng cho: UserPage tab lịch sử
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_ListeningHistory AS
SELECT
    lab.id                                      AS historyId,
    lab.userId,
    lab.bookId,
    lab.audioChapterId,
    lab.audioTimeline,
    lab.isFinished,
    lab.lastListenedAt,
    b.name                                      AS bookName,
    b.thumbnailUrl                              AS bookThumbnail,
    CONCAT(a.firstName, ' ', a.lastName)        AS authorFullName,
    ac.chapterNumber,
    ac.name                                     AS chapterName,
    ac.duration
FROM listeningaudiobook lab
JOIN books b        ON b.id = lab.bookId
LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
LEFT JOIN author a           ON a.id = aob.AuthorId
LEFT JOIN audiochapter ac    ON ac.id = lab.audioChapterId
ORDER BY lab.lastListenedAt DESC;
```


## PHASE 1B: STORED PROCEDURES SQL
```sql
-- ============================================================
-- PHASE 1B: STORED PROCEDURES - dbms_listenary
-- ============================================================

USE dbms_listenary;
DELIMITER $$

-- ─────────────────────────────────────────────────────────────
-- SP 1: sp_AddNewBook
-- Mục đích: Tác giả nộp sách mới (trạng thái PENDING)
--           Tự động ghi vào authorsofbooks và categoriesofbooks
-- Gọi từ: AuthorPage "Upload sách mới"
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_AddNewBook $$
CREATE PROCEDURE sp_AddNewBook(
    IN p_name           VARCHAR(500),
    IN p_description    TEXT,
    IN p_thumbnailUrl   TEXT,
    IN p_country        VARCHAR(100),
    IN p_language       VARCHAR(10),
    IN p_pageNumber     INT,
    IN p_releaseDate    INT,
    IN p_ebookFileUrl   TEXT,
    IN p_audioFileUrl   TEXT,
    IN p_copyrightUrl   TEXT,
    IN p_authorId       INT,        -- ID trong bảng author
    IN p_categoryId     INT,        -- ID trong bảng category
    IN p_submittedBy    INT,        -- userId của người nộp
    OUT p_newBookId     INT,
    OUT p_message       VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_newBookId = -1;
        SET p_message = 'ERROR: Không thể thêm sách. Kiểm tra lại dữ liệu.';
    END;

    START TRANSACTION;

        -- 1. Thêm vào bảng books
        INSERT INTO books (
            name, description, thumbnailUrl, country, language,
            pageNumber, releaseDate, ebookFileUrl, audioFileUrl,
            copyrightFileUrl, approvalStatus, isHidden,
            submittedByUserId, viewCount, weeklyViewCount,
            createdAt, updatedAt
        ) VALUES (
            p_name, p_description, p_thumbnailUrl, p_country, p_language,
            p_pageNumber, p_releaseDate, p_ebookFileUrl, p_audioFileUrl,
            p_copyrightUrl, 'PENDING', FALSE,
            p_submittedBy, 0, 0,
            NOW(), NOW()
        );

        SET p_newBookId = LAST_INSERT_ID();

        -- 2. Ghi vào bảng authorsofbooks
        IF p_authorId IS NOT NULL AND p_authorId > 0 THEN
            INSERT INTO authorsofbooks (AuthorId, BookId)
            VALUES (p_authorId, p_newBookId);
        END IF;

        -- 3. Ghi vào bảng categoriesofbooks
        IF p_categoryId IS NOT NULL AND p_categoryId > 0 THEN
            INSERT INTO categoriesofbooks (BookId, CategoryId)
            VALUES (p_newBookId, p_categoryId);
        END IF;

    COMMIT;
    SET p_message = CONCAT('SUCCESS: Sách đã được nộp. ID = ', p_newBookId);
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 2: sp_UpdateBookApproval
-- Mục đích: Admin duyệt hoặc từ chối sách
-- Gọi từ: AdminPage "Duyệt sách"
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_UpdateBookApproval $$
CREATE PROCEDURE sp_UpdateBookApproval(
    IN p_bookId     INT,
    IN p_status     ENUM('APPROVED','REJECTED','PENDING'),
    IN p_adminId    INT,
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE v_count INT;

    SELECT COUNT(*) INTO v_count FROM books WHERE id = p_bookId;

    IF v_count = 0 THEN
        SET p_message = 'ERROR: Không tìm thấy sách với ID này.';
    ELSE
        UPDATE books
        SET approvalStatus = p_status,
            updatedAt = NOW()
        WHERE id = p_bookId;

        SET p_message = CONCAT('SUCCESS: Đã cập nhật trạng thái sách ', p_bookId, ' → ', p_status);
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 3: sp_UpsertListeningHistory
-- Mục đích: Thêm mới hoặc cập nhật lịch sử nghe của user
--           (dùng INSERT ... ON DUPLICATE KEY UPDATE)
-- Gọi từ: AudioPlayerService khi user nghe sách
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_UpsertListeningHistory $$
CREATE PROCEDURE sp_UpsertListeningHistory(
    IN p_userId         INT,
    IN p_bookId         INT,
    IN p_chapterId      INT,
    IN p_audioTimeline  FLOAT,
    IN p_isFinished     BOOLEAN,
    OUT p_message       VARCHAR(255)
)
BEGIN
    DECLARE v_existing INT;

    SELECT COUNT(*) INTO v_existing
    FROM listeningaudiobook
    WHERE userId = p_userId AND bookId = p_bookId;

    IF v_existing > 0 THEN
        -- Cập nhật bản ghi hiện có
        UPDATE listeningaudiobook
        SET audioChapterId  = p_chapterId,
            audioTimeline   = p_audioTimeline,
            isFinished      = p_isFinished,
            lastListenedAt  = NOW()
        WHERE userId = p_userId AND bookId = p_bookId;

        SET p_message = 'SUCCESS: Đã cập nhật lịch sử nghe.';
    ELSE
        -- Thêm mới
        INSERT INTO listeningaudiobook
            (userId, bookId, audioChapterId, audioTimeline, isFinished, lastListenedAt)
        VALUES
            (p_userId, p_bookId, p_chapterId, p_audioTimeline, p_isFinished, NOW());

        -- Tăng viewCount của sách
        UPDATE books SET viewCount = viewCount + 1 WHERE id = p_bookId;

        SET p_message = 'SUCCESS: Đã thêm lịch sử nghe mới.';
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 4: sp_AddComment
-- Mục đích: Thêm đánh giá sách (mỗi user chỉ đánh giá 1 lần/sách)
-- Gọi từ: BookDetailPage form đánh giá
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_AddComment $$
CREATE PROCEDURE sp_AddComment(
    IN p_userId     INT,
    IN p_bookId     INT,
    IN p_rating     TINYINT,    -- 1 đến 5
    IN p_title      VARCHAR(255),
    IN p_content    TEXT,
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE v_existing INT;

    -- Kiểm tra user đã đánh giá sách này chưa
    SELECT COUNT(*) INTO v_existing
    FROM comments
    WHERE userId = p_userId AND bookId = p_bookId;

    IF v_existing > 0 THEN
        SET p_message = 'ERROR: Bạn đã đánh giá cuốn sách này rồi.';
    ELSEIF p_rating < 1 OR p_rating > 5 THEN
        SET p_message = 'ERROR: Rating phải từ 1 đến 5.';
    ELSE
        INSERT INTO comments (userId, bookId, rating, title, content, createdAt)
        VALUES (p_userId, p_bookId, p_rating, p_title, p_content, NOW());

        SET p_message = 'SUCCESS: Đã thêm đánh giá thành công.';
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 5: sp_UserSubscribe
-- Mục đích: Người dùng mua gói Premium/Basic
-- Gọi từ: SubscriptionPage
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_UserSubscribe $$
CREATE PROCEDURE sp_UserSubscribe(
    IN p_userId         INT,
    IN p_planId         VARCHAR(20),
    IN p_paymentJson    JSON,       -- Lưu thông tin thanh toán dạng JSON
    OUT p_message       VARCHAR(255)
)
BEGIN
    DECLARE v_duration  INT;
    DECLARE v_endDate   DATETIME;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_message = 'ERROR: Thanh toán thất bại.';
    END;

    -- Lấy thời hạn gói
    SELECT duration INTO v_duration FROM subscriptionplans WHERE id = p_planId;

    IF v_duration IS NULL THEN
        SET p_message = 'ERROR: Gói đăng ký không hợp lệ.';
    ELSE
        SET v_endDate = DATE_ADD(NOW(), INTERVAL v_duration DAY);

        START TRANSACTION;

            -- Xóa gói cũ (nếu có) để tránh trùng
            DELETE FROM usersubscriptions WHERE userId = p_userId;

            -- Tạo gói mới
            INSERT INTO usersubscriptions (userId, planId, startDate, endDate, paymentInfo)
            VALUES (p_userId, p_planId, NOW(), v_endDate, p_paymentJson);

        COMMIT;
        SET p_message = CONCAT('SUCCESS: Đăng ký gói ', p_planId, ' thành công đến ', v_endDate);
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 6: sp_ToggleFavorite
-- Mục đích: Thêm/xóa sách yêu thích của user (toggle)
-- Gọi từ: BookDetailPage nút "Yêu thích"
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_ToggleFavorite $$
CREATE PROCEDURE sp_ToggleFavorite(
    IN p_userId     INT,
    IN p_bookId     INT,
    OUT p_action    VARCHAR(10),    -- 'ADDED' hoặc 'REMOVED'
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE v_existing INT;

    SELECT COUNT(*) INTO v_existing
    FROM userfavorites
    WHERE userId = p_userId AND bookId = p_bookId;

    IF v_existing > 0 THEN
        DELETE FROM userfavorites WHERE userId = p_userId AND bookId = p_bookId;
        SET p_action  = 'REMOVED';
        SET p_message = 'SUCCESS: Đã xóa khỏi danh sách yêu thích.';
    ELSE
        INSERT INTO userfavorites (userId, bookId) VALUES (p_userId, p_bookId);
        SET p_action  = 'ADDED';
        SET p_message = 'SUCCESS: Đã thêm vào danh sách yêu thích.';
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 7: sp_LockUnlockUser
-- Mục đích: Admin khóa/mở khóa tài khoản người dùng
-- Gọi từ: AdminPage tab "Tài khoản"
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_LockUnlockUser $$
CREATE PROCEDURE sp_LockUnlockUser(
    IN p_userId     INT,
    IN p_lock       BOOLEAN,    -- TRUE = khóa, FALSE = mở khóa
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE v_count INT;

    SELECT COUNT(*) INTO v_count FROM user WHERE id = p_userId;

    IF v_count = 0 THEN
        SET p_message = 'ERROR: Không tìm thấy tài khoản.';
    ELSE
        UPDATE user
        SET hasLocked = p_lock,
            updatedAt = NOW()
        WHERE id = p_userId;

        IF p_lock THEN
            SET p_message = CONCAT('SUCCESS: Đã khóa tài khoản userId = ', p_userId);
        ELSE
            SET p_message = CONCAT('SUCCESS: Đã mở khóa tài khoản userId = ', p_userId);
        END IF;
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- SP 8: sp_GetBooksByAuthor
-- Mục đích: Lấy danh sách sách của một tác giả
-- Gọi từ: AuthorDetailPage
-- ─────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS sp_GetBooksByAuthor $$
CREATE PROCEDURE sp_GetBooksByAuthor(
    IN p_authorId   INT
)
BEGIN
    SELECT
        b.id, b.name, b.thumbnailUrl, b.viewCount,
        b.releaseDate, b.approvalStatus,
        ROUND(AVG(cm.rating), 1) AS avgRating,
        COUNT(DISTINCT cm.id)    AS totalReviews
    FROM books b
    JOIN authorsofbooks aob ON aob.BookId = b.id AND aob.AuthorId = p_authorId
    LEFT JOIN comments cm   ON cm.bookId = b.id
    WHERE b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
    GROUP BY b.id, b.name, b.thumbnailUrl, b.viewCount, b.releaseDate, b.approvalStatus
    ORDER BY b.viewCount DESC;
END $$

DELIMITER ;
```


## PHASE 1C: TRIGGERS SQL
```sql
-- ============================================================
-- PHASE 1C: TRIGGERS - dbms_listenary
-- ============================================================

USE dbms_listenary;
DELIMITER $$

-- ─────────────────────────────────────────────────────────────
-- TRIGGER 1: trg_BeforeBookInsert
-- Thời điểm: BEFORE INSERT ON books
-- Mục đích:  Tự động gán giá trị mặc định cho sách mới:
--            - approvalStatus = 'PENDING' nếu không được set
--            - createdAt, updatedAt = NOW()
--            - viewCount, weeklyViewCount = 0
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_BeforeBookInsert $$
CREATE TRIGGER trg_BeforeBookInsert
BEFORE INSERT ON books
FOR EACH ROW
BEGIN
    IF NEW.approvalStatus IS NULL OR NEW.approvalStatus = '' THEN
        SET NEW.approvalStatus = 'PENDING';
    END IF;

    IF NEW.createdAt IS NULL THEN
        SET NEW.createdAt = NOW();
    END IF;

    SET NEW.updatedAt = NOW();

    IF NEW.viewCount IS NULL THEN
        SET NEW.viewCount = 0;
    END IF;

    IF NEW.weeklyViewCount IS NULL THEN
        SET NEW.weeklyViewCount = 0;
    END IF;

    IF NEW.isHidden IS NULL THEN
        SET NEW.isHidden = FALSE;
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 2: trg_AfterBookUpdate
-- Thời điểm: AFTER UPDATE ON books
-- Mục đích:  Tự động cập nhật updatedAt khi sách bị sửa
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_AfterBookUpdate $$
CREATE TRIGGER trg_AfterBookUpdate
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 3: trg_AfterListeningInsert
-- Thời điểm: AFTER INSERT ON listeningaudiobook
-- Mục đích:  Mỗi khi user bắt đầu nghe sách lần ĐẦU TIÊN,
--            tự động tăng viewCount của sách lên 1
--            (Trigger này bổ sung cho sp_UpsertListeningHistory)
-- Lưu ý:    Nếu dùng Stored Procedure đã xử lý viewCount,
--           comment trigger này ra để tránh đếm 2 lần
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_AfterListeningInsert $$
CREATE TRIGGER trg_AfterListeningInsert
AFTER INSERT ON listeningaudiobook
FOR EACH ROW
BEGIN
    -- Tăng tổng lượt xem của sách
    UPDATE books
    SET viewCount = viewCount + 1
    WHERE id = NEW.bookId;
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 4: trg_AfterCommentInsert
-- Thời điểm: AFTER INSERT ON comments
-- Mục đích:  Khi có đánh giá mới, ghi log (có thể mở rộng
--            để cập nhật cache avgRating trực tiếp vào books
--            nếu bổ sung cột avgRating vào bảng books)
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_AfterCommentInsert $$
CREATE TRIGGER trg_AfterCommentInsert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    -- Tùy chọn: Cập nhật avgRating cache nếu thêm cột vào bảng books
    -- Hiện tại avgRating được tính động qua VIEW vw_BookDetails
    -- Nếu muốn cache, bỏ comment đoạn dưới và thêm cột avgRating vào books:
    --
    -- UPDATE books
    -- SET avgRating = (
    --     SELECT ROUND(AVG(rating), 1) FROM comments WHERE bookId = NEW.bookId
    -- )
    -- WHERE id = NEW.bookId;

    -- Placeholder: Trigger sẵn sàng cho mở rộng
    SET @last_comment_bookId = NEW.bookId;
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 5: trg_BeforeUserInsert
-- Thời điểm: BEFORE INSERT ON user
-- Mục đích:  Gán createdAt tự động và roleId mặc định = 2 (USER)
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_BeforeUserInsert $$
CREATE TRIGGER trg_BeforeUserInsert
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF NEW.createdAt IS NULL THEN
        SET NEW.createdAt = NOW();
    END IF;

    IF NEW.roleId IS NULL THEN
        SET NEW.roleId = 2; -- ROLE_USER mặc định
    END IF;

    IF NEW.loginFailedAttempts IS NULL THEN
        SET NEW.loginFailedAttempts = 0;
    END IF;

    IF NEW.hasLocked IS NULL THEN
        SET NEW.hasLocked = FALSE;
    END IF;

    IF NEW.authorId IS NULL THEN
        SET NEW.authorId = 0;
    END IF;
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 6: trg_AfterUserDelete
-- Thời điểm: AFTER DELETE ON user
-- Mục đích:  Cascade xóa dữ liệu liên quan khi xóa user
--            (phòng trường hợp FOREIGN KEY chưa được bật ON DELETE CASCADE)
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_AfterUserDelete $$
CREATE TRIGGER trg_AfterUserDelete
AFTER DELETE ON user
FOR EACH ROW
BEGIN
    -- Xóa lịch sử nghe
    DELETE FROM listeningaudiobook WHERE userId = OLD.id;
    -- Xóa yêu thích
    DELETE FROM userfavorites WHERE userId = OLD.id;
    -- Xóa đăng ký gói
    DELETE FROM usersubscriptions WHERE userId = OLD.id;
    -- Xóa bình luận
    DELETE FROM comments WHERE userId = OLD.id;
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 7: trg_AfterSubscriptionInsert
-- Thời điểm: AFTER INSERT ON usersubscriptions
-- Mục đích:  Khi user mua gói mới, tự động cập nhật
--            trường subscriptionPlan trong bảng user
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_AfterSubscriptionInsert $$
CREATE TRIGGER trg_AfterSubscriptionInsert
AFTER INSERT ON usersubscriptions
FOR EACH ROW
BEGIN
    UPDATE user
    SET subscriptionPlan = NEW.planId
    WHERE id = NEW.userId;
END $$


-- ─────────────────────────────────────────────────────────────
-- TRIGGER 8: trg_AfterAudioChapterInsert
-- Thời điểm: AFTER INSERT ON audiochapter
-- Mục đích:  Khi thêm chapter mới, tự động cập nhật updatedAt
--            của sách tương ứng
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_AfterAudioChapterInsert $$
CREATE TRIGGER trg_AfterAudioChapterInsert
AFTER INSERT ON audiochapter
FOR EACH ROW
BEGIN
    UPDATE books
    SET updatedAt = NOW()
    WHERE id = NEW.bookId;
END $$

DELIMITER ;
```


## PHASE 2: NODE.JS BACKEND GUIDE
```sql
-- ============================================================
-- PHASE 2: NODE.JS BACKEND SETUP GUIDE
-- Cài đặt và cấu hình Express + mysql2
-- ============================================================

-- Chạy lệnh này trong terminal (thư mục gốc dự án):
-- npm install express mysql2 cors dotenv

-- File: server/.env
-- DB_HOST=localhost
-- DB_USER=root
-- DB_PASS=your_password
-- DB_NAME=dbms_listenary
-- PORT=3001

-- ============================================================
-- File: server/db.js - Connection Pool
-- ============================================================
/*
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
*/

-- ============================================================
-- File: server/routes/books.js - Các API Endpoint sách
-- ============================================================
/*
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/books → Tất cả sách đã duyệt (dùng View)
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM vw_BookDetails WHERE approvalStatus = "APPROVED" AND isHidden = FALSE'
  );
  res.json(rows);
});

// GET /api/books/newest → Sách mới nhất (dùng View)
router.get('/newest', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vw_NewestBooks LIMIT 6');
  res.json(rows);
});

// GET /api/books/trending → Sách trending (dùng View)
router.get('/trending', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vw_TrendingBooks LIMIT 20');
  res.json(rows);
});

// GET /api/books/:id → Chi tiết sách (dùng View)
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM vw_BookDetails WHERE bookId = ?',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy sách' });
  res.json(rows[0]);
});

// POST /api/books → Tác giả nộp sách mới (dùng Procedure)
router.post('/', async (req, res) => {
  const { name, description, thumbnailUrl, country, language,
          pageNumber, releaseDate, ebookFileUrl, audioFileUrl,
          copyrightUrl, authorId, categoryId, submittedBy } = req.body;

  const [result] = await pool.query(
    'CALL sp_AddNewBook(?,?,?,?,?,?,?,?,?,?,?,?,?,@newId,@msg)',
    [name, description, thumbnailUrl, country, language,
     pageNumber, releaseDate, ebookFileUrl, audioFileUrl,
     copyrightUrl, authorId, categoryId, submittedBy]
  );
  const [[out]] = await pool.query('SELECT @newId AS newId, @msg AS message');
  res.json(out);
});

// PATCH /api/books/:id/approval → Admin duyệt/từ chối (dùng Procedure)
router.patch('/:id/approval', async (req, res) => {
  const { status, adminId } = req.body;
  await pool.query('CALL sp_UpdateBookApproval(?,?,?,@msg)', [req.params.id, status, adminId]);
  const [[out]] = await pool.query('SELECT @msg AS message');
  res.json(out);
});

module.exports = router;
*/

-- ============================================================
-- File: server/routes/users.js - API người dùng
-- ============================================================
/*
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/users → Danh sách tài khoản (Admin)
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vw_UserProfile');
  res.json(rows);
});

// GET /api/users/:id → Hồ sơ cá nhân
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM vw_UserProfile WHERE userId = ?', [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy user' });
  res.json(rows[0]);
});

// PATCH /api/users/:id/lock → Admin khóa/mở khóa (dùng Procedure)
router.patch('/:id/lock', async (req, res) => {
  const { lock } = req.body;
  await pool.query('CALL sp_LockUnlockUser(?,?,@msg)', [req.params.id, lock]);
  const [[out]] = await pool.query('SELECT @msg AS message');
  res.json(out);
});

// GET /api/users/:id/history → Lịch sử nghe (dùng View)
router.get('/:id/history', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM vw_ListeningHistory WHERE userId = ? LIMIT 20', [req.params.id]
  );
  res.json(rows);
});

module.exports = router;
*/

-- ============================================================
-- File: server/routes/admin.js - API Admin chuyên biệt
-- ============================================================
/*
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/admin/authors → Thống kê tác giả (dùng View)
router.get('/authors', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vw_AuthorStats ORDER BY totalViews DESC');
  res.json(rows);
});

// GET /api/admin/pending → Sách chờ duyệt (dùng View)
router.get('/pending', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vw_PendingBooks');
  res.json(rows);
});

module.exports = router;
*/

-- ============================================================
-- File: server/index.js - Entry point
-- ============================================================
/*
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/books',   require('./routes/books'));
app.use('/api/users',   require('./routes/users'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/history', require('./routes/history'));
app.use('/api/comments',require('./routes/comments'));

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server chạy trên cổng ${process.env.PORT || 3001}`);
});
*/
```
