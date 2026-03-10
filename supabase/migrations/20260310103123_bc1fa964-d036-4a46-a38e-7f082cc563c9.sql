
-- Update handle_new_user to give each new user Rs. 10,000 starting balance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, wallox_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Wallox User'),
    'wallox-' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
  );
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 10000.00);
  RETURN NEW;
END;
$function$;

-- Create a function to list all users (for group directory) excluding the caller
CREATE OR REPLACE FUNCTION public.list_group_members()
RETURNS TABLE(user_id uuid, full_name text, wallox_id text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.user_id, p.full_name, p.wallox_id, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id != auth.uid()
  ORDER BY p.full_name;
$$;
