/*
  Add Inventory Items for Raffa's Treats on Stix
  
  Categories:
  - UNIFORMS
  - MAIN PRODUCTS
  - PACKAGING MATERIALS
  - INGREDIENTS & CONDIMENTS
  - SUPPLIES
  
  Items added with auto-generated UUID ids
  Track inventory enabled for all items
*/

-- Ensure pgcrypto for UUID defaults
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0) Ensure inventory columns exist (in case inventory_management migration wasn't run)
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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'menu_items_stock_quantity_non_negative'
  ) THEN
    ALTER TABLE menu_items
      ADD CONSTRAINT menu_items_stock_quantity_non_negative
      CHECK (stock_quantity IS NULL OR stock_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'menu_items_low_stock_threshold_non_negative'
  ) THEN
    ALTER TABLE menu_items
      ADD CONSTRAINT menu_items_low_stock_threshold_non_negative
      CHECK (low_stock_threshold >= 0);
  END IF;
END $$;

-- 1) Insert Categories
INSERT INTO categories (id, name, icon, sort_order, active)
VALUES
  ('uniforms', 'UNIFORMS', '👕', 9, true),
  ('main-products', 'MAIN PRODUCTS', '🍢', 10, true),
  ('packaging-materials', 'PACKAGING MATERIALS', '📦', 11, true),
  ('ingredients-condiments', 'INGREDIENTS & CONDIMENTS', '🧂', 12, true),
  ('supplies', 'SUPPLIES', '🧹', 13, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- 2) Insert Menu Items (inventory items)
INSERT INTO menu_items (
  name,
  description,
  base_price,
  category,
  popular,
  available,
  image_url,
  track_inventory,
  stock_quantity,
  low_stock_threshold
) VALUES
  -- UNIFORMS
  ('APRON', 'Staff uniform apron', 700, 'uniforms', false, true, NULL, true, 0, 5),
  ('SHIRT - Large', 'Staff uniform shirt - Large', 750, 'uniforms', false, true, NULL, true, 0, 5),
  ('SHIRT - Medium', 'Staff uniform shirt - Medium', 750, 'uniforms', false, true, NULL, true, 0, 5),
  ('SHIRT - Small', 'Staff uniform shirt - Small', 750, 'uniforms', false, true, NULL, true, 0, 5),
  ('SHIRT - XL', 'Staff uniform shirt - XL', 750, 'uniforms', false, true, NULL, true, 0, 5),
  ('VISOR', 'Staff uniform visor', 350, 'uniforms', false, true, NULL, true, 0, 5),

  -- MAIN PRODUCTS
  ('BLACK FISH BALL - 40s', 'Black fish balls - 40 pieces', 400, 'main-products', false, true, NULL, true, 0, 10),
  ('BLACK GULAMAN POWDER - 5 x 200g', 'Black gulaman powder - 5 x 200g', 200, 'main-products', false, true, NULL, true, 0, 10),
  ('CALAMARINGS - 20 packs x 50g', 'Calamarings - 20 packs x 50g', 500, 'main-products', false, true, NULL, true, 0, 10),
  ('CHEESE STIX - 50s', 'Cheese stix - 50 pieces', 121, 'main-products', false, true, NULL, true, 0, 10),
  ('CHICKEN BALLS - 100s', 'Chicken balls - 100 pieces', 140, 'main-products', false, true, NULL, true, 0, 10),
  ('CHICKEN SKIN - 10 packs x 140g', 'Chicken skin - 10 packs x 140g', 360, 'main-products', false, true, NULL, true, 0, 10),
  ('CLASSIC SAUCE MIX - 17 c', 'Classic sauce mix - 17 cups', 82, 'main-products', false, true, NULL, true, 0, 10),
  ('CLASSIC SAUCE MIX - 30 c', 'Classic sauce mix - 30 cups', 144, 'main-products', false, true, NULL, true, 0, 10),
  ('CLASSIC SAUCE MIX - 40 c', 'Classic sauce mix - 40 cups', 192, 'main-products', false, true, NULL, true, 0, 10),
  ('CLASSIC SAUCE MIX - 7 c', 'Classic sauce mix - 7 cups', 34, 'main-products', false, true, NULL, true, 0, 10),
  ('DYNAMITE - 10s', 'Dynamite - 10 pieces', 170, 'main-products', false, true, NULL, true, 0, 10),
  ('FISH BALLS - 200s', 'Fish balls - 200 pieces', 82, 'main-products', false, true, NULL, true, 0, 10),
  ('FISH TOFU - 50s', 'Fish tofu - 50 pieces', 313, 'main-products', false, true, NULL, true, 0, 10),
  ('GULAMAN (JELLY) - 1 kg', 'Gulaman (Jelly) - 1 kg', 18, 'main-products', false, true, NULL, true, 0, 10),
  ('KIKIAM - 100s', 'Kikiam - 100 pieces', 86, 'main-products', false, true, NULL, true, 0, 10),
  ('LOBSTER BALLS - 40s', 'Lobster balls - 40 pieces', 346, 'main-products', false, true, NULL, true, 0, 10),
  ('MOZZARELLA STIX - 25s', 'Mozzarella stix - 25 pieces', 520, 'main-products', false, true, NULL, true, 0, 10),
  ('OCTOPUS BALLS - 40s', 'Octopus balls - 40 pieces', 365, 'main-products', false, true, NULL, true, 0, 10),
  ('OH KOY PATTIES 10s', 'Oh Koy patties - 10 pieces', 60, 'main-products', false, true, NULL, true, 0, 10),
  ('SHANGHAI BITES - 10s', 'Shanghai bites - 10 pieces', 70, 'main-products', false, true, NULL, true, 0, 10),
  ('SPAM FRIES - 10s', 'Spam fries - 10 pieces', 79, 'main-products', false, true, NULL, true, 0, 10),
  ('SQUID BALLS - 100s', 'Squid balls - 100 pieces', 128, 'main-products', false, true, NULL, true, 0, 10),
  ('SQUID FISH SAUSAGE - 40s', 'Squid fish sausage - 40 pieces', 240, 'main-products', false, true, NULL, true, 0, 10),
  ('TJ CHEESE BALLS - 1 kg', 'TJ cheese balls - 1 kg', 238, 'main-products', false, true, NULL, true, 0, 10),
  ('TOGUE BITES - 10s', 'Togue bites - 10 pieces', 47, 'main-products', false, true, NULL, true, 0, 10),

  -- PACKAGING MATERIALS
  ('BROWN PAPER BAGS (M2; SMALL)', 'Brown paper bags (M2; Small) - per piece', 1.85, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('HINGED CUP - 50s', 'Hinged cup - 50 pieces', 68, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('HOTDOG BOX - 50s', 'Hotdog box - 50 pieces', 120, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('HOTDOG PLATE - 40s', 'Hotdog plate - 40 pieces', 19, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('ICE CANDY BAG #1.5 x 10 - 100s', 'Ice candy bag #1.5 x 10 - 100 pieces', 9, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('ICE CANDY BAGS #1.25 X 10 - 100s', 'Ice candy bags #1.25 x 10 - 100 pieces', 8, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('KIKIAM PLATE - 40s', 'Kikiam plate - 40 pieces', 17, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('MEDIUM BAGS (PLASTIC) - 100s', 'Medium bags (plastic) - 100 pieces', 60.5, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('PAPER BAGS #25 (LARGE) - per pc', 'Paper bags #25 (Large) - per piece', 1.65, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('PAPER CUPS 12oz - 50s', 'Paper cups 12oz - 50 pieces', 97, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('PET BOTTLE - 250 ml', 'PET bottle - 250 ml', 3.6, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('PET BOTTLE - 350 ml', 'PET bottle - 350 ml', 3.6, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('PLASTIC (LABO) 8x11 - 100s', 'Plastic (Labo) 8x11 - 100 pieces', 12, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('PLASTIC FOR STICKS - 100s', 'Plastic for sticks - 100 pieces', 50, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('POTLUCK TRAY - Big', 'Potluck tray - Big', 52, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('POTLUCK TRAY - Junior', 'Potluck tray - Junior', 36, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('RIBBON - 50 yards/roll', 'Ribbon - 50 yards/roll', 45, 'packaging-materials', false, true, NULL, true, 0, 10),
  ('SAMPLER BOX - 50s', 'Sampler box - 50 pieces', 125, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('SKEWERS/STICKS - 100s', 'Skewers/Sticks - 100 pieces', 16, 'packaging-materials', false, true, NULL, true, 0, 50),
  ('SQUARE PLATES - 40s', 'Square plates - 40 pieces', 19, 'packaging-materials', false, true, NULL, true, 0, 20),
  ('STICKER LABEL (250ml Sweet & Spicy Sauce) - 30s', 'Sticker label (250ml Sweet & Spicy Sauce) - 30 pieces', 20, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('STICKER LABEL 250ml Spiced Vinegar (30s)', 'Sticker label 250ml Spiced Vinegar - 30 pieces', 20, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('STICKER LABELS (250 ml Sweet Sauce) - 30s', 'Sticker labels (250 ml Sweet Sauce) - 30 pieces', 20, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('STICKER SEAL (Bag) - 30s', 'Sticker seal (Bag) - 30 pieces', 33, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('TINY BAGS (plastic) - 100s', 'Tiny bags (plastic) - 100 pieces', 35, 'packaging-materials', false, true, NULL, true, 0, 30),
  ('TISSUE - 1 pack/1000 sheets', 'Tissue - 1 pack/1000 sheets', 50, 'packaging-materials', false, true, NULL, true, 0, 20),

  -- INGREDIENTS & CONDIMENTS
  ('CHEESE POWDER 200g', 'Cheese powder - 200g', 39, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('CHEESE STIX SAUCE - 1 gal', 'Cheese stix sauce - 1 gallon', 173, 'ingredients-condiments', false, true, NULL, true, 0, 5),
  ('DEEP FRY BATTER - 1 kg', 'Deep fry batter - 1 kg', 45, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('EGG WAFFLE BATTER MIX-150-200 EGGS(2CUPS)', 'Egg waffle batter mix - 150-200 eggs (2 cups)', 28.5, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('EGG WAFFLE BATTER MIX-200-250 EGGS(3CUPS)', 'Egg waffle batter mix - 200-250 eggs (3 cups)', 34.7, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('EGG WAFFLE BATTER MIX 250 - 300 EGGS', 'Egg waffle batter mix - 250-300 eggs', 43.75, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('EGG WAFFLE BATTER MIX 300 - 450 EGGS', 'Egg waffle batter mix - 300-450 eggs', 53.5, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('GARLIC - per piece', 'Garlic - per piece', 7, 'ingredients-condiments', false, true, NULL, true, 0, 20),
  ('ONION - per piece', 'Onion - per piece', 7, 'ingredients-condiments', false, true, NULL, true, 0, 20),
  ('PALM OIL - 1 gallon', 'Palm oil - 1 gallon', 368, 'ingredients-condiments', false, true, NULL, true, 0, 5),
  ('QUAIL EGGS - 100s', 'Quail eggs - 100 pieces', 235, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('RED CHILI / SILING LABUYO - piece', 'Red chili / Siling labuyo - per piece', 5, 'ingredients-condiments', false, true, NULL, true, 0, 20),
  ('SOFT FLOUR MIX', 'Soft flour mix', 37, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('SOUR CREAM POWDER - 200g', 'Sour cream powder - 200g', 39, 'ingredients-condiments', false, true, NULL, true, 0, 10),
  ('SOY SAUCE - 1 gal', 'Soy sauce - 1 gallon', 78, 'ingredients-condiments', false, true, NULL, true, 0, 5),
  ('SPICED VINEGAR - 1 gal', 'Spiced vinegar - 1 gallon', 192, 'ingredients-condiments', false, true, NULL, true, 0, 5),

  -- SUPPLIES
  ('MAXGLOW DISHWASHING LIQUID - 1.5L', 'Maxglow dishwashing liquid - 1.5L', 60, 'supplies', false, true, NULL, true, 0, 5),
  ('PLASTIC GLOVES - 100s', 'Plastic gloves - 100 pieces', 40, 'supplies', false, true, NULL, true, 0, 10),
  ('TRASH BAGS - 20s', 'Trash bags - 20 pieces', 30, 'supplies', false, true, NULL, true, 0, 10);

