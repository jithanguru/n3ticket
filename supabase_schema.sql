-- TicketX Supabase Database Schema & Realtime Setup
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  trust_score INT DEFAULT 100,
  verified BOOLEAN DEFAULT TRUE,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '18:00',
  venue_or_route TEXT NOT NULL,
  seat_details TEXT DEFAULT 'General Admission',
  original_price NUMERIC,
  price NUMERIC NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_score INT DEFAULT 100,
  verified_seller BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'Available',
  source_platform TEXT DEFAULT 'Verified Reseller',
  proof_image TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  ticket_id TEXT REFERENCES public.tickets(id),
  ticket_title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Bids Table
CREATE TABLE IF NOT EXISTS public.bids (
  id TEXT PRIMARY KEY,
  ticket_id TEXT REFERENCES public.tickets(id),
  amount NUMERIC NOT NULL,
  bidder_id TEXT NOT NULL,
  bidder_name TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tickets, bids, and messages
CREATE POLICY "Allow public read on tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public read on bids" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Allow public read on messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tickets" ON public.tickets FOR UPDATE USING (true);

-- 7. Enable Supabase Realtime Notifications for Postgres Changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
