-- Migration: Add is_active column to delivery_fees
-- Run this in Supabase SQL Editor

ALTER TABLE delivery_fees 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing rows to be active by default
UPDATE delivery_fees SET is_active = true WHERE is_active IS NULL;
