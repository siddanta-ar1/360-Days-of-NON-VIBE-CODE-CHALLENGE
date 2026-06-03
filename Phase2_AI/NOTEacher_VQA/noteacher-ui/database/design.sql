-- 1. Create the Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create the Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- This locks the tables so NO ONE can read or write by default.
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. CREATE THE SECURITY POLICIES
-- Policy: Users can only select their own chats
CREATE POLICY "Users can view their own chats"
ON chats FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own chats
CREATE POLICY "Users can insert their own chats"
ON chats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only select messages belonging to their chats
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
USING (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);

-- Policy: Users can only insert messages into their own chats
CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
WITH CHECK (
  chat_id IN (
    SELECT id FROM chats WHERE user_id = auth.uid()
  )
);
