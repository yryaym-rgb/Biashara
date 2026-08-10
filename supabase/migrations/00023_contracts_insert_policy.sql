-- BIASHARA: contracts INSERT policy for order parties (PR #23 follow-up)
-- Stops relying on service-role bypass for contract row creation.

CREATE POLICY contracts_insert_party ON public.contracts
  FOR INSERT WITH CHECK (
    public.is_order_party(order_id) OR public.is_admin()
  );
