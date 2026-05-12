const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'DBMS_Listenary',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test kết nối khi khởi động
pool.getConnection()
  .then(conn => {
    console.log('✅ Kết nối MySQL thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Kết nối MySQL thất bại:', err.message);
  });

module.exports = pool;
