-- Add ip_address to orders and a trigger to prevent spam orders per IP (1 minute)

-- Add column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN ip_address text;
  END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_ip_created_at ON orders(ip_address, created_at DESC);

-- Create or replace function to enforce 1-minute cooldown per IP
CREATE OR REPLACE FUNCTION prevent_spam_orders_per_ip()
RETURNS trigger AS $$
DECLARE
  recent_count int;
BEGIN
  IF NEW.ip_address IS NULL OR length(trim(NEW.ip_address)) = 0 THEN
    -- If IP is missing, allow but you may choose to block instead
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO recent_count
  FROM orders
  WHERE ip_address = NEW.ip_address
    AND created_at >= (now() - interval '60 seconds');

  IF recent_count > 0 THEN
    RAISE EXCEPTION 'Rate limit: Please wait 60 seconds before placing another order.' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_prevent_spam_orders_per_ip ON orders;
CREATE TRIGGER trg_prevent_spam_orders_per_ip
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION prevent_spam_orders_per_ip();


