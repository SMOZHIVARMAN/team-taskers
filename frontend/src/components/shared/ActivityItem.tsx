import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  UserPlus, 
  FolderPlus,
  LucideIcon 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ActivityType = 'task_created' | 'task_updated' | 'task_deleted' | 'task_completed' | 'member_added' | 'workspace_created';

interface ActivityItemProps {
  type: ActivityType;
  description: string;
  timestamp: string;
  user: string;
  workspaceName?: string;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; iconBg: string }> = {
  task_created: { icon: Plus, iconBg: 'bg-success/20 text-success' },
  task_updated: { icon: Pencil, iconBg: 'bg-warning/20 text-warning' },
  task_deleted: { icon: Trash2, iconBg: 'bg-destructive/20 text-destructive' },
  task_completed: { icon: CheckCircle2, iconBg: 'bg-primary/20 text-primary' },
  member_added: { icon: UserPlus, iconBg: 'bg-secondary/20 text-secondary' },
  workspace_created: { icon: FolderPlus, iconBg: 'bg-primary/20 text-primary' },
};

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  description,
  timestamp,
  user,
  workspaceName,
}) => {
  const config = activityConfig[type] || activityConfig.task_updated;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors">
      <div className={cn("p-2.5 rounded-xl shrink-0", config.iconBg)}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm">
          <span className="font-medium text-foreground">{user}</span>
          <span className="text-muted-foreground"> {description}</span>
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
          {workspaceName && (
            <>
              <span>•</span>
              <span className="text-secondary">{workspaceName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
