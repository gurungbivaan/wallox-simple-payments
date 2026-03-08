
-- Create wallets for existing users who don't have one
INSERT INTO public.wallets (user_id)
SELECT p.user_id FROM public.profiles p
LEFT JOIN public.wallets w ON w.user_id = p.user_id
WHERE w.id IS NULL;
