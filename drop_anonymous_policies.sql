-- Part C: SQL to drop anonymous RLS policies for Care India
-- Run this SQL in your Supabase SQL Editor to remove anonymous write, update, and read access.

-- 1. Drop anonymous write policy on scheme_matches table
DROP POLICY IF EXISTS "Allow anonymous inserts for scheme matches" ON public.scheme_matches;

-- 2. Drop anonymous write, update, and read policies on claims table
DROP POLICY IF EXISTS "Allow anonymous inserts for claims" ON public.claims;
DROP POLICY IF EXISTS "Allow anonymous updates for claims" ON public.claims;
DROP POLICY IF EXISTS "Allow anonymous select for claims" ON public.claims;
