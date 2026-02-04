import { CheckCircle2, Trash2, Clock, User } from 'lucide-react';
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
  onStatusChange?: (taskId: string) => void;

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
}: TaskCardProps) => {
  return (
    <div className="glass rounded-xl px-4 py-4 flex items-center justify-between gap-4">

      {/* LEFT */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* TASK TITLE */}
        <div className="inline-block px-3 py-1 rounded-md bg-[#00F5DC] text-black font-semibold text-sm">
          {title}
        </div>

        {/* DESCRIPTION */}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}

        {/* META */}
        <div className="flex items-center gap-3 mt-2 text-xs">
          {assignee && (
            <span className="px-2 py-1 rounded-md bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-medium flex items-center gap-1">
              <User size={12} />
              {assignee}
            </span>
          )}

          {dueDate && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} />
              {format(new Date(dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3 shrink-0">
        {status !== 'completed' && (
          <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
            In Progress
          </span>
        )}

        {/* COMPLETE */}
        {onStatusChange && status !== 'completed' && (
          <Button
            size="icon"
            variant="ghost"
            className="text-success"
            onClick={() => onStatusChange(id)}
          >
            <CheckCircle2 size={18} />
          </Button>
        )}

        {/* DELETE */}
        {canDelete && onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => onDelete(id)}
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>
    </div>
  );


};