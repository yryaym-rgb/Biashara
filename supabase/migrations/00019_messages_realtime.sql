-- Enable Supabase Realtime for the messages table (inbox live updates)

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
