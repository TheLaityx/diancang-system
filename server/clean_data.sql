-- 删除脏数据（名称为"1"、价格为0的无效菜品）
DELETE FROM dishes WHERE id = 14;
-- 删除重复的可乐（保留id=11的可口可乐）
DELETE FROM dishes WHERE id = 13;
-- 查看清理后的菜品列表
SELECT id, name, price, status, category_id FROM dishes ORDER BY category_id, id;
