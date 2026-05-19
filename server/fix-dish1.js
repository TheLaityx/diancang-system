const https = require('https');
const fs = require('fs');

const urls = [
  'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=400&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80&fm=jpg'
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const f = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 12000 }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        f.close();
        try { fs.unlinkSync(dest); } catch(e) {}
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        f.close();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      res.pipe(f);
      f.on('finish', () => { f.close(); resolve(fs.statSync(dest).size); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  for (const url of urls) {
    process.stdout.write('Trying: ' + url.slice(0,60) + ' ... ');
    try {
      const size = await download(url, 'uploads/dishes/dish_1.jpg');
      console.log('OK ' + size + ' bytes');
      process.exit(0);
    } catch(e) {
      console.log('FAIL: ' + e.message);
    }
  }
  console.log('All failed');
}
main();
