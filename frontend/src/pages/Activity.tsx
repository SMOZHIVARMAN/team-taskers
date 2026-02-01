import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ActivityItem } from '@/components/shared/ActivityItem';
import { workspaceApi, auditApi } from '@/services/api';

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

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const workspacesRes = await workspaceApi.getAll();
      const allWorkspaces = workspacesRes.data || [];
      setWorkspaces(allWorkspaces);

      // Fetch activities from all workspaces
      const allActivities: Activity[] = [];
      for (const ws of allWorkspaces) {
        try {
          const auditRes = await auditApi.getByWorkspace(ws.id);
          const wsActivities = (auditRes.data || []).map((a: any) => ({
            ...a,
            workspaceName: ws.name,
            workspaceId: ws.id,
          }));
          allActivities.push(...wsActivities);
        } catch (error) {
          // Continue if audit fetch fails
        }
      }

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.workspaceName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWorkspace = 
      selectedWorkspace === 'all' || 
      activity.workspaceName === selectedWorkspace;
    
    return matchesSearch && matchesWorkspace;
  });

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
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-muted-foreground">Track all activities across your workspaces</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className="flex h-11 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.name}>{ws.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="glass rounded-xl divide-y divide-border/50">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityItem key={activity.id} {...activity} />
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm mt-1">
              {searchQuery || selectedWorkspace !== 'all' 
                ? 'Try adjusting your filters'
                : 'Activities will appear here as you work'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
