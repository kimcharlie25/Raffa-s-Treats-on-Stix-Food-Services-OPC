/*
  Orders and Order Items

  - orders: stores customer/order-level info
  - order_items: line items linked to orders
  - RLS enabled with permissive policies for public insert/select (adjust as needed)
*/

-- Enable required extension for UUID if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  contact_number text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('dine-in','pickup','delivery')),
  address text,
  pickup_time text,
  party_size integer,
  dine_in_time timestamptz,
  payment_method text NOT NULL,
  reference_number text,
  notes text,
  total numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  name text NOT NULL,
  variation jsonb,
  add_ons jsonb,
  unit_price numeric(12,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies (adjust to your security model)
-- Allow anyone to insert an order
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT TO public WITH CHECK (true);

-- Allow anyone to view orders (consider restricting to authenticated/admin later)
CREATE POLICY "Public can select orders"
  ON orders FOR SELECT TO public USING (true);

-- Allow anyone to insert order items
CREATE POLICY "Public can insert order items"
  ON order_items FOR INSERT TO public WITH CHECK (true);

-- Allow anyone to view order items
CREATE POLICY "Public can select order items"
  ON order_items FOR SELECT TO public USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);


