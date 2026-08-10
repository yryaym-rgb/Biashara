-- BIASHARA: distributed rate limiting for serverless instances (auth, admin gate, public APIs)

CREATE TABLE public.rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket_key, action, window_start)
);

CREATE INDEX rate_limit_buckets_window_start_idx ON public.rate_limit_buckets (window_start);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.rate_limit_buckets FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.rate_limit_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket_key TEXT,
  p_action TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_epoch BIGINT;
  v_window_start TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  IF p_limit <= 0 OR p_window_seconds <= 0 THEN
    RAISE EXCEPTION 'invalid rate limit parameters';
  END IF;

  v_epoch := floor(extract(epoch FROM v_now));
  v_window_start := to_timestamp((v_epoch / p_window_seconds) * p_window_seconds);
  v_reset_at := v_window_start + make_interval(secs => p_window_seconds);

  INSERT INTO public.rate_limit_buckets AS b (bucket_key, action, window_start, count)
  VALUES (p_bucket_key, p_action, v_window_start, 1)
  ON CONFLICT (bucket_key, action, window_start)
  DO UPDATE SET count = b.count + 1
  RETURNING count INTO v_count;

  IF v_count > p_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'remaining', 0,
      'reset_at', (extract(epoch FROM v_reset_at) * 1000)::bigint
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'remaining', p_limit - v_count,
    'reset_at', (extract(epoch FROM v_reset_at) * 1000)::bigint
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
