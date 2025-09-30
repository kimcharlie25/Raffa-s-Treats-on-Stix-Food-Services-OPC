-- Harden rate limit: also check contact_number, and do not allow missing identifiers

CREATE OR REPLACE FUNCTION prevent_spam_orders_per_ip()
RETURNS trigger AS $$
DECLARE
  recent_ip_count int := 0;
  recent_phone_count int := 0;
BEGIN
  -- Require at least one identifier: IP or contact number
  IF (NEW.ip_address IS NULL OR length(trim(NEW.ip_address)) = 0)
     AND (NEW.contact_number IS NULL OR length(trim(NEW.contact_number)) = 0) THEN
    RAISE EXCEPTION 'Rate limit: Missing identifiers. Please try again shortly.' USING ERRCODE = 'check_violation';
  END IF;

  -- Check by IP when available
  IF NEW.ip_address IS NOT NULL AND length(trim(NEW.ip_address)) > 0 THEN
    SELECT COUNT(*) INTO recent_ip_count
    FROM orders
    WHERE ip_address = NEW.ip_address
      AND created_at >= (now() - interval '60 seconds');
  END IF;

  -- Check by contact number when available
  IF NEW.contact_number IS NOT NULL AND length(trim(NEW.contact_number)) > 0 THEN
    SELECT COUNT(*) INTO recent_phone_count
    FROM orders
    WHERE contact_number = NEW.contact_number
      AND created_at >= (now() - interval '60 seconds');
  END IF;

  IF recent_ip_count > 0 OR recent_phone_count > 0 THEN
    RAISE EXCEPTION 'Rate limit: Please wait 60 seconds before placing another order.' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers to ensure correct order (set IP first, then rate-limit)
DROP TRIGGER IF EXISTS trg_prevent_spam_orders_per_ip ON orders;
CREATE TRIGGER trg_prevent_spam_orders_per_ip
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION prevent_spam_orders_per_ip();


