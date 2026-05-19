UPDATE dishes SET image = CASE id
  WHEN 2 THEN '/uploads/dishes/dish_2.jpg'
  WHEN 3 THEN '/uploads/dishes/dish_3.jpg'
  WHEN 4 THEN '/uploads/dishes/dish_4.jpg'
  WHEN 5 THEN '/uploads/dishes/dish_5.jpg'
  WHEN 6 THEN '/uploads/dishes/dish_6.jpg'
  WHEN 7 THEN '/uploads/dishes/dish_7.jpg'
  WHEN 8 THEN '/uploads/dishes/dish_8.jpg'
  WHEN 9 THEN '/uploads/dishes/dish_9.jpg'
  WHEN 10 THEN '/uploads/dishes/dish_10.jpg'
  WHEN 11 THEN '/uploads/dishes/dish_11.jpg'
  WHEN 12 THEN '/uploads/dishes/dish_12.jpg'
  ELSE image END WHERE id IN (2,3,4,5,6,7,8,9,10,11,12);