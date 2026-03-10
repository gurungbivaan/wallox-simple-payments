
CREATE OR REPLACE FUNCTION public.process_transfer(p_sender_id uuid, p_receiver_id uuid, p_amount numeric, p_type transaction_type DEFAULT 'transfer'::transaction_type, p_description text DEFAULT NULL::text, p_fee numeric DEFAULT 0.00, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sender_balance numeric;
  v_tx_id uuid;
  v_type transaction_type;
BEGIN
  v_type := COALESCE(p_type, 'transfer'::transaction_type);

  IF auth.uid() != p_sender_id THEN
    RAISE EXCEPTION 'Unauthorized: you can only send from your own wallet';
  END IF;

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

  UPDATE public.wallets
  SET balance = balance - (p_amount + p_fee)
  WHERE user_id = p_sender_id;

  IF p_receiver_id IS NOT NULL THEN
    UPDATE public.wallets
    SET balance = balance + p_amount
    WHERE user_id = p_receiver_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Receiver wallet not found';
    END IF;
  END IF;

  INSERT INTO public.transactions (sender_id, receiver_id, amount, fee, type, status, description, metadata)
  VALUES (p_sender_id, p_receiver_id, p_amount, p_fee, v_type, 'completed', p_description, p_metadata)
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$function$;

-- Also fix process_payment with same pattern
CREATE OR REPLACE FUNCTION public.process_payment(p_user_id uuid, p_amount numeric, p_description text DEFAULT 'Payment'::text, p_type transaction_type DEFAULT 'payment'::transaction_type, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance numeric;
  v_tx_id uuid;
  v_type transaction_type;
BEGIN
  v_type := COALESCE(p_type, 'payment'::transaction_type);

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
  VALUES (p_user_id, p_amount, v_type, 'completed', p_description, p_metadata)
  RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$function$;
