-- Populate orders.ip_address from PostgREST forwarded headers when not provided

-- Function to extract IP from request headers
CREATE OR REPLACE FUNCTION set_order_ip_from_headers()
RETURNS trigger AS $$
DECLARE
  headers jsonb;
  fwd text;
  realip text;
  chosen text;
BEGIN
  IF NEW.ip_address IS NOT NULL AND length(trim(NEW.ip_address)) > 0 THEN
    RETURN NEW;
  END IF;

  -- PostgREST exposes request headers via current_setting('request.headers', true)
  BEGIN
    headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN others THEN
    headers := '{}'::jsonb;
  END;

  fwd := COALESCE(headers->>'x-forwarded-for', headers->>'x-real-ip');
  IF fwd IS NOT NULL AND length(trim(fwd)) > 0 THEN
    -- x-forwarded-for may be a comma-separated list; take the first
    chosen := split_part(fwd, ',', 1);
  END IF;

  IF chosen IS NULL OR length(trim(chosen)) = 0 THEN
    realip := headers->>'x-real-ip';
    chosen := realip;
  END IF;

  IF chosen IS NOT NULL AND length(trim(chosen)) > 0 THEN
    NEW.ip_address := trim(chosen);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure we set IP before enforcing rate limit (trigger order matters)
DROP TRIGGER IF EXISTS trg_prevent_spam_orders_per_ip ON orders;
DROP TRIGGER IF EXISTS trg_set_order_ip_from_headers ON orders;

CREATE TRIGGER trg_set_order_ip_from_headers
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_ip_from_headers();

CREATE TRIGGER trg_prevent_spam_orders_per_ip
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION prevent_spam_orders_per_ip();


