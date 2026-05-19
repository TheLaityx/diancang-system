// 用bcryptjs重新生成admin123的哈希并更新数据库
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '123456', database: 'diancang'
  });
  
  // 生成新哈希
  const hash = await bcrypt.hash('admin123', 10);
  console.log('新哈希:', hash);
  
  // 更新数据库
  const [r] = await conn.execute(
    'UPDATE admins SET password = ? WHERE username = ?',
    [hash, 'admin']
  );
  console.log('更新行数:', r.affectedRows);
  
  // 验证能否比对成功
  const [rows] = await conn.execute('SELECT password FROM admins WHERE username = ?', ['admin']);
  const ok = await bcrypt.compare('admin123', rows[0].password);
  console.log('验证结果:', ok ? '✅ 密码正确' : '❌ 仍然错误');
  
  await conn.end();
}

main().catch(console.error);
