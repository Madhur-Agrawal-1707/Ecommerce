-- Add fields for automated refund handling
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS hold_refund boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
