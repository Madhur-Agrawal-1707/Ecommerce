-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active');
CREATE TYPE blouse_status AS ENUM ('none', 'unstitched', 'stitched');
CREATE TYPE image_type AS ENUM ('front', 'back', 'detail', 'blouse', 'model');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE fulfillment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');

-- 2. TABLES

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role user_role DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text DEFAULT 'Noir & Gold',
  tagline text,
  logo_url text,
  logo_inverted_url text,
  favicon_url text,
  contact_email text,
  contact_phone text,
  business_address text,
  currency_code text DEFAULT 'INR',
  currency_symbol text DEFAULT '₹',
  tax_rate numeric DEFAULT 0,
  tax_inclusive boolean DEFAULT false,
  announcement_bar_active boolean DEFAULT false,
  announcement_bar_text text,
  announcement_bar_link text,
  announcement_bar_color text,
  social_instagram text,
  social_facebook text,
  social_pinterest text,
  social_youtube text,
  blouse_stitching_enabled boolean DEFAULT true,
  blouse_stitching_charge numeric DEFAULT 0,
  blouse_stitching_days integer DEFAULT 5,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE seo_settings (
  id integer PRIMARY KEY DEFAULT 1,
  meta_title_template text DEFAULT '{Page Title} | {Site Name}',
  default_meta_description text,
  og_default_image_url text,
  ga_tracking_id text,
  fb_pixel_id text,
  search_console_meta text,
  robots_txt text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  meta_title text,
  meta_description text,
  og_image_url text
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric NOT NULL,
  sale_price numeric,
  sale_start timestamptz,
  sale_end timestamptz,
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  track_inventory boolean DEFAULT true,
  allow_backorders boolean DEFAULT false,
  status product_status DEFAULT 'draft',
  fabric text,
  work_type text,
  occasion text[],
  saree_length_meters numeric,
  blouse_included blouse_status,
  wash_care text,
  meta_title text,
  meta_description text,
  og_image_url text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- Search index
ALTER TABLE products ADD COLUMN text_search tsvector;
CREATE INDEX products_text_search_idx ON products USING GIN (text_search);

CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.text_search :=
    setweight(to_tsvector('pg_catalog.english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(NEW.fabric, '')), 'C') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(array_to_string(NEW.occasion, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON products FOR EACH ROW EXECUTE FUNCTION products_search_trigger();

CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  alt_text text,
  image_type image_type
);

CREATE TABLE product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0
);

CREATE TABLE product_option_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid REFERENCES product_options(id) ON DELETE CASCADE,
  value text NOT NULL,
  sort_order integer DEFAULT 0
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  price numeric,
  stock_quantity integer DEFAULT 0,
  option_values jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  shipping_cost numeric DEFAULT 0,
  subtotal numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total numeric DEFAULT 0,
  coupon_code text,
  payment_status payment_status DEFAULT 'pending',
  fulfillment_status fulfillment_status DEFAULT 'pending',
  razorpay_payment_id text,
  tracking_number text,
  tracking_carrier text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  title text NOT NULL,
  variant_info jsonb,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  line_total numeric NOT NULL
);

CREATE TABLE order_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status fulfillment_status NOT NULL,
  note text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  photo_url text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type coupon_type DEFAULT 'percentage',
  value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  usage_limit integer,
  per_customer_limit integer,
  times_used integer DEFAULT 0,
  valid_from timestamptz,
  valid_to timestamptz,
  applicable_products uuid[],
  applicable_categories uuid[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  heading text,
  subheading text,
  cta_text text,
  cta_link text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

CREATE TABLE wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  filename text NOT NULL,
  size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. FUNCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto generate order number (ORD-10001 format)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10000;
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_generate_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- 4. RLS POLICIES

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Utility function to check admin role
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read access
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read seo settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Public can read page seo" ON page_seo FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public can read product options" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public can read product option values" ON product_option_values FOR SELECT USING (true);
CREATE POLICY "Public can read product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public can read hero slides" ON hero_slides FOR SELECT USING (true);

-- Admin all access
CREATE POLICY "Admins have full access to profiles" ON profiles USING (is_admin());
CREATE POLICY "Admins have full access to site_settings" ON site_settings USING (is_admin());
CREATE POLICY "Admins have full access to seo_settings" ON seo_settings USING (is_admin());
CREATE POLICY "Admins have full access to page_seo" ON page_seo USING (is_admin());
CREATE POLICY "Admins have full access to categories" ON categories USING (is_admin());
CREATE POLICY "Admins have full access to products" ON products USING (is_admin());
CREATE POLICY "Admins have full access to product_images" ON product_images USING (is_admin());
CREATE POLICY "Admins have full access to product_options" ON product_options USING (is_admin());
CREATE POLICY "Admins have full access to product_option_values" ON product_option_values USING (is_admin());
CREATE POLICY "Admins have full access to product_variants" ON product_variants USING (is_admin());
CREATE POLICY "Admins have full access to orders" ON orders USING (is_admin());
CREATE POLICY "Admins have full access to order_items" ON order_items USING (is_admin());
CREATE POLICY "Admins have full access to order_timeline" ON order_timeline USING (is_admin());
CREATE POLICY "Admins have full access to reviews" ON reviews USING (is_admin());
CREATE POLICY "Admins have full access to coupons" ON coupons USING (is_admin());
CREATE POLICY "Admins have full access to subscribers" ON subscribers USING (is_admin());
CREATE POLICY "Admins have full access to hero_slides" ON hero_slides USING (is_admin());
CREATE POLICY "Admins have full access to media" ON media USING (is_admin());

-- Customer self access
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own addresses" ON addresses USING (auth.uid() = user_id);

CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own wishlist" ON wishlist USING (auth.uid() = user_id);

-- 5. STORAGE BUCKETS (executed as DML against storage schema, assuming storage plugin active)
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('brand-assets', 'brand-assets', true),
('media-library', 'media-library', true),
('avatars', 'avatars', true),
('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "product-images public read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "brand-assets public read" ON storage.objects FOR SELECT USING (bucket_id = 'brand-assets');
CREATE POLICY "media-library public read" ON storage.objects FOR SELECT USING (bucket_id = 'media-library');
CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "review-photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'review-photos');

CREATE POLICY "Admin write to product-images" ON storage.objects USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin write to brand-assets" ON storage.objects USING (bucket_id = 'brand-assets' AND is_admin());
CREATE POLICY "Admin write to media-library" ON storage.objects USING (bucket_id = 'media-library' AND is_admin());

CREATE POLICY "Users write to own avatar folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
CREATE POLICY "Users write to own review photos folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'review-photos' AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
