import React, { useState } from 'react';
import { X, Calendar, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

/* ✅ FIX 1: Correct member type */
interface WorkspaceMember {
  userId: number;
  username: string;
  role: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workspaceId: string;
  members: WorkspaceMember[];
}

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workspaceId,
  members,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      await taskApi.create({
        title: data.title,
        description: data.description || '',
        workspaceId,
        assigneeUsername: data.assignee || undefined,
        dueDate: data.dueDate || undefined,
      });

      toast({
        title: "Task created!",
        description: `${data.title} has been added.`,
      });

      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.response?.data?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 animate-scale-in">
        <div className="glass rounded-xl p-6 m-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Create New Task</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input {...register('title')} placeholder="e.g. Design homepage mockup" />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                placeholder="Describe the task..."
                className="flex w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar size={14} />
                  Due Date
                </label>
                <Input {...register('dueDate')} type="datetime-local" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User size={14} />
                  Assign To
                </label>

                <select
                  {...register('assignee')}
                  className="flex h-11 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Unassigned</option>

                  {/* ✅ FIX 2: Render primitives only */}
                  {members.map((member) => (
                    <option
                      key={member.userId}
                      value={member.username}
                    >
                      {member.username} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
