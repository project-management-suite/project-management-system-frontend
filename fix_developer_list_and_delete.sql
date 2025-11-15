-- Fix for Developer List and Project Deletion Issues

-- 1. Ensure managers can read all developer profiles (needed for task assignment)
CREATE OR REPLACE POLICY "Managers can read developer profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'DEVELOPER'
    AND EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.user_id = auth.uid() 
      AND p2.role = 'MANAGER'
    )
  );

-- 2. Ensure managers can delete their own projects 
-- (the policy exists but let's make sure it's working)
DROP POLICY IF EXISTS "Managers can delete own projects" ON projects;

CREATE POLICY "Managers can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    owner_manager_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'MANAGER'
    )
  );

-- 3. Make sure admins can delete any project
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;

CREATE POLICY "Admins can delete any project"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'ADMIN'
    )
  );