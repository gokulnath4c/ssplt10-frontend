import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { User } from '@supabase/supabase-js';

// Using service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL || 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU';
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function updateUserRole(email: string, newRole: "admin" | "user") {
  // Step 1: Get user from auth.users using email with service role
  const { data, error: userError } = await supabase.auth.admin.listUsers();

  console.log('listUsers response:', { data, error: userError });

  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }

  if (!data || !data.users) {
    console.error('No data or users returned');
    return;
  }

  const users = data.users as User[];

  const user = users.find(u => u.email === email);
  if (!user) {
    console.error('User not found with email:', email);
    return;
  }
  
  const user_id = user.id;

  // Step 2: Update role in user_roles table using user_id
  const { error: updateError } = await supabase
    .from('user_roles')
    .upsert({ user_id, role: newRole });

  if (updateError) {
    console.error('Error updating user role:', updateError);
    return;
  }

  // Step 3: Verify the update
  const { data: verifyData, error: verifyError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (verifyError) {
    console.error('Error verifying role update:', verifyError);
    return;
  }

  console.log('User role updated successfully:', {
    user_id,
    email,
    role: verifyData.role
  });
}

// Run the script directly (no sign-in needed with service role)
updateUserRole('gokulnath.4c@gmail.com', 'admin');
