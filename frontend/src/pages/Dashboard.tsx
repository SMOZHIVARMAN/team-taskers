import React, { useEffect, useState } from 'react';
import { FolderKanban, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { isToday } from 'date-fns';

import { StatCard } from '@/components/shared/StatCard';
import { TaskCard } from '@/components/shared/TaskCard';
import { ActivityItem } from '@/components/shared/ActivityItem';

import {
  workspaceApi,
  taskApi,
  auditApi,
  dashboardApi,
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

/* =========================
   Types
========================= */

type BackendStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
type UiStatus = 'pending' | 'in_progress' | 'completed';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: BackendStatus;
  dueDate?: string;
}

interface Workspace {
  id: number;
  name: string;
}

interface Activity {
  id: number;
  user: string;
  description: string;
  timestamp?: string;
  workspaceName?: string;
  type: any;
}

interface DashboardStats {
  todayTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

/* =========================
   Status Mapper
========================= */

const mapStatusToUi = (status: BackendStatus): UiStatus => {
  switch (status) {
    case 'TODO':
      return 'pending';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'pending';
  }
};

/* =========================
   Dashboard Component
========================= */

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =========================
     Fetch dashboard data
  ========================= */

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);

      // 1️⃣ Workspaces
      const wsRes = await workspaceApi.getAll();
      const wsData = wsRes.data || [];
      setWorkspaces(wsData);

      // 2️⃣ My tasks
      const taskRes = await taskApi.getMyTasks();
      const taskData = taskRes.data || [];
      setTasks(taskData);

      // 3️⃣ Dashboard stats (IMPORTANT)
      const statsRes = await dashboardApi.getStats();
      setStats(statsRes.data);

      // 4️⃣ Recent activities
      const allActivities: Activity[] = [];

      for (const ws of wsData.slice(0, 3)) {
        try {
          const auditRes = await auditApi.getByWorkspace(ws.id);
          const logs = auditRes.data || [];

          const mapped = logs.map((log: any) => ({
            id: Number(log.id),
            user: log.username,
            timestamp: log.createdAt,
            workspaceName: ws.name,
            type: log.action,
            description: `${log.username} ${log.action
              .replace(/_/g, ' ')
              .toLowerCase()}`,
          }));

          allActivities.push(...mapped);
        } catch {}
      }

      allActivities.sort(
        (a, b) =>
          new Date(b.timestamp || '').getTime() -
          new Date(a.timestamp || '').getTime()
      );

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     Task Status Change
  ========================= */

  const handleStatusChange = (taskId: string) => {
    updateTaskStatus(taskId);
  };

  const updateTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === Number(taskId));
    if (!task) return;

    const nextStatus: BackendStatus =
      task.status === 'TODO'
        ? 'IN_PROGRESS'
        : task.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'COMPLETED';

    try {
      await taskApi.updateStatus(taskId, nextStatus);

      // Update local task list
      setTasks(prev =>
        prev.map(t =>
          t.id === Number(taskId)
            ? { ...t, status: nextStatus }
            : t
        )
      );

      // 🔁 Re-fetch stats to stay in sync
      const statsRes = await dashboardApi.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  /* =========================
     Derived (UI-only)
  ========================= */

  const todayTaskCards = tasks.filter(
    t => t.dueDate && isToday(new Date(t.dueDate))
  );

  /* =========================
     Loading
  ========================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* =========================
     Render
  ========================= */

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{user?.username}</span>
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your workspaces today.
        </p>
      </div>

      {/* 🔢 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workspaces"
          value={workspaces.length}
          icon={FolderKanban}
        />
        <StatCard
          title="Tasks Today"
          value={stats.todayTasks}
          icon={Clock}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={CheckSquare}
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Recent Activities</h2>

          <div className="glass rounded-xl divide-y divide-border/50">
            {activities.length > 0 ? (
              activities.map(a => (
                <ActivityItem key={a.id} {...a} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No recent activities
              </div>
            )}
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Tasks</h2>

          {todayTaskCards.length > 0 ? (
            todayTaskCards.map(task => (
              <TaskCard
                key={task.id}
                id={task.id.toString()}
                title={task.title}
                description={task.description}
                status={mapStatusToUi(task.status)}
                dueDate={task.dueDate}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="glass rounded-xl p-6 text-center">
              <CheckSquare className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No tasks due today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
