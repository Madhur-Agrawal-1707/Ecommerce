CREATE TABLE shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric DEFAULT 0,
  estimated_delivery_time text,
  free_shipping_threshold numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER shipping_methods_updated_at BEFORE UPDATE ON shipping_methods FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read shipping methods" ON shipping_methods FOR SELECT USING (true);
CREATE POLICY "Admins have full access to shipping methods" ON shipping_methods USING (is_admin());
