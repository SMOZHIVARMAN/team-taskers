import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Crown,
  Trash2,
  Users,
  Send,
  UserMinus,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/shared/TaskCard';
import { CreateTaskModal } from '@/components/workspaces/CreateTaskModal';
import { workspaceApi, taskApi, chatApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/* ================= TYPES ================= */
interface WorkspaceMember {
  id: number;
  username: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  ownerId: number;
  members: WorkspaceMember[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  assignee?: {
    username: string;
  };
}

interface Message {
  id: string;
  content: string;
  senderUsername: string;
  timestamp: string;
}

const WorkspaceDetail: React.FC = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const isOwner = workspace?.ownerId === user?.id;

  /* ============ FETCH DATA ============ */
  useEffect(() => {
    if (workspaceId) fetchAll();
  }, [workspaceId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [w, t, c] = await Promise.all([
        workspaceApi.getById(workspaceId!),
        taskApi.getByWorkspace(workspaceId!),
        chatApi.getMessages(workspaceId!),
      ]);

      setWorkspace(w.data);
      setTasks(t.data || []);
      setMessages(c.data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load workspace',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============ TASK ACTIONS ============ */
  const handleComplete = async (taskId: string) => {
    try {
      await taskApi.updateStatus(taskId, 'COMPLETED');

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status: 'COMPLETED' } : t
        )
      );
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskApi.delete(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm('Delete this workspace permanently?')) return;
    await workspaceApi.delete(workspaceId!);
    navigate('/workspaces');
  };

  /* ============ MEMBERS ============ */
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    await workspaceApi.addMember(workspaceId!, {
      username: newMemberName,
      role: 'MEMBER',
    });
    setNewMemberName('');
    fetchAll();
  };

  const handleRemoveMember = async (username: string) => {
    if (!confirm(`Remove ${username}?`)) return;
    await workspaceApi.removeMember(workspaceId!, username);
    fetchAll();
  };

  /* ============ CHAT ============ */
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await chatApi.sendMessage(workspaceId!, newMessage);
    setNewMessage('');
    fetchAll();
  };

  /* ============ TASK SPLIT ============ */
  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workspaces')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            {isOwner && (
              <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded-full flex gap-1">
                <Crown size={10} /> Owner
              </span>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDeleteWorkspace}>
                <Trash2 size={16} /> Delete Workspace
              </Button>
              <Button variant="gradient" onClick={() => setShowCreateTask(true)}>
                <Plus size={16} /> Add Task
              </Button>
            </div>
          )}
        </div>

        {/* ACTIVE TASKS */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            All Tasks ({activeTasks.length})
          </h2>

          {activeTasks.map(task => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              status={
                task.status === 'COMPLETED'
                  ? 'completed'
                  : 'in_progress'
              }
              assignee={task.assignee?.username}
              canDelete={isOwner}
              onDelete={handleDeleteTask}
              onStatusChange={handleComplete}
            />
          ))}
        </div>

        {/* COMPLETED TASKS */}
        {completedTasks.length > 0 && (
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-success flex gap-2">
              <CheckCircle2 size={18} /> Completed Tasks
            </h2>

            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                status="completed"
                assignee={task.assignee?.username}
              />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="space-y-6">
        {/* MEMBERS */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold flex gap-2 mb-3">
            <Users size={16} /> Members ({workspace.members.length})
          </h3>

          {workspace.members.map(m => (
            <div key={m.id} className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
              <span>{m.username}</span>
              {isOwner && m.id !== user?.id && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(m.username)}>
                  <UserMinus size={14} />
                </Button>
              )}
            </div>
          ))}

          {isOwner && (
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Add username"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
              />
              <Button onClick={handleAddMember}>Add</Button>
            </div>
          )}
        </div>

        {/* CHAT */}
        <div className="glass rounded-xl flex flex-col h-[400px]">
          <div className="p-3 border-b">Team Chat</div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(msg => {
              const me = msg.senderUsername === user?.username;
              return (
                <div key={msg.id} className={cn('max-w-[75%]', me && 'ml-auto text-right')}>
                  <div className={cn(
                    'px-3 py-2 rounded-lg text-sm',
                    me ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 flex gap-2 border-t">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSuccess={fetchAll}
        workspaceId={workspaceId!}
        members={workspace.members}
      />
    </div>
  );
};

export default WorkspaceDetail;
