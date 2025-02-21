-- Add policy to allow inserting user records
CREATE POLICY "System can create user profiles"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);
