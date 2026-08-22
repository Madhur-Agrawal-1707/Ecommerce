-- Seed Categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Sarees', 'sarees', 'Elegant traditional and modern sarees'),
  ('Salwar Suits', 'salwar-suits', 'Comfortable and stylish salwar suits'),
  ('Anarkali Suits', 'anarkali-suits', 'Beautiful flowing anarkali suits'),
  ('Co-ord Sets', 'co-ord-sets', 'Matching sets for a contemporary look'),
  ('Palazzo Suits', 'palazzo-suits', 'Breezy and modern palazzo suits'),
  ('Blouses', 'blouses', 'Custom stitched and ready-made blouses'),
  ('Dupattas', 'dupattas', 'A wide range of dupattas to match your outfit'),
  ('Bridal Edit', 'bridal-edit', 'Exclusive collection for brides')
ON CONFLICT (slug) DO NOTHING;
