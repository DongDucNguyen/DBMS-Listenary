import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// Vite Plugin để giả lập Backend API ghi thẳng vào database.json
const mockDbApiPlugin = () => ({
  name: 'mock-db-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url.startsWith('/api/')) {
        return next();
      }

      const dbPath = path.resolve(__dirname, 'public/database.json');
      let dbData = {};
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Cannot read db' }));
        return;
      }

      // Xử lý JSON body
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        let payload = {};
        if (body) {
          try { payload = JSON.parse(body); } catch (e) { }
        }

        // Endpoint: Thêm Comment
        if (req.method === 'POST' && req.url === '/api/comments') {
          if (!dbData.comments) dbData.comments = [];
          dbData.comments.unshift(payload);
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // Endpoint: Sửa Comment
        if (req.method === 'PUT' && req.url.startsWith('/api/comments/')) {
          const cid = parseInt(req.url.split('/').pop(), 10);
          if (dbData.comments) {
            const idx = dbData.comments.findIndex(c => parseInt(c.id, 10) === cid);
            if (idx >= 0) {
              dbData.comments[idx].content = payload.content;
              dbData.comments[idx].rating = payload.rating;
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            }
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // Endpoint: Xoá Comment
        if (req.method === 'DELETE' && req.url.startsWith('/api/comments/')) {
          const cid = parseInt(req.url.split('/').pop(), 10);
          if (dbData.comments) {
            dbData.comments = dbData.comments.filter(c => parseInt(c.id, 10) !== cid);
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // Endpoint: Thêm Favorite
        if (req.method === 'POST' && req.url === '/api/favorites') {
          const { userId, bookId } = payload;
          if (!dbData.userFavorites) dbData.userFavorites = [];
          if (!dbData.userFavorites.find(f => f.userId === userId && f.bookId === bookId)) {
            const newId = dbData.userFavorites.length > 0 ? Math.max(...dbData.userFavorites.map(f => f.id)) + 1 : 1;
            dbData.userFavorites.unshift({ id: newId, userId, bookId });
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // Endpoint: Xóa Favorite
        if (req.method === 'DELETE' && req.url.startsWith('/api/favorites/')) {
          const parts = req.url.split('/');
          const userId = parseInt(parts[3], 10);
          const bookId = parseInt(parts[4], 10);
          if (dbData.userFavorites) {
            dbData.userFavorites = dbData.userFavorites.filter(f => !(f.userId === userId && f.bookId === bookId));
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // Endpoint: Chỉnh sửa sách (PUT /api/books/:id/edit) → đưa về PENDING
        if (req.method === 'PUT' && req.url.startsWith('/api/books/')) {
          const parts = req.url.split('/');
          if (parts[4] === 'edit') {
            const bookId = parseInt(parts[3], 10);
            const book = dbData.books.find(b => b.id === bookId);
            if (book) {
              // Cập nhật các trường được gửi lên
              if (payload.name !== undefined) book.name = payload.name;
              if (payload.description !== undefined) book.description = payload.description;
              if (payload.country !== undefined) book.country = payload.country;
              if (payload.language !== undefined) book.language = payload.language;
              if (payload.pageNumber !== undefined) book.pageNumber = parseInt(payload.pageNumber) || 0;
              if (payload.releaseDate !== undefined) book.releaseDate = payload.releaseDate;
              if (payload.thumbnailUrl !== undefined) book.thumbnailUrl = payload.thumbnailUrl;
              if (payload.ebookFileUrl !== undefined) book.ebookFileUrl = payload.ebookFileUrl;
              if (payload.audioFileUrl !== undefined) book.audioFileUrl = payload.audioFileUrl;
              if (payload.copyrightFileUrl !== undefined) book.copyrightFileUrl = payload.copyrightFileUrl;
              if (payload.PublishingHouseId !== undefined) book.PublishingHouseId = payload.PublishingHouseId ? parseInt(payload.PublishingHouseId) : null;

              // Cập nhật category nếu thay đổi
              if (payload.categoryId !== undefined) {
                book.categoryId = payload.categoryId ? parseInt(payload.categoryId) : null;
                if (!dbData.categoriesOfBooks) dbData.categoriesOfBooks = [];
                dbData.categoriesOfBooks = dbData.categoriesOfBooks.filter(r => r.BookId !== bookId);
                if (payload.categoryId) {
                  dbData.categoriesOfBooks.push({ BookId: bookId, CategoryId: parseInt(payload.categoryId) });
                }
              }

              // Đưa về trạng thái PENDING để admin duyệt lại
              book.approvalStatus = 'PENDING';
              book.updatedAt = new Date().toISOString();
              book.editedAt = new Date().toISOString();
              // Xóa các trường duyệt cũ
              delete book.approvedAt;
              delete book.rejectedAt;
              delete book.rejectionReason;

              // Edit chapters
              if (payload.chapters && Array.isArray(payload.chapters)) {
                if (!dbData.audioChapter) dbData.audioChapter = [];
                // remove old chapters
                dbData.audioChapter = dbData.audioChapter.filter(c => c.bookId !== bookId);
                // add new ones
                payload.chapters.forEach((ch, idx) => {
                  const newChapId = dbData.audioChapter.length > 0 ? Math.max(...dbData.audioChapter.map(x => x.id)) + 1 : 1;
                  dbData.audioChapter.push({
                    id: newChapId,
                    bookId: bookId,
                    chapterNumber: idx + 1,
                    name: ch.name || `Chương ${idx + 1}`,
                    duration: ch.duration || 0,
                    audiobookUrl: ch.audiobookUrl || ''
                  });
                });
              }

              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, book }));
              return;
            }
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Book not found' }));
            return;
          }
        }

        // Endpoint: Xóa sách (DELETE /api/books/:id) — yêu cầu mật khẩu
        if (req.method === 'DELETE' && req.url.startsWith('/api/books/')) {
          const parts = req.url.split('/');
          const bookId = parseInt(parts[3], 10);

          // Xác thực mật khẩu
          const userId = parseInt(payload.userId, 10);
          const password = payload.password;
          const user = dbData.user.find(u => u.id === userId);

          if (!user || user.encryptedPassword !== password) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Mật khẩu không đúng' }));
            return;
          }

          // Xóa sách
          const bookIndex = dbData.books.findIndex(b => b.id === bookId);
          if (bookIndex >= 0) {
            dbData.books.splice(bookIndex, 1);
            // Xóa quan hệ authorsOfBooks
            if (dbData.authorsOfBooks) {
              dbData.authorsOfBooks = dbData.authorsOfBooks.filter(r => r.BookId !== bookId);
            }
            // Xóa quan hệ categoriesOfBooks
            if (dbData.categoriesOfBooks) {
              dbData.categoriesOfBooks = dbData.categoriesOfBooks.filter(r => r.BookId !== bookId);
            }
            // Xóa audioChapter liên quan
            if (dbData.audioChapter) {
              dbData.audioChapter = dbData.audioChapter.filter(c => c.bookId !== bookId);
            }
            // Xóa comments liên quan
            if (dbData.comments) {
              dbData.comments = dbData.comments.filter(c => c.bookId !== bookId);
            }
            // Xóa favorites liên quan
            if (dbData.userFavorites) {
              dbData.userFavorites = dbData.userFavorites.filter(f => f.bookId !== bookId);
            }
            // Xóa listening history liên quan
            if (dbData.listeningAudioBook) {
              dbData.listeningAudioBook = dbData.listeningAudioBook.filter(h => h.bookId !== bookId);
            }

            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Book not found' }));
          return;
        }

        // Endpoint: Tăng lượt view của Sách
        if (req.method === 'POST' && req.url.startsWith('/api/books/')) {
          const parts = req.url.split('/');

          // POST /api/books/submit — Tác giả gửi sách mới (trạng thái PENDING)
          if (parts[3] === 'submit') {
            const newId = dbData.books.length > 0 ? Math.max(...dbData.books.map(b => b.id)) + 1 : 1;
            const newBook = {
              id: newId,
              name: payload.name || 'Untitled',
              thumbnailUrl: payload.thumbnailUrl || '',
              description: payload.description || '',
              country: payload.country || '',
              language: payload.language || 'VN',
              pageNumber: parseInt(payload.pageNumber) || 0,
              releaseDate: payload.releaseDate || null,
              ebookFileUrl: payload.ebookFileUrl || '',
              weeklyViewCount: 0,
              lastWeekReset: null,
              PublishingHouseId: payload.PublishingHouseId ? parseInt(payload.PublishingHouseId) : null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              authorId: parseInt(payload.authorId),
              viewCount: 0,
              approvalStatus: 'PENDING',
              audioFileUrl: payload.audioFileUrl || '',
              copyrightFileUrl: payload.copyrightFileUrl || '',
              submittedByUserId: parseInt(payload.submittedByUserId) || null,
              submittedAt: new Date().toISOString(),
              categoryId: payload.categoryId ? parseInt(payload.categoryId) : null
            };
            dbData.books.push(newBook);

            // Thêm vào categoriesOfBooks nếu có
            if (payload.categoryId) {
              if (!dbData.categoriesOfBooks) dbData.categoriesOfBooks = [];
              dbData.categoriesOfBooks.push({
                BookId: newId,
                CategoryId: parseInt(payload.categoryId)
              });
            }

            // Thêm vào authorsOfBooks
            if (!dbData.authorsOfBooks) dbData.authorsOfBooks = [];
            dbData.authorsOfBooks.push({
              BookId: newId,
              AuthorId: parseInt(payload.authorId)
            });

            // Thêm Chapters (nếu có)
            if (payload.chapters && Array.isArray(payload.chapters)) {
              if (!dbData.audioChapter) dbData.audioChapter = [];
              payload.chapters.forEach((ch, idx) => {
                const newChapId = dbData.audioChapter.length > 0 ? Math.max(...dbData.audioChapter.map(x => x.id)) + 1 : 1;
                dbData.audioChapter.push({
                  id: newChapId,
                  bookId: newId,
                  chapterNumber: idx + 1,
                  name: ch.name || `Chương ${idx + 1}`,
                  duration: ch.duration || 0,
                  audiobookUrl: ch.audiobookUrl || ''
                });
              });
            }

            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, book: newBook }));
            return;
          }

          // POST /api/books/:id/approve — Admin duyệt sách
          if (parts[4] === 'approve') {
            const bookId = parseInt(parts[3], 10);
            const book = dbData.books.find(b => b.id === bookId);
            if (book) {
              book.approvalStatus = 'APPROVED';
              book.updatedAt = new Date().toISOString();
              book.approvedAt = new Date().toISOString();
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, book }));
              return;
            }
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Book not found' }));
            return;
          }

          // POST /api/books/:id/reject — Admin từ chối sách
          if (parts[4] === 'reject') {
            const bookId = parseInt(parts[3], 10);
            const book = dbData.books.find(b => b.id === bookId);
            if (book) {
              book.approvalStatus = 'REJECTED';
              book.updatedAt = new Date().toISOString();
              book.rejectedAt = new Date().toISOString();
              book.rejectionReason = payload.reason || '';
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, book }));
              return;
            }
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Book not found' }));
            return;
          }

          // POST /api/books/:id/view — Tăng lượt view
          if (parts[4] === 'view') {
            const bookId = parseInt(parts[3], 10);
            const book = dbData.books.find(b => b.id === bookId);
            if (book) {
              book.viewCount = (book.viewCount || 0) + 1;
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, viewCount: book.viewCount }));
              return;
            }
          }
        }

        // Endpoint: Cập nhật Lịch sử nghe (Reading History)
        if (req.method === 'POST' && req.url === '/api/history') {
          const uId = parseInt(payload.userId, 10);
          const bId = parseInt(payload.bookId, 10);
          const { progress, lastListened } = payload;

          if (!dbData.listeningAudioBook) dbData.listeningAudioBook = [];

          const idx = dbData.listeningAudioBook.findIndex(h => h.userId === uId && h.bookId === bId);
          if (idx >= 0) {
            dbData.listeningAudioBook[idx].audioTimeline = progress;
            dbData.listeningAudioBook[idx].lastListenedAt = lastListened;
            if (progress >= 100) dbData.listeningAudioBook[idx].isFinished = true;
          } else {
            const newId = dbData.listeningAudioBook.length > 0 ? Math.max(...dbData.listeningAudioBook.map(x => x.id)) + 1 : 1;
            dbData.listeningAudioBook.unshift({
              id: newId,
              userId: uId,
              bookId: bId,
              audioTimeline: progress,
              isFinished: progress >= 100,
              lastListenedAt: lastListened,
              audioChapterId: 1
            });
          }

          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // Endpoint: Đăng ký / Hủy gói cước
        if (req.method === 'POST' && req.url === '/api/subscription') {
          const { userId, plan, endDate, paymentInfo, action } = payload;
          if (!dbData.userSubscriptions) dbData.userSubscriptions = [];

          if (action === 'SUBSCRIBE') {
            const existingIdx = dbData.userSubscriptions.findIndex(s => s.userId === userId);
            if (existingIdx !== -1) {
              const existingSub = dbData.userSubscriptions[existingIdx];
              if (existingSub.planId === plan) {
                // Cùng gói -> chỉ cập nhật thông tin thanh toán & hạn
                existingSub.endDate = endDate;
                existingSub.paymentInfo = paymentInfo;
              } else {
                // Đổi gói -> xóa cũ thêm mới
                dbData.userSubscriptions.splice(existingIdx, 1);
                const newId = dbData.userSubscriptions.length > 0 ? Math.max(...dbData.userSubscriptions.map(s => s.id)) + 1 : 1;
                dbData.userSubscriptions.push({
                  id: newId,
                  userId: userId,
                  planId: plan,
                  startDate: new Date().toISOString(),
                  endDate: endDate,
                  paymentInfo: paymentInfo
                });
              }
            } else {
              // Thêm gói mới
              const newId = dbData.userSubscriptions.length > 0 ? Math.max(...dbData.userSubscriptions.map(s => s.id)) + 1 : 1;
              dbData.userSubscriptions.push({
                id: newId,
                userId: userId,
                planId: plan,
                startDate: new Date().toISOString(),
                endDate: endDate,
                paymentInfo: paymentInfo
              });
            }
          } else if (action === 'CANCEL') {
            // Hủy gói -> xóa bản ghi của user đó
            dbData.userSubscriptions = dbData.userSubscriptions.filter(s => s.userId !== userId);
          }

          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

          const activeSub = dbData.userSubscriptions.find(s => s.userId === userId && s.status === 'ACTIVE');
          const userSubs = dbData.userSubscriptions.filter(s => s.userId === userId);
          const responseData = {
            subscriptionPlan: activeSub ? activeSub.planId : 'FREE',
            subscriptionEndDate: activeSub ? activeSub.endDate : null,
            paymentInfo: activeSub ? activeSub.paymentInfo : null,
            subscriptionHistory: userSubs
          };

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: responseData }));
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
      });
    });
  }
});

export default defineConfig({
  plugins: [mockDbApiPlugin()],
});
