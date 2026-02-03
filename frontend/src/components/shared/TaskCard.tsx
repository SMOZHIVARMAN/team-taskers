import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, User, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  assignee?: string;
  workspaceName?: string;
  onStatusChange?: (taskId: string, status: string) => void;
  compact?: boolean;
}

const statusConfig = {
  pending: {
    icon: Circle,
    label: 'Pending',
    className: 'text-muted-foreground bg-muted/50',
  },
  in_progress: {
    icon: AlertCircle,
    label: 'In Progress',
    className: 'text-warning bg-warning/10',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'text-success bg-success/10',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  dueDate,
  assignee,
  workspaceName,
  onStatusChange,
  compact = false,
}) => {

  console.log('Task status:', status);
  const config = statusConfig[status] ?? statusConfig.pending;
  const StatusIcon = config.icon;


  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
        <StatusIcon size={18} className={cn("shrink-0", statusConfig[status].className.split(' ')[0])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          {dueDate && (
            <p className="text-xs text-muted-foreground">
              Due {format(new Date(dueDate), 'MMM d, h:mm a')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 card-hover space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
            config.className
          )}
        >
          <StatusIcon size={14} />
          {config.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {workspaceName && (
          <span className="px-2 py-1 rounded bg-secondary/20 text-secondary">
            {workspaceName}
          </span>
        )}
        {dueDate && (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {format(new Date(dueDate), 'MMM d, yyyy')}
          </span>
        )}
        {assignee && (
          <span className="inline-flex items-center gap-1">
            <User size={12} />
            {assignee}
          </span>
        )}
      </div>

      {onStatusChange && status !== 'completed' && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('in_progress')}
              className="text-xs"
            >
              Start Working
            </Button>
          )}
          {status === 'in_progress' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('completed')}
              className="text-xs text-success hover:text-success"
            >
              Mark Complete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
