const bcrypt = require('bcryptjs');
const db = require('./db');

async function resetAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('生成的哈希:', hash);
  
  db.query(
    'UPDATE admins SET password = ? WHERE username = ?',
    [hash, 'admin'],
    (err, result) => {
      if (err) {
        console.error('更新失败:', err);
      } else {
        console.log('更新成功，影响行数:', result.affectedRows);
      }
      // 验证一下
      db.query('SELECT id, username, password FROM admins', (err2, rows) => {
        if (err2) console.error(err2);
        else console.log('当前admins表:', rows);
        process.exit(0);
      });
    }
  );
}

resetAdmin();
