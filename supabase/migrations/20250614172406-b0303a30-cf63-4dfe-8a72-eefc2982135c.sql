
-- Add the missing columns to the categories table
ALTER TABLE public.categories 
ADD COLUMN is_curated BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN image_url TEXT;
