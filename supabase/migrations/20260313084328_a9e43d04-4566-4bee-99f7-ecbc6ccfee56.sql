
ALTER TABLE public.products ADD COLUMN image_urls text[] DEFAULT '{}'::text[];

UPDATE public.products SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '';

ALTER TABLE public.products DROP COLUMN image_url;
