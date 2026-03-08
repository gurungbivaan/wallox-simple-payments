
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify on new transaction
CREATE OR REPLACE FUNCTION public.notify_on_transaction()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  v_sender_name text;
  v_receiver_name text;
BEGIN
  -- Notify receiver on transfers/topups
  IF NEW.receiver_id IS NOT NULL THEN
    SELECT full_name INTO v_sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
    IF NEW.type = 'topup' THEN
      INSERT INTO public.notifications (user_id, title, message, type, metadata)
      VALUES (NEW.receiver_id, 'Wallet Topped Up', 'Rs. ' || NEW.amount || ' added to your wallet', 'topup', jsonb_build_object('transaction_id', NEW.id));
    ELSIF NEW.type = 'transfer' THEN
      INSERT INTO public.notifications (user_id, title, message, type, metadata)
      VALUES (NEW.receiver_id, 'Money Received', 'Rs. ' || NEW.amount || ' received from ' || COALESCE(v_sender_name, 'someone'), 'transfer', jsonb_build_object('transaction_id', NEW.id));
    END IF;
  END IF;

  -- Notify sender on payments/transfers
  IF NEW.sender_id IS NOT NULL AND NEW.type IN ('payment', 'transfer') THEN
    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    VALUES (NEW.sender_id, 
      CASE WHEN NEW.type = 'payment' THEN 'Payment Successful' ELSE 'Money Sent' END,
      'Rs. ' || NEW.amount || ' - ' || COALESCE(NEW.description, NEW.type),
      NEW.type::text, jsonb_build_object('transaction_id', NEW.id));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_transaction();

-- Trigger: notify on KYC status change
CREATE OR REPLACE FUNCTION public.notify_on_kyc_update()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (NEW.user_id, 'KYC Approved!', 'Your identity has been verified successfully. You now have full access.', 'kyc');
      UPDATE public.profiles SET kyc_verified = true WHERE user_id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, type, metadata)
      VALUES (NEW.user_id, 'KYC Rejected', 'Your verification was rejected: ' || COALESCE(NEW.rejection_reason, 'Please resubmit.'), 'kyc', jsonb_build_object('reason', NEW.rejection_reason));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_kyc_update
  AFTER UPDATE ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_kyc_update();
