
-- Secure function to process wallet transfers atomically
-- Uses SECURITY DEFINER to update both sender and receiver wallets
CREATE OR REPLACE FUNCTION public.process_transfer(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount numeric,
  p_type public.transaction_type DEFAULT 'transfer',
  p_description text DEFAULT NULL,
  p_fee numeric DEFAULT 0.00,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_balance numeric;
  v_tx_id uuid;
BEGIN
  -- Verify caller is the sender
  IF auth.uid() != p_sender_id THEN
    RAISE EXCEPTION 'Unauthorized: you can only send from your own wallet';
  END IF;

  -- Lock sender wallet and check balance
  SELECT balance INTO v_sender_balance
  FROM public.wallets
  WHERE user_id = p_sender_id
  FOR UPDATE;

  IF v_sender_balance IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;

  IF v_sender_balance < (p_amount + p_fee) THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct from sender
  UPDATE public.wallets
  SET balance = balance - (p_amount + p_fee)
  WHERE user_id = p_sender_id;

  -- Credit receiver (if exists)
  IF p_receiver_id IS NOT NULL THEN
    UPDATE public.wallets
    SET balance = balance + p_amount
    WHERE user_id = p_receiver_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Receiver wallet not found';
    END IF;
  END IF;

  -- Record transaction
  INSERT INTO public.transactions (sender_id, receiver_id, amount, fee, type, status, description, metadata)
  VALUES (p_sender_id, p_receiver_id, p_amount, p_fee, p_type, 'completed', p_description, p_metadata)
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;

-- Function to process top-ups (add money to own wallet)
CREATE OR REPLACE FUNCTION public.process_topup(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Wallet Top Up',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_id uuid;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Credit wallet
  UPDATE public.wallets
  SET balance = balance + p_amount
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Record transaction
  INSERT INTO public.transactions (receiver_id, amount, type, status, description, metadata)
  VALUES (p_user_id, p_amount, 'topup', 'completed', p_description, p_metadata)
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;

-- Function to process payments (deduct from wallet for services like bills, hotels)
CREATE OR REPLACE FUNCTION public.process_payment(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Payment',
  p_type public.transaction_type DEFAULT 'payment',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_tx_id uuid;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT balance INTO v_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.wallets
  SET balance = balance - p_amount
  WHERE user_id = p_user_id;

  INSERT INTO public.transactions (sender_id, amount, type, status, description, metadata)
  VALUES (p_user_id, p_amount, p_type, 'completed', p_description, p_metadata)
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$$;

-- Lookup user by wallox_id, phone, or email for sending money
CREATE OR REPLACE FUNCTION public.lookup_user(
  p_identifier text,
  p_method text DEFAULT 'wallox'
)
RETURNS TABLE(user_id uuid, full_name text, wallox_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_method = 'wallox' THEN
    RETURN QUERY
    SELECT p.user_id, p.full_name, p.wallox_id
    FROM public.profiles p
    WHERE p.wallox_id = p_identifier
    LIMIT 1;
  ELSIF p_method = 'phone' THEN
    RETURN QUERY
    SELECT p.user_id, p.full_name, p.wallox_id
    FROM public.profiles p
    WHERE p.phone = p_identifier
    LIMIT 1;
  ELSIF p_method = 'email' THEN
    RETURN QUERY
    SELECT p.user_id, p.full_name, p.wallox_id
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
    WHERE u.email = p_identifier
    LIMIT 1;
  END IF;
END;
$$;
