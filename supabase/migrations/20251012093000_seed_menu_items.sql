/*
  Seed menu categories and items for Raffa’s Treats on Stix

  - Inserts categories (text ids, kebab-case) if not present
  - Inserts menu_items with auto-generated UUID ids (do not supply id)
  - Inserts sauce add-ons (price 0) where specified
*/

-- Ensure pgcrypto for UUID defaults (if not already present elsewhere)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Categories
INSERT INTO categories (id, name, icon, sort_order, active)
VALUES
  ('snack-boxes', 'SNACK BOXES', '🍱', 1, true),
  ('party-platters', 'PARTY PLATTERS', '🎉', 2, true),
  ('rockin-rolls-street-faves', 'ROCKIN'' ROLLS & STREET FAVES', '🍢', 3, true),
  ('classic-stix', 'CLASSIC STIX', '🍢', 4, true),
  ('premium-stix', 'PREMIUM STIX', '⭐', 5, true),
  ('top-it-off-rice-bowls', 'TOP IT OFF (rice bowls)', '🍚', 6, true),
  ('beverages', 'BEVERAGES', '🥤', 7, true),
  ('bottled-sauces', 'BOTTLED SAUCES', '🧴', 8, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- 2) Menu items (bulk insert with CTE to capture ids)
WITH items AS (
  INSERT INTO menu_items (
    name,
    description,
    base_price,
    category,
    popular,
    available,
    image_url,
    discount_price,
    discount_start_date,
    discount_end_date,
    discount_active,
    track_inventory,
    stock_quantity,
    low_stock_threshold
  ) VALUES
    -- SNACK BOXES
    ('SANA ALL BOX', 'Fish/Squid/Chicken Balls, Kikiam and Kwek-kwek in one box', 65, 'snack-boxes', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('SUPREME BOX', 'Premium Balls in one box', 145, 'snack-boxes', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CHICKEN SKIN PLATTER', '100g', 100, 'snack-boxes', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CALAMARINGS', 'N/A', 70, 'snack-boxes', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- PARTY PLATTERS
    ('FIESTA POTLUCK TRAY', 'Classic Street Food set (Fish/Squid/Chicken Balls, Kikiam, Kwek-kwek) - Good for 10 pax', 715, 'party-platters', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('JR. FIESTA POTLUCK TRAY', 'Good for 5 pax', 395, 'party-platters', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('ALTA POTLUCK TRAY', 'Fish/Squid/Chicken Balls, Kikiam, Kwek-kwek, Cheese Bombs - Good for 10 pax', 820, 'party-platters', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('JR. ALTA POTLUCK TRAY', 'Good for 5 pax', 450, 'party-platters', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- ROCKIN' ROLLS & STREET FAVES
    ('TOGUE BITES', '3 pcs', 35, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('SHANGHAI BITES', '5 pcs', 50, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('DYNAMITE', '2 pcs', 55, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CHEESE BOMBS', '5 pcs', 30, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CHEESE BOMBS SUPREME', '10 pcs', 70, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('OH KOY!', '2 pcs', 40, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('MOZZA STIX', '5 pcs', 135, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('SPAM FRIES', '5 pcs', 75, 'rockin-rolls-street-faves', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- CLASSIC STIX
    ('FISH BALLS', '10 pcs', 28, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('KIKIAM', '5 pcs', 32, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('SQUID BALLS', '5 pcs', 32, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CHICKEN BALLS', '5 pcs', 32, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('KWEK-KWEK', '5 pcs', 36, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('WALASTICK', 'Mixed balls on a stick', 40, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('HOTDOG CHEESE BALLS', '5 pcs', 45, 'classic-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- PREMIUM STIX
    ('BLACK FISH BALLS', '4 pcs', 58, 'premium-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('LOBSTER BALLS', '4 pcs', 58, 'premium-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('OCTOPUS BALLS', '4 pcs', 58, 'premium-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('FISH SQUID SAUSAGES', '4 pcs', 58, 'premium-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('FISH TOFU', '5 pcs', 45, 'premium-stix', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- TOP IT OFF (rice bowls)
    ('CALAMARINGS RICE BOWL', 'N/A', 95, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('DYNAMITE RICE BOWL', 'N/A', 80, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('SHANGHAI BITES RICE BOWL', 'N/A', 75, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('OH KOY RICE BOWL', 'N/A', 65, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CHICKEN SKIN RICE BOWL', 'N/A', 75, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('PINOY STREET FOOD RICE BOWL', 'N/A', 70, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('SALT & PEPPER CHICKEN BITES RICE BOWL', 'N/A', 100, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('TOGUE BITES RICE BOWL', 'N/A', 65, 'top-it-off-rice-bowls', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- BEVERAGES
    ('BLACK GULAMAN', '12 oz', 25, 'beverages', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('CHILLED BLACK GULAMAN', '350ml', 35, 'beverages', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),

    -- BOTTLED SAUCES
    ('250 ml CLASSIC SWEET SAUCE', 'N/A', 56, 'bottled-sauces', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('250 ml SWEET & SPICY SAUCE', 'N/A', 56, 'bottled-sauces', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0),
    ('250 ml SPICED VINEGAR', 'N/A', 56, 'bottled-sauces', false, true, NULL, NULL, NULL, NULL, false, false, NULL, 0)
  RETURNING id, name
)
-- 3) Add-ons (sauces) for items that specify sauce choices
INSERT INTO add_ons (menu_item_id, name, price, category)
SELECT i.id, sauce.name, 0, 'sauce'
FROM items i
JOIN (
  VALUES
    -- SNACK BOXES
    ('SANA ALL BOX', 'Sweet'),
    ('SANA ALL BOX', 'Sweet & Spicy'),
    ('SUPREME BOX', 'Sweet'),
    ('SUPREME BOX', 'Sweet & Spicy'),

    -- PARTY PLATTERS (vinegar combos)
    ('FIESTA POTLUCK TRAY', 'Sweet Sauce & Spiced Vinegar'),
    ('FIESTA POTLUCK TRAY', 'Sweet & Spicy Sauce & Spiced Vinegar'),
    ('JR. FIESTA POTLUCK TRAY', 'Sweet Sauce & Spiced Vinegar'),
    ('JR. FIESTA POTLUCK TRAY', 'Sweet & Spicy Sauce & Spiced Vinegar'),
    ('ALTA POTLUCK TRAY', 'Sweet Sauce & Spiced Vinegar'),
    ('ALTA POTLUCK TRAY', 'Sweet & Spicy Sauce & Spiced Vinegar'),
    ('JR. ALTA POTLUCK TRAY', 'Sweet Sauce & Spiced Vinegar'),
    ('JR. ALTA POTLUCK TRAY', 'Sweet & Spicy Sauce & Spiced Vinegar'),

    -- CLASSIC STIX
    ('FISH BALLS', 'Sweet'),
    ('FISH BALLS', 'Sweet & Spicy'),
    ('KIKIAM', 'Sweet'),
    ('KIKIAM', 'Sweet & Spicy'),
    ('SQUID BALLS', 'Sweet'),
    ('SQUID BALLS', 'Sweet & Spicy'),
    ('CHICKEN BALLS', 'Sweet'),
    ('CHICKEN BALLS', 'Sweet & Spicy'),
    ('KWEK-KWEK', 'Sweet'),
    ('KWEK-KWEK', 'Sweet & Spicy'),
    ('WALASTICK', 'Sweet'),
    ('WALASTICK', 'Sweet & Spicy'),
    ('HOTDOG CHEESE BALLS', 'Sweet'),
    ('HOTDOG CHEESE BALLS', 'Sweet & Spicy'),

    -- PREMIUM STIX
    ('BLACK FISH BALLS', 'Sweet'),
    ('BLACK FISH BALLS', 'Sweet & Spicy'),
    ('LOBSTER BALLS', 'Sweet'),
    ('LOBSTER BALLS', 'Sweet & Spicy'),
    ('OCTOPUS BALLS', 'Sweet'),
    ('OCTOPUS BALLS', 'Sweet & Spicy'),
    ('FISH SQUID SAUSAGES', 'Sweet'),
    ('FISH SQUID SAUSAGES', 'Sweet & Spicy'),
    ('FISH TOFU', 'Sweet'),
    ('FISH TOFU', 'Sweet & Spicy'),

    -- RICE BOWLS with sauce choices
    ('SHANGHAI BITES RICE BOWL', 'Sweet'),
    ('SHANGHAI BITES RICE BOWL', 'Sweet & Spicy'),
    ('PINOY STREET FOOD RICE BOWL', 'Sweet'),
    ('PINOY STREET FOOD RICE BOWL', 'Sweet & Spicy'),
    ('SALT & PEPPER CHICKEN BITES RICE BOWL', 'Sweet'),
    ('SALT & PEPPER CHICKEN BITES RICE BOWL', 'Sweet & Spicy')
) AS sauce(item_name, name)
  ON i.name = sauce.item_name;


