
-- Wallets table: one per user, tracks current balance
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric(15,2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'NPR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger to ensure balance never goes negative
CREATE OR REPLACE FUNCTION public.validate_wallet_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Wallet balance cannot be negative';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_wallet_balance
  BEFORE INSERT OR UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_wallet_balance();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON public.wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transaction types enum
CREATE TYPE public.transaction_type AS ENUM (
  'topup',
  'transfer',
  'payment',
  'withdrawal',
  'refund'
);

CREATE TYPE public.transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'reversed'
);

-- Transactions ledger
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid,
  receiver_id uuid,
  amount numeric(15,2) NOT NULL,
  fee numeric(15,2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'NPR',
  type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  description text,
  reference_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_transaction_amount()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Transaction amount must be positive';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_transaction_amount
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_transaction_amount();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert transactions they send"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id OR (type = 'topup' AND auth.uid() = receiver_id));

-- Update handle_new_user to also create wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, wallox_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Wallox User'),
    'wallox-' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
  );
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;
