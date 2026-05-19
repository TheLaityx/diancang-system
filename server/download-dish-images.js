/**
 * 下载菜品图片到本地 uploads/dishes/ 目录
 * 运行: node download-dish-images.js
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const dishes = [
  { id: 1,  name: '红烧肉',   url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80&fm=jpg' },
  { id: 2,  name: '鱼香肉丝', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80&fm=jpg' },
  { id: 3,  name: '宫保鸡丁', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80&fm=jpg' },
  { id: 4,  name: '麻婆豆腐', url: 'https://images.unsplash.com/photo-1546069901-5ec6a79120b0?w=400&q=80&fm=jpg' },
  { id: 5,  name: '夫妻肺片', url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80&fm=jpg' },
  { id: 6,  name: '凉拌黄瓜', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&fm=jpg' },
  { id: 7,  name: '番茄蛋汤', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80&fm=jpg' },
  { id: 8,  name: '老鸭汤',   url: 'https://images.unsplash.com/photo-1619894991209-9f9694be045a?w=400&q=80&fm=jpg' },
  { id: 9,  name: '白米饭',   url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80&fm=jpg' },
  { id: 10, name: '扬州炒饭', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80&fm=jpg' },
  { id: 11, name: '可口可乐', url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80&fm=jpg' },
  { id: 12, name: '鲜榨橙汁', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80&fm=jpg' },
];

const saveDir = path.join(__dirname, 'uploads', 'dishes');
if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      // 跟随重定向
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', err => { file.close(); reject(err); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function run() {
  const results = [];
  for (const dish of dishes) {
    const filename = `dish_${dish.id}.jpg`;
    const dest = path.join(saveDir, filename);
    const localUrl = `/uploads/dishes/${filename}`;
    
    process.stdout.write(`下载 [${dish.id}] ${dish.name} ... `);
    try {
      await download(dish.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✅ ${(size/1024).toFixed(1)}KB → ${localUrl}`);
      results.push({ id: dish.id, url: localUrl, ok: true });
    } catch (e) {
      console.log(`❌ ${e.message}`);
      results.push({ id: dish.id, url: null, ok: false });
    }
    // 稍微等一下，避免被限速
    await new Promise(r => setTimeout(r, 300));
  }
  
  // 生成 MySQL UPDATE 语句
  const updates = results.filter(r => r.ok);
  if (updates.length > 0) {
    const sql = `UPDATE dishes SET image = CASE id\n` +
      updates.map(r => `  WHEN ${r.id} THEN '${r.url}'`).join('\n') +
      `\n  ELSE image END WHERE id IN (${updates.map(r => r.id).join(',')});`;
    
    const sqlFile = path.join(__dirname, 'update-images.sql');
    fs.writeFileSync(sqlFile, sql);
    console.log(`\n已生成 SQL: ${sqlFile}`);
    console.log('\n执行以下命令写入数据库:');
    console.log(`mysql -u root -p123456 diancang < ${sqlFile}`);
  }
  
  console.log(`\n完成：${updates.length}/${dishes.length} 张图片下载成功`);
}

run().catch(console.error);
