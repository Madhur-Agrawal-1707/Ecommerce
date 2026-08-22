-- Seed dummy orders
INSERT INTO orders (id, order_number, email, shipping_address, billing_address, shipping_method, shipping_cost, subtotal, discount_amount, tax_amount, total, payment_status, fulfillment_status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'ORD-1001', 'john@example.com', '{"full_name": "John Doe", "city": "Mumbai", "state": "MH", "zip": "400001"}', '{"full_name": "John Doe", "city": "Mumbai", "state": "MH", "zip": "400001"}', 'Standard', 50, 2000, 0, 100, 2150, 'paid', 'delivered', now() - interval '2 days', now() - interval '1 days'),
  (gen_random_uuid(), 'ORD-1002', 'jane@example.com', '{"full_name": "Jane Smith", "city": "Delhi", "state": "DL", "zip": "110001"}', '{"full_name": "Jane Smith", "city": "Delhi", "state": "DL", "zip": "110001"}', 'Express', 150, 4500, 500, 200, 4350, 'paid', 'processing', now() - interval '1 day', now() - interval '10 hours'),
  (gen_random_uuid(), 'ORD-1003', 'mike@example.com', '{"full_name": "Mike Johnson", "city": "Bangalore", "state": "KA", "zip": "560001"}', '{"full_name": "Mike Johnson", "city": "Bangalore", "state": "KA", "zip": "560001"}', 'Standard', 50, 1500, 0, 75, 1625, 'pending', 'pending', now() - interval '5 hours', now() - interval '5 hours'),
  (gen_random_uuid(), 'ORD-1004', 'sara@example.com', '{"full_name": "Sara Ali", "city": "Chennai", "state": "TN", "zip": "600001"}', '{"full_name": "Sara Ali", "city": "Chennai", "state": "TN", "zip": "600001"}', 'Standard', 50, 3000, 0, 150, 3200, 'failed', 'cancelled', now() - interval '4 days', now() - interval '3 days'),
  (gen_random_uuid(), 'ORD-1005', 'amit@example.com', '{"full_name": "Amit Patel", "city": "Ahmedabad", "state": "GJ", "zip": "380001"}', '{"full_name": "Amit Patel", "city": "Ahmedabad", "state": "GJ", "zip": "380001"}', 'Express', 150, 5500, 0, 275, 5925, 'paid', 'shipped', now() - interval '12 hours', now() - interval '2 hours');

-- Add some order items
WITH inserted_orders AS (SELECT id, order_number FROM orders)
INSERT INTO order_items (order_id, title, quantity, unit_price, line_total, variant_info)
SELECT 
  o.id, 
  'Banarasi Silk Saree', 
  1, 
  2000, 
  2000,
  '{"color": "Red", "blouse_stitching": "Yes"}'::jsonb
FROM inserted_orders o WHERE o.order_number = 'ORD-1001';

WITH inserted_orders AS (SELECT id, order_number FROM orders)
INSERT INTO order_items (order_id, title, quantity, unit_price, line_total, variant_info)
SELECT 
  o.id, 
  'Kanjeevaram Saree', 
  1, 
  4500, 
  4500,
  '{"color": "Gold", "blouse_stitching": "No"}'::jsonb
FROM inserted_orders o WHERE o.order_number = 'ORD-1002';

WITH inserted_orders AS (SELECT id, order_number FROM orders)
INSERT INTO order_items (order_id, title, quantity, unit_price, line_total)
SELECT 
  o.id, 
  'Cotton Printed Saree', 
  1, 
  1500, 
  1500
FROM inserted_orders o WHERE o.order_number = 'ORD-1003';

WITH inserted_orders AS (SELECT id, order_number FROM orders)
INSERT INTO order_items (order_id, title, quantity, unit_price, line_total)
SELECT 
  o.id, 
  'Georgette Party Wear', 
  2, 
  1500, 
  3000
FROM inserted_orders o WHERE o.order_number = 'ORD-1004';

WITH inserted_orders AS (SELECT id, order_number FROM orders)
INSERT INTO order_items (order_id, title, quantity, unit_price, line_total)
SELECT 
  o.id, 
  'Chiffon Designer Saree', 
  1, 
  5500, 
  5500
FROM inserted_orders o WHERE o.order_number = 'ORD-1005';

-- Add timeline entries
WITH inserted_orders AS (SELECT id, order_number FROM orders)
INSERT INTO order_timeline (order_id, status, note, created_at)
SELECT o.id, 'pending'::fulfillment_status, 'Order placed by customer.', now() - interval '2 days' FROM inserted_orders o WHERE o.order_number = 'ORD-1001'
UNION ALL
SELECT o.id, 'processing'::fulfillment_status, 'Payment verified.', now() - interval '47 hours' FROM inserted_orders o WHERE o.order_number = 'ORD-1001'
UNION ALL
SELECT o.id, 'shipped'::fulfillment_status, 'Package handed over to carrier.', now() - interval '1 day' FROM inserted_orders o WHERE o.order_number = 'ORD-1001'
UNION ALL
SELECT o.id, 'delivered'::fulfillment_status, 'Delivered to customer.', now() - interval '12 hours' FROM inserted_orders o WHERE o.order_number = 'ORD-1001'
UNION ALL
SELECT o.id, 'pending'::fulfillment_status, 'Order placed.', now() - interval '1 day' FROM inserted_orders o WHERE o.order_number = 'ORD-1002'
UNION ALL
SELECT o.id, 'processing'::fulfillment_status, 'Preparing order.', now() - interval '10 hours' FROM inserted_orders o WHERE o.order_number = 'ORD-1002'
UNION ALL
SELECT o.id, 'pending'::fulfillment_status, 'Order placed.', now() - interval '5 hours' FROM inserted_orders o WHERE o.order_number = 'ORD-1003'
UNION ALL
SELECT o.id, 'pending'::fulfillment_status, 'Order placed.', now() - interval '4 days' FROM inserted_orders o WHERE o.order_number = 'ORD-1004'
UNION ALL
SELECT o.id, 'cancelled'::fulfillment_status, 'Payment failed.', now() - interval '3 days' FROM inserted_orders o WHERE o.order_number = 'ORD-1004'
UNION ALL
SELECT o.id, 'pending'::fulfillment_status, 'Order placed.', now() - interval '12 hours' FROM inserted_orders o WHERE o.order_number = 'ORD-1005'
UNION ALL
SELECT o.id, 'shipped'::fulfillment_status, 'Shipped via Bluedart.', now() - interval '2 hours' FROM inserted_orders o WHERE o.order_number = 'ORD-1005';
