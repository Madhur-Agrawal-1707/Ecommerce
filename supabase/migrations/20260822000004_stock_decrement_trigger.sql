-- Decrement stock on payment success

CREATE OR REPLACE FUNCTION decrement_stock_on_paid()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Only decrement when payment status transitions from pending to paid
  IF NEW.payment_status = 'paid' AND OLD.payment_status = 'pending' THEN
    FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
      IF item.variant_id IS NOT NULL THEN
        UPDATE product_variants
        SET stock_quantity = GREATEST(stock_quantity - item.quantity, 0)
        WHERE id = item.variant_id;
      END IF;

      IF item.variant_id IS NULL AND item.product_id IS NOT NULL THEN
        UPDATE products
        SET stock_quantity = GREATEST(stock_quantity - item.quantity, 0)
        WHERE id = item.product_id;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_stock_on_paid ON orders;
CREATE TRIGGER trigger_decrement_stock_on_paid
AFTER UPDATE OF payment_status ON orders
FOR EACH ROW
EXECUTE FUNCTION decrement_stock_on_paid();
