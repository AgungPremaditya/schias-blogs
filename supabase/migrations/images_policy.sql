-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive if needed)
CREATE POLICY "Allow all operations for images"
ON public.images
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant access to authenticated and anon users
GRANT ALL ON public.images TO authenticated, anon; 