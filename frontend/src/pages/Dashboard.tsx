import React, { useState, useEffect } from 'react';
import { FolderKanban, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { TaskCard } from '@/components/shared/TaskCard';
import { ActivityItem } from '@/components/shared/ActivityItem';
import { useAuth } from '@/contexts/AuthContext';
import { workspaceApi, taskApi, auditApi } from '@/services/api';
import { isToday } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  workspaceName?: string;
  assignee?: string;
}

interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_completed' | 'member_added' | 'workspace_created';
  description: string;
  timestamp: string;
  user: string;
  workspaceName?: string;
}

interface Workspace {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch workspaces
      const workspacesRes = await workspaceApi.getAll();
      setWorkspaces(workspacesRes.data || []);

      // Fetch user's tasks
      const tasksRes = await taskApi.getMyTasks();
      setTasks(tasksRes.data || []);

      // Fetch activities from first workspace (if exists)
      if (workspacesRes.data?.length > 0) {
        const allActivities: Activity[] = [];
        for (const ws of workspacesRes.data.slice(0, 3)) {
          try {
            const auditRes = await auditApi.getByWorkspace(ws.id);
            const wsActivities = (auditRes.data || []).map((a: any) => ({
              ...a,
              workspaceName: ws.name,
            }));
            allActivities.push(...wsActivities);
          } catch (error) {
            // Continue if audit fetch fails
          }
        }
        // Sort by timestamp and take latest 10
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(allActivities.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await taskApi.updateStatus(taskId, status);
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: status as any } : t
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const todayTasks = tasks.filter(t => 
    t.dueDate && isToday(new Date(t.dueDate))
  );

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{user?.username || 'User'}</span>
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your workspaces today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workspaces"
          value={workspaces.length}
          icon={FolderKanban}
          iconColor="text-primary"
        />
        <StatCard
          title="Tasks Today"
          value={todayTasks.length}
          icon={Clock}
          iconColor="text-warning"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          icon={CheckSquare}
          iconColor="text-secondary"
        />
        <StatCard
          title="Completed"
          value={tasks.filter(t => t.status === 'completed').length}
          icon={TrendingUp}
          iconColor="text-success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
          </div>
          
          <div className="glass rounded-xl divide-y divide-border/50">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No recent activities</p>
                <p className="text-sm mt-1">Activities will appear here as you work</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Today's Tasks</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {todayTasks.length} tasks
            </span>
          </div>

          <div className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="glass rounded-xl p-6 text-center">
                <CheckSquare className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-muted-foreground">No tasks due today</p>
                <p className="text-xs text-muted-foreground mt-1">Enjoy your free time!</p>
              </div>
            )}
          </div>

          {/* Pending Tasks Preview */}
          {pendingTasks.length > 0 && todayTasks.length === 0 && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground pt-4">Upcoming Tasks</h3>
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} {...task} compact />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
