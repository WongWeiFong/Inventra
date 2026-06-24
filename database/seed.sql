insert into categories (name, icon) values
  ('Produce', '🥦'),
  ('Dairy', '🥛'),
  ('Meat', '🥩'),
  ('Pantry', '🫙'),
  ('Frozen', '🧊'),
  ('Household', '🧼')
on conflict (name) do nothing;

insert into storage_locations (name, icon) values
  ('Pantry', '🍞'),
  ('Refrigerator', '🧊'),
  ('Freezer', '❄️'),
  ('Bathroom', '🚿')
on conflict (name) do nothing;