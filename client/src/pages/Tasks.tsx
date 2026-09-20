import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskService } from '../services/api.service';
import { useFilters } from '../hooks/useFilters';
import { Priority, TaskStatus } from '../types';
import {
  StatusBadge,
  PriorityBadge,
  LoadingSpinner,
  EmptyState,
  PageHeader,
  Card,
  NeuSelect,
} from '../components/ui/SharedComponents';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string; email: string } | null;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters, setFilter, clearFilters } = useFilters();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
      if (filters.dueDateTo) params.dueDateTo = filters.dueDateTo;
      const data = await taskService.getMyTasks(params);
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Tasks" subtitle="Tasks assigned to you" />

      <div className="neu flex flex-wrap items-center gap-4 p-4">
        <NeuSelect
          value={filters.status || ''}
          onChange={(val) => setFilter('status', val || null)}
          placeholder="All Status"
          options={[
            { value: 'TODO', label: 'To Do' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'IN_REVIEW', label: 'In Review' },
            { value: 'DONE', label: 'Done' },
          ]}
        />
        <NeuSelect
          value={filters.priority || ''}
          onChange={(val) => setFilter('priority', val || null)}
          placeholder="All Priority"
          options={[
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'CRITICAL', label: 'Critical' },
          ]}
        />
        <input
          type="date"
          value={filters.dueDateFrom || ''}
          onChange={(e) => setFilter('dueDateFrom', e.target.value || null)}
          className="input-neu text-sm"
          placeholder="From date"
        />
        <input
          type="date"
          value={filters.dueDateTo || ''}
          onChange={(e) => setFilter('dueDateTo', e.target.value || null)}
          className="input-neu text-sm"
          placeholder="To date"
        />
        <button className="btn-ghost" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks assigned to you" />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="neu-sm p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="font-display text-lg font-semibold text-holst-navy-900">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-holst-navy-800/60">
                    <Link
                      to={`/projects/${task.project.id}`}
                      className="transition-colors hover:text-holst-blue"
                    >
                      {task.project.name}
                    </Link>
                    <span className={task.assignedTo ? '' : 'italic'}>
                      {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </span>
                    {task.dueDate && (
                      <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <PriorityBadge priority={task.priority as Priority} />
                  <StatusBadge status={task.status as TaskStatus} />
                  <NeuSelect
                    value={task.status}
                    onChange={(val) => handleStatusChange(task.id, val as TaskStatus)}
                    options={[
                      { value: 'TODO', label: 'To Do' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'IN_REVIEW', label: 'In Review' },
                      { value: 'DONE', label: 'Done' },
                    ]}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
