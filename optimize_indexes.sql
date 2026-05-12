-- ================================================================
-- optimize_indexes.sql — DBMS_Listenary  (MariaDB 10.4 strict compatible)
-- Dùng PREPARE/EXECUTE cho tất cả DROP IF EXISTS operations
-- ================================================================
USE DBMS_Listenary;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- HELPER PROCEDURES
-- ================================================================
DROP PROCEDURE IF EXISTS _drop_fk;
DROP PROCEDURE IF EXISTS _drop_idx;

DELIMITER $$

CREATE PROCEDURE _drop_fk(IN tbl VARCHAR(64), IN fk VARCHAR(64))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl
          AND CONSTRAINT_NAME = fk AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ) THEN
        SET @_sql = CONCAT('ALTER TABLE `', tbl, '` DROP FOREIGN KEY `', fk, '`');
        PREPARE _st FROM @_sql; EXECUTE _st; DEALLOCATE PREPARE _st;
    END IF;
END$$

CREATE PROCEDURE _drop_idx(IN tbl VARCHAR(64), IN idx VARCHAR(64))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND INDEX_NAME = idx
    ) THEN
        SET @_sql = CONCAT('ALTER TABLE `', tbl, '` DROP INDEX `', idx, '`');
        PREPARE _st FROM @_sql; EXECUTE _st; DEALLOCATE PREPARE _st;
    END IF;
END$$

DELIMITER ;

-- ================================================================
-- PHASE 1: DROP FOREIGN KEYS (phải làm trước khi drop index)
-- ================================================================
CALL _drop_fk('authorsofbooks',    'fk_aob_author');
CALL _drop_fk('authorsofbooks',    'fk_aob_book');
CALL _drop_fk('categoriesofbooks', 'fk_cob_book');
CALL _drop_fk('categoriesofbooks', 'fk_cob_category');
CALL _drop_fk('audiochapter',      'fk_audiochapter_book');
CALL _drop_fk('comments',          'fk_comments_user');
CALL _drop_fk('comments',          'fk_comments_book');
CALL _drop_fk('listeningaudiobook','fk_lab_user');
CALL _drop_fk('listeningaudiobook','fk_lab_book');
CALL _drop_fk('listeningaudiobook','fk_lab_chapter');
CALL _drop_fk('userfavorites',     'fk_uf_user');
CALL _drop_fk('userfavorites',     'fk_uf_book');
CALL _drop_fk('usersubscriptions', 'fk_us_user');
CALL _drop_fk('books',             'fk_books_submittedby');

-- ================================================================
-- PHASE 2: DROP INDEX CŨ DƯ THỪA
-- ================================================================
CALL _drop_idx('authorsofbooks',    'idx_aob_book');
CALL _drop_idx('authorsofbooks',    'idx_aob_author');
CALL _drop_idx('categoriesofbooks', 'idx_cob_book');
CALL _drop_idx('categoriesofbooks', 'idx_cob_category');
CALL _drop_idx('audiochapter',      'idx_ac_book');
CALL _drop_idx('comments',          'idx_comments_user');
CALL _drop_idx('comments',          'idx_comments_book');
CALL _drop_idx('listeningaudiobook','idx_lab_user');
CALL _drop_idx('listeningaudiobook','idx_lab_book');
CALL _drop_idx('userfavorites',     'idx_uf_user');
CALL _drop_idx('userfavorites',     'idx_uf_book');
CALL _drop_idx('usersubscriptions', 'idx_us_user');

-- ================================================================
-- PHASE 3: ADD INDEX TỐI ƯU
-- ================================================================

-- [1] books: approvalStatus+isHidden → createdAt  (vw_NewestBooks ORDER BY createdAt)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='books'
    AND INDEX_NAME='idx_books_status_hidden_created')=0,
    'ALTER TABLE books ADD INDEX idx_books_status_hidden_created (approvalStatus,isHidden,createdAt)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [2] books: approvalStatus+isHidden → viewCount  (vw_TrendingBooks ORDER BY viewCount)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='books'
    AND INDEX_NAME='idx_books_status_hidden_viewcount')=0,
    'ALTER TABLE books ADD INDEX idx_books_status_hidden_viewcount (approvalStatus,isHidden,viewCount)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [3] books: submittedByUserId → createdAt  (Author dashboard ORDER BY createdAt)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='books'
    AND INDEX_NAME='idx_books_submittedby_created')=0,
    'ALTER TABLE books ADD INDEX idx_books_submittedby_created (submittedByUserId,createdAt)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [4] user: UNIQUE username  (login)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='user'
    AND INDEX_NAME='idx_user_username')=0,
    'ALTER TABLE `user` ADD UNIQUE INDEX idx_user_username (username)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [5] user: UNIQUE email  (register)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='user'
    AND INDEX_NAME='idx_user_email')=0,
    'ALTER TABLE `user` ADD UNIQUE INDEX idx_user_email (email)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [6] authorsofbooks: UNIQUE(BookId,AuthorId) — junction, BookId first
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='authorsofbooks'
    AND INDEX_NAME='idx_aob_book_author')=0,
    'ALTER TABLE authorsofbooks ADD UNIQUE INDEX idx_aob_book_author (BookId,AuthorId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [7] authorsofbooks: AuthorId riêng — JOIN ON AuthorId
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='authorsofbooks'
    AND INDEX_NAME='idx_aob_author_only')=0,
    'ALTER TABLE authorsofbooks ADD INDEX idx_aob_author_only (AuthorId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [8] categoriesofbooks: UNIQUE(BookId,CategoryId)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoriesofbooks'
    AND INDEX_NAME='idx_cob_book_category')=0,
    'ALTER TABLE categoriesofbooks ADD UNIQUE INDEX idx_cob_book_category (BookId,CategoryId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [9] categoriesofbooks: CategoryId riêng
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoriesofbooks'
    AND INDEX_NAME='idx_cob_category_only')=0,
    'ALTER TABLE categoriesofbooks ADD INDEX idx_cob_category_only (CategoryId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [10] audiochapter: (bookId,chapterNumber) — loại filesort ORDER BY chapterNumber
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='audiochapter'
    AND INDEX_NAME='idx_ac_book_chapter')=0,
    'ALTER TABLE audiochapter ADD INDEX idx_ac_book_chapter (bookId,chapterNumber)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [11] comments: UNIQUE(userId,bookId) — 1 review/sách/user
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='comments'
    AND INDEX_NAME='idx_comments_user_book')=0,
    'ALTER TABLE comments ADD UNIQUE INDEX idx_comments_user_book (userId,bookId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [12] comments: Covering(bookId,rating) — AVG(rating) index-only scan
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='comments'
    AND INDEX_NAME='idx_comments_book_rating')=0,
    'ALTER TABLE comments ADD INDEX idx_comments_book_rating (bookId,rating)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [13] listeningaudiobook: UNIQUE(userId,bookId) — 1 history/user/sách
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listeningaudiobook'
    AND INDEX_NAME='idx_lab_user_book')=0,
    'ALTER TABLE listeningaudiobook ADD UNIQUE INDEX idx_lab_user_book (userId,bookId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [14] listeningaudiobook: (userId,lastListenedAt) — ORDER BY lastListenedAt DESC/user
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='listeningaudiobook'
    AND INDEX_NAME='idx_lab_user_listened')=0,
    'ALTER TABLE listeningaudiobook ADD INDEX idx_lab_user_listened (userId,lastListenedAt)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [15] userfavorites: UNIQUE(userId,bookId) — sp_ToggleFavorite
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='userfavorites'
    AND INDEX_NAME='idx_uf_user_book')=0,
    'ALTER TABLE userfavorites ADD UNIQUE INDEX idx_uf_user_book (userId,bookId)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- [16] usersubscriptions: (userId,endDate) — WHERE userId=? AND endDate>=NOW()
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='usersubscriptions'
    AND INDEX_NAME='idx_us_user_enddate')=0,
    'ALTER TABLE usersubscriptions ADD INDEX idx_us_user_enddate (userId,endDate)',
    'SELECT 1');
PREPARE _st FROM @s; EXECUTE _st; DEALLOCATE PREPARE _st;

-- ================================================================
-- PHASE 4: ADD FOREIGN KEYS LẠI (dùng index mới làm support)
-- ================================================================
ALTER TABLE authorsofbooks
    ADD CONSTRAINT fk_aob_author FOREIGN KEY (AuthorId)  REFERENCES author(id) ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_aob_book   FOREIGN KEY (BookId)    REFERENCES books(id)  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE categoriesofbooks
    ADD CONSTRAINT fk_cob_category FOREIGN KEY (CategoryId) REFERENCES category(id) ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_cob_book     FOREIGN KEY (BookId)     REFERENCES books(id)    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE audiochapter
    ADD CONSTRAINT fk_audiochapter_book FOREIGN KEY (bookId) REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE comments
    ADD CONSTRAINT fk_comments_user FOREIGN KEY (userId) REFERENCES `user`(id) ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_comments_book FOREIGN KEY (bookId) REFERENCES books(id)  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE listeningaudiobook
    ADD CONSTRAINT fk_lab_user    FOREIGN KEY (userId)         REFERENCES `user`(id)       ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_lab_book    FOREIGN KEY (bookId)         REFERENCES books(id)        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_lab_chapter FOREIGN KEY (audioChapterId) REFERENCES audiochapter(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE userfavorites
    ADD CONSTRAINT fk_uf_user FOREIGN KEY (userId) REFERENCES `user`(id) ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT fk_uf_book FOREIGN KEY (bookId) REFERENCES books(id)  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE usersubscriptions
    ADD CONSTRAINT fk_us_user FOREIGN KEY (userId) REFERENCES `user`(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE books
    ADD CONSTRAINT fk_books_submittedby FOREIGN KEY (submittedByUserId) REFERENCES `user`(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- cleanup
DROP PROCEDURE IF EXISTS _drop_fk;
DROP PROCEDURE IF EXISTS _drop_idx;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- VERIFY 1: Tất cả index sau tối ưu
-- ================================================================
SELECT
    TABLE_NAME  AS `Table`,
    INDEX_NAME  AS `Index`,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ', ') AS `Columns`,
    IF(NON_UNIQUE=0,'UNIQUE','INDEX') AS `Type`
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
      'books','user','authorsofbooks','categoriesofbooks',
      'audiochapter','comments','listeningaudiobook',
      'userfavorites','usersubscriptions'
  )
  AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- ================================================================
-- VERIFY 2: FK còn đủ
-- ================================================================
SELECT TABLE_NAME AS `Table`, CONSTRAINT_NAME AS `FK`,
       COLUMN_NAME AS `Column`, REFERENCED_TABLE_NAME AS `Ref`
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ================================================================
-- VERIFY 3: Phát hiện index đơn cột bị bao phủ bởi composite
-- ================================================================
SELECT
    s1.TABLE_NAME AS `Table`,
    s1.INDEX_NAME AS `Redundant?`,
    s1.COLUMN_NAME AS `Column`,
    s2.INDEX_NAME AS `Covered by`
FROM information_schema.STATISTICS s1
JOIN information_schema.STATISTICS s2
    ON  s1.TABLE_SCHEMA = s2.TABLE_SCHEMA
    AND s1.TABLE_NAME   = s2.TABLE_NAME
    AND s1.COLUMN_NAME  = s2.COLUMN_NAME
    AND s1.SEQ_IN_INDEX = 1 AND s2.SEQ_IN_INDEX = 1
    AND s1.INDEX_NAME  != s2.INDEX_NAME
    AND s1.INDEX_NAME  != 'PRIMARY' AND s2.INDEX_NAME != 'PRIMARY'
WHERE s1.TABLE_SCHEMA = DATABASE()
  AND (SELECT COUNT(*) FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA=s1.TABLE_SCHEMA AND TABLE_NAME=s1.TABLE_NAME
         AND INDEX_NAME=s1.INDEX_NAME) = 1
  AND (SELECT COUNT(*) FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA=s2.TABLE_SCHEMA AND TABLE_NAME=s2.TABLE_NAME
         AND INDEX_NAME=s2.INDEX_NAME) > 1
ORDER BY s1.TABLE_NAME, s1.INDEX_NAME;

SELECT '✅ optimize_indexes.sql hoàn tất!' AS status;
