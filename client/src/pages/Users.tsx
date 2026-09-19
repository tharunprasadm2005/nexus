import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../services/api.service';
import {
  LoadingSpinner,
  EmptyState,
  PageHeader,
  Card,
  NeuSelect,
} from '../components/ui/SharedComponents';
import { Plus, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  _count: { assignedTasks: number };
}

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'bg-holst-navy-800/15 text-holst-navy-900',
  PROJECT_MANAGER: 'bg-holst-blue/15 text-holst-blue',
  DEVELOPER: 'bg-holst-sage/20 text-holst-sage',
};

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  DEVELOPER: 'Developer',
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    try {
      setSubmitting(true);
      await userService.create(form);
      toast.success('User created');
      setForm({ name: '', email: '', password: '', role: 'DEVELOPER' });
      setShowForm(false);
      fetchUsers();
    } catch {
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage team members"
        action={
          <button className="btn-neu" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} />
            Add User
          </button>
        }
      />

      {showForm && (
        <Card className="neu-lg p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Name
                </label>
                <input
                  className="input-neu w-full"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Email
                </label>
                <input
                  className="input-neu w-full"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Password
                </label>
                <input
                  className="input-neu w-full"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Role
                </label>
                <NeuSelect
                  value={form.role}
                  onChange={(val) => setForm({ ...form, role: val })}
                  options={[
                    { value: 'DEVELOPER', label: 'Developer' },
                    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-neu" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <Card className="p-6">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-4 text-left text-xs uppercase tracking-wide text-holst-navy-800/40">
                  User
                </th>
                <th className="pb-4 text-left text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Email
                </th>
                <th className="pb-4 text-left text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Role
                </th>
                <th className="pb-4 text-left text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Tasks
                </th>
                <th className="pb-4 text-right text-xs uppercase tracking-wide text-holst-navy-800/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-holst-navy-800/10">
              {users.map((u) => (
                <tr key={u.id} className="group">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="neu-sm flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-semibold text-holst-navy-900">
                        {getInitial(u.name)}
                      </div>
                      <span className="font-body font-medium text-holst-navy-900">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-holst-navy-800/60">
                    {u.email}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        roleBadgeClass[u.role] || ''
                      }`}
                    >
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-holst-navy-800/60">
                    {u._count.assignedTasks}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="rounded-lg p-2 text-holst-navy-800/40 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Users;
