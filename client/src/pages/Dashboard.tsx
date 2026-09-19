import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { dashboardService } from '../services/api.service';
import { StatusBadge, PriorityBadge, LoadingSpinner, PageHeader, Card } from '../components/ui/SharedComponents';
import { FolderOpen, AlertTriangle, CheckSquare, Users, TrendingUp, Clock, ArrowUpRight, Calendar, Briefcase } from 'lucide-react';
import { TaskStatus, Priority } from '../types';

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: number; color: string; trend?: string }) {
  return (
    <div className="neu p-5 group hover:shadow-[8px_8px_16px_#d1ccc0] transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`${color} text-white p-3 rounded-xl shadow-neu-sm group-hover:scale-105 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-3xl font-display font-bold text-holst-navy-900">{value}</p>
          <p className="text-xs text-holst-navy-800/40 font-body font-medium tracking-wide uppercase mt-0.5">{label}</p>
        </div>
        {trend && (
          <span className="text-xs font-accent text-holst-sage/70 italic">{trend}</span>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-holst-navy-800/50 font-body">{label}</span>
        <span className="font-medium text-holst-navy-800/60 font-body">{count}</span>
      </div>
      <div className="h-2.5 rounded-full bg-holst-sand/15 overflow-hidden neu-inset">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  return (
    <div className="neu-sm p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display font-semibold text-holst-navy-900 truncate">{task.title}</p>
            {task.isOverdue && (
              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Overdue</span>
            )}
          </div>
          <p className="text-xs text-holst-navy-800/40 mt-0.5 font-accent italic">{task.project?.name}</p>
          {task.dueDate && (
            <p className="text-xs text-holst-sage/60 mt-1 font-body flex items-center gap-1">
              <Calendar size={10} />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { onlineCount, socket } = useWebSocket();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => loadDashboard();
    socket.on('task:updated', handleUpdate);
    socket.on('activity:new', handleUpdate);
    return () => {
      socket.off('task:updated', handleUpdate);
      socket.off('activity:new', handleUpdate);
    };
  }, [socket]);

  const loadDashboard = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const data = await dashboardService.getAdminStats();
        setStats({ type: 'admin', ...data });
      } else if (user?.role === 'PROJECT_MANAGER') {
        const data = await dashboardService.getPMStats();
        setStats({ type: 'pm', ...data });
      } else {
        const data = await dashboardService.getDeveloperStats();
        setStats({ type: 'developer', ...data });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="text-center py-16 text-holst-navy-800/40 font-accent italic">Unable to load dashboard</div>;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      <div className="neu-lg p-8 mb-2">
        <h1 className="font-display text-3xl font-semibold text-holst-navy-900">
          Good {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-holst-navy-800/40 font-accent mt-1 italic">
          Here's what's happening with your {user?.role === 'ADMIN' ? 'organization' : 'work'} today.
        </p>
        <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-holst-sand via-holst-blue/30 to-transparent rounded-full" />
      </div>

      {stats.type === 'admin' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={<FolderOpen size={20} />}
              label="Total Projects"
              value={stats.totalProjects}
              color="bg-holst-blue"
            />
            <StatCard
              icon={<CheckSquare size={20} />}
              label="Total Tasks"
              value={stats.totalTasks}
              color="bg-holst-sage"
            />
            <StatCard
              icon={<AlertTriangle size={20} />}
              label="Overdue Tasks"
              value={stats.overdueTasks}
              color="bg-holst-sand"
              trend={stats.overdueTasks > 0 ? 'Needs attention' : 'All clear'}
            />
            <StatCard
              icon={<Users size={20} />}
              label="Online Users"
              value={onlineCount}
              color="bg-holst-navy-800"
            />
          </div>

          {stats.tasksByStatus && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-holst-blue" />
                <h2 className="font-display text-lg font-semibold text-holst-navy-900">Task Distribution</h2>
              </div>
              <div className="space-y-5">
                <ProgressBar label="To Do" count={stats.tasksByStatus.TODO || 0} total={stats.totalTasks} color="bg-holst-blue/40" />
                <ProgressBar label="In Progress" count={stats.tasksByStatus.IN_PROGRESS || 0} total={stats.totalTasks} color="bg-holst-blue" />
                <ProgressBar label="In Review" count={stats.tasksByStatus.IN_REVIEW || 0} total={stats.totalTasks} color="bg-holst-sand" />
                <ProgressBar label="Done" count={stats.tasksByStatus.DONE || 0} total={stats.totalTasks} color="bg-holst-sage" />
              </div>
            </Card>
          )}
        </div>
      )}

      {stats.type === 'pm' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              icon={<FolderOpen size={20} />}
              label="My Projects"
              value={stats.projects?.length || 0}
              color="bg-holst-blue"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Due This Week"
              value={stats.upcomingDueDates?.length || 0}
              color="bg-holst-sand"
              trend={stats.upcomingDueDates?.length > 0 ? `${stats.upcomingDueDates.length} items` : 'Nothing due'}
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="High Priority"
              value={stats.tasksByPriority?.HIGH || 0}
              color="bg-holst-navy-800"
            />
          </div>

          {stats.projects && stats.projects.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase size={18} className="text-holst-blue" />
                <h2 className="font-display text-lg font-semibold text-holst-navy-900">My Projects</h2>
              </div>
              <div className="space-y-3">
                {stats.projects.map((project: any) => (
                  <div key={project.id} className="neu-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display font-semibold text-holst-navy-900">{project.name}</p>
                        <p className="text-xs text-holst-navy-800/40 mt-0.5 font-accent italic">{project.client?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-holst-navy-800/40 font-body">{project._count?.tasks || 0} tasks</span>
                        <ArrowUpRight size={14} className="text-holst-navy-800/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {stats.tasksByPriority && (() => {
                const values = Object.values(stats.tasksByPriority) as number[];
                const pmTotalTasks = values.reduce((sum, v) => sum + v, 0);
                return (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertTriangle size={18} className="text-holst-sand" />
                      <h2 className="font-display text-lg font-semibold text-holst-navy-900">Priority Overview</h2>
                    </div>
                    <div className="space-y-5">
                      <ProgressBar label="Critical" count={stats.tasksByPriority.CRITICAL || 0} total={pmTotalTasks || 1} color="bg-[#B05050]" />
                      <ProgressBar label="High" count={stats.tasksByPriority.HIGH || 0} total={pmTotalTasks || 1} color="bg-holst-sand-dark" />
                      <ProgressBar label="Medium" count={stats.tasksByPriority.MEDIUM || 0} total={pmTotalTasks || 1} color="bg-holst-blue" />
                      <ProgressBar label="Low" count={stats.tasksByPriority.LOW || 0} total={pmTotalTasks || 1} color="bg-holst-sage" />
                    </div>
                  </Card>
                );
              })()}
        </div>
      )}

      {stats.type === 'developer' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              icon={<CheckSquare size={20} />}
              label="My Tasks"
              value={stats.assignedTasks?.length || 0}
              color="bg-holst-blue"
            />
            <StatCard
              icon={<AlertTriangle size={20} />}
              label="High Priority"
              value={stats.assignedTasks?.filter((t: any) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length || 0}
              color="bg-holst-sage"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Due Soon"
              value={stats.assignedTasks?.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length || 0}
              color="bg-holst-sand"
              trend={stats.assignedTasks?.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length > 0 ? 'Within 3 days' : 'All clear'}
            />
          </div>

          {stats.assignedTasks && stats.assignedTasks.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckSquare size={18} className="text-holst-sage" />
                <h2 className="font-display text-lg font-semibold text-holst-navy-900">My Assigned Tasks</h2>
              </div>
              <div className="space-y-3">
                {[...stats.assignedTasks]
                  .sort((a: any, b: any) => {
                    const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                    const pDiff = (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
                    if (pDiff !== 0) return pDiff;
                    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    if (a.dueDate) return -1;
                    if (b.dueDate) return 1;
                    return 0;
                  })
                  .map((task: any) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
