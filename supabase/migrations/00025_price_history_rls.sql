-- BIASHARA: public read for price charts; writes remain service-role only

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY price_history_select_all ON public.price_history
  FOR SELECT USING (true);
