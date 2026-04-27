SET FOREIGN_KEY_CHECKS=0;

-- Fix audiochapter (có thể bị duplicate)
ALTER TABLE audiochapter MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix author
ALTER TABLE author MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix books  
ALTER TABLE books MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix category
ALTER TABLE category MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix comments — nếu có duplicate id, xóa rows trùng trước
DELETE c1 FROM comments c1 INNER JOIN comments c2 
  WHERE c1.id = c2.id AND c1.createdAt < c2.createdAt;
ALTER TABLE comments MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix listeningaudiobook — có row id=0, cập nhật id=0 sang giá trị mới
SET @rownum = 100;
UPDATE listeningaudiobook SET id = (@rownum := @rownum + 1) WHERE id = 0;
ALTER TABLE listeningaudiobook MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix publishinghouse
ALTER TABLE publishinghouse MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix role
ALTER TABLE role MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix userfavorites — có row id=0
SET @rownum2 = 100;
UPDATE userfavorites SET id = (@rownum2 := @rownum2 + 1) WHERE id = 0;
ALTER TABLE userfavorites MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Fix usersubscriptions (đã xóa row id=0 trước đó)
ALTER TABLE usersubscriptions MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE usersubscriptions AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS=1;

-- Verify
SELECT TABLE_NAME, AUTO_INCREMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA='dbms_listenary' AND TABLE_TYPE='BASE TABLE'
ORDER BY TABLE_NAME;
