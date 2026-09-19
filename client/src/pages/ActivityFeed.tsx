import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { activityService } from '../services/api.service';
import {
  LoadingSpinner,
  EmptyState,
  PageHeader,
  Card,
} from '../components/ui/SharedComponents';

interface ActivityLog {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string };
  task?: {
    id: string;
    title: string;
    project?: { id: string; name: string };
  };
}

const avatarGradients = [
  'from-holst-blue to-holst-sage',
  'from-holst-sage to-holst-sand',
  'from-holst-sand to-holst-blue',
  'from-holst-navy-800 to-holst-blue',
  'from-holst-sage to-holst-navy-900',
];

const ActivityFeed = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivities = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const data = await activityService.getGlobalFeed(pageNum, 20);

        if (append) {
          setActivities((prev) => [...prev, ...data.activities]);
        } else {
          setActivities(data.activities);
        }
        setHasMore(
          data.pagination &&
          data.pagination.page < data.pagination.totalPages
        );
      } catch {
        toast.error('Failed to load activity');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAdmin, user?.id]
  );

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchActivities(next, true);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const getGradient = (index: number) =>
    avatarGradients[index % avatarGradients.length];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Global Activity Feed' : 'Activity Feed'}
        subtitle="Recent actions across your projects"
      />

      {loading ? (
        <LoadingSpinner />
      ) : activities.length === 0 ? (
        <EmptyState message="No activity yet" />
      ) : (
        <Card className="p-6">
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <div key={activity.id} className="neu-sm group p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getGradient(
                      index
                    )} font-display text-sm font-semibold text-white`}
                  >
                    {getInitial(activity.user.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-holst-navy-900">
                      <span className="font-medium">{activity.user.name}</span>{' '}
                      <span className="text-holst-navy-800/60">
                        {activity.action}
                      </span>
                    </p>
                    {activity.task?.project && (
                      <p className="mt-1 font-accent text-xs italic text-holst-blue">
                        {activity.task.project.name}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-holst-navy-800/40">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                className="btn-ghost"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ActivityFeed;
