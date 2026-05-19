-- 更新现有菜品库存为合理数值（根据销量判断热销程度）
-- 执行方式：在 MySQL 中运行此文件，或后端启动时自动执行

USE diancang;

UPDATE dishes SET stock = CASE
  WHEN name = '白米饭'    THEN 100
  WHEN name = '扬州炒饭'  THEN 80
  WHEN name = '可口可乐'  THEN 80
  WHEN name = '宫保鸡丁'  THEN 60
  WHEN name = '凉拌黄瓜'  THEN 55
  WHEN name = '红烧肉'    THEN 50
  WHEN name = '鱼香肉丝'  THEN 45
  WHEN name = '麻婆豆腐'  THEN 40
  WHEN name = '鲜榨橙汁'  THEN 40
  WHEN name = '夫妻肺片'  THEN 35
  WHEN name = '番茄蛋汤'  THEN 30
  WHEN name = '老鸭汤'    THEN 25
  ELSE 30
END
WHERE stock = 999 OR stock IS NULL;

-- 确认更新结果
SELECT name, stock, sales FROM dishes ORDER BY sales DESC;
