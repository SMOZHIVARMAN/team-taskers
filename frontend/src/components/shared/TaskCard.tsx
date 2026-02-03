import { CheckCircle2, Trash2, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  assignee?: string;

  canDelete?: boolean;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;

  compact?: boolean;
}

export const TaskCard = ({
  id,
  title,
  description,
  status,
  dueDate,
  assignee,
  canDelete,
  onDelete,
  onStatusChange,
  compact = false,
}: TaskCardProps) => {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-4">
      
      {/* LEFT SIDE */}
      <div className="flex-1 min-w-0">
        <div className="inline-block px-3 py-1 rounded-md bg-yellow-400 text-black font-semibold text-sm">
          {title}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {assignee && (
            <span className="flex items-center gap-1">
              <User size={12} /> {assignee}
            </span>
          )}
          {dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {format(new Date(dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT SIDE ACTIONS */}
      <div className="flex items-center gap-3 shrink-0">
        {/* STATUS */}
        {status !== 'completed' && (
          <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
            In Progress
          </span>
        )}

        {/* COMPLETE BUTTON */}
        {onStatusChange && status !== 'completed' && (
          <Button
            size="icon"
            variant="ghost"
            className="text-success hover:text-success"
            onClick={() => onStatusChange(id, 'COMPLETED')}
          >
            <CheckCircle2 size={18} />
          </Button>
        )}

        {/* DELETE BUTTON */}
        {canDelete && onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};
