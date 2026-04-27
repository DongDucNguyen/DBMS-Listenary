DELIMITER $$

DROP PROCEDURE IF EXISTS sp_AddComment $$

CREATE PROCEDURE sp_AddComment(
  IN p_userId INT,
  IN p_bookId INT,
  IN p_rating INT,
  IN p_title VARCHAR(255),
  IN p_content TEXT,
  OUT p_message VARCHAR(255)
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

DELIMITER ;
