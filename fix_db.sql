SET FOREIGN_KEY_CHECKS = 0;

UPDATE userfavorites SET userId=11 WHERE userId=0;
UPDATE listeningaudiobook SET userId=11 WHERE userId=0;
UPDATE comments SET userId=11 WHERE userId=0;
UPDATE usersubscriptions SET userId=11 WHERE userId=0;
UPDATE user SET id=11 WHERE id=0;

ALTER TABLE user MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE user AUTO_INCREMENT = 12;

SET FOREIGN_KEY_CHECKS = 1;

SELECT id, username FROM user ORDER BY id;
SELECT AUTO_INCREMENT FROM information_schema.TABLES 
WHERE TABLE_NAME='user' AND TABLE_SCHEMA='dbms_listenary';
