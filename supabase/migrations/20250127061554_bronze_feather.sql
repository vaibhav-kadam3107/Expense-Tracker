/*
  # Update expenses table RLS policies

  1. Changes
    - Modified RLS policies to use Clerk user ID format
    - Added proper type checking for user_id comparison

  2. Security
    - Policies now correctly handle Clerk authentication
    - Maintains data isolation between users
*/

CREATE TABLE IF NOT EXISTS expenses (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

-- Create new policies with proper user_id handling
CREATE POLICY "Users can view their own expenses"
    ON expenses
    FOR SELECT
    USING (user_id = current_user);

CREATE POLICY "Users can insert their own expenses"
    ON expenses
    FOR INSERT
    WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update their own expenses"
    ON expenses
    FOR UPDATE
    USING (user_id = current_user);

CREATE POLICY "Users can delete their own expenses"
    ON expenses
    FOR DELETE
    USING (user_id = current_user);