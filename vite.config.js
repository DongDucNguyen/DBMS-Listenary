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
                // rebuild chapters with startOffset
                let offset = 0;
                payload.chapters.forEach((ch, idx) => {
                  const newChapId = dbData.audioChapter.length > 0 ? Math.max(...dbData.audioChapter.map(x => x.id)) + 1 : 1;
                  dbData.audioChapter.push({
                    id: newChapId,
                    bookId: bookId,
                    chapterNumber: idx + 1,
                    name: ch.name || `Chương ${idx + 1}`,
                    duration: ch.duration || 0,
                    startOffset: offset,
                    audiobookUrl: ch.audiobookUrl || ''
                  });
                  offset += ch.duration || 0;
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

        // Endpoint: Admin Xóa sách không cần mật khẩu (DELETE /api/admin/books/:id)
        if (req.method === 'DELETE' && req.url.startsWith('/api/admin/books/')) {
          const parts = req.url.split('/');
          const bookId = parseInt(parts[4], 10);

          const bookIndex = dbData.books.findIndex(b => b.id === bookId);
          if (bookIndex >= 0) {
            dbData.books.splice(bookIndex, 1);
            // Xóa các liên kết
            if (dbData.authorsOfBooks) dbData.authorsOfBooks = dbData.authorsOfBooks.filter(r => r.BookId !== bookId);
            if (dbData.categoriesOfBooks) dbData.categoriesOfBooks = dbData.categoriesOfBooks.filter(r => r.BookId !== bookId);
            if (dbData.audioChapter) dbData.audioChapter = dbData.audioChapter.filter(c => c.bookId !== bookId);
            if (dbData.comments) dbData.comments = dbData.comments.filter(c => c.bookId !== bookId);
            if (dbData.userFavorites) dbData.userFavorites = dbData.userFavorites.filter(f => f.bookId !== bookId);
            if (dbData.listeningAudioBook) dbData.listeningAudioBook = dbData.listeningAudioBook.filter(h => h.bookId !== bookId);

            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Book not found' }));
          return;
        }

        // Endpoint: Admin toggle ẩn sách
        if (req.method === 'POST' && req.url.startsWith('/api/admin/books/') && req.url.endsWith('/toggleHide')) {
          const parts = req.url.split('/');
          const bookId = parseInt(parts[4], 10);
          
          const book = dbData.books.find(b => b.id === bookId);
          if (book) {
            book.isHidden = !book.isHidden;
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, isHidden: book.isHidden }));
            return;
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Book not found' }));
          return;
        }

        // Endpoint: Admin tạo sách mới
        if (req.method === 'POST' && req.url === '/api/admin/books/create') {
          const newId = dbData.books.length > 0 ? Math.max(...dbData.books.map(b => b.id)) + 1 : 1;
          let finalAuthorId = null;
          let createdAuthor = null;
          if (payload.authorId === 'NEW' && payload.newAuthorName) {
            finalAuthorId = dbData.author.length > 0 ? Math.max(...dbData.author.map(a => a.id)) + 1 : 1;
            const parts = payload.newAuthorName.trim().split(' ');
            const lastName = parts.pop();
            const firstName = parts.join(' ');
            createdAuthor = {
              id: finalAuthorId,
              firstName: firstName,
              lastName: lastName,
              birthday: null,
              imagineUrl: "",
              description: "Tác giả mới"
            };
            dbData.author.push(createdAuthor);
          } else {
            finalAuthorId = parseInt(payload.authorId) || null;
          }

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
            authorId: finalAuthorId,
            viewCount: 0,
            approvalStatus: 'APPROVED', // Admin create is instantly approved
            audioFileUrl: payload.audioFileUrl || '',
            copyrightFileUrl: payload.copyrightFileUrl || '',
            submittedByUserId: parseInt(payload.submittedByUserId) || null,
            categoryId: payload.categoryId ? parseInt(payload.categoryId) : null
          };
          dbData.books.unshift(newBook); // Add to top

          if (payload.categoryId) {
            if (!dbData.categoriesOfBooks) dbData.categoriesOfBooks = [];
            dbData.categoriesOfBooks.push({ BookId: newId, CategoryId: parseInt(payload.categoryId) });
          }
          if (finalAuthorId) {
            if (!dbData.authorsOfBooks) dbData.authorsOfBooks = [];
            dbData.authorsOfBooks.push({ BookId: newId, AuthorId: finalAuthorId });
          }
          if (payload.chapters && Array.isArray(payload.chapters)) {
            if (!dbData.audioChapter) dbData.audioChapter = [];
            payload.chapters.forEach((ch, i) => {
              const chId = dbData.audioChapter.length > 0 ? Math.max(...dbData.audioChapter.map(c => c.id)) + 1 + i : 1 + i;
              dbData.audioChapter.push({
                id: chId,
                chapterNumber: i + 1,
                name: ch.name || `Chương ${i+1}`,
                audiobookUrl: ch.url || payload.audioFileUrl || '',
                duration: parseFloat(ch.duration) || 0,
                bookId: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            });
          }

          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, book: newBook, createdAuthor }));
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
              // save chapters with startOffset + audiobookUrl
              let offset = 0;
              payload.chapters.forEach((ch, idx) => {
                const newChapId = dbData.audioChapter.length > 0 ? Math.max(...dbData.audioChapter.map(x => x.id)) + 1 : 1;
                dbData.audioChapter.push({
                  id: newChapId,
                  bookId: newId,
                  chapterNumber: idx + 1,
                  name: ch.name || `Chương ${idx + 1}`,
                  duration: ch.duration || 0,
                  startOffset: offset,
                  audiobookUrl: ch.audiobookUrl || ''
                });
                offset += ch.duration || 0;
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

        // Endpoint: Admin Tạo User
        if (req.method === 'POST' && req.url === '/api/admin/users/create') {
          const { username, email, password, firstName, lastName, roleId, phoneNumber, addresses, birthday } = payload;
          if (!username || !email || !password || !roleId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Thiếu thông tin bắt buộc' }));
            return;
          }

          if (dbData.user.some(u => u.username === username || u.email === email)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Username hoặc Email đã tồn tại' }));
            return;
          }

          const newId = dbData.user.length > 0 ? Math.max(...dbData.user.map(u => u.id)) + 1 : 1;
          const newUser = {
            id: newId,
            username,
            encryptedPassword: password, // Mật khẩu mock để đăng nhập
            firstName: firstName || '',
            lastName: lastName || '',
            email,
            emailVerifiedAt: new Date().toISOString(),
            phoneNumber: phoneNumber || null,
            addresses: addresses || null,
            birthday: birthday || null,
            loginFailedAttempts: 0,
            hasLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            roleId: parseInt(roleId, 10),
            subscriptionPlan: "FREE",
            thumbnailUrl: ""
          };

          if (newUser.roleId === 3) { // Author
            const newAuthorId = dbData.author && dbData.author.length > 0 ? Math.max(...dbData.author.map(a => a.id)) + 1 : 1;
            newUser.authorId = newAuthorId;
            if (!dbData.author) dbData.author = [];
            dbData.author.push({
              id: newAuthorId,
              firstName: firstName || '',
              lastName: lastName || '',
              birthday: birthday || null,
              imagineUrl: '',
              description: 'Tác giả mới'
            });
          }

          dbData.user.unshift(newUser); // Đưa lên đầu
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, user: newUser }));
          return;
        }

        // Endpoint: Admin Toggle Khóa User
        if (req.method === 'POST' && req.url.startsWith('/api/admin/users/') && req.url.endsWith('/toggleLock')) {
          const userId = parseInt(req.url.split('/')[4], 10);
          const idx = dbData.user.findIndex(u => u.id === userId);
          if (idx >= 0) {
            if (dbData.user[idx].roleId === 1) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Không thể vô hiệu hóa tài khoản Admin' }));
            } else {
              dbData.user[idx].hasLocked = !dbData.user[idx].hasLocked;
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, hasLocked: dbData.user[idx].hasLocked }));
            }
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'User not found' }));
          }
          return;
        }

        // Endpoint: Đăng ký User
        if (req.method === 'POST' && req.url === '/api/auth/register') {
          const { username, password, email } = payload;
          if (!username || !password || !email) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Vui lòng nhập đủ thông tin' }));
            return;
          }
          if (dbData.user.some(u => u.username === username)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Tên đăng nhập đã tồn tại' }));
            return;
          }
          if (dbData.user.some(u => u.email === email)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Email đã tồn tại' }));
            return;
          }

          const newId = dbData.user.length > 0 ? Math.max(...dbData.user.map(u => u.id)) + 1 : 1;
          const newUser = {
            id: newId,
            username,
            encryptedPassword: password,
            firstName: username,
            lastName: "",
            email,
            emailVerifiedAt: "",
            phoneNumber: "",
            addresses: "",
            birthday: "",
            loginFailedAttempts: 0,
            hasLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: "",
            roleId: 2, // 2: ROLE_USER
            subscriptionPlan: "",
            thumbnailUrl: `https://ui-avatars.com/api/?name=${username}&background=7c3aed&color=fff`,
            authorId: 0
          };

          dbData.user.unshift(newUser);
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, user: newUser }));
          return;
        }

        // Endpoint: Đổi mật khẩu
        if (req.method === 'POST' && req.url === '/api/users/update-password') {
          const { userId, oldPassword, newPassword } = payload;
          const userIdx = dbData.user.findIndex(u => u.id === userId);
          if (userIdx >= 0) {
            if (dbData.user[userIdx].encryptedPassword !== oldPassword) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Mật khẩu cũ không chính xác' }));
              return;
            }
            dbData.user[userIdx].encryptedPassword = newPassword;
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'User not found' }));
          }
          return;
        }

        // Endpoint: Xóa tài khoản (bởi chính người dùng)
        if (req.method === 'POST' && req.url === '/api/users/delete') {
          const { userId, password } = payload;
          const idx = dbData.user.findIndex(u => u.id === userId);
          if (idx >= 0) {
            if (dbData.user[idx].encryptedPassword !== password) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Mật khẩu không chính xác' }));
              return;
            }
            if (dbData.user[idx].roleId === 1) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Không thể xóa tài khoản Admin' }));
              return;
            }

            const authorIdToRemove = dbData.user[idx].authorId;
            dbData.user.splice(idx, 1);
            if (authorIdToRemove && dbData.author) dbData.author = dbData.author.filter(a => a.id !== authorIdToRemove);
            
            if (dbData.comments) dbData.comments = dbData.comments.filter(c => c.userId !== userId);
            if (dbData.userFavorites) dbData.userFavorites = dbData.userFavorites.filter(f => f.userId !== userId);
            if (dbData.listeningAudioBook) dbData.listeningAudioBook = dbData.listeningAudioBook.filter(l => l.userId !== userId);
            if (dbData.userSubscriptions) dbData.userSubscriptions = dbData.userSubscriptions.filter(s => s.userId !== userId);
            
            fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'User not found' }));
          }
          return;
        }

        // Endpoint: Admin Xóa User
        if (req.method === 'DELETE' && req.url.startsWith('/api/admin/users/')) {
          const parts = req.url.split('/');
          if (parts.length === 5) {
            const userId = parseInt(parts[4], 10);
            const usr = dbData.user.find(u => u.id === userId);
            if (usr) {
              if (usr.roleId === 1) {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Không thể xóa tài khoản Admin' }));
                return;
              }
              
              dbData.user = dbData.user.filter(u => u.id !== userId);
              if (usr.authorId && dbData.author) {
                dbData.author = dbData.author.filter(a => a.id !== usr.authorId);
                // Also optionally clean up their books or leave them orphaned
              }
              dbData.comments = (dbData.comments || []).filter(c => c.userId !== userId);
              dbData.userFavorites = (dbData.userFavorites || []).filter(f => f.userId !== userId);
              
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'User not found' }));
            }
            return;
          }
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
