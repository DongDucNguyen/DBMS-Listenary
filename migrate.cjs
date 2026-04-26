const fs = require('fs');

const dataRaw = fs.readFileSync('./public/database.json', 'utf8');
const data = JSON.parse(dataRaw);

// 1. Them ROLE_AUTHOR
if (!data.role.find(r => r.id === 3)) {
  data.role.push({
    id: 3,
    name: "ROLE_AUTHOR",
    description: "Tac gia, co quyen quan ly tac pham, xem thong ke va tuong tac voi ban doc."
  });
}

// 2. Gan authorId cho sach (dua tren thu tu sach trong database.json)
const authorBookMap = {
  1:[1], 2:[2], 3:[3], 4:[4], 5:[5], 6:[6,7],
  7:[8], 8:[9,10], 9:[11], 10:[12,15], 11:[13], 12:[14],
  13:[16], 14:[17], 15:[18], 16:[19], 17:[20], 18:[21],
  19:[22], 20:[23], 21:[24,25,26], 22:[27], 23:[28,29,30],
  24:[31], 25:[32], 26:[33], 27:[34], 28:[35], 29:[36],
  30:[37], 31:[38], 32:[39], 33:[40], 34:[41], 35:[42],
  36:[43], 37:[44], 38:[45], 39:[46], 40:[47], 41:[48], 42:[49], 43:[50]
};
const bookToAuthor = {};
Object.entries(authorBookMap).forEach(([authorId, bookIds]) => {
  bookIds.forEach(bId => { bookToAuthor[bId] = parseInt(authorId); });
});
data.books.forEach(book => {
  if (!book.authorId) {
    book.authorId = bookToAuthor[book.id] || null;
  }
});

// 3. Them comments array nen
if (!data.comments) {
  data.comments = [
    { id: 1, userId: 2, bookId: 10, rating: 5.0, title: "Tuyet tac!", content: "Mot cuon sach thay doi tu duy cua minh hoan toan.", createdAt: "2025-11-20" },
    { id: 2, userId: 2, bookId: 6, rating: 4.5, title: "Rat hay", content: "Bai hoc gian di nhung sau sac, nen doc.", createdAt: "2025-11-22" },
    { id: 3, userId: 3, bookId: 6, rating: 5.0, title: "Tuyet", content: "Cuon sach hay nhat toi tung doc.", createdAt: "2025-11-25" },
    { id: 4, userId: 3, bookId: 10, rating: 4.0, title: "Kha hay", content: "Nhieu bai hoc thuc tien ve giao tiep.", createdAt: "2025-11-27" },
    { id: 5, userId: 2, bookId: 8, rating: 4.0, title: "Tham, y nghia", content: "Giup minh song tich cuc hon.", createdAt: "2025-12-01" }
  ];
}

// 4. Them subscription va readingHistory cho user
const bobIndex = data.user.findIndex(u => u.username === 'bob');
if (bobIndex !== -1) {
  data.user[bobIndex].subscriptionPlan = "PREMIUM";
  data.user[bobIndex].subscriptionEndDate = "2026-12-30T23:59:59Z";
  data.user[bobIndex].readingHistory = [
    { bookId: 10, progress: 45, lastListened: "2025-12-01T14:30:00Z" },
    { bookId: 6, progress: 90, lastListened: "2025-11-30T09:00:00Z" },
    { bookId: 8, progress: 20, lastListened: "2025-11-28T20:00:00Z" }
  ];
  data.user[bobIndex].favoriteBookIds = [10, 6, 27];
}

const testIndex = data.user.findIndex(u => u.username === 'test');
if (testIndex !== -1) {
  data.user[testIndex].subscriptionPlan = "FREE";
  data.user[testIndex].subscriptionEndDate = null;
  data.user[testIndex].readingHistory = [];
  data.user[testIndex].favoriteBookIds = [];
}

// 5. Cap nhat admin
const adminIndex = data.user.findIndex(u => u.username === 'admin');
if (adminIndex !== -1) {
  data.user[adminIndex].thumbnailUrl = "https://ui-avatars.com/api/?name=Admin+User&background=7c3aed&color=fff";
}

// 6. Them tai khoan tac gia (roleId = 3)
const authorAccounts = [
  { id: 4, username: "aristotle_author", email: "aristotle@listenary.com", encryptedPassword: "author123", roleId: 3, authorId: 1, firstName: "Aristotle", lastName: "", thumbnailUrl: "https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/1.png", phoneNumber: "0200000001", birthday: "384 TCN", addresses: "Athens, Greece", createdAt: "2025-11-08" },
  { id: 5, username: "paulo_author", email: "paulo@listenary.com", encryptedPassword: "author123", roleId: 3, authorId: 22, firstName: "Paulo", lastName: "Coelho", thumbnailUrl: "https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/22.png", phoneNumber: "0200000022", birthday: "24/8/1947", addresses: "Brazil", createdAt: "2025-11-08" },
  { id: 6, username: "george_author", email: "george@listenary.com", encryptedPassword: "author123", roleId: 3, authorId: 21, firstName: "George", lastName: "Orwell", thumbnailUrl: "https://raw.githubusercontent.com/Kaohtp/images-authors-books/refs/heads/main/author/21.png", phoneNumber: "0200000021", birthday: "25/6/1903", addresses: "UK", createdAt: "2025-11-08" }
];
authorAccounts.forEach(acc => {
  if (!data.user.find(u => u.id === acc.id)) {
    data.user.push(acc);
  }
});

// 7. Them subscriptions array (goi cuoc)
if (!data.subscriptionPlans) {
  data.subscriptionPlans = [
    { id: "FREE", name: "Miễn phí", price: 0, duration: 0, features: ["Nghe 5 sách/tháng", "Chất lượng tiêu chuẩn"] },
    { id: "BASIC", name: "Cơ bản", price: 49000, duration: 30, features: ["Nghe không giới hạn", "Chất lượng cao", "Tải về offline 5 sách"] },
    { id: "PREMIUM", name: "Premium", price: 99000, duration: 30, features: ["Tất cả tính năng Basic", "Chất lượng lossless", "Tải về không giới hạn", "Truy cập sách độc quyền"] }
  ];
}

fs.writeFileSync('./public/database.json', JSON.stringify(data, null, 2));
console.log("✅ Database updated successfully!");
console.log("Roles:", data.role.map(r => r.name));
console.log("Users:", data.user.map(u => `${u.username}(role:${u.roleId})`));
console.log("Books with authorId:", data.books.filter(b => b.authorId).length, "/", data.books.length);
