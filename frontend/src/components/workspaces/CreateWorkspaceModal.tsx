import React, { useState } from 'react';
import { X, Plus, Calendar, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { workspaceApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  deadline: z.string().optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [memberInputs, setMemberInputs] = useState<string[]>(['']);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
  });

  const handleAddMemberField = () => {
    setMemberInputs([...memberInputs, '']);
  };

  const handleRemoveMemberField = (index: number) => {
    setMemberInputs(memberInputs.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, value: string) => {
    const newInputs = [...memberInputs];
    newInputs[index] = value;
    setMemberInputs(newInputs);
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    setIsLoading(true);
    try {
      // Create workspace
      const response = await workspaceApi.create({
        name: data.name,
        description: data.description || '',
        deadline: data.deadline,
      });

      const workspaceId = response.data.id;

      // Add members if any
      const validMembers = memberInputs.filter(m => m.trim().length > 0);
      if (validMembers.length > 0) {
        await workspaceApi.addMembers(workspaceId, validMembers);
      }

      toast({
        title: "Workspace created!",
        description: `${data.name} has been created successfully.`,
      });

      reset();
      setMemberInputs(['']);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Failed to create workspace",
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
            <h2 className="text-xl font-semibold">Create New Workspace</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace Name</label>
              <Input
                {...register('name')}
                placeholder="e.g. Marketing Campaign"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                placeholder="Brief description of the project..."
                className="flex w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar size={14} />
                Deadline (Optional)
              </label>
              <Input
                {...register('deadline')}
                type="date"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users size={14} />
                Add Members
              </label>
              <div className="space-y-2">
                {memberInputs.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      placeholder="Enter username"
                    />
                    {memberInputs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMemberField(index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMemberField}
                  className="gap-2"
                >
                  <Plus size={14} />
                  Add Another Member
                </Button>
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
                  'Create Workspace'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
