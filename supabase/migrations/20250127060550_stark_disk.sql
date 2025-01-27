/*
  # Create expenses tracking schema

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (text, from Clerk)
      - `friend_name` (text)
      - `amount` (decimal)
      - `description` (text)
      - `type` (text) - 'GIVEN' or 'RECEIVED'
      - `date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `expenses` table
    - Add policies for CRUD operations
*/

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    friend_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('GIVEN', 'RECEIVED')),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own expenses"
    ON expenses
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own expenses"
    ON expenses
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own expenses"
    ON expenses
    FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own expenses"
    ON expenses
    FOR DELETE
    USING (auth.uid()::text = user_id);