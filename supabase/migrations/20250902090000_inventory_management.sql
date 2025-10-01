/*
  Add inventory fields and automatic availability management for menu items.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'track_inventory'
  ) THEN
    ALTER TABLE menu_items
      ADD COLUMN track_inventory boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE menu_items
      ADD COLUMN stock_quantity integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE menu_items
      ADD COLUMN low_stock_threshold integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Ensure non-negative stock values
ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_stock_quantity_non_negative
  CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_low_stock_threshold_non_negative
  CHECK (low_stock_threshold >= 0);

-- Keep availability in sync when tracking inventory
CREATE OR REPLACE FUNCTION sync_menu_item_availability()
RETURNS trigger AS $$
BEGIN
  IF COALESCE(NEW.track_inventory, false) THEN
    NEW.stock_quantity := GREATEST(COALESCE(NEW.stock_quantity, 0), 0);
    NEW.low_stock_threshold := GREATEST(COALESCE(NEW.low_stock_threshold, 0), 0);

    IF NEW.stock_quantity <= NEW.low_stock_threshold THEN
      NEW.available := false;
    ELSE
      NEW.available := true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_menu_item_availability ON menu_items;
CREATE TRIGGER trg_sync_menu_item_availability
BEFORE INSERT OR UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION sync_menu_item_availability();

-- Helper to decrement stock quantities in batch
CREATE OR REPLACE FUNCTION decrement_menu_item_stock(items jsonb)
RETURNS void AS $$
DECLARE
  entry jsonb;
  qty integer;
BEGIN
  IF items IS NULL THEN
    RETURN;
  END IF;

  FOR entry IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    qty := GREATEST(COALESCE((entry->>'quantity')::integer, 0), 0);

    IF qty <= 0 THEN
      CONTINUE;
    END IF;

    UPDATE menu_items
    SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - qty, 0)
    WHERE track_inventory = true
      AND id::text = entry->>'id';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_menu_item_stock(jsonb) TO anon, authenticated;
