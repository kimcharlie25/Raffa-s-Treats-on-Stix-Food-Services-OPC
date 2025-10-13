/*
  # Add Sort Order for Menu Items

  1. Changes
    - Add `sort_order` integer field to menu_items table
    - Set default values for existing items based on created_at
    - Allow NULL for flexibility
*/

-- Add sort_order column to menu_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN sort_order integer;
  END IF;
END $$;

-- Set default sort_order for existing items based on their creation order
UPDATE menu_items
SET sort_order = subquery.row_number
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at ASC) as row_number
  FROM menu_items
) AS subquery
WHERE menu_items.id = subquery.id AND menu_items.sort_order IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category_sort_order 
ON menu_items(category, sort_order);

