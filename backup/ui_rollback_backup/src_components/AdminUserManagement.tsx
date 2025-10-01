import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
  user_email: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      // Get all user roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `);

      if (error) throw error;

      // For now, we'll show user IDs since we can't access emails from client
      // In production, you'd use Supabase Edge Functions for this
      const usersWithEmails: UserRole[] = (userRoles || []).map(userRole => ({
        ...userRole,
        user_email: `User ${userRole.user_id.slice(0, 8)}...` // Show partial ID
      }));

      setUsers(usersWithEmails);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      // First, try to sign up the user normally (they'll need to confirm email)
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user role entry
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: newUser.role as 'admin' | 'user'
          });

        if (roleError) {
          console.error('Role creation error:', roleError);
          // Don't throw here, user was created successfully
        }

        toast({
          title: "Success",
          description: `User account created successfully! They will receive an email confirmation. Role: ${newUser.role}`,
        });

        setNewUser({ email: '', password: '', role: 'user' });
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create user account";
      console.error('User creation error:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Note: Client-side user deletion is limited
      // In a production environment, you'd use Supabase Edge Functions for this
      toast({
        title: "Info",
        description: "User deletion requires server-side permissions. Please use Supabase Dashboard for user management.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const makeGokulnathAdmin = useCallback(async () => {
    try {
      // Admin role management should be handled through proper admin interface
      // Removed hardcoded email for security
      toast({
        title: "Info",
        description: "Admin role management should be handled through the proper admin interface",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  // Function to make any user admin by email (for admin use)
  const makeUserAdminByEmail = useCallback(async (email: string) => {
    try {
      // This function can only be called by an admin user
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        toast({
          title: "Error",
          description: "No authenticated user found",
          variant: "destructive"
        });
        return;
      }

      // Check if current user is admin
      const { data: currentUserRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .single();

      if (roleError || currentUserRole?.role !== 'admin') {
        toast({
          title: "Error",
          description: "Only admin users can use this function",
          variant: "destructive"
        });
        return;
      }

      // Find the target user by email
      // Note: This is a simplified approach since we can't use admin APIs
      // In a real scenario, you'd use Supabase admin APIs or server-side functions
      toast({
        title: "Info",
        description: `To make ${email} an admin, they need to log in first and use the admin setup function`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={creating} className="w-full md:w-auto">
              {creating ? 'Creating...' : 'Create User Account'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Users will receive an email confirmation and must verify their account before they can sign in.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Special Admin Setup */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Shield className="w-5 h-5" />
            Special Admin Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Admin Role Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                Admin role management should be handled through the proper admin interface.
                This function is deprecated and should not be used.
              </p>
              <Button
                onClick={makeGokulnathAdmin}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled
              >
                <Shield className="w-4 h-4 mr-2" />
                Deprecated Function
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.user_email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'user') => updateUserRole(user.user_id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteUser(user.user_id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;