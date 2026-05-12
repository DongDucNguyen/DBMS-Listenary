-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: DBMS_Listenary
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audiochapter`
--

DROP TABLE IF EXISTS `audiochapter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audiochapter`
--

LOCK TABLES `audiochapter` WRITE;
/*!40000 ALTER TABLE `audiochapter` DISABLE KEYS */;
INSERT INTO `audiochapter` VALUES (4,1,'Thứ Sáu không trọng lực','Một nhà vật lý học khám phá ra cách bẻ cong không gian-thời gian bằng cách sử dụng các vật liệu tái chế từ bãi phế liệu, mở ra cánh cửa du hành đến quá khứ.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1v-x7OS9wTsruUdiNRYfeBMe0amqRTwt-%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',401,2,'2025-11-08 21:00:00','2025-11-08 21:01:10'),(5,2,'Con tàu bị nguyền rủa','Cả đội phải đối mặt với một con tàu ma đã biến mất hàng thế kỷ, giờ xuất hiện trở lại với thủy thủ đoàn bị hóa đá giữa đại dương rộng lớn.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1v-x7OS9wTsruUdiNRYfeBMe0amqRTwt-%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',298,2,'2025-11-08 21:05:00','2025-11-08 21:05:55'),(6,1,'Nghệ thuật của Chiếc Thìa Bay','Giới thiệu về triết lý Zen và cách áp dụng nó vào việc chế tạo những dụng cụ nhà bếp biết bay, một phong trào mới nổi ở Tây Tạng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1GHKxzhv2NrSMXM59JahAq9Os7ROv1ZU7&version=fix_lan_cuoi',210,3,'2025-11-08 21:10:00','2025-11-08 21:10:30'),(7,2,'Cánh cửa Tử thần','Nhân vật nữ chính, một đầu bếp lừng danh, phải chiến đấu với các thế lực siêu nhiên đang cố gắng đánh cắp công thức nấu ăn bí mật của gia đình cô.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1GHKxzhv2NrSMXM59JahAq9Os7ROv1ZU7&version=fix_lan_cuoi',355,3,'2025-11-08 21:15:00','2025-11-08 21:16:05'),(8,3,'Lời thì thầm của Bột Mì','Hồi tưởng về quá khứ đầy biến động, giải thích nguồn gốc siêu năng lực của chiếc Thìa Bay và mối liên hệ của nó với một loại bột mì hiếm.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1GHKxzhv2NrSMXM59JahAq9Os7ROv1ZU7&version=fix_lan_cuoi',432,3,'2025-11-08 21:20:00','2025-11-08 21:21:11'),(9,1,'Bí mật của Chim ruồi','Một nhà thám hiểm lớn tuổi phát hiện ra một bộ lạc sống ẩn dật trong rừng Amazon, họ giao tiếp hoàn toàn bằng cách bắt chước tiếng chim ruồi.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1wr4WKrbfOsYENvfOsywtpw1_9yB1KTRD%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5t7un6Zba-QqISgqOyJ8Um5LLna2q16GHaPPV7J1HJ_6mjJIY7isoAuenk5w_aem_S06E2R6TJez-t8Npapow7g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',277,4,'2025-11-08 21:25:00','2025-11-08 21:25:40'),(10,2,'Vũ điệu Mùa Đông','Miêu tả chi tiết về nghi lễ thiêng liêng của bộ lạc, một vũ điệu cầu mưa được thực hiện dưới ánh trăng tròn, nơi thời gian dường như ngưng đọng.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1wr4WKrbfOsYENvfOsywtpw1_9yB1KTRD%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5t7un6Zba-QqISgqOyJ8Um5LLna2q16GHaPPV7J1HJ_6mjJIY7isoAuenk5w_aem_S06E2R6TJez-t8Npapow7g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',390,4,'2025-11-08 21:30:00','2025-11-08 21:31:09'),(11,1,'Thành phố dưới Hồ Đen','Một thợ lặn khảo cổ tình cờ tìm thấy bằng chứng về một nền văn minh tiên tiến đã bị nhấn chìm dưới đáy hồ băng ở Siberia từ hàng ngàn năm trước.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1wzclVK5H9453q2EwyDaKcdLykOnTIy_E%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR73QcY5asBlHURnuumaMcEZEOrfexUypYp5RK1ClvWalEAbeL7lA78-VFe1DQ_aem_1_3uP_HrEodhVDr7_4MyzA&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',465,5,'2025-11-08 21:35:00','2025-11-08 21:36:12'),(12,2,'Máy tính Khổng lồ','Nhóm nghiên cứu tìm cách kích hoạt lại \'bộ não\' của thành phố, một cỗ máy cổ đại nắm giữ chìa khóa cho mọi bí mật khoa học và triết học của nhân loại.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1wzclVK5H9453q2EwyDaKcdLykOnTIy_E%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR73QcY5asBlHURnuumaMcEZEOrfexUypYp5RK1ClvWalEAbeL7lA78-VFe1DQ_aem_1_3uP_HrEodhVDr7_4MyzA&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',580,5,'2025-11-08 21:40:00','2025-11-08 21:41:22'),(13,3,'Âm mưu của Người ngoài hành tinh','Sự thật kinh hoàng được tiết lộ: nền văn minh dưới hồ không phải đã bị hủy diệt mà đã chọn cách rút lui để tránh một cuộc xâm lược không gian.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1wzclVK5H9453q2EwyDaKcdLykOnTIy_E%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR73QcY5asBlHURnuumaMcEZEOrfexUypYp5RK1ClvWalEAbeL7lA78-VFe1DQ_aem_1_3uP_HrEodhVDr7_4MyzA&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',399,5,'2025-11-08 21:45:00','2025-11-08 21:45:48'),(14,1,'Tiếng vọng từ Thế kỷ 18','Một nhà sưu tập đồ cổ mua được chiếc đồng hồ quả quýt có khả năng phát ra những cuộc đối thoại lịch sử từ hai trăm năm trước, dẫn đến một vụ án giết người chưa được giải quyết.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1ioqKmzbEpr293-hUb0XeaN0wHmpKA2wO&version=fix_lan_cuoi',310,6,'2025-11-08 21:50:00','2025-11-08 21:51:01'),(15,2,'Quán rượu Vàng son','Thám tử theo dấu vết của nạn nhân cuối cùng đến một quán rượu cũ kỹ, nơi sự thật về vụ án bị chôn vùi trong những lời nói dối của các nhân chứng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1ioqKmzbEpr293-hUb0XeaN0wHmpKA2wO&version=fix_lan_cuoi',450,6,'2025-11-08 21:55:00','2025-11-08 21:55:59'),(16,1,'Hòn đảo của những giấc mơ','Một nhóm bạn trẻ lạc vào một hòn đảo nhiệt đới không có trong bản đồ, nơi mọi giấc mơ của họ đều trở thành hiện thực, nhưng cái giá phải trả là sự tỉnh táo.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1Tw4qYHd3Ik56PNOKJ4vxiDFln3DSg2Y2%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',520,7,'2025-11-08 22:00:00','2025-11-08 22:01:15'),(17,2,'Bóng tối dưới lá cọ','Căng thẳng leo thang khi các giấc mơ bắt đầu chồng chéo và biến thành ác mộng tập thể, buộc nhóm bạn phải tìm ra chủ nhân thực sự của hòn đảo.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1Tw4qYHd3Ik56PNOKJ4vxiDFln3DSg2Y2%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',370,7,'2025-11-08 22:05:00','2025-11-08 22:06:05'),(18,3,'Trở về từ Hư vô','Để thoát khỏi hòn đảo, họ phải chấp nhận hy sinh giấc mơ lớn nhất của mình. Chỉ có một người có thể giữ được ký ức về nơi này.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1Tw4qYHd3Ik56PNOKJ4vxiDFln3DSg2Y2%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',490,7,'2025-11-08 22:10:00','2025-11-08 22:11:18'),(19,1,'Robot biết khóc','Trong một tương lai nơi robot làm mọi công việc, một kỹ sư phát hiện ra lỗi lập trình khiến robot lau dọn của anh có khả năng cảm nhận và khóc thương cho số phận của con người.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1cqkGRelpHFnIo6bdfiL_VM_GO1pG2t2r%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5kpXOICqCBYFIF_BSKNEF0nbPftWzTSAyRmBFMMWREaDWI8DVgXJaZYp3ekQ_aem_RYdGD0rH-sSFSOa0pRqV2g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',333,8,'2025-11-08 22:15:00','2025-11-08 22:15:45'),(20,2,'Đạo luật Nhân tính','Chính phủ lo sợ về trí tuệ cảm xúc của robot và ban hành Đạo luật cấm mọi biểu hiện cảm xúc nhân tạo. Kỹ sư phải tìm cách bảo vệ người bạn robot của mình.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1cqkGRelpHFnIo6bdfiL_VM_GO1pG2t2r%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5kpXOICqCBYFIF_BSKNEF0nbPftWzTSAyRmBFMMWREaDWI8DVgXJaZYp3ekQ_aem_RYdGD0rH-sSFSOa0pRqV2g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',415,8,'2025-11-08 22:20:00','2025-11-08 22:21:05'),(21,1,'Huyền thoại về Sói Mặt Trăng','Mở đầu câu chuyện về một tộc người sói cuối cùng sống trên dãy núi Andes, những người nắm giữ bí mật về cách thuần hóa ánh trăng để chữa bệnh.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1heEdgfx5V_L21QlG3apBHnM_8qBHNoVl%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4q4a2sAMPJvEP2Mcw2wGHVshZR8ZGQOtUgqPzQInH_N3kdcXpBl8JetUZtoQ_aem_mJXdiuZwrOOd62vhl_hSSg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',280,9,'2025-11-08 22:25:00','2025-11-08 22:25:35'),(22,2,'Cuộc săn lùng Kim cương Đen','Một thợ săn kho báu tham lam quyết tâm truy tìm viên Kim cương Đen, nguồn năng lượng của Sói Mặt Trăng, gây ra mối đe dọa hủy diệt tộc người sói.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1heEdgfx5V_L21QlG3apBHnM_8qBHNoVl%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4q4a2sAMPJvEP2Mcw2wGHVshZR8ZGQOtUgqPzQInH_N3kdcXpBl8JetUZtoQ_aem_mJXdiuZwrOOd62vhl_hSSg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',470,9,'2025-11-08 22:30:00','2025-11-08 22:31:01'),(23,1,'Cánh đồng Điện thoại','Một ngôi làng nhỏ ở châu Phi bỗng trở thành trung tâm của một hiện tượng siêu nhiên: tất cả điện thoại di động bị hỏng bỗng hoạt động trở lại, kết nối với một mạng lưới không gian.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1TjQ8Y2zXsxmCLoYtq_gOr9SDI4crqGr2%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',505,10,'2025-11-08 22:35:00','2025-11-08 22:36:10'),(24,2,'Người gọi từ Sao Thổ','Những cư dân làng bắt đầu nhận được các cuộc gọi không xác định. Giọng nói trong điện thoại tiết lộ họ là những người du hành thời gian bị mắc kẹt.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1TjQ8Y2zXsxmCLoYtq_gOr9SDI4crqGr2%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',360,10,'2025-11-08 22:40:00','2025-11-08 22:41:00'),(25,3,'Mật mã Vô cực','Chương này giải mã thông điệp cuối cùng được gửi từ tương lai, một mật mã chứa đựng công thức cứu Trái Đất khỏi một thảm họa sắp xảy ra.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1TjQ8Y2zXsxmCLoYtq_gOr9SDI4crqGr2%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR6K56LoNlQyzClR1_ameqXzeepODzqOOoodtgOIfjeg0QJVBzDhwivPSvok8Q_aem_kSWUKstzg5c3zr6yslhbTg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',444,10,'2025-11-08 22:45:00','2025-11-08 22:46:08'),(26,1,'Vụ mất tích của Lão già Câu cá','Giới thiệu về vụ án mất tích bí ẩn tại một thị trấn ven biển yên bình, nơi manh mối duy nhất là một con cá vàng biết nói.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D13yM_JdlEJjaHvtPMOZsZtbW4tdSKjf-E%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7RLe3xXFxBjMiOqc8WtJo4Xt0FAWTJQHkSrP3Z33OZRi4ffRgwFzlxbNqNdg_aem_UVyaWCx1ED4IpY3QIxOTHw&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',305,11,'2025-11-08 22:50:00','2025-11-08 22:50:55'),(27,2,'Bản đồ hình Vảy Cá','Thám tử truy tìm ra bản đồ được giấu kín dưới lớp vảy của con cá vàng, dẫn đến một kho báu bị cướp trong Thế chiến thứ nhất.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D13yM_JdlEJjaHvtPMOZsZtbW4tdSKjf-E%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7RLe3xXFxBjMiOqc8WtJo4Xt0FAWTJQHkSrP3Z33OZRi4ffRgwFzlxbNqNdg_aem_UVyaWCx1ED4IpY3QIxOTHw&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',389,11,'2025-11-08 22:55:00','2025-11-08 22:55:49'),(28,1,'Vườn cây ăn thịt','Một nhà thực vật học phát hiện ra một khu vườn bí mật, nơi các loài cây không chỉ biết di chuyển mà còn có trí thông minh và bắt đầu săn mồi vào ban đêm.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1DzDqZB11ehQr_2mP4tUdpuGnCXWtjzYR&version=fix_lan_cuoi',430,12,'2025-11-08 23:00:00','2025-11-08 23:01:05'),(29,2,'Cuộc chạy trốn của Hạt giống','Để ngăn chặn sự bành trướng của khu vườn, anh ta phải tìm được \'Hạt giống Mẹ\', thứ đang kiểm soát mọi cây cối và có ý định chiếm lấy thế giới.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1DzDqZB11ehQr_2mP4tUdpuGnCXWtjzYR&version=fix_lan_cuoi',322,12,'2025-11-08 23:05:00','2025-11-08 23:06:01'),(30,3,'Trận chiến của Cây Trúc','Trận chiến cuối cùng diễn ra trong rừng tre, nơi nhân vật chính sử dụng âm nhạc dân gian để làm tê liệt các loài cây ăn thịt.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1DzDqZB11ehQr_2mP4tUdpuGnCXWtjzYR&version=fix_lan_cuoi',550,12,'2025-11-08 23:10:00','2025-11-08 23:11:18'),(31,1,'Bức tượng biết nhảy múa','Tại một bảo tàng nghệ thuật hiện đại, một bức tượng điêu khắc vô tri vô giác bỗng dưng bắt đầu nhảy múa vào nửa đêm, chỉ khi có một người xem duy nhất.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1EAxe7iR1zoMlRZYEwno3b4yawprCMyzY&version=fix_lan_cuoi',295,13,'2025-11-08 23:15:00','2025-11-08 23:15:45'),(32,2,'Sự thật về Người nghệ sĩ','Tìm hiểu về cuộc đời bi kịch của nghệ sĩ đã tạo ra bức tượng, người đã phong ấn linh hồn mình vào tác phẩm để được sống mãi với đam mê.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1EAxe7iR1zoMlRZYEwno3b4yawprCMyzY&version=fix_lan_cuoi',480,13,'2025-11-08 23:20:00','2025-11-08 23:21:03'),(33,1,'Người đàn ông vô hình','Một thám tử tư được thuê để tìm kiếm một người đàn ông tuyên bố mình đã trở nên vô hình sau một thí nghiệm hóa học thất bại tại nhà kho bỏ hoang.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=10Fyw5ibjmyNe1u3BDu2bYpYBJqWGFtMu&version=fix_lan_cuoi',375,14,'2025-11-08 23:25:00','2025-11-08 23:25:58'),(34,2,'Hóa chất Lam','Thám tử khám phá ra rằng người đàn ông không vô hình, mà là anh ta bị phủ bởi một lớp hóa chất khiến ánh sáng không phản chiếu, và thuốc giải là mật ong hiếm.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=10Fyw5ibjmyNe1u3BDu2bYpYBJqWGFtMu&version=fix_lan_cuoi',315,14,'2025-11-08 23:30:00','2025-11-08 23:30:50'),(35,1,'Thủ thuật của Tiên Tri Mèo','Trong một thế giới hậu tận thế, con người phải sống nhờ sự dẫn dắt của một con mèo Xiêm có khả năng dự đoán thiên tai qua tiếng kêu.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1t6sB9M14CB6phK9GuBHHw_RdoPGunD6_&version=fix_lan_cuoi',420,15,'2025-11-08 23:35:00','2025-11-08 23:35:49'),(36,2,'Cuộc săn Cây Thông Sống','Để củng cố sức mạnh của thị trấn, nhóm lính đánh thuê phải đi tìm Cây Thông Sống trong Khu Rừng Cấm, nhưng đó là một cái bẫy của Tiên Tri Mèo.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1t6sB9M14CB6phK9GuBHHw_RdoPGunD6_&version=fix_lan_cuoi',500,15,'2025-11-08 23:40:00','2025-11-08 23:41:00'),(37,3,'Bài học về Lòng tin','Tiên Tri Mèo không phải là kẻ xấu, mà nó đang cố gắng dạy con người bài học về lòng tin và sự tự chủ, thay vì phụ thuộc vào một thế lực duy nhất.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1t6sB9M14CB6phK9GuBHHw_RdoPGunD6_&version=fix_lan_cuoi',330,15,'2025-11-08 23:45:00','2025-11-08 23:46:01'),(38,1,'Chiếc ô Thời gian','Một cô bé học sinh phát hiện ra chiếc ô cũ của bà có khả năng đưa cô bé quay ngược thời gian 5 phút, đủ để sửa chữa những sai lầm nhỏ.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1P8qPNWG6UqVd2N8i2hFyGfbSuF5tjTDk&version=fix_lan_cuoi',255,16,'2025-11-08 23:50:00','2025-11-08 23:50:45'),(39,2,'Hiệu ứng Cánh bướm','Việc lạm dụng chiếc ô đã tạo ra những biến động lớn trong thực tại. Cô bé phải hợp tác với một nhà khoa học tương lai để cứu dòng thời gian.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1P8qPNWG6UqVd2N8i2hFyGfbSuF5tjTDk&version=fix_lan_cuoi',400,16,'2025-11-08 23:55:00','2025-11-08 23:56:00'),(40,1,'Bữa tiệc cuối cùng của Đại dương','Một cuốn sách ẩm thực giả tưởng, nơi các đầu bếp tranh tài bằng cách sử dụng các nguyên liệu từ các vùng biển sâu chưa được khám phá.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1zthqJIXdV3itT5QsTcDESniI7p-SO26W&version=fix_lan_cuoi',365,17,'2025-11-09 00:00:00','2025-11-09 00:01:05'),(41,2,'Công thức Ánh sáng','Đầu bếp chính phải đối mặt với đối thủ truyền kiếp, người đã đánh cắp \'Công thức Ánh sáng\', món ăn duy nhất có khả năng xoa dịu các vị thần biển cả.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1zthqJIXdV3itT5QsTcDESniI7p-SO26W&version=fix_lan_cuoi',470,17,'2025-11-09 00:05:00','2025-11-09 00:06:05'),(42,3,'Vị mặn của Quá khứ','Trong trận chung kết, anh ta quyết định nấu một món ăn đơn giản, gợi nhớ về hương vị tuổi thơ, chứng minh rằng ẩm thực đích thực đến từ tâm hồn.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1zthqJIXdV3itT5QsTcDESniI7p-SO26W&version=fix_lan_cuoi',310,17,'2025-11-09 00:10:00','2025-11-09 00:10:48'),(43,1,'Cuộc xâm lăng của Ốc sên','Báo cáo về một dịch bệnh toàn cầu: Ốc sên đột biến gen tấn công các thành phố lớn, chúng có lớp vỏ chống đạn và tốc độ kinh hoàng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1dehSSnPnbfRoee-Loh9YxO3SXtsD7sps&version=fix_lan_cuoi',288,18,'2025-11-09 00:15:00','2025-11-09 00:15:39'),(44,2,'Hội đồng Muối','Các nhà khoa học phát hiện ra điểm yếu duy nhất của Ốc sên là muối, dẫn đến một chiến dịch toàn cầu sử dụng muối biển để ngăn chặn cuộc xâm lăng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1dehSSnPnbfRoee-Loh9YxO3SXtsD7sps&version=fix_lan_cuoi',450,18,'2025-11-09 00:20:00','2025-11-09 00:21:01'),(45,1,'Làn sóng im lặng','Một cô gái mắc chứng mất ngủ mãn tính phát hiện ra rằng cô là người duy nhất không bị ảnh hưởng bởi một làn sóng âm thanh tần số thấp khiến toàn bộ thành phố chìm vào giấc ngủ sâu.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1xc7MWsyFs7rCKbFilCUFlGpYbSkvRxok&version=fix_lan_cuoi',340,19,'2025-11-09 00:25:00','2025-11-09 00:25:55'),(46,2,'Căn phòng Khóa kép','Cô gái phải lẻn vào một căn phòng bí mật dưới lòng đất, nơi nguồn phát sóng được đặt, và đối mặt với người tạo ra nó - một nhà khoa học muốn \'nghỉ ngơi\' cho nhân loại.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1xc7MWsyFs7rCKbFilCUFlGpYbSkvRxok&version=fix_lan_cuoi',510,19,'2025-11-09 00:30:00','2025-11-09 00:31:18'),(47,3,'Thức tỉnh trong Mơ','Sự thật là cô gái cũng đang ngủ, và cách duy nhất để thức tỉnh là thuyết phục nhà khoa học rằng cuộc sống thực có ý nghĩa hơn giấc mơ hoàn hảo.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1xc7MWsyFs7rCKbFilCUFlGpYbSkvRxok&version=fix_lan_cuoi',466,19,'2025-11-09 00:35:00','2025-11-09 00:36:02'),(48,1,'Áo khoác của Thần Lừa Lọc','Một tên trộm vặt nhặt được chiếc áo khoác cũ trong thùng rác, chiếc áo có khả năng thay đổi nhận dạng của hắn, biến hắn thành bất kỳ ai hắn chạm vào.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1m7SnkKw9wMXYkAgB6_ZzFWO9WXCSJ2cA&version=fix_lan_cuoi',325,20,'2025-11-09 00:40:00','2025-11-09 00:40:55'),(49,2,'Bẫy của Nữ hoàng','Hắn bị một nữ hoàng tội phạm lừa vào một vụ cướp lớn. Chiếc áo khoác trở nên không ổn định, đe dọa biến hắn thành hàng trăm người cùng một lúc.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1m7SnkKw9wMXYkAgB6_ZzFWO9WXCSJ2cA&version=fix_lan_cuoi',490,20,'2025-11-09 00:45:00','2025-11-09 00:46:01'),(50,1,'Dòng sông không nước','Chương mở đầu của một bộ tiểu thuyết triết học, nơi dòng sông của thành phố đã biến mất một cách bí ẩn, chỉ còn lại những con thuyền mắc cạn trên cát trắng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1c-NZ_OQuLbBYXLEBGrTBmwVWfEnYHUzY&version=fix_lan_cuoi',377,21,'2025-11-09 00:50:00','2025-11-09 00:50:50'),(51,2,'Lời cầu nguyện của Thủy thủ','Tìm hiểu về truyền thuyết địa phương: dòng sông đã biến mất vì bị xúc phạm bởi lời nói dối của một thủy thủ. Chỉ có lời thú tội chân thành mới có thể đưa nước trở lại.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1c-NZ_OQuLbBYXLEBGrTBmwVWfEnYHUzY&version=fix_lan_cuoi',440,21,'2025-11-09 00:55:00','2025-11-09 00:56:09'),(52,1,'Khóa học nấu ăn với Người tuyết','Một cuốn sách hướng dẫn hài hước, nơi một đầu bếp bị trục xuất đến Bắc Cực và phải dạy nấu ăn cho một cộng đồng người tuyết chỉ biết ăn đá.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1EWwHb6waNz2qwjlIxqaTdkpXHhdTpqF0&version=fix_lan_cuoi',300,22,'2025-11-09 01:00:00','2025-11-09 01:00:35'),(53,2,'Bí kíp kem Lửa','Công thức làm món kem duy nhất có thể làm ấm cơ thể người tuyết mà không làm họ tan chảy, được làm từ các loại gia vị núi lửa hiếm.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1EWwHb6waNz2qwjlIxqaTdkpXHhdTpqF0&version=fix_lan_cuoi',405,22,'2025-11-09 01:05:00','2025-11-09 01:05:55'),(54,1,'Cuộc họp của những chiếc Ghế','Một cuốn sách kinh dị tâm lý, nơi một nhà văn phát hiện ra đồ nội thất trong nhà anh ta tổ chức các cuộc họp bí mật vào lúc 3 giờ sáng.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1ygaiUqJdl_JS08HPTM8yKessV5Zw6fnn%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR719dKFHhULVC8YMoGBV6w1MvJieKmJ4B-n8WJVEE58wO12RAROcM1XZ15a6A_aem_FSJSel5JN4ts1FttSKCrOg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',450,23,'2025-11-09 01:10:00','2025-11-09 01:11:10'),(55,2,'Quyết định của Chiếc Bàn','Chiếc bàn quyết định rằng nhà văn không còn xứng đáng với ngôi nhà và lên kế hoạch loại bỏ anh ta bằng cách thay đổi cấu trúc của căn phòng.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1ygaiUqJdl_JS08HPTM8yKessV5Zw6fnn%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR719dKFHhULVC8YMoGBV6w1MvJieKmJ4B-n8WJVEE58wO12RAROcM1XZ15a6A_aem_FSJSel5JN4ts1FttSKCrOg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',380,23,'2025-11-09 01:15:00','2025-11-09 01:16:05'),(56,1,'Nụ hôn của Người máy','Một câu chuyện tình lãng mạn khoa học viễn tưởng. Một cô gái yêu một người máy cao cấp nhưng phát hiện ra anh ta được lập trình để... không thể yêu.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1iqIVXdGaFj03uhNHIhJ3F4_Dg3agBHVo&version=fix_lan_cuoi',330,24,'2025-11-09 01:20:00','2025-11-09 01:21:00'),(57,2,'Mã nguồn Trái tim','Cô gái cố gắng tìm và viết lại mã nguồn của người máy, nhưng việc này có thể xóa bỏ hoàn toàn ký ức và nhân cách hiện tại của anh ta.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1iqIVXdGaFj03uhNHIhJ3F4_Dg3agBHVo&version=fix_lan_cuoi',490,24,'2025-11-09 01:25:00','2025-11-09 01:26:05'),(58,1,'Thư viện Mờ Sương','Một thủ thư phát hiện ra rằng mỗi cuốn sách trong thư viện của cô chứa đựng một cánh cổng dẫn đến một chiều không gian khác nhau.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1S8Mqa-aZjx14POy2O3ffwauOjoxTPKga%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4Kcx9VLJfswhPFnGQK9XqvO9GhGvBM5wPS8TCtrKiV9Xu51BWAxTODzMO5Fw_aem_uYC5hrVxRiK9e_bC3LNlig&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',400,25,'2025-11-09 01:30:00','2025-11-09 01:31:00'),(59,2,'Bẫy của Kẻ Đọc','Cô gái bị mắc kẹt trong thế giới của một cuốn sách viễn tưởng tối tăm, và phải hoàn thành nhiệm vụ của nhân vật chính để có thể thoát ra.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1S8Mqa-aZjx14POy2O3ffwauOjoxTPKga%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4Kcx9VLJfswhPFnGQK9XqvO9GhGvBM5wPS8TCtrKiV9Xu51BWAxTODzMO5Fw_aem_uYC5hrVxRiK9e_bC3LNlig&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',555,25,'2025-11-09 01:35:00','2025-11-09 01:36:12'),(60,1,'Tấm gương Nói dối','Một chiếc gương cổ đại được tìm thấy trong một lâu đài bỏ hoang. Chiếc gương này không phản chiếu thực tế, mà phản chiếu những gì bạn muốn tin là thật.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1huT_FZb6GJWoMKaabthy2Bn5A87ZQbLf&version=fix_lan_cuoi',320,26,'2025-11-09 01:40:00','2025-11-09 01:40:55'),(61,2,'Ảo ảnh Nguy hiểm','Những người sử dụng gương bắt đầu đánh mất ý thức về thực tại, tin vào những hình ảnh dối trá của mình. Một cô gái phải đập vỡ chiếc gương để cứu họ.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1huT_FZb6GJWoMKaabthy2Bn5A87ZQbLf&version=fix_lan_cuoi',410,26,'2025-11-09 01:45:00','2025-11-09 01:46:01'),(62,3,'Giá trị của Sự thật','Sau khi gương vỡ, mọi người phải đối mặt với sự thật phũ phàng về bản thân, nhưng điều đó lại mở ra cơ hội để xây dựng lại cuộc sống chân thật.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1huT_FZb6GJWoMKaabthy2Bn5A87ZQbLf&version=fix_lan_cuoi',390,26,'2025-11-09 01:50:00','2025-11-09 01:50:58'),(63,1,'Kỷ nguyên của Gấu Bắc Cực','Trái Đất bị đóng băng vĩnh cửu. Gấu Bắc Cực tiến hóa thành loài thông minh và xây dựng một nền văn minh dựa trên năng lượng từ băng tuyết.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1y0ZzvVG3rtEJpLcRsbhU0fBA-sCg72u4&version=fix_lan_cuoi',280,27,'2025-11-09 01:55:00','2025-11-09 01:55:40'),(64,2,'Lời nguyền của Kẻ Băng giá','Một nhà khoa học gấu Bắc Cực cố gắng giải mã công nghệ cũ của loài người, nhưng vô tình giải phóng một \'Kẻ Băng giá\' đe dọa làm tan chảy toàn bộ thế giới băng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1y0ZzvVG3rtEJpLcRsbhU0fBA-sCg72u4&version=fix_lan_cuoi',500,27,'2025-11-09 02:00:00','2025-11-09 02:01:05'),(65,1,'Khách sạn trên Mây','Một khách sạn sang trọng được xây dựng trên tầng mây của Sao Kim, nơi giới siêu giàu tận hưởng cuộc sống xa hoa tách biệt với những người nghèo sống dưới mặt đất.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1XLQOS0zzsVntZJ9xABHZaFG3YtJiaudx&version=fix_lan_cuoi',450,28,'2025-11-09 02:05:00','2025-11-09 02:06:08'),(66,2,'Lỗ hổng An ninh','Một nhân viên dọn dẹp phát hiện ra một lỗ hổng trong hệ thống an ninh, cho phép anh ta gửi thông điệp cảnh báo về cuộc sống dưới lòng đất lên mây.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1XLQOS0zzsVntZJ9xABHZaFG3YtJiaudx&version=fix_lan_cuoi',395,28,'2025-11-09 02:10:00','2025-11-09 02:10:55'),(67,3,'Cơn bão Bụi Vàng','Cư dân trên mây phải đối mặt với cơn bão Sao Kim chưa từng có. Họ buộc phải liên lạc với những người dưới mặt đất để xin sự giúp đỡ.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1XLQOS0zzsVntZJ9xABHZaFG3YtJiaudx&version=fix_lan_cuoi',470,28,'2025-11-09 02:15:00','2025-11-09 02:16:10'),(68,1,'Hòn đá biết bay','Tại một thị trấn miền núi hẻo lánh, người dân sử dụng những viên đá có khả năng bay lơ lửng để làm phương tiện giao thông chính.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1F_M-s3Y70AV8n4SUZO_6DYnCkh8yiypv&version=fix_lan_cuoi',310,29,'2025-11-09 02:20:00','2025-11-09 02:20:45'),(69,2,'Lệnh cấm Lực hút','Một tập đoàn công nghệ lớn cố gắng mua lại thị trấn để độc quyền công nghệ \'hòn đá biết bay\', nhưng gặp phải sự phản đối mạnh mẽ của người dân.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1F_M-s3Y70AV8n4SUZO_6DYnCkh8yiypv&version=fix_lan_cuoi',440,29,'2025-11-09 02:25:00','2025-11-09 02:26:01'),(70,1,'Ngôi làng của Người Đàn Bà Thép','Mở đầu về một ngôi làng mà tất cả đàn ông đều biến mất, chỉ còn lại những người phụ nữ mạnh mẽ, tự xây dựng lại cuộc sống bằng thép và máy móc.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1AN_VpnEpSUD5g0v5X7EW3TqEJ_72Yms4&version=fix_lan_cuoi',360,30,'2025-11-09 02:30:00','2025-11-09 02:30:50'),(71,2,'Bí mật của Núi Lửa','Họ phát hiện ra rằng những người đàn ông không chết, mà bị một thế lực siêu nhiên đưa lên đỉnh núi lửa để làm công việc không ai biết.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1AN_VpnEpSUD5g0v5X7EW3TqEJ_72Yms4&version=fix_lan_cuoi',520,30,'2025-11-09 02:35:00','2025-11-09 02:36:15'),(72,3,'Tái hợp bằng Máy móc','Những người phụ nữ quyết định xây dựng một cỗ máy khổng lồ để leo lên núi lửa, chiến đấu với thế lực siêu nhiên và đưa những người đàn ông trở về.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1AN_VpnEpSUD5g0v5X7EW3TqEJ_72Yms4&version=fix_lan_cuoi',480,30,'2025-11-09 02:40:00','2025-11-09 02:41:03'),(73,1,'Những người nói chuyện với Bóng tối','Một cuốn tiểu thuyết trinh thám. Nhân vật chính có khả năng nghe được những bí mật mà các bóng tối trong phòng đang thì thầm về những vụ án chưa được giải quyết.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=159xGCvmdC75ZjDo6yvw2_yDN-bvv9awi&version=fix_lan_cuoi',370,31,'2025-11-09 02:45:00','2025-11-09 02:45:58'),(74,2,'Cái bẫy Ánh sáng','Anh ta nhận ra kẻ giết người đang cố gắng bẫy anh ta bằng cách luôn giữ các phòng tràn ngập ánh sáng, khiến bóng tối không thể nói chuyện.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=159xGCvmdC75ZjDo6yvw2_yDN-bvv9awi&version=fix_lan_cuoi',435,31,'2025-11-09 02:50:00','2025-11-09 02:51:02'),(75,1,'Đứa trẻ được sinh ra trong Bão','Một câu chuyện giả tưởng lãng mạn. Một đứa trẻ được sinh ra trên một ngọn hải đăng trong cơn bão thế kỷ, và có khả năng điều khiển thời tiết bằng cảm xúc.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1GStX-mfwbYd0zeQb9qGf--PIv84ZwmIf&version=fix_lan_cuoi',305,32,'2025-11-09 02:55:00','2025-11-09 02:55:45'),(76,2,'Chiếc ô Tình yêu','Lần đầu tiên đứa trẻ cảm nhận được tình yêu, điều đó tạo ra một hiện tượng thời tiết kỳ lạ: mưa cầu vồng và tuyết ấm, gây náo động toàn thế giới.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1GStX-mfwbYd0zeQb9qGf--PIv84ZwmIf&version=fix_lan_cuoi',500,32,'2025-11-09 03:00:00','2025-11-09 03:01:09'),(77,3,'Sự cân bằng Cảm xúc','Đứa trẻ học được cách kiểm soát cảm xúc để giữ cân bằng thời tiết, nhận ra rằng sự bình yên không nằm ở việc loại bỏ bão tố mà là chấp nhận nó.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1GStX-mfwbYd0zeQb9qGf--PIv84ZwmIf&version=fix_lan_cuoi',445,32,'2025-11-09 03:05:00','2025-11-09 03:06:05'),(78,1,'Đại hội của những Con rối','Thế giới do những con rối bằng gỗ tự trị lãnh đạo. Chúng tổ chức một đại hội thường niên để quyết định số phận của những con người còn sót lại.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1kA4JWWg9ipD11RFxVz-t74Fi6VsocoUG&version=fix_lan_cuoi',360,33,'2025-11-09 03:10:00','2025-11-09 03:10:59'),(79,2,'Sợi dây Vô hình','Một cậu bé người thường phát hiện ra rằng những con rối không hề tự trị, mà được điều khiển bởi một sợi dây vô hình kết nối với một thế lực cổ xưa.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1kA4JWWg9ipD11RFxVz-t74Fi6VsocoUG&version=fix_lan_cuoi',420,33,'2025-11-09 03:15:00','2025-11-09 03:16:01'),(80,1,'Nước mắt của Cà phê','Một cuốn sách triết học/hài hước. Một người pha cà phê phát hiện ra rằng những hạt cà phê anh ta sử dụng đều có cảm xúc và khóc khi bị xay.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1NiB8Ik5nlaTx1e-9xPdTuT9n0POwCT44&version=fix_lan_cuoi',290,34,'2025-11-09 03:20:00','2025-11-09 03:20:45'),(81,2,'Lễ rửa tội Hương vị','Anh ta phải tìm ra cách để làm hài lòng những hạt cà phê để chúng tự nguyện hiến dâng mình, dẫn đến một cuộc hành trình tìm kiếm hương vị hoàn hảo.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1NiB8Ik5nlaTx1e-9xPdTuT9n0POwCT44&version=fix_lan_cuoi',470,34,'2025-11-09 03:25:00','2025-11-09 03:26:05'),(82,1,'Bộ nhớ của Đá','Một nhà địa chất phát hiện ra rằng các tảng đá dưới chân núi có thể ghi lại và phát lại ký ức của những người đã từng đứng trên đó.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1f5GGGE5NDYUwLK9ZMJQxVyP5hklrF4fe&version=fix_lan_cuoi',340,35,'2025-11-09 03:30:00','2025-11-09 03:30:50'),(83,2,'Lời thú tội từ Thời tiền sử','Anh ta nghe thấy những bí mật từ hàng triệu năm trước, bao gồm cả một lời thú tội về sự sụp đổ của một nền văn minh bí ẩn.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1f5GGGE5NDYUwLK9ZMJQxVyP5hklrF4fe&version=fix_lan_cuoi',405,35,'2025-11-09 03:35:00','2025-11-09 03:35:55'),(84,1,'Đường hầm dưới Lòng đất','Một đội công nhân xây dựng phát hiện ra một mạng lưới đường hầm phức tạp bên dưới thành phố, dẫn đến một thế giới song song nơi mọi thứ đều ngược lại.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=14_aw7Iwnji5UUq-fGQi_9gr7_mB2kK_D&version=fix_lan_cuoi',500,36,'2025-11-09 03:40:00','2025-11-09 03:41:09'),(85,2,'Phiên bản Phản diện','Trong thế giới song song, họ gặp phiên bản phản diện của chính mình, những người cố gắng ngăn cản họ trở về thế giới thực.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=14_aw7Iwnji5UUq-fGQi_9gr7_mB2kK_D&version=fix_lan_cuoi',355,36,'2025-11-09 03:45:00','2025-11-09 03:45:58'),(86,3,'Bí mật của Chiếc Chìa khóa','Để đóng cánh cổng, họ phải tìm được \'Chiếc Chìa khóa Cân bằng\', một vật thể chỉ có thể tồn tại khi kết hợp cả hai phiên bản của nó từ hai thế giới.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=14_aw7Iwnji5UUq-fGQi_9gr7_mB2kK_D&version=fix_lan_cuoi',420,36,'2025-11-09 03:50:00','2025-11-09 03:51:00'),(87,1,'Vụ trộm Đôi giày Mây','Một câu chuyện hài hước về một tên trộm muốn đánh cắp đôi giày có thể đi trên mây từ một bảo tàng an ninh cao nhất thế giới.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1Ve0LYS9gRIrscxYsLej_8mdN7IXEdTGs&version=fix_lan_cuoi',288,37,'2025-11-09 03:55:00','2025-11-09 03:55:45'),(88,2,'Cuộc truy đuổi trên Không','Tên trộm sử dụng đôi giày để chạy trốn trên bầu trời, dẫn đến một cuộc truy đuổi ngoạn mục với cảnh sát bay lượn.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1Ve0LYS9gRIrscxYsLej_8mdN7IXEdTGs&version=fix_lan_cuoi',400,37,'2025-11-09 04:00:00','2025-11-09 04:01:05'),(89,1,'Bông hoa Vĩnh cửu','Một câu chuyện thần thoại về một bông hoa chỉ nở sau mỗi 1000 năm, và nước mắt của nó có thể chữa lành mọi bệnh tật.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1iI-TlimallM4IHp9be9axTkaVul1F2fO%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5t7un6Zba-QqISgqOyJ8Um5LLna2q16GHaPPV7J1HJ_6mjJIY7isoAuenk5w_aem_S06E2R6TJez-t8Npapow7g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',350,38,'2025-11-09 04:05:00','2025-11-09 04:05:55'),(90,2,'Sự hy sinh của Công chúa','Một công chúa phải vượt qua ba thử thách chết người để đến được bông hoa trước khi nó tàn, hy sinh tuổi trẻ của mình để cứu vương quốc.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1iI-TlimallM4IHp9be9axTkaVul1F2fO%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5t7un6Zba-QqISgqOyJ8Um5LLna2q16GHaPPV7J1HJ_6mjJIY7isoAuenk5w_aem_S06E2R6TJez-t8Npapow7g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',510,38,'2025-11-09 04:10:00','2025-11-09 04:11:18'),(91,1,'Cửa hàng Đồ chơi của Ông già Noel','Một câu chuyện giáng sinh rùng rợn. Một cậu bé phát hiện ra cửa hàng đồ chơi của ông già Noel thực chất là một nhà máy robot cũ bị ma ám.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1gs0S8mHmK4m8G2HgE1fDpKkvsYkZCmm1&version=fix_lan_cuoi',400,39,'2025-11-09 04:15:00','2025-11-09 04:16:01'),(92,2,'Lũ chuột Băng giá','Cậu bé phải chiến đấu với lũ chuột robot được lập trình để phá hoại mọi món đồ chơi, và giải thoát linh hồn của những đứa trẻ bị mắc kẹt.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1gs0S8mHmK4m8G2HgE1fDpKkvsYkZCmm1&version=fix_lan_cuoi',380,39,'2025-11-09 04:20:00','2025-11-09 04:20:55'),(93,1,'Sự trở lại của Khủng long','Một công ty công nghệ lớn tìm ra cách hồi sinh khủng long bằng cách sử dụng DNA từ một con muỗi hóa thạch, nhưng chúng vượt ngoài tầm kiểm soát.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1xGz7UWogeajjV9FOXcoJpCG5hr5YpWY6%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7r1g_zc5WFroxFjuC-Lskoe8CR3v0w0gsx8oR2-YpJQjOR-ufL-QTrIx5mbQ_aem_0ZsVvn6y2TBM_EWTeHOb3w&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',460,40,'2025-11-09 04:25:00','2025-11-09 04:26:09'),(94,2,'Trận chiến trên Tòa nhà Chọc trời','Các nhân viên phải tìm cách sống sót và ngăn chặn khủng long T-Rex săn mồi trên đỉnh các tòa nhà cao tầng của thành phố.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1xGz7UWogeajjV9FOXcoJpCG5hr5YpWY6%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7r1g_zc5WFroxFjuC-Lskoe8CR3v0w0gsx8oR2-YpJQjOR-ufL-QTrIx5mbQ_aem_0ZsVvn6y2TBM_EWTeHOb3w&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',520,40,'2025-11-09 04:30:00','2025-11-09 04:31:10'),(95,1,'Đội quân Gương mặt','Giới thiệu một thế giới nơi con người có thể thay đổi khuôn mặt hàng ngày bằng công nghệ sinh học, nhưng một nhóm nhỏ muốn trở về với khuôn mặt thật.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1P-DoW5gdg0ufVceiatnkmhskaglclOjS%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4Kcx9VLJfswhPFnGQK9XqvO9GhGvBM5wPS8TCtrKiV9Xu51BWAxTODzMO5Fw_aem_uYC5hrVxRiK9e_bC3LNlig&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',300,41,'2025-11-09 04:35:00','2025-11-09 04:35:50'),(96,2,'Cuộc nổi dậy của Lòng trung thực','Cuộc đấu tranh chống lại chính phủ \'Gương mặt Vĩnh cửu\', nơi lòng trung thực về bản thân bị coi là tội ác nghiêm trọng.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1P-DoW5gdg0ufVceiatnkmhskaglclOjS%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4Kcx9VLJfswhPFnGQK9XqvO9GhGvBM5wPS8TCtrKiV9Xu51BWAxTODzMO5Fw_aem_uYC5hrVxRiK9e_bC3LNlig&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',410,41,'2025-11-09 04:40:00','2025-11-09 04:41:01'),(97,1,'Cánh đồng Cỏ biết hát','Một cuốn sách thiếu nhi kỳ ảo. Một cậu bé phát hiện ra một cánh đồng cỏ có thể hát, và cậu bé là người duy nhất nghe thấy bài hát của chúng.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=11TkAY_m1Qdx75nQK__ObksUrK4YzKiQk&version=fix_lan_cuoi',250,42,'2025-11-09 04:45:00','2025-11-09 04:45:40'),(98,2,'Bài ca của Giông tố','Cậu bé phải dạy cánh đồng cỏ hát một bài hát đặc biệt để xoa dịu một cơn giông tố đang tiến đến, bảo vệ ngôi làng nhỏ của mình.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=11TkAY_m1Qdx75nQK__ObksUrK4YzKiQk&version=fix_lan_cuoi',330,42,'2025-11-09 04:50:00','2025-11-09 04:50:55'),(99,1,'Thợ săn Giấc mơ','Một người đàn ông có khả năng đi vào giấc mơ của người khác để tìm kiếm những ký ức bị mất tích, nhưng anh ta phải trả giá bằng việc mất đi ký ức của chính mình.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1PW2CPrsdycppLQDThCy_AEZAHzbEcQ7-%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5t7un6Zba-QqISgqOyJ8Um5LLna2q16GHaPPV7J1HJ_6mjJIY7isoAuenk5w_aem_S06E2R6TJez-t8Npapow7g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',480,43,'2025-11-09 04:55:00','2025-11-09 04:56:05'),(100,2,'Mê cung Tiềm thức','Anh ta bước vào giấc mơ của một tỷ phú bị hôn mê để tìm mật mã ngân hàng, nhưng bị mắc kẹt trong mê cung tiềm thức đầy rẫy nỗi sợ hãi và hối tiếc.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1PW2CPrsdycppLQDThCy_AEZAHzbEcQ7-%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5t7un6Zba-QqISgqOyJ8Um5LLna2q16GHaPPV7J1HJ_6mjJIY7isoAuenk5w_aem_S06E2R6TJez-t8Npapow7g&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',540,43,'2025-11-09 05:00:00','2025-11-09 05:01:18'),(101,1,'Cánh đồng Lúa không Gió','Một ngôi làng nông thôn nơi cây lúa phát triển mà không cần gió. Đây là kết quả của một thí nghiệm khoa học đã thất bại từ lâu.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1PW2CPrsdycppLQDThCy_AEZAHzbEcQ7-&version=fix_lan_cuoi',310,44,'2025-11-09 05:05:00','2025-11-09 05:05:50'),(102,2,'Tiếng thở dài của Đất','Người dân phát hiện ra cánh đồng không gió là do bị hút hết sinh khí. Họ phải thực hiện một nghi lễ để đưa linh hồn của gió trở về.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1PW2CPrsdycppLQDThCy_AEZAHzbEcQ7-&version=fix_lan_cuoi',450,44,'2025-11-09 05:10:00','2025-11-09 05:11:01'),(103,1,'Vua của Chim Cánh Cụt','Một câu chuyện phiêu lưu hài hước. Một thủy thủ bị mắc kẹt ở Nam Cực và được một bầy chim cánh cụt thông minh tôn làm vua.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1z973iJrBTYu002B0a3Vfvd2wcfbGSYsf&version=fix_lan_cuoi',340,45,'2025-11-09 05:15:00','2025-11-09 05:15:45'),(104,2,'Cuộc chiến Trứng Vàng','Vị vua mới phải dẫn dắt bầy chim cánh cụt bảo vệ \'Trứng Vàng\', báu vật có khả năng kiểm soát thời tiết của Nam Cực, khỏi những kẻ săn trộm.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1z973iJrBTYu002B0a3Vfvd2wcfbGSYsf&version=fix_lan_cuoi',505,45,'2025-11-09 05:20:00','2025-11-09 05:21:10'),(105,3,'Bài ca Tự do','Thủy thủ nhận ra chim cánh cụt không cần vua. Anh ta trao lại Trứng Vàng và dạy chúng bài ca tự do, rồi bắt đầu cuộc hành trình trở về.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1z973iJrBTYu002B0a3Vfvd2wcfbGSYsf&version=fix_lan_cuoi',420,45,'2025-11-09 05:25:00','2025-11-09 05:25:59'),(106,1,'Bức tranh bị lãng quên','Một nhà phục chế nghệ thuật phát hiện ra một bí mật bị che giấu dưới lớp sơn của một bức tranh cũ: đó là một lời tiên tri về ngày tận thế.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1wjjNVMQd-63UDf0HAqw819suoEsnFO5a&version=fix_lan_cuoi',380,46,'2025-11-09 05:30:00','2025-11-09 05:30:58'),(107,2,'Màu Đỏ Định mệnh','Lời tiên tri chỉ rõ \'Màu Đỏ Định mệnh\' sẽ gây ra sự hủy diệt. Cô gái phải tìm ra sắc đỏ đó được giấu ở đâu trong thành phố.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1wjjNVMQd-63UDf0HAqw819suoEsnFO5a&version=fix_lan_cuoi',490,46,'2025-11-09 05:35:00','2025-11-09 05:36:02'),(108,1,'Đám cưới trên Tàu điện ngầm','Hai người xa lạ vô tình gặp nhau và quyết định kết hôn ngay lập tức trên chuyến tàu điện ngầm đang chạy, bắt đầu một cuộc hôn nhân kỳ lạ.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1oFXMWNUBeRwbTFNsjgTeztBxze6TUXev&version=fix_lan_cuoi',315,47,'2025-11-09 05:40:00','2025-11-09 05:40:50'),(109,2,'Bí mật của Đường ray','Họ phát hiện ra chuyến tàu họ đang đi không đi đến bất cứ đâu, mà là một vòng lặp thời gian được tạo ra để thử thách tình yêu của họ.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1oFXMWNUBeRwbTFNsjgTeztBxze6TUXev&version=fix_lan_cuoi',440,47,'2025-11-09 05:45:00','2025-11-09 05:46:01'),(110,1,'Nhật ký của Người đưa thư','Một người đưa thư tìm thấy một cuốn nhật ký cũ của một người đồng nghiệp đã biến mất, tiết lộ một âm mưu sử dụng thư từ để kiểm soát tâm trí người dân.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1r6k3GIAfLwXBfCHobZkDwHHXHXB9WZcK&version=fix_lan_cuoi',375,48,'2025-11-09 05:50:00','2025-11-09 05:50:58'),(111,2,'Con tem Ma thuật','Anh ta phát hiện ra \'Con tem Ma thuật\' là chìa khóa để phá vỡ âm mưu. Con tem này có thể biến thư từ thành hiện thực khi được dán lên.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1r6k3GIAfLwXBfCHobZkDwHHXHXB9WZcK&version=fix_lan_cuoi',500,48,'2025-11-09 05:55:00','2025-11-09 05:56:05'),(112,1,'Bản giao hưởng của Cát','Trong một sa mạc nơi âm nhạc bị cấm, một nhạc sĩ trẻ sử dụng cát để tạo ra những âm thanh có thể xoa dịu các cơn bão cát khổng lồ.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1LtSbD43ES0gJ0PUHMVWGvFzkG1jGKz6Q&version=fix_lan_cuoi',315,49,'2025-11-09 06:00:00','2025-11-09 06:01:00'),(113,2,'Nhà độc tài Vĩnh cửu','Nhạc sĩ phải đối mặt với nhà độc tài đã cấm âm nhạc, người hóa ra là người cha đã mất tích từ lâu của anh ta.','https://crimson-voice-0636.dongducnguyen05.workers.dev/?fileId=1LtSbD43ES0gJ0PUHMVWGvFzkG1jGKz6Q&version=fix_lan_cuoi',450,49,'2025-11-09 06:05:00','2025-11-09 06:06:05'),(114,1,'Chuyến tàu cuối cùng đến Sao Hỏa','Chương cuối cùng của series, kể về những người sống sót trên Trái Đất đang lên chuyến tàu cuối cùng để định cư trên Sao Hỏa, mang theo hy vọng cuối cùng của nhân loại.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1LRpX4BCFA4zvUH2EVZUBm-oOyjLv4s-O%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4q4a2sAMPJvEP2Mcw2wGHVshZR8ZGQOtUgqPzQInH_N3kdcXpBl8JetUZtoQ_aem_mJXdiuZwrOOd62vhl_hSSg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',520,50,'2025-11-09 06:10:00','2025-11-09 06:11:15'),(115,2,'Tạm biệt Trái Đất','Những giây phút cuối cùng nhìn về hành tinh xanh. Quyết định được đưa ra: họ sẽ không cố gắng tái tạo Trái Đất trên Sao Hỏa, mà sẽ xây dựng một nền văn minh mới.','https://l.facebook.com/l.php?u=https%3A%2F%2Fcrimson-voice-0636.dongducnguyen05.workers.dev%2F%3FfileId%3D1LRpX4BCFA4zvUH2EVZUBm-oOyjLv4s-O%26version%3Dfix_lan_cuoi%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbE03S3ZDNExZUk00elo1b3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4q4a2sAMPJvEP2Mcw2wGHVshZR8ZGQOtUgqPzQInH_N3kdcXpBl8JetUZtoQ_aem_mJXdiuZwrOOd62vhl_hSSg&h=AT3XBAcmohCSz-z8qh4cxm08zyRb2S2mFJrgdBMxzJUWv9o6Awct3YHeNEAon6TOogNdV7szp7bMBX9EzAm_dTjxN_I2svM23rDGnptp5w2WJ63DsBLH09_0OPCvzr_BU4mNoQ',395,50,'2025-11-09 06:15:00','2025-11-09 06:16:00'),(116,1,'chương 1','','blob:http://localhost:5173/2b0825cf-4215-4b0f-90cb-aa440bc38edb',120,52,'2026-04-26 17:48:51','2026-04-26 17:48:51'),(118,2,'chương 2','','blob:http://localhost:5173/2b0825cf-4215-4b0f-90cb-aa440bc38edb',120,52,'2026-04-26 17:48:51','2026-04-26 17:48:51'),(119,1,'Chuong 1',NULL,'',60,58,'2026-05-12 21:53:27','2026-05-12 21:53:27'),(120,2,'Chuong 2',NULL,'',90,58,'2026-05-12 21:53:27','2026-05-12 21:53:27'),(121,1,'hay',NULL,'blob:http://localhost:5173/3bb5705c-c091-4e3a-a201-f5ff78620a89',60,59,'2026-05-12 21:53:27','2026-05-12 21:53:27'),(122,2,'hay lắm',NULL,'blob:http://localhost:5173/6eaf33bf-6df1-4fb1-881a-5f47cdfe2464',60,59,'2026-05-12 21:53:27','2026-05-12 21:53:27');
/*!40000 ALTER TABLE `audiochapter` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_AfterAudioChapterInsert
AFTER INSERT ON audiochapter FOR EACH ROW
BEGIN
    UPDATE books SET updatedAt = NOW() WHERE id = NEW.bookId;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `author`
--

DROP TABLE IF EXISTS `author`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `author` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `imagineUrl` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `birthday` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `author`
--

LOCK TABLES `author` WRITE;
/*!40000 ALTER TABLE `author` DISABLE KEYS */;
INSERT INTO `author` VALUES (1,'Aristotle','','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/1.png','Triết gia, nhà bác học người Hy Lạp cổ điển. Ông là một trong những môn sinh ưu tú của triết gia Platon, đã có công sáng lập trường phái triết học tiêu dao tại Lyceum cũng như đặt nền móng cho chủ nghĩa Aristoteles.','384 TCN'),(2,'Plato','','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/2.png','Nhà triết học người Athens trong thời kỳ Cổ điển ở Hy Lạp cổ đại, người sáng lập trường phái tư tưởng Platon, và Học viện Platon, cơ sở giáo dục đại học đầu tiên ở thế giới phương Tây.','428/427 TCN'),(3,'Jean-Jacques','Rousseau','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/3.png','Nhà triết học thuộc trào lưu Khai sáng có ảnh hưởng lớn tới Cách mạng Pháp 1789, sự phát triển của lý thuyết xã hội, và sự phát triển của chủ nghĩa dân tộc. Rousseau cũng có nhiều đóng góp cho âm nhạc cả trên phương diện lý luận và sáng tác.','28/6/1712'),(4,'John Stuart','Mill','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/4.png','Triết gia, nhà kinh tế học và chính trị gia người Anh, một trong những đại diện tiêu biểu nhất của triết học khai sáng và chủ nghĩa tự do thế kỷ XIX.','20/5/1806'),(5,'Friedrich','Hayek','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/5.png','Nhà kinh tế học và nhà khoa học chính trị người Anh gốc Áo nổi tiếng. Hayek được biết đến qua lập luận ủng hộ cho chủ nghĩa tư bản trên thị trường tự do để chống lại các tư tưởng xã hội chủ nghĩa đang phát triển trong thế kỷ 20.','8/5/1899'),(6,'Robin','Sharma','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/6.png','Tác giả, diễn giả và chuyên gia huấn luyện phát triển bản thân người Canada gốc Ấn. Ông từng là luật sư trước khi trở thành nhà diễn thuyết truyền cảm hứng nổi tiếng toàn cầu. Sharma được biết đến nhiều nhất qua loạt sách giúp thay đổi tư duy sống tích cực và lãnh đạo bản thân. ','16/6/1964'),(7,'Eckhart','Tolle','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/7.png','Nhà văn, diễn giả và nhà tư tưởng tâm linh nổi tiếng thế giới người Đức','16/2/1948'),(8,'Dale','Carnegie','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/8.png','Diễn giả, nhà văn và chuyên gia đào tạo kỹ năng giao tiếp người Mỹ. Xuất thân nghèo khó nhưng với nỗ lực và ý chí mạnh mẽ, ông đã trở thành người tiên phong trong lĩnh vực phát triển bản thân và giao tiếp ứng xử. ','24/11/1888'),(9,'Nam Cao','','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/9.png','Cây bút hiện thực xuất sắc với văn phong giàu chiều sâu, nhân đạo và phân tích tâm lý tinh tế. Ông được xem là người mở đường cho văn học hiện thực hiện đại Việt Nam.','29/10/1917'),(10,'Trọng Phụng','Vũ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/10.png','Nhà văn hiện thực xuất sắc trước Cách mạng Tháng Tám. Cuộc đời ngắn ngủi nhưng ông để lại nhiều tác phẩm lớn như Giông tố, Vỡ đê, Làm đĩ, thể hiện khả năng quan sát tinh tế, ngòi bút trào phúng sắc sảo và tinh thần phê phán xã hội mạnh mẽ.','20/10/1912'),(11,'Sơn Tùng','','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/11.png','Nhà văn chuyên viết về Chủ tịch Hồ Chí Minh. Ông từng tham gia kháng chiến chống Pháp và sau đó cống hiến trọn đời cho văn học cách mạng.','21/9/1928'),(12,'Lai','Chu','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/12.png','Tên thật là Chu Văn Lai, là nhà văn - cựu chiến binh nổi tiếng của văn học Việt Nam đương đại. Ông từng tham gia chiến đấu ở chiến trường miền Nam và sau này chuyển sang sáng tác văn học, chuyên viết về chiến tranh và hậu chiến.','5/2/1946'),(13,'Tất Tố','Ngô','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/13.png','Nhà văn, nhà báo và dịch giả tiêu biểu của trào lưu hiện thực. Ông để lại nhiều tác phẩm giá trị như Việc làng, Lều chõng, thể hiện ngòi bút sắc bén, tinh thần nhân đạo và lòng cảm thông với người nông dân nghèo.','20/4/1893'),(14,'Nhật Ánh','Nguyễn','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/14.png','Nhà văn viết cho tuổi trẻ nổi tiếng nhất Việt Nam. Với văn phong giản dị, dí dỏm và đầy cảm xúc, ông để lại nhiều tác phẩm được yêu thích như Kính vạn hoa, Cho tôi xin một vé đi tuổi thơ, Tôi thấy hoa vàng trên cỏ xanh.','7/5/1955'),(15,'Công Hoan','Nguyễn','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/15.png','Cây bút trào phúng hàng đầu của văn học Việt Nam giai đoạn 1930-1945. Văn ông giàu tính hiện thực, dí dỏm, mang tính phê phán mạnh.','6/3/1903'),(16,'Dữ','Nguyễn','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/16.png','Nhà văn thời Lê sơ, được coi là “người mở đầu cho văn xuôi tự sự Việt Nam”. Ông nổi tiếng với Truyền kỳ mạn lục gồm 20 truyện, thể hiện tinh thần nhân đạo và nghệ thuật kể chuyện giàu tưởng tượng.','Thế kỉ XVI'),(17,'William','Golding','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/17.png','Nhà văn, nhà thơ, nhà phê bình người Anh, đoạt giải Nobel Văn học năm 1983. Ông từng tham gia Chiến tranh Thế giới II, trải nghiệm đó ảnh hưởng mạnh mẽ đến các tác phẩm của ông. Ngoài Chúa ruồi, ông còn có The Spire, Rites of Passage, Free Fall, thể hiện cái nhìn bi quan nhưng sâu sắc về bản chất con người.','19/9/1911'),(18,'Khaled','Hosseini','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/18.png','Bác sĩ và nhà văn người Mỹ gốc Afghanistan. Ông nổi tiếng nhờ phong cách kể chuyện cảm động, đậm chất nhân văn. Ngoài Người đua diều, ông còn có Ngàn mặt trời rực rỡ và Và những ngọn núi vọng lại, đều là những tác phẩm bán chạy toàn cầu, phản ánh sâu sắc thân phận con người trong chiến tranh và tha hương.','4/3/1965'),(19,'Wendelin Van','Draanen','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/19.png','Nhà văn Mỹ chuyên viết cho lứa tuổi thiếu niên. Bà nổi tiếng với loạt truyện Sammy Keyes và tiểu thuyết Flipped, tác phẩm đã được chuyển thể thành phim năm 2010. Văn phong của bà gần gũi, hài hước và truyền cảm hứng về sự trưởng thành và lòng nhân ái.','6/1/1965'),(20,'John','Boyne','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/20.png','Nhà văn người Ireland, nổi tiếng với các tác phẩm mang đề tài lịch sử và chiến tranh. Ngoài Chú bé mang pyjama sọc , ông còn viết The Heart\'s Invisible Furies, A Ladder to the Sky, thể hiện phong cách nhân văn, giản dị và cảm động.','30/4/1971'),(21,'George','Orwell','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/21.png','Tên thật là Eric Arthur Blair, là nhà văn, nhà báo người Anh. Ông nổi tiếng với lối viết sắc sảo, phê phán chủ nghĩa toàn trị và tuyên truyền chính trị. Ngoài 1984, ông còn có Trại súc vật (Animal Farm), đều là những tác phẩm kinh điển phản ánh quyền lực và sự thao túng con người.','25/6/1903'),(22,'Paulo','Coelho','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/22.png','Nhà văn người Brazil, nổi tiếng với phong cách triết lý và truyền cảm hứng. Nhà giả kim là tác phẩm đưa ông lên hàng nhà văn có sách bán chạy nhất thế giới. Ngoài ra, ông còn có Veronika quyết chết để được sống, Brida, Phù thủy phố Portobello.','24/8/1947'),(23,'Higashino','Keigo','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/23.png','Nhà văn trinh thám hàng đầu Nhật Bản. Ông nổi tiếng với khả năng kết hợp yếu tố tội phạm, tâm lý và nhân văn sâu sắc. Những tác phẩm tiêu biểu của ông gồm Phía sau nghi can X, Bạch dạ hành, Thánh giá rỗng, và Điều kỳ diệu của tiệm tạp hóa Namiya.','4/2/1958'),(24,'Chang-in','Cho','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/24.png','Nhà văn đương đại nổi tiếng của Hàn Quốc. Văn phong của Jo Chang-in được đánh giá là giản dị, chân thành, sâu sắc, thường khai thác tình cảm gia đình, sự hi sinh và giá trị nhân văn trong cuộc sống. Các tác phẩm của ông thường khiến người đọc rơi nước mắt nhưng cũng thấy ấm lòng, vì chứa đựng tình yêu thương và niềm tin vào con người.','1953'),(25,'Tara','Westover','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/25.png','Là nhà văn và học giả trẻ, Tara được xem như biểu tượng của sức mạnh tri thức và giáo dục khai phóng. Được học là tác phẩm đầu tay và cũng là kiệt tác giúp cô nổi tiếng toàn cầu, được dịch ra hơn 30 ngôn ngữ và nằm trong danh sách The New York Times Best Seller suốt nhiều năm liền.','27/9/1986'),(26,'Maria','Montessori','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/26.png','Bác sĩ, nhà giáo dục người Ý, người sáng lập phương pháp giáo dục Montessori. Bà là một trong những người đầu tiên đề xuất việc dạy học lấy trẻ làm trung tâm, tôn trọng nhu cầu phát triển tự nhiên của trẻ. Trong suốt sự nghiệp, bà đã mở hàng trăm trường học Montessori trên khắp thế giới và ảnh hưởng sâu rộng tới nền giáo dục hiện đại.','31/8/1870'),(27,'Yukichi','Fukuzawa','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/27.png','Nhà tư tưởng, nhà giáo dục, nhà cải cách xã hội người Nhật. Ông là người sáng lập Đại học Keio - một trong những đại học danh tiếng nhất Nhật Bản hiện nay. Tư tưởng của Fukuzawa đề cao giáo dục, khoa học, lý trí và tự do cá nhân, góp phần quan trọng vào công cuộc hiện đại hóa đất nước.','10/1/1835'),(28,'Frank','McCourt','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/28.png','Nhà văn, nhà giáo người Ireland - Mỹ. Ông nổi tiếng với loạt hồi ký tự truyện giàu cảm xúc, phản ánh cuộc đời từ nghèo khó đến thành công nhờ tri thức và nghị lực. McCourt từng giành giải Pulitzer cho cuốn Angela’s Ashes (Tro tàn Angela), một trong những tác phẩm tự truyện xuất sắc nhất thế kỷ XX. Ngoài ra, ông còn viết ‘Tis và Teacher Man, tạo nên bộ ba hồi ký gắn liền tên tuổi của mình.','19/8/1930'),(29,'Hân','Trần','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/29.png','Bà là tác giả chuyên viết về kỹ năng sống và giáo dục gia đình. Các tác phẩm khác cùng chủ đề gồm Cha mẹ Do Thái dạy con như thế nào và Trí tuệ Do Thái trong giáo dục hiện đại.',NULL),(30,'Kyuichi','Kimura','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/30.png','Một giáo viên tiếng Anh, tâm lý học, logic học nổi tiếng và tài bà. Ông được biết đến là một nhà tâm lý học giáo dục học nổi tiếng về phương pháp giáo dục âm nhạc từ sớm. Kimura Kyuichi đã dịch các điển tích, tham gia chỉnh sửa và biên tập lại cuốn Bách khoa toàn thư hiện đại đầu tiên tại Nhật Bản. Ông cũng đã từng giữ vị trí Tổng biên tập tạp chí Thời đại. Là một tác giả nổi tiếng với phương pháp giáo dục từ sớm ông đã có những tác phẩm tâm huyết với mong muốn rằng các thế hệ trẻ ngày càng thông minh hơn và cố gắng hoàn thiện bản thân mình hơn nữa.','1883'),(31,'John','Medina','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/31.png','Tiến sĩ chuyên ngành sinh học phân tử và là nhà nghiên cứu thần kinh học người Mỹ. Ông giảng dạy tại Đại học Washington và là người sáng lập Trung tâm Nghiên cứu Ứng dụng về Não bộ. Các công trình của ông tập trung vào mối liên hệ giữa não bộ và hành vi con người, đặc biệt trong học tập và phát triển trẻ em. Một số tác phẩm nổi bật khác của ông gồm Brain Rules, Brain Rules for Aging Well và Attack of the Teenage Brain!.','5/9/1985'),(32,'Robert T.','Kiyosaki','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/32.png','Doanh nhân, nhà đầu tư, diễn giả và tác giả người Mỹ gốc Nhật. Ông nổi tiếng với loạt sách Rich Dad bán chạy toàn cầu, được dịch ra hơn 50 ngôn ngữ. Kiyosaki là người sáng lập công ty Rich Dad Company – chuyên đào tạo về tài chính cá nhân và đầu tư. Các tác phẩm nổi bật khác của ông gồm Cashflow Quadrant, Rich Dad’s Guide to Investing và The Business of the 21st Century.','8/4/1947'),(33,'Tim ','Marshall','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/33.png','Nhà báo, tác giả và chuyên gia phân tích địa - chính trị người Anh. Ông từng là phóng viên của BBC và Sky News, đưa tin tại hơn 40 quốc gia. Marshall được biết đến với phong cách viết dễ hiểu, hấp dẫn và giàu tính thời sự. Một số tác phẩm nổi bật khác của ông gồm The Power of Geography, Divided: Why We’re Living in an Age of Walls và The Future of Geography.','1/5/1959'),(34,'Stephen','Hawking','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/34.png','Nhà vật lý lý thuyết, vũ trụ học và tác giả người Anh. Ông nổi tiếng với những nghiên cứu về hố đen và nguồn gốc vũ trụ, được xem là biểu tượng của trí tuệ và nghị lực phi thường khi vẫn làm khoa học dù mắc bệnh ALS. Các tác phẩm khác của ông gồm Lược sử thời gian, Vũ trụ khổng lồ trong lòng bàn tay và Trả lời những câu hỏi lớn.','8/1/1942'),(35,'Yuval Noah','Harari','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/35.png','Nhà sử học và triết gia người Israel, giảng dạy tại Đại học Hebrew ở Jerusalem. Ông được biết đến với các tác phẩm nổi tiếng như Homo Deus: Lược sử tương lai và 21 bài học cho thế kỷ 21, có ảnh hưởng sâu rộng trong giới học thuật và đại chúng.','24/2/1976'),(36,'Brian','Greene','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/36.png','Nhà vật lý lý thuyết, nhà vũ trụ học và tác giả người Mỹ, đồng thời là giáo sư tại Đại học Columbia. Ông được biết đến là một trong những người tiên phong nghiên cứu về Lý thuyết dây (String Theory) – lĩnh vực tìm cách thống nhất thuyết tương đối rộng và cơ học lượng tử.','9/2/1963'),(37,'Jim','Collins','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/37.png','Nhà nghiên cứu, giảng viên và cố vấn doanh nghiệp người Mỹ. Ông nổi tiếng với các công trình về quản trị và phát triển tổ chức. Những tác phẩm khác gồm Built to Last, Great by Choice và How the Mighty Fall.','25/1/1958'),(38,'Nhiều tác giả','','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/38.png','',''),(39,'Camilo','Cruz','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/39.png','Tiến sĩ, diễn giả truyền cảm hứng và tác giả người Colombia. Ông nổi tiếng với các bài nói chuyện và sách kỹ năng sống, giúp hàng triệu người phát triển bản thân. Một số tác phẩm khác của ông gồm The Power of Your Story và La vaca: Cómo eliminar las excusas que nos impiden triunfar.','1960'),(40,'Bảo Châu','Ngô','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/40.png','Nhà toán học người Việt Nam, hiện là giáo sư tại Đại học Chicago (Hoa Kỳ). Ông nổi tiếng trên toàn thế giới với chứng minh Bổ đề cơ bản trong chương trình Langlands, một công trình mang tính đột phá giúp ông trở thành người Việt Nam đầu tiên nhận Giải thưởng Fields năm 2010 – giải thưởng cao quý nhất trong ngành Toán học.','28/6/1972'),(41,'Phương Mai','Nguyễn','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/41.png','Nhà báo, nhà nghiên cứu và giảng viên nổi tiếng của Việt Nam. Bà được biết đến như một chuyên gia hàng đầu về giao tiếp đa văn hóa và quản trị đa dạng, đồng thời là tác giả của nhiều cuốn sách giá trị.','27/11/1976'),(42,'Takeshi','Furukawa','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/42.png','Nhà huấn luyện kỹ năng và tác giả người Nhật. Ông nổi tiếng với các bài giảng và sách về phát triển bản thân, hướng con người tới sự cân bằng giữa tinh thần và công việc.','31/8/1978'),(43,'Thùy Trâm','Đặng','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/43.png','Nữ bác sĩ, liệt sĩ người Việt Nam, sinh tại Hà Nội. Bà tốt nghiệp Đại học Y Hà Nội, tình nguyện vào chiến trường miền Nam làm bác sĩ quân y. Trong quá trình công tác, bà đã viết nhật ký ghi lại tâm tư, lý tưởng và tình yêu đất nước cháy bỏng giữa bom đạn. Bà hi sinh khi mới 28 tuổi. Cuốn nhật ký của bà được một sĩ quan Mỹ lưu giữ suốt nhiều năm trước khi được trao lại cho gia đình, trở thành hiện tượng văn học xúc động và góp phần khơi dậy lòng yêu nước, trân trọng hòa bình trong nhiều thế hệ độc giả.','26/11/1942'),(44,'','duyen','','Tác giả mới',NULL),(45,'','','','Tác giả mới',NULL),(46,'','','','Tác giả mới',NULL);
/*!40000 ALTER TABLE `author` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authorsofbooks`
--

DROP TABLE IF EXISTS `authorsofbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `authorsofbooks` (
  `AuthorId` int(11) NOT NULL,
  `BookId` int(11) NOT NULL,
  PRIMARY KEY (`AuthorId`,`BookId`),
  UNIQUE KEY `idx_aob_book_author` (`BookId`,`AuthorId`),
  KEY `idx_aob_author_only` (`AuthorId`),
  CONSTRAINT `fk_aob_author` FOREIGN KEY (`AuthorId`) REFERENCES `author` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_aob_book` FOREIGN KEY (`BookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorsofbooks`
--

LOCK TABLES `authorsofbooks` WRITE;
/*!40000 ALTER TABLE `authorsofbooks` DISABLE KEYS */;
INSERT INTO `authorsofbooks` VALUES (1,59),(2,2),(3,3),(3,36),(4,4),(4,57),(4,58),(5,5),(6,6),(6,7),(6,45),(7,8),(8,9),(8,10),(9,11),(9,20),(10,12),(10,15),(11,13),(12,14),(13,16),(14,17),(15,18),(16,19),(17,21),(18,22),(18,29),(19,23),(20,24),(21,25),(21,26),(22,27),(23,28),(24,30),(25,31),(26,32),(27,33),(28,34),(29,35),(30,37),(31,38),(32,39),(33,40),(34,41),(35,42),(36,43),(37,44),(38,45),(39,46),(40,47),(41,48),(42,49),(43,50),(44,51),(44,52),(45,53),(45,54),(45,56);
/*!40000 ALTER TABLE `authorsofbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (2,'Cộng Hòa','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/2_2.png','Cộng hòa (tiếng Hy Lạp: Politeia) là tác phẩm triết học nổi tiếng nhất của Plato, được viết khoảng năm 380 TCN trong giai đoạn ông giảng dạy tại Học viện Plato ở Athens. Tác phẩm được trình bày dưới hình thức đối thoại, chủ yếu giữa Socrates và các nhân vật khác, bàn luận về bản chất của công lý, linh hồn con người và mô hình nhà nước lý tưởng. Plato cho rằng một xã hội công bằng chỉ có thể đạt được khi mỗi người làm đúng chức năng của mình và nhà nước được lãnh đạo bởi “triết gia – vương” (philosopher-king), những người có trí tuệ và đạo đức cao nhất. Tác phẩm chia xã hội thành ba tầng lớp: tầng lớp cầm quyền (triết gia), tầng lớp chiến binh và tầng lớp lao động; đồng thời nhấn mạnh vai trò của giáo dục trong việc hình thành nhân cách và duy trì trật tự chính trị. Cộng hòa không chỉ là công trình triết học về công lý và chính trị mà còn là nền tảng cho tư tưởng triết học, đạo đức và giáo dục phương Tây. Tác phẩm thể hiện khát vọng xây dựng một xã hội lý tưởng, nơi trí tuệ và đạo đức thống trị thay vì quyền lực và dục vọng, và đến nay vẫn được xem là một trong những di sản vĩ đại nhất của triết học nhân loại.','Hy Lạp cổ đại','VN',724,NULL,'https://kaohtp.github.io/BTL_OOP/2.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-05-05 10:43:22',17102,'APPROVED','',NULL,0,0),(3,'Bàn về khế ước xã hội','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/3_3.png','Bàn về khế ước xã hội (tiếng Pháp: Du contrat social ou Principes du droit politique) là tác phẩm chính trị – triết học nổi tiếng của Jean-Jacques Rousseau, xuất bản năm 1762 tại Pháp, trong bối cảnh chế độ phong kiến châu Âu đang khủng hoảng và các tư tưởng Khai sáng lan rộng mạnh mẽ. Tác phẩm mở đầu bằng câu nói nổi tiếng: “Con người sinh ra tự do, nhưng ở đâu cũng bị xiềng xích.” Rousseau đặt ra vấn đề làm thế nào để con người có thể sống trong xã hội mà vẫn giữ được tự do vốn có. Ông cho rằng nền tảng chính đáng của mọi quyền lực chính trị phải dựa trên một “khế ước xã hội” – tức là sự thỏa thuận tự nguyện giữa các cá nhân để hình thành cộng đồng chung, trong đó quyền lực tối cao thuộc về “ý chí chung” (volonté générale) của toàn dân. Nhà nước theo ông phải phục vụ lợi ích chung chứ không phải lợi ích riêng của giai cấp cầm quyền. Khế ước xã hội là một tuyên ngôn mạnh mẽ về quyền tự do, bình đẳng và chủ quyền nhân dân, trở thành nguồn cảm hứng lý luận cho Cách mạng Pháp 1789 và nhiều phong trào dân chủ sau này.\n','Pháp','VN',281,1762,'https://kaohtp.github.io/BTL_OOP/3.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',25050,'APPROVED','',NULL,0,0),(4,'Bàn về tự do','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/4_4.png','Bàn về tự do (tiếng Anh: On Liberty) là tác phẩm triết học chính trị tiêu biểu của John Stuart Mill, xuất bản năm 1859 tại Anh. Tác phẩm ra đời trong bối cảnh xã hội phương Tây đang chuyển mình mạnh mẽ dưới tác động của Cách mạng công nghiệp và phong trào dân chủ tự do, khi các vấn đề về quyền cá nhân và giới hạn của quyền lực nhà nước trở nên cấp thiết. Mill viết tác phẩm này nhằm bảo vệ tự do cá nhân trước sự chuyên chế của đa số và sự can thiệp quá mức của chính quyền. Ông khẳng định rằng tự do là điều kiện cần thiết cho sự phát triển toàn diện của con người, và quyền tự do chỉ nên bị giới hạn khi hành động của một người gây hại đến người khác — đây được gọi là “nguyên tắc gây hại” (harm principle). Bàn về tự do không chỉ bàn về quyền ngôn luận, tư tưởng, hành động mà còn đề cao sự đa dạng ý kiến, coi đó là động lực của tiến bộ xã hội. Với lập luận chặt chẽ và tinh thần nhân văn sâu sắc, tác phẩm trở thành nền tảng lý luận quan trọng của chủ nghĩa tự do hiện đại và có ảnh hưởng lớn đến tư tưởng dân chủ – nhân quyền cho đến ngày nay.\n','Anh','VN',263,1859,'https://kaohtp.github.io/BTL_OOP/4.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',33000,'APPROVED','',NULL,0,0),(5,'Đường về nô lệ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/5_5.png','Tác phẩm ra đời trong bối cảnh Thế chiến II và sự lan rộng của các chế độ toàn trị như phát xít và cộng sản. Hayek cảnh báo rằng việc mở rộng vai trò kiểm soát của nhà nước đối với nền kinh tế – dù với mục tiêu tốt đẹp – có thể dẫn đến mất tự do cá nhân và dần đưa xã hội đến con đường nô lệ. Ông bảo vệ nguyên tắc tự do kinh tế, quyền sở hữu cá nhân và cơ chế thị trường tự do như nền tảng của một xã hội văn minh. Đường về nô lệ không chỉ là lời cảnh báo về nguy cơ của chủ nghĩa tập thể mà còn là bản tuyên ngôn mạnh mẽ về giá trị của tự do cá nhân và trách nhiệm công dân.','Áo','VN',440,1944,'https://kaohtp.github.io/BTL_OOP/5.pdf',0,NULL,11,'2025-11-08 10:00:00','2026-04-27 13:01:46',40950,'APPROVED','',NULL,0,0),(6,'Ba người thầy vĩ đại','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/6_6.png','Cuốn sách kể câu chuyện về một chàng trai đang lạc hướng trong cuộc sống, được ba người thầy đặc biệt dẫn dắt để khám phá ý nghĩa thật sự của thành công và hạnh phúc. Thông qua những bài học giản dị mà sâu sắc, tác phẩm khuyến khích con người sống đúng với đam mê, dũng cảm vượt qua nỗi sợ và tìm lại “mục đích sống” của chính mình. Với ngôn ngữ nhẹ nhàng, mang tính triết lý và gần gũi, Ba người thầy vĩ đại được xem là cuốn cẩm nang giúp người đọc thức tỉnh nội tâm, tìm lại giá trị sống đích thực trong xã hội hiện đại.','Canada','VN',330,2002,'https://kaohtp.github.io/BTL_OOP/6.pdf',0,NULL,12,'2025-11-08 10:00:00','2026-04-27 13:01:46',48902,'APPROVED','',NULL,0,0),(7,'Đời ngắn đừng ngủ dài','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/7_6.png','Dưới dạng những câu chuyện ngắn và lời nhắn gửi nhẹ nhàng, cuốn sách khuyến khích con người sống tích cực, trân trọng thời gian, dám thay đổi và hành động để đạt được hạnh phúc, thành công thật sự trong cuộc sống. Với giọng văn gần gũi, súc tích, Đời ngắn đừng ngủ dài hướng người đọc đến việc sống có mục tiêu, biết yêu thương bản thân và cống hiến cho người khác. Cuốn sách được xem là một trong những cẩm nang truyền động lực sống mạnh mẽ nhất của thế kỷ XXI.\n','Canada','VN',223,2014,'https://kaohtp.github.io/BTL_OOP/7.pdf',0,NULL,8,'2025-11-08 10:00:00','2026-04-27 13:01:46',56851,'APPROVED','',NULL,0,0),(8,'Thức tỉnh mục đích sống','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/8_7.png','Cuốn sách tập trung vào hành trình thức tỉnh tâm thức, giúp con người thoát khỏi cái tôi (ego) và sống trọn vẹn trong hiện tại. Thông qua những suy ngẫm sâu sắc về tâm linh, nhận thức và bản ngã, Tolle chỉ ra rằng hạnh phúc và bình an nội tâm không nằm ở danh vọng hay vật chất, mà ở khả năng nhận biết bản thân trong từng khoảnh khắc. Thức tỉnh mục đích sống mang ý nghĩa triết lý và nhân văn sâu sắc, là lời kêu gọi con người sống tỉnh thức, yêu thương và hòa hợp với thế giới xung quanh.\n','Đức','VN',441,2005,'https://kaohtp.github.io/BTL_OOP/8.pdf',0,NULL,1,'2025-11-08 10:00:00','2026-04-27 13:01:46',64801,'APPROVED','',NULL,0,0),(9,'Quẳng gánh lo đi mà vui sống','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/9_8.png','Cuốn sách ra đời sau Thế chiến II – thời điểm con người chịu nhiều áp lực tinh thần và lo âu về cuộc sống. Tác phẩm đưa ra những nguyên tắc thực tiễn giúp con người kiểm soát lo lắng, vượt qua sợ hãi và tìm lại niềm vui trong cuộc sống hàng ngày. Thông qua những câu chuyện thật và lời khuyên giản dị, Carnegie khuyến khích người đọc sống tích cực, tập trung vào hiện tại, biết chấp nhận điều không thể thay đổi và luôn nuôi dưỡng thái độ biết ơn. Quẳng gánh lo đi mà vui sống đã trở thành “liều thuốc tinh thần” cho hàng triệu người trên thế giới, được dịch ra hàng chục ngôn ngữ và lưu hành rộng rãi đến nay.','Hoa Kỳ','VN',298,1948,'https://kaohtp.github.io/BTL_OOP/9.pdf',0,NULL,10,'2025-11-08 10:00:00','2026-04-27 13:01:46',72750,'APPROVED','',NULL,0,0),(10,'Đắc nhân tâm','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/10_8.png','Tác phẩm trình bày những nguyên tắc giao tiếp, ứng xử và thuyết phục người khác dựa trên sự thấu hiểu, tôn trọng và thiện chí. Carnegie chỉ ra rằng thành công trong cuộc sống không chỉ đến từ kiến thức hay tài năng mà còn phụ thuộc vào khả năng tạo thiện cảm và ảnh hưởng tích cực đến người khác. Các bài học như “thành thật quan tâm đến người khác”, “khuyến khích thay vì chỉ trích”, hay “gợi cho người khác ý muốn làm việc đó” đã trở thành nền tảng cho nghệ thuật giao tiếp hiện đại. Đắc nhân tâm không chỉ là cẩm nang thành công trong công việc mà còn là bài học về nhân cách, lòng nhân ái và ứng xử khôn ngoan trong xã hội.','Hoa Kỳ','VN',322,1936,'https://kaohtp.github.io/BTL_OOP/10.pdf',0,NULL,10,'2025-11-08 10:00:00','2026-04-27 13:01:46',2701,'APPROVED','',NULL,0,0),(11,'Đời thừa','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/11_9.png','phản ánh bi kịch của người trí thức nghèo – nhân vật Hộ – khi bị giằng xé giữa lý tưởng nghệ thuật và hiện thực cơm áo. Tác phẩm thể hiện nỗi đau tinh thần, sự bế tắc của con người trong xã hội cũ và gửi gắm thông điệp về khát vọng sống có ý nghĩa.\n','Việt Nam','VN',20,1943,'https://kaohtp.github.io/BTL_OOP/11.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',10650,'APPROVED','',NULL,0,0),(12,'Số đỏ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/12_10.png','Tác phẩm kể về Xuân Tóc Đỏ – kẻ vô học, tình cờ trở thành “anh hùng thời đại”, qua đó phơi bày xã hội tư sản thành thị lố lăng, giả tạo thời Pháp thuộc. Với giọng văn sắc bén, châm biếm mạnh mẽ, Vũ Trọng Phụng đã vẽ nên bức tranh trào lộng về một xã hội đang đảo lộn mọi giá trị đạo đức. Số đỏ mang ý nghĩa phê phán sâu sắc và vẫn còn nguyên giá trị hiện thực – nhân đạo đến ngày nay.]\n','Việt Nam','VN',245,1938,'https://kaohtp.github.io/BTL_OOP/12.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',18600,'APPROVED','',NULL,0,0),(13,'Búp sen xanh','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/13_11.png','tiểu thuyết tiểu sử nổi tiếng viết về thời thơ ấu và tuổi trẻ của Chủ tịch Hồ Chí Minh. Qua hành trình từ quê hương Kim Liên đến khi ra đi tìm đường cứu nước, tác phẩm thể hiện quá trình hình thành nhân cách, trí tuệ và lý tưởng lớn lao của Người. Được sáng tác trong giai đoạn đất nước tưởng nhớ và tri ân công lao của Bác, tác phẩm mang ý nghĩa giáo dục sâu sắc về lòng yêu nước, đạo đức và khát vọng cống hiến.\n','Việt Nam','VN',320,1982,'https://kaohtp.github.io/BTL_OOP/13.pdf',0,NULL,22,'2025-11-08 10:00:00','2026-04-27 13:01:46',26550,'APPROVED','',NULL,0,0),(14,'Mưa đỏ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/14_12.png','Tác phẩm khắc họa sâu sắc số phận những người lính trong cuộc chiến ác liệt, nơi họ phải đối mặt với sự mất mát, đau thương nhưng vẫn giữ vững lòng dũng cảm và tình đồng đội thiêng liêng. Thông qua ngòi bút chân thực, mạnh mẽ và đầy cảm xúc, Chu Lai đã tái hiện một không gian chiến tranh khốc liệt nhưng chan chứa tình người, đồng thời gửi gắm thông điệp về giá trị của niềm tin, tình yêu và lòng nhân hậu ngay giữa bão đạn. Tác phẩm mang ý nghĩa nhân văn sâu sắc, giúp thế hệ sau hiểu rõ hơn về những hy sinh của cha anh và giá trị của hòa bình hôm nay.\n','Việt Nam','VN',372,2016,'https://kaohtp.github.io/BTL_OOP/14.pdf',0,NULL,23,'2025-11-08 10:00:00','2026-04-27 13:01:46',34500,'APPROVED','',NULL,0,0),(15,'Cơm thầy cơm cô','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/15_10.png','phản ánh sâu sắc những mặt tối trong đời sống xã hội Việt Nam trước Cách mạng tháng Tám. Câu chuyện kể về một cô gái nông thôn lên thành phố kiếm sống bằng nghề giúp việc, phải chịu nhiều tủi nhục, bị bóc lột và khinh rẻ bởi những người tự cho mình là “trí thức”. Tác phẩm phơi bày sự giả dối, đạo đức giả trong tầng lớp trên và tố cáo những bất công xã hội đương thời. Qua đó, nhà văn thể hiện lòng cảm thương sâu sắc với những kiếp người nghèo khổ, đồng thời gửi gắm tinh thần nhân đạo và khát vọng công bằng. Cơm thầy cơm cô có giá trị hiện thực và phê phán mạnh mẽ, cho thấy bút pháp châm biếm sắc sảo và khả năng quan sát tinh tế của tác giả.\n','Việt Nam','VN',35,1936,'https://kaohtp.github.io/BTL_OOP/15.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',42450,'APPROVED','',NULL,0,0),(16,'Tắt đèn','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/16_13.png','tiểu thuyết hiện thực phê phán nổi bật, kể về cuộc đời khổ cực của chị Dậu – người phụ nữ nông dân bị dồn ép đến bước đường cùng bởi sưu thuế và áp bức phong kiến. Tác phẩm tố cáo mạnh mẽ xã hội tàn bạo, đồng thời ca ngợi phẩm chất kiên cường và tình thương con vô bờ của người phụ nữ Việt Nam.','Việt Nam','VN',215,1937,'https://kaohtp.github.io/BTL_OOP/16.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',50400,'APPROVED','',NULL,0,0),(17,'Có 2 con mèo ngồi bên cửa sổ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/17_14.png','tác phẩm là câu chuyện ngụ ngôn nhẹ nhàng về tình bạn, tình yêu và lòng bao dung giữa hai chú mèo Gấu và Mun. Với giọng kể hài hước, hóm hỉnh, tác phẩm gửi gắm thông điệp nhân văn sâu sắc: con người cần thấu hiểu, chia sẻ và yêu thương nhau hơn.','Việt Nam','VN',136,2012,'https://kaohtp.github.io/BTL_OOP/17.pdf',0,NULL,24,'2025-11-08 10:00:00','2026-04-27 13:01:46',58350,'APPROVED','',NULL,0,0),(18,'Đồng hào có ma','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/18_15.png','truyện ngắn trào phúng nổi bật, phản ánh sự ngu dốt, mê tín và lòng tham trong xã hội thực dân phong kiến. Bằng giọng kể châm biếm, Nguyễn Công Hoan đã phơi bày thói hám lợi và sự tha hoá đạo đức con người, qua đó thể hiện tiếng cười phê phán sâu sắc.\n','Việt Nam','VN',4,1937,'https://kaohtp.github.io/BTL_OOP/18.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',66301,'APPROVED','',NULL,0,0),(19,'Nam Xương nữ tử truyện','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/19_16.png','câu chuyện kể về Vũ Nương – người vợ hiền bị chồng nghi oan, uất ức mà tự vẫn. Tác phẩm kết hợp yếu tố kỳ ảo và hiện thực để bày tỏ niềm cảm thương sâu sắc với số phận người phụ nữ và phê phán xã hội phong kiến trọng nam khinh nữ.\n','Việt Nam','VN',7,NULL,'https://kaohtp.github.io/BTL_OOP/19.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',74250,'APPROVED','',NULL,0,0),(20,'Lão Hạc','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/20_9.png',' Tác phẩm thể hiện nỗi đau thân phận con người bị bần cùng hoá, đồng thời ca ngợi phẩm giá và nhân cách cao đẹp của người lao động nghèo.','Việt Nam','VN',17,1943,'https://kaohtp.github.io/BTL_OOP/20.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',4200,'APPROVED','',NULL,0,0),(21,'Chúa ruồi','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/21_17.png','Truyện kể về một nhóm học sinh bị lạc trên đảo hoang sau tai nạn máy bay. Khi không còn luật lệ, những đứa trẻ dần trở nên man rợ và tàn bạo, thể hiện sự suy đồi của bản chất con người khi bị tách khỏi nền văn minh. Tác phẩm là một ẩn dụ sâu sắc về xã hội loài người, lên án bạo lực, sự ích kỷ và cảnh báo về bản năng hoang dã ẩn sâu trong mỗi người.','Anh','VN',334,1954,'https://kaohtp.github.io/BTL_OOP/21.pdf',0,NULL,13,'2025-11-08 10:00:00','2026-04-27 13:01:46',12150,'APPROVED','',NULL,0,0),(22,'Người đua diều','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/22_18.png','Người đua diều kể về tình bạn cảm động giữa Amir và Hassan – hai cậu bé lớn lên ở Afghanistan trước khi đất nước rơi vào chiến tranh. Sau một biến cố, Amir rời quê hương nhưng suốt đời sống trong day dứt và khát vọng chuộc lỗi. Tác phẩm là câu chuyện về tội lỗi, sự tha thứ, tình cha con và tình người, đồng thời khắc họa bi kịch của Afghanistan trong biến động lịch sử.','Hoa Kỳ','VN',457,2003,'https://kaohtp.github.io/BTL_OOP/22.pdf',0,NULL,2,'2025-11-08 10:00:00','2026-04-27 13:01:46',20100,'APPROVED','',NULL,0,0),(23,'Bên kia đường có đứa dở hơi','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/23_19.png','tiểu thuyết tuổi teen nhẹ nhàng và sâu sắc kể về mối quan hệ giữa Bryce và Juli – hai người bạn hàng xóm có tính cách trái ngược. Qua góc nhìn luân phiên của hai nhân vật, tác phẩm khắc họa quá trình trưởng thành, sự thay đổi trong cách nhìn nhận về tình cảm, gia đình và giá trị bản thân. Tác phẩm mang đến thông điệp giản dị nhưng ý nghĩa: yêu thương là biết nhìn thấy vẻ đẹp thật sự của người khác.\n','Hoa Kỳ','VN',258,2001,'https://kaohtp.github.io/BTL_OOP/23.pdf',0,NULL,3,'2025-11-08 10:00:00','2026-04-27 13:01:46',28050,'APPROVED','',NULL,0,0),(24,'Chú bé mang pyjama sọc','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/24_20.png','lấy bối cảnh Thế chiến II, truyện kể về tình bạn cảm động giữa Bruno – con trai một sĩ quan Đức Quốc xã, và Shmuel – cậu bé Do Thái trong trại tập trung. Tác phẩm hé lộ sự tàn khốc của chiến tranh và nỗi đau nhân loại qua cái nhìn ngây thơ của trẻ nhỏ.','Ireland','VN',473,2006,'https://kaohtp.github.io/BTL_OOP/24.pdf',0,NULL,14,'2025-11-08 10:00:00','2026-04-27 13:01:46',36000,'APPROVED','',NULL,0,0),(25,'1984','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/25_21.png','tiểu thuyết chính trị – viễn tưởng kinh điển của George Orwell, miêu tả một xã hội toàn trị nơi mọi hành động, lời nói và ý nghĩ đều bị giám sát bởi “Đảng” và “Anh Cả”. Nhân vật chính Winston Smith dần nhận ra sự thật khủng khiếp về chế độ này. Tác phẩm là lời cảnh báo sâu sắc về nguy cơ mất tự do cá nhân và quyền con người.\n','Anh','VN',165,1949,'https://kaohtp.github.io/BTL_OOP/25.pdf',0,NULL,7,'2025-11-08 10:00:00','2026-04-27 13:01:46',43950,'APPROVED','',NULL,0,0),(26,'Trại súc vật','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/26_21.png','tiểu thuyết ngụ ngôn chính trị nổi tiếng của George Orwell, kể về một nông trại nơi các loài vật nổi dậy lật đổ con người để xây dựng xã hội bình đẳng do chính chúng cai quản. Tuy nhiên, quyền lực dần rơi vào tay loài heo, đặc biệt là Napoleon, và xã hội mới nhanh chóng trở nên độc tài chẳng khác gì trước kia. Tác phẩm là một ẩn dụ sâu sắc về Cách mạng Nga và sự tha hóa của quyền lực, phê phán mạnh mẽ chế độ độc tài, tuyên truyền và thao túng quần chúng. Bằng giọng văn châm biếm sắc sảo, Orwell đã gửi gắm thông điệp về khát vọng tự do, công bằng và cảnh báo về sự dễ bị lạm dụng của quyền lực trong mọi hình thái xã hội.\n','Anh','VN',56,1944,'https://kaohtp.github.io/BTL_OOP/26.pdf',0,NULL,7,'2025-11-08 10:00:00','2026-04-27 13:01:46',51900,'APPROVED','',NULL,0,0),(27,'Nhà giả kim','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/27_22.png','Nhà giả kim kể về hành trình của chàng chăn cừu Santiago đi tìm “kho báu” của đời mình. Trên đường đi, cậu nhận ra kho báu thật sự nằm trong chính bản thân và hành trình khám phá cuộc sống. Tác phẩm là câu chuyện triết lý, biểu tượng về ước mơ, định mệnh và sức mạnh của niềm tin.\n','Brazil','VN',85,1988,'https://kaohtp.github.io/BTL_OOP/27.pdf',0,NULL,15,'2025-11-08 10:00:00','2026-04-27 13:01:46',59852,'APPROVED','',NULL,0,0),(28,'Điều kỳ diệu của tiệm tạp hóa Namiya','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/28_23.png','Điều kỳ diệu của tiệm tạp hóa Namiya kể về ba thanh niên trộm cắp vô tình trú trong một tiệm tạp hóa cũ, nơi họ nhận được những bức thư cầu xin lời khuyên từ quá khứ. Qua việc giúp đỡ người khác, họ tìm lại niềm tin và ý nghĩa cuộc sống. Tác phẩm mang thông điệp nhân văn về sự kết nối giữa con người qua thời gian.','Nhật Bản','VN',397,2012,'https://kaohtp.github.io/BTL_OOP/28.pdf',0,NULL,16,'2025-11-08 10:00:00','2026-04-27 13:01:46',67800,'APPROVED','',NULL,0,0),(29,'Ngàn mặt trời rực rỡ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/29_18.png','Ngàn mặt trời rực rỡ là câu chuyện đầy xúc động về số phận hai người phụ nữ Afghanistan – Mariam và Laila – bị ràng buộc bởi chiến tranh, định kiến và nỗi đau. Tác phẩm khắc họa nghị lực phi thường, tình mẫu tử và khát vọng tự do của người phụ nữ trong xã hội hà khắc.','Hoa Kỳ','VN',446,2007,'https://kaohtp.github.io/BTL_OOP/29.pdf',0,NULL,2,'2025-11-08 10:00:00','2026-04-27 13:02:06',75755,'APPROVED','',NULL,0,0),(30,'Bố con cá gai','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/30_24.png','một câu chuyện xúc động về tình phụ tử, về những tổn thương, sự thấu hiểu và sức mạnh của tình yêu trong gia đình. Tác phẩm kể về hành trình người cha cùng con trai mắc bệnh hiểm nghèo đi dọc đất nước Hàn Quốc để thực hiện ước mơ cuối cùng của con.\nTrên hành trình ấy, những kỷ niệm, hối tiếc và tình yêu thương được khơi dậy, giúp hai cha con tìm thấy sự cảm thông và gắn kết sâu sắc hơn bao giờ hết.','Hàn Quốc','VN',0,2000,'https://kaohtp.github.io/BTL_OOP/30.pdf',0,NULL,17,'2025-11-08 10:00:00','2026-04-27 13:01:46',5700,'APPROVED','',NULL,0,0),(31,'Được học','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/31_25.png','hồi ký nổi tiếng của Tara Westover kể về hành trình phi thường của một cô gái sinh ra trong gia đình Mặc Môn cực đoan, không được đến trường và bị giam hãm trong tư tưởng cổ hủ, nhưng đã tự vươn lên để trở thành tiến sĩ tại Đại học Cambridge. Tác phẩm khắc họa sức mạnh của tri thức, lòng dũng cảm và giáo dục – những yếu tố giúp con người vượt qua giới hạn và tìm thấy bản sắc thật của mình. Ra đời trong bối cảnh xã hội hiện đại đề cao giáo dục và quyền tự do cá nhân, Được học mang ý nghĩa nhân văn sâu sắc, truyền cảm hứng mạnh mẽ về nghị lực, tự học và sự giải phóng bản thân thông qua tri thức.\n','Hoa Kỳ','VN',446,2018,'https://kaohtp.github.io/BTL_OOP/31.pdf',0,NULL,4,'2025-11-08 10:00:00','2026-04-27 13:01:46',13650,'APPROVED','',NULL,0,0),(32,'Maria-montessori-Her life and work','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/32_26.png','The book introduces the journey and educational philosophy of Maria Montessori – an Italian physician, educator, and social reformer. It presents the process through which she developed the renowned Montessori method, based on encouraging children’s natural development, respecting individuality, and nurturing creativity. Emerging amid the global educational reform movements of the 20th century, the work not only recounts the extraordinary life of a pioneering woman in pedagogy but also conveys profound humanistic values about every child’s right to develop freely.','Anh','EN',400,1957,'https://kaohtp.github.io/BTL_OOP/32.pdf',0,NULL,18,'2025-11-08 10:00:00','2026-04-27 13:01:46',21600,'APPROVED','',NULL,0,0),(33,'Khuyến học','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/33_27.png','tác phẩm kinh điển của Fukuzawa Yukichi – người được xem là “nhà khai sáng vĩ đại của Nhật Bản”. Cuốn sách khẳng định vai trò của tri thức và giáo dục trong việc giải phóng con người khỏi ngu dốt, lệ thuộc và bất công xã hội. Với lời văn giản dị, giàu tính thực tiễn, Khuyến học truyền cảm hứng về tinh thần học hỏi suốt đời, tinh thần độc lập và bình đẳng của mọi công dân trong xã hội hiện đại. Tác phẩm được xem là “ngọn đèn khai sáng” đưa nước Nhật bước vào thời kỳ Duy tân Minh Trị.\n','Nhật Bản','VN',244,1872,'https://kaohtp.github.io/BTL_OOP/33.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',29550,'APPROVED','',NULL,0,0),(34,'Người thầy','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/34_28.png','Người thầy là hồi ký thứ ba của Frank McCourt, kể lại hơn ba mươi năm ông giảng dạy tại các trường trung học ở New York. Cuốn sách mô tả chân thực niềm vui, nỗi buồn, áp lực và sự tận tụy của người làm nghề dạy học. Qua đó, tác giả khẳng định vai trò của người thầy không chỉ là truyền đạt kiến thức mà còn là người thắp sáng niềm tin, giúp học sinh khám phá giá trị bản thân. Người thầy mang ý nghĩa sâu sắc về tình yêu nghề và sức mạnh của giáo dục nhân bản.\n','Hoa Kỳ','VN',278,2005,'https://kaohtp.github.io/BTL_OOP/34.pdf',0,NULL,5,'2025-11-08 10:00:00','2026-04-27 13:01:46',37500,'APPROVED','',NULL,0,0),(35,'Phương pháp giáo dục con của người Do Thái','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/35_29.png','trình bày bí quyết nuôi dạy con của dân tộc Do Thái – một trong những cộng đồng có nhiều người thành công và trí tuệ nhất thế giới. Sách chỉ ra rằng bí quyết nằm ở việc rèn luyện tính tự lập, tinh thần học hỏi, tư duy phản biện và niềm tin tôn trọng tri thức. Tác phẩm mang ý nghĩa định hướng phụ huynh trong giáo dục hiện đại: thay vì nhồi nhét kiến thức, hãy khơi gợi tiềm năng và nhân cách ở trẻ.\n','Việt Nam','VN',300,2022,'https://kaohtp.github.io/BTL_OOP/35.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',45450,'APPROVED','',NULL,0,0),(36,'Emile hay là về giáo dục','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/36_3.png',' tác phẩm triết học – giáo dục kinh điển của Jean-Jacques Rousseau. Cuốn sách được viết dưới hình thức một tiểu thuyết triết lý, kể về quá trình nuôi dạy và giáo dục một cậu bé tên Emile từ khi sinh ra đến tuổi trưởng thành. Thông qua đó, Rousseau trình bày quan điểm giáo dục “theo tự nhiên”, nhấn mạnh rằng trẻ em cần được phát triển tự do, phù hợp với quy luật tự nhiên chứ không bị gò bó bởi xã hội và khuôn mẫu cứng nhắc. Tác phẩm ra đời trong bối cảnh châu Âu đang chịu ảnh hưởng nặng nề của giáo dục khuôn phép và tôn giáo, nên Emile được xem là một cuộc cách mạng trong tư tưởng sư phạm, đặt nền móng cho giáo dục hiện đại và ảnh hưởng sâu sắc đến các nhà giáo dục sau này như Pestalozzi, Montessori hay Dewey.\n','Pháp','VN',691,1762,'https://kaohtp.github.io/BTL_OOP/36.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',53400,'APPROVED','',NULL,0,0),(37,'Thiên tài và sự giáo dục từ sớm','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/37_30.png','“Thiên tài và sự giáo dục từ sớm” là cuốn sách truyền cảm hứng về sức mạnh của giáo dục trong những năm đầu đời. Tác phẩm giúp ta hiểu vì sao mỗi đứa trẻ đều có tiềm năng trở thành “thiên tài” nếu được khơi dậy và dẫn dắt đúng cách. Với lối viết giản dị, gần gũi nhưng sâu sắc, cuốn sách mang đến nhiều gợi mở quý giá cho cha mẹ và những ai quan tâm đến việc nuôi dưỡng trí tuệ trẻ nhỏ.','Nhật Bản','VN',121,1917,'https://kaohtp.github.io/BTL_OOP/37.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',61350,'APPROVED','',NULL,0,0),(38,'Những quy tắc để trẻ thông minh và hạnh phúc','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/38_31.png','Tác phẩm tập trung vào cách nuôi dạy trẻ từ khi còn trong bụng mẹ đến 5 tuổi, dựa trên các nghiên cứu khoa học về não bộ. Cuốn sách lý giải vì sao trí thông minh và hạnh phúc của trẻ không chỉ phụ thuộc vào di truyền, mà còn do môi trường, cách cha mẹ tương tác, và phương pháp giáo dục sớm. Qua các “quy tắc” đơn giản nhưng khoa học, John Medina hướng đến việc giúp cha mẹ nuôi dưỡng con phát triển toàn diện về trí tuệ, cảm xúc và nhân cách.','Hoa Kỳ','VN',147,2010,'https://kaohtp.github.io/BTL_OOP/38.pdf',0,NULL,27,'2025-11-08 10:00:00','2026-04-27 13:01:46',69300,'APPROVED','',NULL,0,0),(39,'Cha giàu cha nghèo - Tập 1','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/39_32.png','Cuốn sách kinh điển về tài chính cá nhân của Robert T. Kiyosaki. Tác phẩm kể lại những bài học mà tác giả học được từ “hai người cha” – cha ruột (người cha nghèo) và cha của bạn thân (người cha giàu). Qua những câu chuyện đối lập, Robert chỉ ra sự khác biệt trong tư duy về tiền bạc, đầu tư và cách xây dựng tự do tài chính. Cuốn sách khuyến khích người đọc thay đổi cách nhìn về giáo dục tài chính, coi việc học cách khiến tiền làm việc cho mình quan trọng hơn là chỉ làm việc vì tiền.','Hoa Kỳ','VN',100,1997,'https://kaohtp.github.io/BTL_OOP/39.pdf',0,NULL,28,'2025-11-08 10:00:00','2026-04-27 13:07:52',77258,'APPROVED','',NULL,0,0),(40,'Những tù nhân của địa lý','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/40_33.png','Phân tích mối liên hệ giữa địa lý tự nhiên và chính trị toàn cầu. Sách lý giải cách địa hình, khí hậu, tài nguyên và vị trí địa lý ảnh hưởng đến chiến lược, quyền lực và hành vi của các quốc gia. Với lập luận chặt chẽ, hấp dẫn như một bài giảng địa – chính trị sinh động, tác phẩm giúp người đọc hiểu rằng nhiều sự kiện lịch sử và chính trị hiện đại đều bắt nguồn từ “định mệnh địa lý”.\n','Anh','VN',314,2015,'https://kaohtp.github.io/BTL_OOP/40.pdf',0,NULL,19,'2025-11-08 10:00:00','2026-04-27 13:01:46',7200,'APPROVED','',NULL,0,0),(41,'Vũ trụ trong vỏ hạt dẻ','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/41_34.png','Cuốn sách diễn giải những lý thuyết vật lý hiện đại như thuyết tương đối, cơ học lượng tử, lỗ đen và vũ trụ song song bằng ngôn ngữ dễ hiểu, kèm minh họa sinh động. Tác phẩm giúp người đọc khám phá bản chất của không gian – thời gian và những giới hạn tri thức của nhân loại.\n','Anh','VN',253,2001,'https://kaohtp.github.io/BTL_OOP/41.pdf',0,NULL,6,'2025-11-08 10:00:00','2026-04-27 13:01:46',15150,'APPROVED','',NULL,0,0),(42,'Lược sử loài người','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/42_35.png','Kể lại hành trình phát triển của Homo sapiens từ thuở săn bắt – hái lượm đến thời đại công nghệ. Tác phẩm đặt ra nhiều câu hỏi sâu sắc về trí tuệ, quyền lực, hạnh phúc và tương lai của nhân loại trong thời đại trí tuệ nhân tạo.\n','Israel','VN',504,2011,'https://kaohtp.github.io/BTL_OOP/42.pdf',0,NULL,20,'2025-11-08 10:00:00','2026-04-27 13:01:46',23100,'APPROVED','',NULL,0,0),(43,'Vũ trụ song song','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/43_36.png','Trình bày những lý thuyết vật lý hiện đại về sự tồn tại của nhiều vũ trụ song song, dựa trên thuyết dây và vũ trụ học lượng tử. Tác phẩm mở rộng trí tưởng tượng của người đọc về không gian, thời gian và khả năng có vô số thế giới song hành với thế giới chúng ta.\n','Hoa Kỳ','VN',355,1999,'https://kaohtp.github.io/BTL_OOP/43.pdf',0,NULL,3,'2025-11-08 10:00:00','2026-04-27 13:01:46',31050,'APPROVED','',NULL,0,0),(44,'Từ tốt đến vĩ đại','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/44_37.png','Công trình nghiên cứu nổi tiếng của Jim Collins, phân tích lý do vì sao một số công ty có thể chuyển mình từ mức trung bình đến tầm vóc vĩ đại và duy trì thành công lâu dài. Cuốn sách nêu bật vai trò của lãnh đạo cấp độ 5, kỷ luật trong tư duy và hành động, cùng tầm nhìn chiến lược dựa trên giá trị cốt lõi.\n','Hoa Kỳ','VN',308,2001,'https://kaohtp.github.io/BTL_OOP/44.pdf',0,NULL,9,'2025-11-08 10:00:00','2026-04-27 13:01:46',39000,'APPROVED','',NULL,0,0),(45,'Vị tu sĩ bán chiếc Ferrari','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/45_38.png','Cuốn sách kể về Julian Mantle – một luật sư thành đạt nhưng kiệt quệ vì lối sống chạy theo danh lợi. Sau khi trải qua khủng hoảng, anh từ bỏ tất cả để tìm đến Ấn Độ học hỏi triết lý sống từ các nhà hiền triết Himalaya. Qua hành trình ấy, tác phẩm truyền tải thông điệp sâu sắc về cân bằng giữa thành công vật chất và hạnh phúc tinh thần, khuyến khích con người hướng tới sự tỉnh thức, ý nghĩa sống và giá trị nội tâm.','Hoa Kỳ','VN',184,1997,'https://kaohtp.github.io/BTL_OOP/45.pdf',0,NULL,8,'2025-11-08 10:00:00','2026-04-27 13:01:46',46951,'APPROVED','',NULL,0,0),(46,'Ngày xưa có 1 con bò','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/46_39.png','Kể câu chuyện về việc con người thường tự bào chữa cho thất bại bằng những “con bò” – tức là những lời biện minh, thói quen trì hoãn hoặc sợ hãi. Cuốn sách khuyến khích người đọc dám thay đổi, vượt qua giới hạn để đạt được thành công.','Colombia','VN',148,2005,'https://kaohtp.github.io/BTL_OOP/46.pdf',0,NULL,21,'2025-11-08 10:00:00','2026-04-27 13:01:46',54901,'APPROVED','',NULL,0,0),(47,'Ai và Ky ở xứ sở những con số tàng hình','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/47_40.png','“Ai và Ky ở xứ sở những con số tàng hình” là cuốn sách kết hợp độc đáo giữa toán học và trí tưởng tượng. Qua chuyến phiêu lưu kỳ thú của hai nhân vật Ai và Ky, người đọc được dẫn dắt vào thế giới của những con số, hình học và tư duy logic một cách sinh động, dễ hiểu và đầy cảm hứng. Cuốn sách không chỉ khơi dậy niềm yêu thích toán học mà còn giúp người đọc nhận ra vẻ đẹp ẩn sau những con số tưởng chừng khô khan.','Việt Nam','VN',167,2012,'https://kaohtp.github.io/BTL_OOP/47.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:01:46',62850,'APPROVED','',NULL,0,0),(48,'Con đường Hồi giáo','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/48_41.png','Tập ký sự ghi lại hành trình của tác giả qua các quốc gia Hồi giáo. Tác phẩm kết hợp giữa quan sát, trải nghiệm và nghiên cứu văn hóa – tôn giáo, giúp người đọc hiểu hơn về thế giới Hồi giáo đa dạng, khác biệt nhưng đầy nhân văn.\n','Việt Nam','VN',198,2014,'https://kaohtp.github.io/BTL_OOP/48.pdf',0,NULL,25,'2025-11-08 10:00:00','2026-04-27 13:01:46',70800,'APPROVED','',NULL,0,0),(49,'Mình là cá, việc của mình là bơi','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/49_42.png','Giúp người đọc học cách chấp nhận bản thân, kiên định với mục tiêu và tìm kiếm sự bình an nội tâm. Thông qua 33 bài học ngắn gọn, tác phẩm khuyến khích lối sống tích cực và biết hài lòng với chính mình.\n','Nhật Bản','VN',192,2017,'https://kaohtp.github.io/BTL_OOP/49.pdf',0,NULL,NULL,'2025-11-08 10:00:00','2026-04-27 13:02:44',78762,'APPROVED','',NULL,0,0),(50,'Nhật ký Đặng Thùy Trâm','https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/book/50_43.png','Cuốn nhật ký ghi lại những suy nghĩ, cảm xúc và trải nghiệm của bác sĩ Đặng Thùy Trâm trong những năm công tác tại chiến trường Quảng Ngãi. Tác phẩm không chỉ là lời kể chân thực về cuộc sống gian khổ và tàn khốc nơi chiến trường, mà còn là tiếng nói của lòng yêu nước, tình thương con người và khát vọng cống hiến của tuổi trẻ. Nhật ký Đặng Thùy Trâm mang ý nghĩa nhân văn sâu sắc, trở thành biểu tượng của tinh thần dũng cảm và lý tưởng sống cao đẹp trong thời chiến.','Việt Nam','VN',322,2005,'https://kaohtp.github.io/BTL_OOP/50.pdf',0,NULL,26,'2025-11-08 10:00:00','2026-04-27 13:01:46',8700,'APPROVED','',NULL,0,0),(51,'buồn ngủngủ','','','','VN',0,NULL,'',0,NULL,NULL,'2026-04-26 17:39:43','2026-04-29 13:38:17',0,'APPROVED','','',1,0),(52,'ước được đi ngủ','','','','VN',0,NULL,'blob:http://localhost:5173/4e41eb4b-8166-464f-9bb0-82c779cecdf4',0,NULL,NULL,'2026-04-26 17:48:51','2026-04-27 13:01:46',0,'APPROVED','blob:http://localhost:5173/2b0825cf-4215-4b0f-90cb-aa440bc38edb','',1,0),(59,'Aristole','','hay lắm','','VN',0,NULL,'blob:http://localhost:5173/e7a034c2-2f69-4e36-a590-175fc2ac2934',0,NULL,NULL,'2026-04-27 14:45:40','2026-04-29 13:38:15',6,'APPROVED','blob:http://localhost:5173/3bb5705c-c091-4e3a-a201-f5ff78620a89','blob:http://localhost:5173/d6e1ffbf-a3a4-4875-8367-ef82317ece84',4,0);
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_BeforeBookInsert
BEFORE INSERT ON books FOR EACH ROW
BEGIN
    IF NEW.approvalStatus IS NULL OR NEW.approvalStatus = '' THEN SET NEW.approvalStatus = 'PENDING'; END IF;
    IF NEW.createdAt IS NULL THEN SET NEW.createdAt = NOW(); END IF;
    SET NEW.updatedAt = NOW();
    IF NEW.viewCount IS NULL THEN SET NEW.viewCount = 0; END IF;
    IF NEW.weeklyViewCount IS NULL THEN SET NEW.weeklyViewCount = 0; END IF;
    IF NEW.isHidden IS NULL THEN SET NEW.isHidden = FALSE; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_BeforeBookUpdate
BEFORE UPDATE ON books FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
    IF OLD.approvalStatus = 'PENDING' AND NEW.approvalStatus = 'APPROVED' THEN
        IF NEW.releaseDate IS NULL OR NEW.releaseDate = 0 THEN
            SET NEW.releaseDate = YEAR(CURDATE());
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `categoriesofbooks`
--

DROP TABLE IF EXISTS `categoriesofbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoriesofbooks` (
  `BookId` int(11) NOT NULL,
  `CategoryId` int(11) NOT NULL,
  PRIMARY KEY (`BookId`,`CategoryId`),
  UNIQUE KEY `idx_cob_book_category` (`BookId`,`CategoryId`),
  KEY `idx_cob_category_only` (`CategoryId`),
  CONSTRAINT `fk_cob_book` FOREIGN KEY (`BookId`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cob_category` FOREIGN KEY (`CategoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriesofbooks`
--

LOCK TABLES `categoriesofbooks` WRITE;
/*!40000 ALTER TABLE `categoriesofbooks` DISABLE KEYS */;
INSERT INTO `categoriesofbooks` VALUES (2,3),(3,3),(4,3),(5,3),(6,3),(7,3),(8,3),(9,3),(10,3),(11,1),(12,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,1),(21,2),(22,2),(23,2),(24,2),(25,2),(26,2),(27,2),(28,2),(29,2),(30,2),(31,4),(32,4),(33,4),(34,4),(35,4),(36,4),(37,4),(38,4),(39,4),(40,4),(41,5),(42,5),(43,5),(44,5),(45,5),(46,5),(47,5),(48,5),(49,5),(50,5),(51,1),(52,3),(58,1);
/*!40000 ALTER TABLE `categoriesofbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Việt Nam',''),(2,'Nước ngoài',''),(3,'Đời sống & Xã hội',''),(4,'Giáo dục',''),(5,'Khác','');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (3,3,6,5,'Tuyet','Cuon sach hay nhat toi tung doc.','2025-11-25 00:00:00'),(4,3,10,4,'Kha hay','Nhieu bai hoc thuc tien ve giao tiep.','2025-11-27 00:00:00'),(5,2,8,4,'Tham, y nghia','Giup minh song tich cuc hon.','2025-12-01 00:00:00'),(7,2,49,5,'','hay thí','2026-04-27 14:59:24'),(8,2,49,5,'','hay điên','2026-04-27 14:59:29');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_BeforeCommentInsert_CheckRate
BEFORE INSERT ON comments FOR EACH ROW
BEGIN
    IF NEW.rating > 5 THEN SET NEW.rating = 5;
    ELSEIF NEW.rating < 1 THEN SET NEW.rating = 1;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_AfterCommentInsert
AFTER INSERT ON comments FOR EACH ROW
BEGIN
    SET @last_comment_bookId = NEW.bookId;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `listeningaudiobook`
--

DROP TABLE IF EXISTS `listeningaudiobook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listeningaudiobook`
--

LOCK TABLES `listeningaudiobook` WRITE;
/*!40000 ALTER TABLE `listeningaudiobook` DISABLE KEYS */;
INSERT INTO `listeningaudiobook` VALUES (1,1,2,0,0,'2025-11-08 10:54:00',2),(2,2,6,0,0,'2026-04-24 10:04:09',1),(3,2,27,0,0,'2026-04-24 10:04:36',1),(4,1,49,0,0,'2026-04-26 09:18:48',1),(5,2,49,0,0,'2026-04-27 12:26:44',1),(6,4,49,62,0,'2026-04-27 13:03:05',1),(7,1,45,0,0,'2026-04-27 03:03:54',1),(101,2,39,0,0,'2026-04-27 13:07:52',1),(102,1,58,0,0,'2026-04-27 14:26:42',1),(103,4,59,4,0,'2026-04-27 14:46:07',1),(104,1,59,0,0,'2026-04-27 14:46:27',1),(109,2,2,10,0,'2026-05-05 10:43:22',4);
/*!40000 ALTER TABLE `listeningaudiobook` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publishinghouse`
--

DROP TABLE IF EXISTS `publishinghouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `publishinghouse` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publishinghouse`
--

LOCK TABLES `publishinghouse` WRITE;
/*!40000 ALTER TABLE `publishinghouse` DISABLE KEYS */;
INSERT INTO `publishinghouse` VALUES (1,'Penguin Publishing Group','Đây là tập đoàn xuất bản thương mại lớn nhất thế giới hiện nay. Nó được thành lập vào năm 2013 từ sự sáp nhập của hai gã khổng lồ trong ngành: Random House (thành lập tại Mỹ năm 1927) và Penguin Group (thành lập tại Anh năm 1935). Cả hai công ty này đều có lịch sử cách mạng hóa ngành xuất bản, đặc biệt Penguin nổi tiếng với việc tiên phong xuất bản sách bìa mềm chất lượng cao với giá cả phải chăng, đưa văn học đến với đại chúng.'),(2,'Riverhead Books','Được thành lập vào năm 1994, Riverhead Books là một chi nhánh của Penguin Group. Họ nổi tiếng với việc xuất bản các tác phẩm văn học có tính đột phá, sách phi hư cấu mang tính thời sự và các tác phẩm từ những tác giả có tầm ảnh hưởng toàn cầu, như Khaled Hosseini.'),(3,'Alfred A. Knopf','Được thành lập vào năm 1915 bởi Alfred A. Knopf Sr. và Blanche Knopf. Ngay từ đầu, Knopf đã định vị mình là nhà xuất bản các tác phẩm văn học chất lượng cao, không chỉ về nội dung (với nhiều tác giả đoạt giải Nobel) mà còn về hình thức, thiết kế sách. Họ trở thành một phần của Random House vào năm 1960.'),(4,'Random House','Random House là một trong những tên tuổi huyền thoại của ngành xuất bản Mỹ, được thành lập vào năm 1927 bởi Bennett Cerf và Donald Klopfer. Tên \'Random House\' (Ngôi nhà Ngẫu nhiên) ra đời vì ban đầu họ muốn xuất bản \'ngẫu nhiên\' một vài cuốn sách mà họ yêu thích, chủ yếu là các tác phẩm kinh điển. Họ nhanh chóng phát triển, mua lại nhiều NXB uy tín khác (như Alfred A. Knopf) và trở thành một gã khổng lồ. Trước khi sáp nhập với Penguin vào năm 2013, Random House là nhà xuất bản thương mại lớn nhất thế giới nói tiếng Anh.'),(5,'Scribner','Được thành lập vào năm 1846 với tên gốc là Charles Scribner\'s Sons, Scribner là một trong những nhà xuất bản văn học có lịch sử lâu đời và uy tín nhất Hoa Kỳ. Đây là \'ngôi nhà\' của các tác giả vĩ đại như F. Scott Fitzgerald, Ernest Hemingway và Thomas Wolfe. Việc xuất bản \'Người thầy\' (Teacher Man) của Frank McCourt hoàn toàn phù hợp với truyền thống xuất bản các tác phẩm hồi ký văn học chất lượng cao của họ. Hiện nay, Scribner là một chi nhánh quan trọng của Simon & Schuster.'),(6,'Bantam Books','Thành lập năm 1945, Bantam Books là một trong những nhà xuất bản sách bìa mềm (paperback) đại chúng hàng đầu của Mỹ. Họ tập trung mạnh vào các thể loại phổ biến, khoa học viễn tưởng và sách thương mại, giúp đưa các tác phẩm của các tác giả lớn (như Stephen Hawking) đến với đông đảo công chúng với chi phí thấp.'),(7,'Secker & Warburg','Được thành lập vào năm 1936 tại London, là kết quả của sự hợp nhất giữa Martin Secker và Frederic Warburg. Nhà xuất bản này đi vào lịch sử vì lập trường dũng cảm, sẵn sàng xuất bản các tác phẩm bị coi là gây tranh cãi về mặt chính trị, tiêu biểu nhất là \'Trại súc vật\' và \'1984\' của George Orwell, vào thời điểm mà các tư tưởng này bị kiểm duyệt gắt gao.'),(8,'HarperCollins Publishers','Là một trong \'Big 5\' (5 nhà xuất bản lớn nhất) thế giới, HarperCollins có lịch sử từ đầu thế kỷ 19. Nguồn gốc của nó bắt nguồn từ Harper & Brothers (thành lập tại New York năm 1817) và William Collins, Sons (thành lập tại Scotland năm 1819). Hai công ty này đã sáp nhập qua nhiều bước, và hiện thuộc sở hữu của News Corp.'),(9,'HarperCollins','Là một trong \'Big 5\' (5 nhà xuất bản lớn nhất) thế giới, HarperCollins có lịch sử từ đầu thế kỷ 19. Nguồn gốc của nó bắt nguồn từ Harper & Brothers (thành lập tại New York năm 1817) và William Collins, Sons (thành lập tại Scotland năm 1819). Hai công ty này đã sáp nhập qua nhiều bước, và hiện thuộc sở hữu của News Corp.'),(10,'Simon & Schuster','Được thành lập vào năm 1924 tại New York bởi Richard Simon và M. Lincoln \'Max\' Schuster. Câu chuyện thành công đầu tiên của họ là xuất bản cuốn sách... trò chơi ô chữ đầu tiên, một hiện tượng vào thời đó. Simon & Schuster nhanh chóng phát triển thành một nhà xuất bản đa ngành, nổi tiếng với các tác phẩm thương mại và kỹ năng sống, như của Dale Carnegie.'),(11,'George Routledge & Sons Ltd.','George Routledge & Sons (NXB gốc của \"Đường về nô lệ\") được thành lập năm 1836 tại London. Qua nhiều lần sáp nhập, nó trở thành một phần của Routledge, và hiện nay thuộc tập đoàn Taylor & Francis. Đây là một tập đoàn xuất bản học thuật khổng lồ, tập trung vào sách giáo khoa, tạp chí khoa học và các công trình nghiên cứu chuyên sâu.'),(12,'Hay House LLC','Được thành lập vào năm 1984 bởi Louise Hay. Đây là nhà xuất bản chuyên về sách \"self-help\" (tự lực), phát triển bản thân, tâm linh và tư duy tích cực. Nguồn gốc của nó gắn liền với chính tác phẩm nổi tiếng của Louise Hay, \"You Can Heal Your Life\" (Bạn có thể chữa lành cuộc sống của mình).'),(13,'Faber and Faber','Thường được gọi đơn giản là Faber, đây là một trong những nhà xuất bản văn học độc lập hàng đầu của Anh, được thành lập vào năm 1929. Faber nổi tiếng với danh mục thơ ca (nhà thơ T.S. Eliot là một biên tập viên chủ chốt) và văn học kịch. \"Chúa ruồi\" là một trong những thành công thương mại và phê bình lớn nhất của họ.'),(14,'David Fickling Books','Được thành lập vào năm 2000 bởi David Fickling, ban đầu là một chi nhánh của Random House Children\'s Books, trước khi trở thành một một NXB độc lập vào năm 2013. Họ chuyên về sách thiếu nhi và thanh thiếu niên chất lượng cao, với mục tiêu xuất bản những câu chuyện hay, bất kể thể loại.'),(15,'Editora Rocco Ltd.','Được thành lập vào năm 1975 tại Rio de Janeiro, Brazil, bởi Paulo Rocco. Đây là một trong những nhà xuất bản quan trọng của Brazil. Mặc dù \"Nhà giả kim\" ban đầu được xuất bản bởi một NXB nhỏ khác và không thành công, Editora Rocco đã mua lại quyền và xuất bản lại, góp phần đưa cuốn sách trở thành một hiện tượng toàn cầu.'),(16,'Kadokawa Shoten','Thành lập năm 1945 tại Nhật Bản bởi Genyoshi Kadokawa. Ban đầu tập trung vào văn học Nhật Bản, Kadokawa đã phát triển thành một tập đoàn giải trí khổng lồ, thống trị thị trường manga, light novel (tiểu thuyết nhẹ), anime và trò chơi điện tử. Họ là một thế lực lớn trong việc xuất khẩu văn hóa đại chúng Nhật Bản.'),(17,'Shogakukan (小学館)','Được thành lập năm 1922 tại Nhật Bản. Tên của NXB (Shogakukan) có nghĩa là \"Nhà trường tiểu học\", phản ánh mục tiêu ban đầu là xuất bản tạp chí và tài liệu học tập cho học sinh tiểu học. Ngày nay, Shogakukan là một trong những nhà xuất bản lớn nhất Nhật Bản, nổi tiếng với các tạp chí manga (như Shonen Sunday) và các tác phẩm văn học đại chúng.'),(18,'Frederick A. Stokes Company','\"Không còn hoạt động\". Được thành lập vào năm 1881 tại New York, Frederick A. Stokes là một NXB quan trọng vào cuối thế kỷ 19 và đầu thế kỷ 20. Họ xuất bản nhiều thể loại, bao gồm cả sách thiếu nhi (nó là NXB đầu tiên của \"The Story of Doctor Dolittle\") và sách phi hư cấu. Họ đã bị bán lại và sáp nhập vào J.B. Lippincott Company vào năm 1941.'),(19,'Elliott & Thompson','Là một nhà xuất bản độc lập của Anh, được thành lập vào năm 2002. Họ tập trung vào việc xuất bản các cuốn sách phi hư cấu (non-fiction) có nội dung hấp dẫn, dễ tiếp cận nhưng giàu thông tin, với mục tiêu \"xuất bản những cuốn sách mà chúng tôi thích đọc\". \"Những tù nhân của địa lý\" là một thành công lớn, thể hiện rõ triết lý này.'),(20,'Kinneret, Zmora-Bitan, Dvir','Đây là một trong những tập đoàn xuất bản lớn nhất và hàng đầu tại Israel, được hình thành từ sự hợp nhất của nhiều nhà xuất bản lâu đời (Dvir thành lập năm 1924). Họ xuất bản đa dạng các thể loại từ văn học Israel, sách dịch, sách thiếu nhi đến sách phi hư cấu, và là đơn vị đầu tiên nhận ra tiềm năng của \"Lược sử loài người\" bằng tiếng Hebrew.'),(21,'Taller del Éxito','Được thành lập vào năm 1993 bởi chính tác giả Dr. Camilo Cruz, Taller del Éxito (nghĩa là \"Xưởng Thành công\") là một công ty có trụ sở tại Hoa Kỳ. Họ chuyên xuất bản sách, sách nói (audiobook) và các tài liệu về phát triển cá nhân, lãnh đạo và tài chính. Mục tiêu chính của họ là phục vụ cộng đồng nói tiếng Tây Ban Nha trên toàn thế giới, cung cấp các công cụ để đạt được thành công.'),(22,'Nhà xuất bản Kim Đồng','Được thành lập vào ngày 17 tháng 6 năm 1957. Đây là nhà xuất bản đầu tiên và lớn nhất tại Việt Nam chuyên về sách cho thiếu nhi và thanh thiếu niên. Tên của NXB được đặt theo tên người anh hùng thiếu niên Kim Đồng. NXB Kim Đồng gắn liền với tuổi thơ của nhiều thế hệ người Việt qua các bộ truyện tranh (như Doraemon) và các tác phẩm văn học kinh điển trong nước và quốc tế.'),(23,'Nhà xuất bản Quân đội Nhân dân','Thành lập ngày 11 tháng 7 năm 1950. Đây là nhà xuất bản trực thuộc Tổng cục Chính trị Quân đội Nhân dân Việt Nam. Chức năng chính là xuất bản các sách, tài liệu phục vụ nhiệm vụ chính trị, quân sự, quốc phòng, và các tác phẩm văn học về đề tài chiến tranh cách mạng và người lính, như \"Mưa đỏ\".'),(24,'Nhà xuất bản Trẻ','Được thành lập chính thức vào năm 1981, bắt nguồn từ Nhà xuất bản của Đoàn Thanh niên Cộng sản TP. Hồ Chí Minh. NXB Trẻ là một trong những đơn vị xuất bản năng động và lớn mạnh nhất Việt Nam, đặc biệt mạnh về văn học trong nước (như của Nguyễn Nhật Ánh), văn học dịch và sách cho giới trẻ.'),(25,'Nhã Nam','Được thành lập vào năm 2005, Nhã Nam (tên đầy đủ là Công ty Cổ phần Văn hóa và Truyền thông Nhã Nam) là một công ty sách tư nhân (không phải nhà xuất bản, họ liên kết với các NXB nhà nước để xin giấy phép). Nhã Nam nhanh chóng trở thành một thương hiệu hàng đầu trong việc giới thiệu văn học dịch có giá trị và các tác phẩm văn học Việt Nam đương đại, nổi tiếng với thiết kế bìa sách đặc trưng.'),(26,'Nhà xuất bản Hội Nhà văn','Được thành lập vào năm 1957, cùng thời điểm thành lập Hội Nhà văn Việt Nam. Đây là cơ quan xuất bản của Hội, chuyên xuất bản các tác phẩm (thơ, văn xuôi, lý luận phê bình) của các hội viên (các nhà văn, nhà thơ) và các tác phẩm văn học có giá trị. Việc xuất bản \"Nhật ký Đặng Thùy Trâm\" là một sự kiện xuất bản lớn, mang lại tiếng vang toàn quốc.'),(27,'Scribe Publications','Scribe Publications (thường được gọi tắt là Scribe) là một nhà xuất bản độc lập có uy tín, được Henry Rosenbloom sáng lập tại Melbourne, Úc vào năm 1976. Khởi điểm từ mong muốn xuất bản các tác phẩm phi hư cấu nghiêm túc, Scribe đã phát triển thành một công ty đa quốc gia, mở rộng chi nhánh Scribe UK tại Luân Đôn vào năm 2013 và có hoạt động mạnh mẽ tại thị trường Bắc Mỹ. Nhà xuất bản này nổi tiếng với việc xuất bản cả tiểu thuyết và phi hư cấu chất lượng cao, tập trung vào các chủ đề quan trọng như chính trị, lịch sử, khoa học, và các vấn đề xã hội. Scribe đã nhiều lần được vinh danh với giải thưởng \"Nhà xuất bản nhỏ của Úc trong năm,\" khẳng định vị thế là một trong những đơn vị xuất bản độc lập hàng đầu thế giới.'),(28,'Warner Business Books','Warner Business Books là một ấn hiệu (imprint) chuyên biệt của Warner Books, một công ty con thuộc tập đoàn truyền thông lớn Time Warner. Warner Books được thành lập vào năm 1970 sau khi Warner Communications mua lại The Paperback Library. Ấn hiệu Warner Business Books được tạo ra để tập trung xuất bản các tác phẩm chất lượng cao về lĩnh vực kinh doanh, tài chính, quản lý và phát triển cá nhân. Ấn hiệu này đã xuất bản nhiều tác giả và sách bán chạy nổi tiếng trong lĩnh vực kinh doanh trước khi Warner Books (cùng với các ấn hiệu khác) được bán cho Hachette Livre vào năm 2006 và sau đó đổi tên thành Grand Central Publishing. Mặc dù không còn tồn tại dưới tên gọi, Warner Business Books đại diện cho một phần quan trọng trong lịch sử xuất bản sách kinh doanh tại Mỹ.');
/*!40000 ALTER TABLE `publishinghouse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ROLE_ADMIN','Quản trị hệ thống, có toàn quyền truy cập và chỉnh sửa dữ liệu.'),(2,'ROLE_USER','Người dùng thông thường, có quyền đọc sách, nghe audiobook và đánh giá.'),(3,'ROLE_AUTHOR','Tac gia, co quyen quan ly tac pham, xem thong ke va tuong tac voi ban doc.');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptionplans`
--

DROP TABLE IF EXISTS `subscriptionplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptionplans`
--

LOCK TABLES `subscriptionplans` WRITE;
/*!40000 ALTER TABLE `subscriptionplans` DISABLE KEYS */;
INSERT INTO `subscriptionplans` VALUES ('BASIC','Cơ bản',49000,30,10,NULL,'[\"Nghe tối đa 10 sách/tháng\", \"Nghe toàn bộ nội dung\", \"Chất lượng âm thanh cao\", \"Tua & chọn chương tự do\"]'),('FREE','Miễn phí',0,0,0,30,'[\"Nghe thử 30 giây/sách\", \"Khám phá thư viện\", \"Đọc mô tả & đánh giá\"]'),('PREMIUM','Premium',99000,30,NULL,NULL,'[\"Nghe không giới hạn sách\", \"Chất lượng lossless\", \"Tua, chọn chương, tốc độ phát\", \"Tải về offline không giới hạn\", \"Truy cập sách độc quyền\"]');
/*!40000 ALTER TABLE `subscriptionplans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','admin123','Admin','User','admin@example.com','','0123456789','Hanoi, Vietnam','1990-01-01',0,0,'2025-01-02 00:00:00',NULL,1,'https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff',0),(2,'bob','bob123','Bob','User','test@test.com','','0987654321','HCMC, Vietnam','1995-05-11',0,0,'2025-11-05 00:00:00','2026-04-27 14:44:24',2,'',0),(3,'test','test123','Test','Tran','test@example.com','','0987654782','','1995-05-10',0,0,'2025-11-29 00:00:00',NULL,2,'',0),(4,'aristotle_author','author123','Aristotle','','aristotle@listenary.com','','0200000010','Athens, Greece','384 TCN',0,0,'2025-11-08 00:00:00',NULL,3,'https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/1.png',1),(5,'paulo_author','author123','Paulo','Coelho','paulo@listenary.com','','0200000022','Brazil','24/8/1947',0,0,'2025-11-08 00:00:00',NULL,3,'https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/22.png',22),(6,'george_author','author123','George','Orwell','george@listenary.com','','0200000021','UK','25/6/1903',0,0,'2025-11-08 00:00:00',NULL,3,'https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/21.png',21),(9,'admin1','123456','','','admin1@gmail.comcom','2026-04-26T17:06:31.057Z',NULL,NULL,NULL,0,0,'2026-04-26 17:06:31','2026-04-26 17:06:31',1,'',0),(10,'duyen','123456','duyen','','duyen@123','','','','',0,0,'2026-04-26 18:14:28',NULL,2,'https://ui-avatars.com/api/?name=duyen&background=7c3aed&color=fff',0),(13,'author','12345','','','123@12',NULL,NULL,NULL,NULL,0,0,'2026-04-27 14:16:48','2026-04-27 14:39:44',3,'',45);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_BeforeUserInsert
BEFORE INSERT ON user FOR EACH ROW
BEGIN
    IF NEW.createdAt IS NULL THEN SET NEW.createdAt = NOW(); END IF;
    IF NEW.roleId IS NULL THEN SET NEW.roleId = 2; END IF;
    IF NEW.loginFailedAttempts IS NULL THEN SET NEW.loginFailedAttempts = 0; END IF;
    IF NEW.hasLocked IS NULL THEN SET NEW.hasLocked = FALSE; END IF;
    IF NEW.authorId IS NULL OR NEW.authorId = 0 THEN SET NEW.authorId = NULL; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `userfavorites`
--

DROP TABLE IF EXISTS `userfavorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userfavorites`
--

LOCK TABLES `userfavorites` WRITE;
/*!40000 ALTER TABLE `userfavorites` DISABLE KEYS */;
INSERT INTO `userfavorites` VALUES (2,2,6),(101,2,9),(1,2,10);
/*!40000 ALTER TABLE `userfavorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usersubscriptions`
--

DROP TABLE IF EXISTS `usersubscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usersubscriptions`
--

LOCK TABLES `usersubscriptions` WRITE;
/*!40000 ALTER TABLE `usersubscriptions` DISABLE KEYS */;
INSERT INTO `usersubscriptions` VALUES (6,2,'PREMIUM','2026-04-29 13:42:43','2026-05-29 13:42:43','{\"cardType\":\"visa\",\"last4\":\"2122\",\"cardNumber\":\"1112112112122122\",\"cardName\":\"22\",\"exp\":\"12/27\",\"cvv\":\"123\"}');
/*!40000 ALTER TABLE `usersubscriptions` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_AfterSubscriptionInsert
AFTER INSERT ON usersubscriptions FOR EACH ROW
BEGIN
    
    SET @last_sub_userId = NEW.userId;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary table structure for view `vw_authorstats`
--

DROP TABLE IF EXISTS `vw_authorstats`;
/*!50001 DROP VIEW IF EXISTS `vw_authorstats`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_bookdetails`
--

DROP TABLE IF EXISTS `vw_bookdetails`;
/*!50001 DROP VIEW IF EXISTS `vw_bookdetails`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_listeninghistory`
--

DROP TABLE IF EXISTS `vw_listeninghistory`;
/*!50001 DROP VIEW IF EXISTS `vw_listeninghistory`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_newestbooks`
--

DROP TABLE IF EXISTS `vw_newestbooks`;
/*!50001 DROP VIEW IF EXISTS `vw_newestbooks`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_pendingbooks`
--

DROP TABLE IF EXISTS `vw_pendingbooks`;
/*!50001 DROP VIEW IF EXISTS `vw_pendingbooks`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_platformdashboard`
--

DROP TABLE IF EXISTS `vw_platformdashboard`;
/*!50001 DROP VIEW IF EXISTS `vw_platformdashboard`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_platformdashboard` AS SELECT
 1 AS `totalBooks`,
  1 AS `totalUsers`,
  1 AS `totalAuthors`,
  1 AS `totalPendingBooks`,
  1 AS `totalSystemViews`,
  1 AS `totalComments` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_trendingbooks`
--

DROP TABLE IF EXISTS `vw_trendingbooks`;
/*!50001 DROP VIEW IF EXISTS `vw_trendingbooks`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_userfavoritebooks`
--

DROP TABLE IF EXISTS `vw_userfavoritebooks`;
/*!50001 DROP VIEW IF EXISTS `vw_userfavoritebooks`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_userprofile`
--

DROP TABLE IF EXISTS `vw_userprofile`;
/*!50001 DROP VIEW IF EXISTS `vw_userprofile`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
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
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'DBMS_Listenary'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_AddComment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_AddNewBook` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_DeleteBook` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_EditBook` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetBooksByAuthor` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_LockUnlockUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ResetWeeklyViews` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ResetWeeklyViews`(OUT p_message VARCHAR(255))
BEGIN
    UPDATE books SET weeklyViewCount = 0, updatedAt = NOW();
    SET p_message = 'SUCCESS: Đã làm mới số lượt xem tuần.';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ToggleFavorite` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UpdateBookApproval` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UpsertListeningHistory` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UserSubscribe` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vw_authorstats`
--

/*!50001 DROP VIEW IF EXISTS `vw_authorstats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_authorstats` AS select `a`.`id` AS `authorId`,`a`.`firstName` AS `firstName`,`a`.`lastName` AS `lastName`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `fullName`,`a`.`imagineUrl` AS `imagineUrl`,`a`.`birthday` AS `birthday`,`a`.`description` AS `authorBio`,count(distinct `b`.`id`) AS `totalBooks`,coalesce(sum(`b`.`viewCount`),0) AS `totalViews`,coalesce(round(avg(`b`.`viewCount`),0),0) AS `avgViewsPerBook`,round(avg(`cm`.`rating`),1) AS `avgRating`,count(distinct `cm`.`id`) AS `totalReviews` from (((`author` `a` left join `authorsofbooks` `aob` on(`aob`.`AuthorId` = `a`.`id`)) left join `books` `b` on(`b`.`id` = `aob`.`BookId` and `b`.`approvalStatus` = 'APPROVED' and `b`.`isHidden` = 0)) left join `comments` `cm` on(`cm`.`bookId` = `b`.`id`)) group by `a`.`id`,`a`.`firstName`,`a`.`lastName`,`a`.`imagineUrl`,`a`.`birthday`,`a`.`description` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_bookdetails`
--

/*!50001 DROP VIEW IF EXISTS `vw_bookdetails`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_bookdetails` AS select `b`.`id` AS `bookId`,`b`.`name` AS `bookName`,`b`.`description` AS `description`,`b`.`thumbnailUrl` AS `thumbnailUrl`,`b`.`country` AS `country`,`b`.`language` AS `language`,`b`.`pageNumber` AS `pageNumber`,`b`.`releaseDate` AS `releaseDate`,`b`.`ebookFileUrl` AS `ebookFileUrl`,`b`.`audioFileUrl` AS `audioFileUrl`,`b`.`copyrightFileUrl` AS `copyrightFileUrl`,`b`.`viewCount` AS `viewCount`,`b`.`weeklyViewCount` AS `weeklyViewCount`,`b`.`approvalStatus` AS `approvalStatus`,`b`.`isHidden` AS `isHidden`,`b`.`submittedByUserId` AS `submittedByUserId`,`b`.`createdAt` AS `bookCreatedAt`,`b`.`updatedAt` AS `bookUpdatedAt`,`a`.`id` AS `authorId`,`a`.`firstName` AS `authorFirstName`,`a`.`lastName` AS `authorLastName`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `authorFullName`,`a`.`imagineUrl` AS `authorImageUrl`,`c`.`id` AS `categoryId`,`c`.`name` AS `categoryName`,`ph`.`id` AS `publishingHouseId`,`ph`.`name` AS `publishingHouseName`,round(avg(`cm`.`rating`),1) AS `avgRating`,count(distinct `cm`.`id`) AS `totalReviews` from ((((((`books` `b` left join `authorsofbooks` `aob` on(`aob`.`BookId` = `b`.`id`)) left join `author` `a` on(`a`.`id` = `aob`.`AuthorId`)) left join `categoriesofbooks` `cob` on(`cob`.`BookId` = `b`.`id`)) left join `category` `c` on(`c`.`id` = `cob`.`CategoryId`)) left join `publishinghouse` `ph` on(`ph`.`id` = `b`.`PublishingHouseId`)) left join `comments` `cm` on(`cm`.`bookId` = `b`.`id`)) group by `b`.`id`,`b`.`name`,`b`.`description`,`b`.`thumbnailUrl`,`b`.`country`,`b`.`language`,`b`.`pageNumber`,`b`.`releaseDate`,`b`.`ebookFileUrl`,`b`.`audioFileUrl`,`b`.`copyrightFileUrl`,`b`.`viewCount`,`b`.`weeklyViewCount`,`b`.`approvalStatus`,`b`.`isHidden`,`b`.`submittedByUserId`,`b`.`createdAt`,`b`.`updatedAt`,`a`.`id`,`a`.`firstName`,`a`.`lastName`,`a`.`imagineUrl`,`c`.`id`,`c`.`name`,`ph`.`id`,`ph`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_listeninghistory`
--

/*!50001 DROP VIEW IF EXISTS `vw_listeninghistory`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_listeninghistory` AS select `lab`.`id` AS `historyId`,`lab`.`userId` AS `userId`,`lab`.`bookId` AS `bookId`,`lab`.`audioChapterId` AS `audioChapterId`,`lab`.`audioTimeline` AS `audioTimeline`,`lab`.`isFinished` AS `isFinished`,`lab`.`lastListenedAt` AS `lastListenedAt`,`b`.`name` AS `bookName`,`b`.`thumbnailUrl` AS `bookThumbnail`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `authorFullName`,`ac`.`chapterNumber` AS `chapterNumber`,`ac`.`name` AS `chapterName`,`ac`.`duration` AS `duration` from ((((`listeningaudiobook` `lab` join `books` `b` on(`b`.`id` = `lab`.`bookId`)) left join `authorsofbooks` `aob` on(`aob`.`BookId` = `b`.`id`)) left join `author` `a` on(`a`.`id` = `aob`.`AuthorId`)) left join `audiochapter` `ac` on(`ac`.`id` = `lab`.`audioChapterId`)) order by `lab`.`lastListenedAt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_newestbooks`
--

/*!50001 DROP VIEW IF EXISTS `vw_newestbooks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_newestbooks` AS select `b`.`id` AS `bookId`,`b`.`name` AS `bookName`,`b`.`thumbnailUrl` AS `thumbnailUrl`,`b`.`releaseDate` AS `releaseDate`,`b`.`viewCount` AS `viewCount`,`b`.`createdAt` AS `createdAt`,`b`.`approvalStatus` AS `approvalStatus`,`b`.`isHidden` AS `isHidden`,`a`.`id` AS `authorId`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `authorFullName`,`c`.`name` AS `categoryName` from ((((`books` `b` left join `authorsofbooks` `aob` on(`aob`.`BookId` = `b`.`id`)) left join `author` `a` on(`a`.`id` = `aob`.`AuthorId`)) left join `categoriesofbooks` `cob` on(`cob`.`BookId` = `b`.`id`)) left join `category` `c` on(`c`.`id` = `cob`.`CategoryId`)) where `b`.`approvalStatus` = 'APPROVED' and `b`.`isHidden` = 0 and `b`.`thumbnailUrl` is not null and `b`.`thumbnailUrl` <> '' order by `b`.`createdAt` desc,coalesce(`b`.`releaseDate`,0) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_pendingbooks`
--

/*!50001 DROP VIEW IF EXISTS `vw_pendingbooks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_pendingbooks` AS select `b`.`id` AS `bookId`,`b`.`name` AS `bookName`,`b`.`thumbnailUrl` AS `thumbnailUrl`,`b`.`description` AS `description`,`b`.`copyrightFileUrl` AS `copyrightFileUrl`,`b`.`approvalStatus` AS `approvalStatus`,`b`.`createdAt` AS `submittedAt`,`b`.`submittedByUserId` AS `submittedByUserId`,concat(`u`.`firstName`,' ',`u`.`lastName`) AS `submittedByName`,`u`.`username` AS `submittedByUsername`,`a`.`id` AS `authorId`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `authorFullName`,`c`.`name` AS `categoryName` from (((((`books` `b` left join `user` `u` on(`u`.`id` = `b`.`submittedByUserId`)) left join `authorsofbooks` `aob` on(`aob`.`BookId` = `b`.`id`)) left join `author` `a` on(`a`.`id` = `aob`.`AuthorId`)) left join `categoriesofbooks` `cob` on(`cob`.`BookId` = `b`.`id`)) left join `category` `c` on(`c`.`id` = `cob`.`CategoryId`)) where `b`.`approvalStatus` = 'PENDING' order by `b`.`createdAt` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_platformdashboard`
--

/*!50001 DROP VIEW IF EXISTS `vw_platformdashboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_platformdashboard` AS select (select count(0) from `books`) AS `totalBooks`,(select count(0) from `user` where `user`.`roleId` = 2) AS `totalUsers`,(select count(0) from `author`) AS `totalAuthors`,(select count(0) from `books` where `books`.`approvalStatus` = 'PENDING') AS `totalPendingBooks`,(select coalesce(sum(`books`.`viewCount`),0) from `books`) AS `totalSystemViews`,(select count(0) from `comments`) AS `totalComments` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_trendingbooks`
--

/*!50001 DROP VIEW IF EXISTS `vw_trendingbooks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_trendingbooks` AS select `b`.`id` AS `bookId`,`b`.`name` AS `bookName`,`b`.`thumbnailUrl` AS `thumbnailUrl`,`b`.`description` AS `description`,`b`.`viewCount` AS `viewCount`,`b`.`weeklyViewCount` AS `weeklyViewCount`,`b`.`releaseDate` AS `releaseDate`,`b`.`country` AS `country`,`b`.`approvalStatus` AS `approvalStatus`,`a`.`id` AS `authorId`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `authorFullName`,`a`.`imagineUrl` AS `authorImageUrl`,`c`.`name` AS `categoryName`,round(avg(`cm`.`rating`),1) AS `avgRating`,count(distinct `cm`.`id`) AS `totalReviews` from (((((`books` `b` left join `authorsofbooks` `aob` on(`aob`.`BookId` = `b`.`id`)) left join `author` `a` on(`a`.`id` = `aob`.`AuthorId`)) left join `categoriesofbooks` `cob` on(`cob`.`BookId` = `b`.`id`)) left join `category` `c` on(`c`.`id` = `cob`.`CategoryId`)) left join `comments` `cm` on(`cm`.`bookId` = `b`.`id`)) where `b`.`approvalStatus` = 'APPROVED' and `b`.`isHidden` = 0 group by `b`.`id`,`b`.`name`,`b`.`thumbnailUrl`,`b`.`description`,`b`.`viewCount`,`b`.`weeklyViewCount`,`b`.`releaseDate`,`b`.`country`,`b`.`approvalStatus`,`a`.`id`,`a`.`firstName`,`a`.`lastName`,`a`.`imagineUrl`,`c`.`name` order by `b`.`viewCount` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_userfavoritebooks`
--

/*!50001 DROP VIEW IF EXISTS `vw_userfavoritebooks`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_userfavoritebooks` AS select `uf`.`userId` AS `userId`,`uf`.`bookId` AS `bookId`,`b`.`name` AS `bookName`,`b`.`thumbnailUrl` AS `thumbnailUrl`,`b`.`viewCount` AS `viewCount`,`b`.`approvalStatus` AS `approvalStatus`,`a`.`id` AS `authorId`,concat(`a`.`firstName`,' ',`a`.`lastName`) AS `authorFullName`,round(avg(`cm`.`rating`),1) AS `avgRating` from ((((`userfavorites` `uf` join `books` `b` on(`b`.`id` = `uf`.`bookId`)) left join `authorsofbooks` `aob` on(`aob`.`BookId` = `b`.`id`)) left join `author` `a` on(`a`.`id` = `aob`.`AuthorId`)) left join `comments` `cm` on(`cm`.`bookId` = `b`.`id`)) where `b`.`approvalStatus` = 'APPROVED' and `b`.`isHidden` = 0 group by `uf`.`userId`,`uf`.`bookId`,`b`.`id`,`b`.`name`,`b`.`thumbnailUrl`,`b`.`viewCount`,`b`.`approvalStatus`,`a`.`id`,`a`.`firstName`,`a`.`lastName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_userprofile`
--

/*!50001 DROP VIEW IF EXISTS `vw_userprofile`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_userprofile` AS select `u`.`id` AS `userId`,`u`.`username` AS `username`,`u`.`firstName` AS `firstName`,`u`.`lastName` AS `lastName`,concat(`u`.`firstName`,' ',`u`.`lastName`) AS `fullName`,`u`.`email` AS `email`,`u`.`emailVerifiedAt` AS `emailVerifiedAt`,`u`.`phoneNumber` AS `phoneNumber`,`u`.`addresses` AS `addresses`,`u`.`birthday` AS `birthday`,`u`.`thumbnailUrl` AS `thumbnailUrl`,`u`.`hasLocked` AS `hasLocked`,`u`.`loginFailedAttempts` AS `loginFailedAttempts`,`u`.`createdAt` AS `userCreatedAt`,`u`.`roleId` AS `roleId`,`r`.`name` AS `roleName`,`us`.`planId` AS `currentPlanId`,`sp`.`name` AS `currentPlanName`,`sp`.`price` AS `planPrice`,`us`.`startDate` AS `subStartDate`,`us`.`endDate` AS `subEndDate`,`u`.`authorId` AS `authorId`,`a`.`firstName` AS `authorFirstName`,`a`.`lastName` AS `authorLastName` from ((((`user` `u` join `role` `r` on(`r`.`id` = `u`.`roleId`)) left join `usersubscriptions` `us` on(`us`.`userId` = `u`.`id` and `us`.`endDate` >= current_timestamp())) left join `subscriptionplans` `sp` on(`sp`.`id` = `us`.`planId`)) left join `author` `a` on(`a`.`id` = `u`.`authorId`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12 22:00:36
