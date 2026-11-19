import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Users, Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.admin.listUsers(search);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">User Directory</h2>
          <p className="text-xs text-text-muted">Registered student and administrator accounts.</p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <Input
            placeholder="Search email or name..."
            className="pl-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              <LoadingSkeleton className="h-8 w-full" />
              <LoadingSkeleton className="h-8 w-full" />
              <LoadingSkeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted/50 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/60">
                  <tr>
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4">Onboarding</th>
                    <th className="py-3 px-6 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-muted/30">
                      <td className="py-3.5 px-6 font-semibold text-text">{u.full_name}</td>
                      <td className="py-3.5 px-4 text-text-muted">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.role === 'admin' ? 'danger' : 'primary'} className="capitalize text-[10px]">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">{u.target_role || 'Not selected'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.onboarding_completed ? 'success' : 'outline'} className="text-[10px]">
                          {u.onboarding_completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right text-text-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
