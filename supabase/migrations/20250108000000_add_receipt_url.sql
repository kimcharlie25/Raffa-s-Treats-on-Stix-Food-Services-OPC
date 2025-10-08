/*
  Add receipt_url column to orders table for storing uploaded receipt image URLs
*/

-- Add receipt_url column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_url text;

-- Add index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_orders_receipt_url ON orders(receipt_url) WHERE receipt_url IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN orders.receipt_url IS 'URL of the payment receipt image uploaded to Cloudinary';

