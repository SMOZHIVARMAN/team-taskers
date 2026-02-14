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
import { format, isValid } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/shared/TaskCard';
import { CreateTaskModal } from '@/components/workspaces/CreateTaskModal';
import { workspaceApi, taskApi, chatApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* ================= TYPES ================= */

interface WorkspaceMember {
  id: number;        // workspace_member id
  userId: number;    // ✅ REAL user.id
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
  senderName: string;
  createdAt: string;
}

/* ================= UTILS ================= */

const safeTime = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return isValid(d) ? format(d, 'h:mm a') : '';
};

/* ================= COMPONENT ================= */

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
      setTasks(Array.isArray(t.data) ? t.data : []);
      setMessages(Array.isArray(c.data) ? c.data : []);
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
    await taskApi.updateStatus(taskId, 'COMPLETED');
    fetchAll();
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskApi.delete(taskId);
    fetchAll();
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
    await chatApi.sendMessage(workspaceId!, newMessage.trim());
    setNewMessage('');
    fetchAll();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">

      {/* LEFT PANEL */}
      <div className="lg:w-2/3 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workspaces')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold break-words">{workspace.name}</h1>
            {isOwner && (
              <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded-full flex gap-1">
                <Crown size={10} /> Owner
              </span>
            )}
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" onClick={handleDeleteWorkspace}>
                <Trash2 size={16} /> Delete Workspace
              </Button>
              <Button variant="gradient" onClick={() => setShowCreateTask(true)}>
                <Plus size={16} /> Add Task
              </Button>
            </div>
          )}
        </div>

        {/* TASK LISTS */}
        <div className="flex-1 flex flex-col mt-4 overflow-hidden">
          <div className="flex-[2] overflow-y-auto pr-2 -mr-2">
            <h2 className="text-lg font-semibold mb-3">
              All Tasks ({activeTasks.length})
            </h2>

            <div className="space-y-3">
              {activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status="in_progress"
                  assignee={task.assignee?.username}
                  canDelete={isOwner}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleComplete}
                />
              ))}
            </div>
          </div>

          {completedTasks.length > 0 && (
            <div className="flex-[1] pt-4 border-t mt-4 overflow-y-auto pr-2 -mr-2">
              <h2 className="text-lg font-semibold text-success flex gap-2 mb-3">
                <CheckCircle2 size={18} /> Completed Tasks
              </h2>

              <div className="space-y-3">
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
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:w-1/3 flex flex-col gap-6">

        {/* MEMBERS */}
        <div className="glass rounded-xl p-4 flex flex-col min-h-[200px] flex-shrink-0">
          <h3 className="text-sm font-semibold flex gap-2 mb-3">
            <Users size={16} /> Members ({workspace.members.length})
          </h3>

          <div className="overflow-y-auto pr-2 -mr-2 space-y-1">
            {workspace.members.map(m => (
              <div key={m.id} className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
                <span className="min-w-0 break-words">{m.username}</span>
                {isOwner && m.userId !== user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(m.username)}
                  >
                    <UserMinus size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isOwner && (
            <div className="flex gap-2 mt-auto pt-4 border-t">
              <div className="flex-1">
                <Input
                  placeholder="Add username"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                />
              </div>
              <Button onClick={handleAddMember}>Add</Button>
            </div>
          )}
        </div>

        {/* CHAT (RESTORED) */}
        <div className="glass rounded-xl flex flex-col flex-1">
          <div className="p-3 border-b font-semibold">Team Chat</div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.map(msg => {
              const isMe = msg.senderName === user?.username;
              const initial = msg.senderName.charAt(0).toUpperCase();

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isMe ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shadow">
                      {initial}
                    </div>
                  )}

                  <div className="max-w-[70%] px-4 py-2 rounded-2xl text-sm bg-transparent shadow shadow-gray-400/30">
                    <div>{msg.content}</div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {safeTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 flex gap-2 border-t">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message and press Enter"
              />
            </div>
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
