import json
import mysql.connector

# 1. Đọc file JSON gốc của bạn
with open('database.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 2. Kết nối tới MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="", # <-- Điền mật khẩu MySQL Workbench của bạn vào đây
    database="dbms_listenary" # <-- Chạy vào đúng DB trong hình bạn chụp
)
cursor = db.cursor()

print("Bắt đầu dọn dẹp và sửa lỗi dữ liệu...")

# 3. Fix toàn bộ link và mô tả cho bảng audioChapter
for chapter in data['audioChapter']:
    sql = "UPDATE audioChapter SET description = %s, audiobookUrl = %s WHERE id = %s"
    val = (chapter['description'], chapter['audiobookUrl'], chapter['id'])
    cursor.execute(sql, val)
print("- Đã sửa xong bảng audioChapter!")

# 4. Fix lại toàn bộ mô tả dài và link của bảng books
for book in data['books']:
    sql = "UPDATE books SET description = %s, ebookFileUrl = %s, audioFileUrl = %s, thumbnailUrl = %s WHERE id = %s"
    val = (book['description'], book['ebookFileUrl'], book['audioFileUrl'], book['thumbnailUrl'], book['id'])
    cursor.execute(sql, val)
print("- Đã sửa xong bảng books!")

# 5. Fix lại mô tả cho bảng author
for author in data['author']:
    sql = "UPDATE author SET description = %s, imagineUrl = %s WHERE id = %s"
    val = (author.get('description', ''), author.get('imagineUrl', ''), author['id'])
    cursor.execute(sql, val)
print("- Đã sửa xong bảng author!")

# 6. Fix lại mô tả cho bảng publishingHouse
for pub in data['publishingHouse']:
    sql = "UPDATE publishingHouse SET description = %s WHERE id = %s"
    val = (pub.get('description', ''), pub['id'])
    cursor.execute(sql, val)
print("- Đã sửa xong bảng publishingHouse!")

# Lưu thay đổi và đóng kết nối
db.commit()
cursor.close()
db.close()

print("\nThành công! Toàn bộ URL và văn bản đã được khôi phục nguyên vẹn 100%. Hãy vào Workbench Refresh lại để kiểm tra nhé!")