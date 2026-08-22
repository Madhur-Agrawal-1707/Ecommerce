-- Migration to fix RLS for public storefront tables and storage

-- Hero Slides
DROP POLICY IF EXISTS "Public can read hero slides" ON public.hero_slides;
CREATE POLICY "Public can read hero slides" ON public.hero_slides FOR SELECT TO public USING (is_active = true);

-- Products
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT TO public USING (status = 'active');

-- Categories
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT TO public USING (true);

-- Site Settings
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT TO public USING (true);

-- Reviews
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews" ON public.reviews FOR SELECT TO public USING (is_verified = true);

-- Storage Buckets (ensure public read)
DROP POLICY IF EXISTS "brand-assets public read" ON storage.objects;
CREATE POLICY "brand-assets public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
CREATE POLICY "product-images public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
