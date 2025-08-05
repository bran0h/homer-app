-- Inventory system SQL schema for Supabase
-- This schema creates tables for managing home inventory items with categories and tags

-- Create enum for item status
CREATE TYPE item_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'expired');

-- Create categories table
CREATE TABLE inventory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- For hex color codes like #FF5733
    icon VARCHAR(50), -- For icon names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create tags table
CREATE TABLE inventory_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- For hex color codes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create items table
CREATE TABLE inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(20), -- 'pieces', 'kg', 'liters', etc.
    min_quantity INTEGER, -- Optional for low stock alerts
    status item_status DEFAULT 'in_stock',
    purchase_date DATE,
    expiration_date DATE,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create inventory history table for tracking changes
CREATE TABLE inventory_item_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    old_values JSONB, -- Store previous values
    new_values JSONB, -- Store new values
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create junction table for item categories (many-to-many relationship)
CREATE TABLE inventory_item_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(item_id, category_id)
);

-- Create junction table for item tags (many-to-many relationship)
CREATE TABLE inventory_item_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES inventory_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(item_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_expiration ON inventory_items(expiration_date);
CREATE INDEX idx_inventory_items_created_by ON inventory_items(created_by);
CREATE INDEX idx_inventory_item_history_item ON inventory_item_history(item_id);
CREATE INDEX idx_inventory_item_history_created_by ON inventory_item_history(created_by);
CREATE INDEX idx_inventory_item_categories_item ON inventory_item_categories(item_id);
CREATE INDEX idx_inventory_item_categories_category ON inventory_item_categories(category_id);
CREATE INDEX idx_inventory_item_tags_item ON inventory_item_tags(item_id);
CREATE INDEX idx_inventory_item_tags_tag ON inventory_item_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_item_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies based on user roles (admin, member, host)
-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION has_user_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY definer
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = role_name
  );
$$;

-- Categories policies
CREATE POLICY "Authenticated users can view categories" ON inventory_categories FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Only admins can manage categories" ON inventory_categories FOR ALL USING (
  has_user_role('admin')
) WITH CHECK (
  has_user_role('admin')
);

-- Tags policies
CREATE POLICY "Authenticated users can view tags" ON inventory_tags FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admins and members can manage tags" ON inventory_tags FOR ALL USING (
  has_user_role('admin') OR has_user_role('member')
) WITH CHECK (
  has_user_role('admin') OR has_user_role('member')
);

-- Items policies
CREATE POLICY "Authenticated users can view items" ON inventory_items FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admins and members can manage items" ON inventory_items FOR ALL USING (
  has_user_role('admin') OR has_user_role('member')
) WITH CHECK (
  has_user_role('admin') OR has_user_role('member')
);

-- History policies
CREATE POLICY "Authenticated users can view item history" ON inventory_item_history FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admins and members can create history entries" ON inventory_item_history FOR INSERT WITH CHECK (
  has_user_role('admin') OR has_user_role('member')
);

-- Junction table policies
CREATE POLICY "Authenticated users can view item categories" ON inventory_item_categories FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admins and members can manage item categories" ON inventory_item_categories FOR ALL USING (
  has_user_role('admin') OR has_user_role('member')
) WITH CHECK (
  has_user_role('admin') OR has_user_role('member')
);

CREATE POLICY "Authenticated users can view item tags" ON inventory_item_tags FOR SELECT USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admins and members can manage item tags" ON inventory_item_tags FOR ALL USING (
  has_user_role('admin') OR has_user_role('member')
) WITH CHECK (
  has_user_role('admin') OR has_user_role('member')
);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default categories
INSERT INTO inventory_categories (name, description, color, icon) VALUES
('Food & Beverages', 'All food items and drinks', '#4CAF50', 'utensils'),
('Cleaning Supplies', 'Household cleaning products', '#2196F3', 'spray-can'),
('Personal Care', 'Health and beauty products', '#FF9800', 'heart'),
('Household Items', 'General household supplies', '#9C27B0', 'home'),
('Electronics', 'Electronic devices and accessories', '#607D8B', 'cpu'),
('Medicine', 'Medical supplies and medications', '#F44336', 'plus-circle'),
('Pet Supplies', 'Items for pets', '#795548', 'paw'),
('Office Supplies', 'Office and work related items', '#FF5722', 'briefcase');

-- Insert some default tags
INSERT INTO inventory_tags (name, description, color) VALUES
('gluten-free', 'Contains no gluten', '#4CAF50'),
('dairy-free', 'Contains no dairy products', '#2196F3'),
('organic', 'Organically produced', '#8BC34A'),
('vegan', 'Suitable for vegans', '#4CAF50'),
('eco-friendly', 'Environmentally friendly', '#4CAF50'),
('fragrance-free', 'No added fragrances', '#9E9E9E'),
('expired-soon', 'Expires within 7 days', '#FF5722'),
('bulk-buy', 'Bought in bulk quantity', '#FF9800'),
('essential', 'Essential household item', '#F44336'),
('luxury', 'Non-essential luxury item', '#9C27B0');
