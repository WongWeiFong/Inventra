insert into categories (name, icon) values
  ('Produce', '🥦'),
  ('Dairy', '🥛'),
  ('Meat', '🥩'),
  ('Pantry', '🫙'),
  ('Frozen', '🧊'),
  ('Household', '🧼')
on conflict (name) do nothing;

insert into storage_locations (name, icon) values
  ('Refrigerator', '🧊'),
  ('Freezer', '❄️'),
  ('1st Floor Bathroom', '🚿'),
  ('1st Floor Cabinet', '🗄️'),
  ('2nd Floor Cabinet', '🚪')
on conflict (name) do nothing;