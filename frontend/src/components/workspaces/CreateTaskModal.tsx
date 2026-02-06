import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

/* ================= TYPES ================= */

interface WorkspaceMember {
  id: number;        // workspace_member id
  userId: number;    // ✅ REAL user.id
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

/* ================= FORM ================= */

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  assignedUserId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workspaceId,
  members,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsLoading(true);

      await taskApi.create({
        title: data.title,
        description: data.description || '',
        workspaceId,
        dueDate: data.dueDate || undefined,
        assignedUserId: data.assignedUserId
          ? Number(data.assignedUserId)
          : undefined,
      });

      toast({
        title: 'Task created',
        description: `"${data.title}" added successfully`,
      });

      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Failed to create task',
        description: err.response?.data?.message || 'Error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/70 z-40" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Task</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register('title')} placeholder="Task title" />

            <textarea
              {...register('description')}
              className="w-full rounded-lg p-3 bg-muted/50"
              placeholder="Description"
            />

            <Input {...register('dueDate')} type="date" />

            {/* 🔥 FIXED ASSIGNEE DROPDOWN */}
            <select
              {...register('assignedUserId')}
              className="w-full rounded-lg p-3 bg-muted/50"
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.username} ({m.role})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
