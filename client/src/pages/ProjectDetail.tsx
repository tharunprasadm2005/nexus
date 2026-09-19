import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Clock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import {
  projectService,
  taskService,
  activityService,
  userService,
} from '../services/api.service';
import {
  StatusBadge,
  PriorityBadge,
  LoadingSpinner,
  PageHeader,
  Card,
  NeuSelect,
} from '../components/ui/SharedComponents';
import { useFilters } from '../hooks/useFilters';
import type { Priority, TaskStatus } from '../types';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: {
    id: string;
    name: string;
  };
  dueDate: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  message: string;
  task?: {
    id: string;
    title: string;
    project?: { id: string; name: string };
  };
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { joinProject, leaveProject } = useWebSocket();
  const { filters, setFilter } = useFilters();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'activity'>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  useEffect(() => {
    if (id) {
      fetchData();
      joinProject(id);
      return () => leaveProject(id);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchTasks();
  }, [id, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, activitiesData] = await Promise.all([
        projectService.getById(id!),
        activityService.getProjectFeed(id!),
      ]);
      setProject(projectData);
      setActivities(activitiesData.activities || []);

      try {
        const usersData = await userService.getDevelopers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch {
        setUsers([]);
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error('You do not have access to this project');
      } else {
        toast.error('Failed to load project details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await taskService.getByProject(id!, filters);
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.create(id!, taskForm);
      toast.success('Task created successfully');
      setTaskForm({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      setShowTaskForm(false);
      fetchTasks();
      fetchData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await taskService.update(taskId, { status });
      toast.success('Status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const canCreateTask = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  if (loading) return <LoadingSpinner />;
  if (!project) return (
    <div className="neu p-12 text-center rounded-2xl">
      <h3 className="font-display text-xl text-holst-navy-800/40">Project not found</h3>
      <p className="text-sm text-holst-navy-800/40 mt-2">You may not have access to this project.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-holst-navy-800/50 hover:text-holst-navy-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="font-body text-sm">Back to Projects</span>
      </Link>

      <div className="neu p-6 rounded-2xl mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-holst-navy-900 mb-2">
              {project.name}
            </h1>
            <p className="text-holst-navy-800/50 mb-1">
              Client: {project.clientName}
            </p>
            <p className="text-sm text-holst-navy-800/40">
              {project.description}
            </p>
          </div>
          {canCreateTask && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="btn-neu flex items-center gap-2"
            >
              <Plus size={18} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {showTaskForm && canCreateTask && (
        <div className="neu-lg p-6 mb-8 rounded-2xl max-w-2xl">
          <h3 className="font-display text-xl mb-4 text-holst-navy-900">
            Create New Task
          </h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                className="input-neu w-full"
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                Description
              </label>
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                className="textarea-neu w-full"
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                  Assignee
                </label>
                <NeuSelect
                  value={taskForm.assigneeId}
                  onChange={(val) => setTaskForm({ ...taskForm, assigneeId: val })}
                  placeholder="Select assignee"
                  options={users.map((u) => ({
                    value: u.id,
                    label: u.name,
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                  Priority
                </label>
                <NeuSelect
                  value={taskForm.priority}
                  onChange={(val) => setTaskForm({ ...taskForm, priority: val })}
                  options={[
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'CRITICAL', label: 'Critical' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-holst-navy-800/60 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                }
                className="input-neu w-full"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-sage">
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 rounded-xl font-body text-sm transition-all ${
            activeTab === 'tasks'
              ? 'neu font-medium text-holst-navy-900'
              : 'neu-inset text-holst-navy-800/50 hover:text-holst-navy-800'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-6 py-3 rounded-xl font-body text-sm transition-all ${
            activeTab === 'activity'
              ? 'neu font-medium text-holst-navy-900'
              : 'neu-inset text-holst-navy-800/50 hover:text-holst-navy-800'
          }`}
        >
          Activity
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex gap-4 mb-6">
            <NeuSelect
              value={(filters.status as string) || ''}
              onChange={(val) => setFilter('status', val || null)}
              placeholder="All Statuses"
              options={[
                { value: 'TODO', label: 'To Do' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'IN_REVIEW', label: 'In Review' },
                { value: 'DONE', label: 'Done' },
              ]}
            />
            <NeuSelect
              value={(filters.priority as string) || ''}
              onChange={(val) => setFilter('priority', val || null)}
              placeholder="All Priorities"
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
            />
            <input
              type="date"
              value={(filters.dueDateFrom as string) || ''}
              onChange={(e) => setFilter('dueDateFrom', e.target.value || null)}
              className="input-neu text-sm"
            />
            <input
              type="date"
              value={(filters.dueDateTo as string) || ''}
              onChange={(e) => setFilter('dueDateTo', e.target.value || null)}
              className="input-neu text-sm"
            />
          </div>

          {tasks.length === 0 ? (
            <div className="neu p-12 text-center rounded-2xl">
              <p className="font-display text-xl text-holst-navy-800/40">
                No tasks found
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="neu-sm p-5 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-lg text-holst-navy-900 mb-1">
                      {task.title}
                    </h4>
                    <p className="text-sm text-holst-navy-800/40 line-clamp-1 mb-3">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-holst-navy-800/50">
                      <span className="flex items-center gap-1">
                        <UserIcon size={14} />
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock size={14} />
                          {formatDistanceToNow(new Date(task.dueDate), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-2">
                      <PriorityBadge priority={task.priority as Priority} />
                      <StatusBadge status={task.status as TaskStatus} />
                    </div>
                    <NeuSelect
                      value={task.status}
                      onChange={(val) => handleStatusChange(task.id, val)}
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
            ))
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="neu p-12 text-center rounded-2xl">
              <p className="font-display text-xl text-holst-navy-800/40">
                No activity yet
              </p>
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-holst-navy-800/10" />
              {activities.map((activity) => (
                <div key={activity.id} className="relative mb-6 last:mb-0">
                  <div className="absolute -left-5 top-1 neu-sm w-8 h-8 rounded-full flex items-center justify-center bg-holst-cream">
                    {activity.user.avatar ? (
                      <img
                        src={activity.user.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <UserIcon size={14} className="text-holst-navy-800/40" />
                    )}
                  </div>
                  <div className="neu-sm p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-holst-navy-900 text-sm">
                        {activity.user.name}
                      </span>
                      <span className="text-holst-navy-800/40 text-sm">
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-sm text-holst-navy-800/60">
                      {activity.message}
                    </p>
                    <span className="text-xs text-holst-navy-800/40 mt-2 block">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}