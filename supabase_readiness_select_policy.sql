-- Migration: Add SELECT policy for anonymous users to claims table
-- This is required so that anonymous updates/upserts can match existing rows.

CREATE POLICY "Allow anonymous select for claims"
ON public.claims FOR SELECT
TO anon
USING (user_id IS NULL);
