-- Quick check for car-images storage bucket
SELECT 
    name as "Bucket Name",
    id as "Bucket ID",
    public as "Is Public",
    created_at,
    updated_at
FROM storage.buckets 
WHERE name = 'car-images';

-- If no results, the bucket doesn't exist
-- If you see a row, the bucket exists!

