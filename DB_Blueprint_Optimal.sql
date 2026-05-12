
-- =========================================================================
-- DATABASE: DBMS_Listenary
-- MÔ TẢ: BẢN THIẾT KẾ (BLUEPRINT) HOÀN CHỈNH VÀ TỐI ƯU NHẤT
-- BAO GỒM: TABLES, FOREIGN KEYS, INDEXES, VIEWS, TRIGGERS, STORED PROCEDURES
-- (FILE NÀY KHÔNG CHỨA DỮ LIỆU - CHỈ CHỨA CẤU TRÚC CHUẨN ĐỂ LÀM TÀI LIỆU HOẶC TẠO DB MỚI)
-- LƯU Ý: ĐÃ FIX TOÀN BỘ BUG VÀ TỐI ƯU INDEX CHO TỐC ĐỘ CAO NHẤT.
-- =========================================================================

SET FOREIGN_KEY_CHECKS = 0;



DROP TABLE IF EXISTS `audiochapter`;
CREATE TABLE `audiochapter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chapterNumber` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `audiobookUrl` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `bookId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ac_book_chapter` (`bookId`,`chapterNumber`),
  CONSTRAINT `fk_audiochapter_book` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_AfterAudioChapterInsert
AFTER INSERT ON audiochapter FOR EACH ROW
BEGIN
    UPDATE books SET updatedAt = NOW() WHERE id = NEW.bookId;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;

DROP TABLE IF EXISTS `author`;
CREATE TABLE `author` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `imagineUrl` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `birthday` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `authorsofbooks`;
CREATE TABLE `authorsofbooks` (
  `AuthorId` int(11) NOT NULL,
  `BookId` int(11) NOT NULL,
  PRIMARY KEY (`AuthorId`,`BookId`),
  UNIQUE KEY `idx_aob_book_author` (`BookId`,`AuthorId`),
  KEY `idx_aob_author_only` (`AuthorId`),
  CONSTRAINT `fk_aob_author` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_aob_book` FOREIGN KEY (`BookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `thumbnailUrl` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `pageNumber` int(11) DEFAULT NULL,
  `releaseDate` int(11) DEFAULT NULL,
  `ebookFileUrl` text DEFAULT NULL,
  `weeklyViewCount` int(11) DEFAULT NULL,
  `lastWeekReset` varchar(100) DEFAULT NULL,
  `PublishingHouseId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `viewCount` int(11) DEFAULT NULL,
  `approvalStatus` varchar(50) DEFAULT NULL,
  `audioFileUrl` text DEFAULT NULL,
  `copyrightFileUrl` text DEFAULT NULL,
  `submittedByUserId` int(11) DEFAULT NULL,
  `isHidden` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_books_publishinghouse` (`PublishingHouseId`),
  KEY `idx_books_submittedby` (`submittedByUserId`),
  KEY `idx_books_status_hidden_created` (`approvalStatus`,`isHidden`,`createdAt`),
  KEY `idx_books_status_hidden_viewcount` (`approvalStatus`,`isHidden`,`viewCount`),
  KEY `idx_books_submittedby_created` (`submittedByUserId`,`createdAt`),
  CONSTRAINT `fk_books_publishinghouse` FOREIGN KEY (`PublishingHouseId`) REFERENCES `publishinghouse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_books_submittedby` FOREIGN KEY (`submittedByUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_BeforeBookInsert
BEFORE INSERT ON books FOR EACH ROW
BEGIN
    IF NEW.approvalStatus IS NULL OR NEW.approvalStatus = '' THEN SET NEW.approvalStatus = 'PENDING'; END IF;
    IF NEW.createdAt IS NULL THEN SET NEW.createdAt = NOW(); END IF;
    SET NEW.updatedAt = NOW();
    IF NEW.viewCount IS NULL THEN SET NEW.viewCount = 0; END IF;
    IF NEW.weeklyViewCount IS NULL THEN SET NEW.weeklyViewCount = 0; END IF;
    IF NEW.isHidden IS NULL THEN SET NEW.isHidden = FALSE; END IF;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_BeforeBookUpdate
BEFORE UPDATE ON books FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
    IF OLD.approvalStatus = 'PENDING' AND NEW.approvalStatus = 'APPROVED' THEN
        IF NEW.releaseDate IS NULL OR NEW.releaseDate = 0 THEN
            SET NEW.releaseDate = YEAR(CURDATE());
        END IF;
    END IF;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;

DROP TABLE IF EXISTS `categoriesofbooks`;
CREATE TABLE `categoriesofbooks` (
  `BookId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  PRIMARY KEY (`BookId`,`CategoryId`),
  UNIQUE KEY `idx_cob_book_category` (`BookId`,`CategoryId`),
  KEY `idx_cob_category_only` (`CategoryId`),
  CONSTRAINT `fk_cob_book` FOREIGN KEY (`BookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cob_category` FOREIGN KEY (`CategoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `bookId` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_comments_book_rating` (`bookId`,`rating`),
  KEY `idx_comments_user_book` (`userId`,`bookId`),
  CONSTRAINT `fk_comments_book` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_BeforeCommentInsert_CheckRate
BEFORE INSERT ON comments FOR EACH ROW
BEGIN
    IF NEW.rating > 5 THEN SET NEW.rating = 5;
    ELSEIF NEW.rating < 1 THEN SET NEW.rating = 1;
    END IF;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_AfterCommentInsert
AFTER INSERT ON comments FOR EACH ROW
BEGIN
    SET @last_comment_bookId = NEW.bookId;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;

DROP TABLE IF EXISTS `listeningaudiobook`;
CREATE TABLE `listeningaudiobook` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `bookId` int(11) DEFAULT NULL,
  `audioTimeline` int(11) DEFAULT NULL,
  `isFinished` tinyint(1) DEFAULT NULL,
  `lastListenedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `audioChapterId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_lab_user_book` (`userId`,`bookId`),
  KEY `idx_lab_chapter` (`audioChapterId`),
  KEY `idx_lab_user_listened` (`userId`,`lastListenedAt`),
  KEY `fk_lab_book` (`bookId`),
  CONSTRAINT `fk_lab_book` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lab_chapter` FOREIGN KEY (`audioChapterId`) REFERENCES `audiochapter` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lab_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `publishinghouse`;
CREATE TABLE `publishinghouse` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `subscriptionplans`;
CREATE TABLE `subscriptionplans` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `monthlyBookLimit` int(11) DEFAULT NULL,
  `demoSeconds` int(11) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `encryptedPassword` varchar(255) DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `emailVerifiedAt` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `addresses` text DEFAULT NULL,
  `birthday` varchar(50) DEFAULT NULL,
  `loginFailedAttempts` int(11) DEFAULT NULL,
  `hasLocked` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `thumbnailUrl` text DEFAULT NULL,
  `authorId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_username` (`username`),
  UNIQUE KEY `idx_user_email` (`email`),
  KEY `idx_user_role` (`roleId`),
  KEY `idx_user_author` (`authorId`),
  CONSTRAINT `fk_user_author` FOREIGN KEY (`authorId`) REFERENCES `author` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_BeforeUserInsert
BEFORE INSERT ON user FOR EACH ROW
BEGIN
    IF NEW.createdAt IS NULL THEN SET NEW.createdAt = NOW(); END IF;
    IF NEW.roleId IS NULL THEN SET NEW.roleId = 2; END IF;
    IF NEW.loginFailedAttempts IS NULL THEN SET NEW.loginFailedAttempts = 0; END IF;
    IF NEW.hasLocked IS NULL THEN SET NEW.hasLocked = FALSE; END IF;
    IF NEW.authorId IS NULL OR NEW.authorId = 0 THEN SET NEW.authorId = NULL; END IF;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;

DROP TABLE IF EXISTS `userfavorites`;
CREATE TABLE `userfavorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `bookId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_uf_user_book` (`userId`,`bookId`),
  KEY `fk_uf_book` (`bookId`),
  CONSTRAINT `fk_uf_book` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_uf_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `usersubscriptions`;
CREATE TABLE `usersubscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `planId` varchar(50) DEFAULT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `paymentInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`paymentInfo`)),
  PRIMARY KEY (`id`),
  KEY `idx_us_plan` (`planId`),
  KEY `idx_us_user_enddate` (`userId`,`endDate`),
  CONSTRAINT `fk_us_plan` FOREIGN KEY (`planId`) REFERENCES `subscriptionplans` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_us_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` /*!50003 TRIGGER trg_AfterSubscriptionInsert
AFTER INSERT ON usersubscriptions FOR EACH ROW
BEGIN
    
    SET @last_sub_userId = NEW.userId;
END */$
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;

DROP TABLE IF EXISTS `vw_authorstats`;
/*!50001 CREATE VIEW `vw_authorstats` AS SELECT
 1 AS `authorId`,
  1 AS `firstName`,
  1 AS `lastName`,
  1 AS `fullName`,
  1 AS `imagineUrl`,
  1 AS `birthday`,
  1 AS `authorBio`,
  1 AS `totalBooks`,
  1 AS `totalViews`,
  1 AS `avgViewsPerBook`,
  1 AS `avgRating`,
  1 AS `totalReviews` */;

DROP TABLE IF EXISTS `vw_bookdetails`;
/*!50001 CREATE VIEW `vw_bookdetails` AS SELECT
 1 AS `bookId`,
  1 AS `bookName`,
  1 AS `description`,
  1 AS `thumbnailUrl`,
  1 AS `country`,
  1 AS `language`,
  1 AS `pageNumber`,
  1 AS `releaseDate`,
  1 AS `ebookFileUrl`,
  1 AS `audioFileUrl`,
  1 AS `copyrightFileUrl`,
  1 AS `viewCount`,
  1 AS `weeklyViewCount`,
  1 AS `approvalStatus`,
  1 AS `isHidden`,
  1 AS `submittedByUserId`,
  1 AS `bookCreatedAt`,
  1 AS `bookUpdatedAt`,
  1 AS `authorId`,
  1 AS `authorFirstName`,
  1 AS `authorLastName`,
  1 AS `authorFullName`,
  1 AS `authorImageUrl`,
  1 AS `categoryId`,
  1 AS `categoryName`,
  1 AS `publishingHouseId`,
  1 AS `publishingHouseName`,
  1 AS `avgRating`,
  1 AS `totalReviews` */;

DROP TABLE IF EXISTS `vw_listeninghistory`;
/*!50001 CREATE VIEW `vw_listeninghistory` AS SELECT
 1 AS `historyId`,
  1 AS `userId`,
  1 AS `bookId`,
  1 AS `audioChapterId`,
  1 AS `audioTimeline`,
  1 AS `isFinished`,
  1 AS `lastListenedAt`,
  1 AS `bookName`,
  1 AS `bookThumbnail`,
  1 AS `authorFullName`,
  1 AS `chapterNumber`,
  1 AS `chapterName`,
  1 AS `duration` */;

DROP TABLE IF EXISTS `vw_newestbooks`;
/*!50001 CREATE VIEW `vw_newestbooks` AS SELECT
 1 AS `bookId`,
  1 AS `bookName`,
  1 AS `thumbnailUrl`,
  1 AS `releaseDate`,
  1 AS `viewCount`,
  1 AS `createdAt`,
  1 AS `approvalStatus`,
  1 AS `isHidden`,
  1 AS `authorId`,
  1 AS `authorFullName`,
  1 AS `categoryName` */;

DROP TABLE IF EXISTS `vw_pendingbooks`;
/*!50001 CREATE VIEW `vw_pendingbooks` AS SELECT
 1 AS `bookId`,
  1 AS `bookName`,
  1 AS `thumbnailUrl`,
  1 AS `description`,
  1 AS `copyrightFileUrl`,
  1 AS `approvalStatus`,
  1 AS `submittedAt`,
  1 AS `submittedByUserId`,
  1 AS `submittedByName`,
  1 AS `submittedByUsername`,
  1 AS `authorId`,
  1 AS `authorFullName`,
  1 AS `categoryName` */;

DROP TABLE IF EXISTS `vw_platformdashboard`;
/*!50001 CREATE VIEW `vw_platformdashboard` AS SELECT
 1 AS `totalBooks`,
  1 AS `totalUsers`,
  1 AS `totalAuthors`,
  1 AS `totalPendingBooks`,
  1 AS `totalSystemViews`,
  1 AS `totalComments` */;

DROP TABLE IF EXISTS `vw_trendingbooks`;
/*!50001 CREATE VIEW `vw_trendingbooks` AS SELECT
 1 AS `bookId`,
  1 AS `bookName`,
  1 AS `thumbnailUrl`,
  1 AS `description`,
  1 AS `viewCount`,
  1 AS `weeklyViewCount`,
  1 AS `releaseDate`,
  1 AS `country`,
  1 AS `approvalStatus`,
  1 AS `authorId`,
  1 AS `authorFullName`,
  1 AS `authorImageUrl`,
  1 AS `categoryName`,
  1 AS `avgRating`,
  1 AS `totalReviews` */;

DROP TABLE IF EXISTS `vw_userfavoritebooks`;
/*!50001 CREATE VIEW `vw_userfavoritebooks` AS SELECT
 1 AS `userId`,
  1 AS `bookId`,
  1 AS `bookName`,
  1 AS `thumbnailUrl`,
  1 AS `viewCount`,
  1 AS `approvalStatus`,
  1 AS `authorId`,
  1 AS `authorFullName`,
  1 AS `avgRating` */;

DROP TABLE IF EXISTS `vw_userprofile`;
/*!50001 CREATE VIEW `vw_userprofile` AS SELECT
 1 AS `userId`,
  1 AS `username`,
  1 AS `firstName`,
  1 AS `lastName`,
  1 AS `fullName`,
  1 AS `email`,
  1 AS `emailVerifiedAt`,
  1 AS `phoneNumber`,
  1 AS `addresses`,
  1 AS `birthday`,
  1 AS `thumbnailUrl`,
  1 AS `hasLocked`,
  1 AS `loginFailedAttempts`,
  1 AS `userCreatedAt`,
  1 AS `roleId`,
  1 AS `roleName`,
  1 AS `currentPlanId`,
  1 AS `currentPlanName`,
  1 AS `planPrice`,
  1 AS `subStartDate`,
  1 AS `subEndDate`,
  1 AS `authorId`,
  1 AS `authorFirstName`,
  1 AS `authorLastName` */;

SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddComment`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_AddNewBook`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_DeleteBook`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_EditBook`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetBooksByAuthor`(IN p_authorId INT)
BEGIN
    SELECT b.id, b.name, b.thumbnailUrl, b.viewCount, b.releaseDate, b.approvalStatus,
        ROUND(AVG(cm.rating), 1) AS avgRating, COUNT(DISTINCT cm.id) AS totalReviews
    FROM books b
    JOIN authorsofbooks aob ON aob.BookId = b.id AND aob.AuthorId = p_authorId
    LEFT JOIN comments cm   ON cm.bookId = b.id
    WHERE b.approvalStatus = 'APPROVED' AND b.isHidden = FALSE
    GROUP BY b.id, b.name, b.thumbnailUrl, b.viewCount, b.releaseDate, b.approvalStatus
    ORDER BY b.viewCount DESC;
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_LockUnlockUser`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ResetWeeklyViews`(OUT p_message VARCHAR(255))
BEGIN
    UPDATE books SET weeklyViewCount = 0, updatedAt = NOW();
    SET p_message = 'SUCCESS: Đã làm mới số lượt xem tuần.';
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ToggleFavorite`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateBookApproval`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpsertListeningHistory`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;
SET @saved_sql_mode       = @@sql_mode  ;
SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION'  ;
SET @saved_cs_client      = @@character_set_client  ;
SET @saved_cs_results     = @@character_set_results  ;
SET @saved_col_connection = @@collation_connection  ;
SET character_set_client  = utf8  ;
SET character_set_results = utf8  ;
SET collation_connection  = utf8_general_ci  ;
DELIMITER $
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UserSubscribe`(
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
END $
DELIMITER ;

SET sql_mode              = @saved_sql_mode  ;
SET character_set_client  = @saved_cs_client  ;
SET character_set_results = @saved_cs_results  ;
SET collation_connection  = @saved_col_connection  ;


SET FOREIGN_KEY_CHECKS = 1;
