import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Send, 
  Clock, 
  Crown,
  UserMinus,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/shared/TaskCard';
import { workspaceApi, taskApi, chatApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CreateTaskModal } from '@/components/workspaces/CreateTaskModal';
import { User } from '@/contexts/AuthContext';

interface WorkspaceMember {
  id: number;
  username: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: number;
  ownerUsername: string;
  members: WorkspaceMember[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignee?: User;
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
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const isOwner = workspace ? workspace.ownerId === user?.id : false;

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData();
    }
  }, [workspaceId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!workspaceId) return;
    
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const fetchWorkspaceData = async () => {
    try {
      setIsLoading(true);
      
      const [workspaceRes, tasksRes, chatRes] = await Promise.all([
        workspaceApi.getById(workspaceId!),
        taskApi.getByWorkspace(workspaceId!),
        chatApi.getMessages(workspaceId!),
      ]);

      setWorkspace(workspaceRes.data);
      setTasks(tasksRes.data || []);
      setMessages(chatRes.data || []);
    } catch (error) {
      console.error('Failed to fetch workspace data:', error);
      toast({
        title: "Error",
        description: "Failed to load workspace data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await chatApi.getMessages(workspaceId!);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      await chatApi.sendMessage(workspaceId!, newMessage);
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await taskApi.updateStatus(taskId, status);
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: status as any } : t
      ));
      toast({
        title: "Task updated",
        description: `Task status changed to ${status.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskApi.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;

    try {
      await workspaceApi.addMember(workspaceId!, {
        username: newMemberName,
        role: 'MEMBER',
      });
      toast({
        title: "Member added",
        description: `${newMemberName} has been added to the workspace.`,
      });
      setNewMemberName('');
      await fetchWorkspaceData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add member.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (username: string) => {
    if (!confirm(`Remove ${username} from this workspace?`)) return;
    
    try {
      await workspaceApi.removeMember(workspaceId!, username);
      await fetchWorkspaceData();
      toast({
        title: "Member removed",
        description: `${username} has been removed from the workspace.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove member.",
        variant: "destructive",
      });
    }
  };

  const handleTaskCreated = () => {
    setShowCreateTask(false);
    fetchWorkspaceData();
  };

  const handleDeleteWorkspace = async () => {
    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await workspaceApi.delete(workspaceId!);
        toast({
          title: "Workspace deleted",
          description: "The workspace has been successfully deleted.",
        });
        navigate('/workspaces');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete workspace.",
          variant: "destructive",
        });
      }
    }
  };

  // Filter tasks for current user if not owner
  const displayTasks = isOwner 
    ? tasks 
    : tasks.filter(t => t.assignee?.username === user?.username);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Workspace not found</p>
        <Button variant="ghost" onClick={() => navigate('/workspaces')} className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Workspaces
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workspaces')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              {isOwner && (
                <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning flex items-center gap-1">
                  <Crown size={10} />
                  Owner
                </span>
              )}
            </div>
            {workspace.description && (
              <p className="text-muted-foreground mt-1">{workspace.description}</p>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button variant="destructive" onClick={handleDeleteWorkspace} className="gap-2">
              <Trash2 size={18} />
              Delete Workspace
            </Button>
            <Button variant="gradient" onClick={() => setShowCreateTask(true)} className="gap-2">
              <Plus size={18} />
              Add Task
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">
            {isOwner ? 'All Tasks' : 'My Tasks'}
            <span className="text-sm text-muted-foreground ml-2">({displayTasks.length})</span>
          </h2>

          <div className="space-y-3">
            {displayTasks.length > 0 ? (
              displayTasks.map((task) => (
                <div key={task.id} className="relative group">
                  <TaskCard
                    {...task}
                    onStatusChange={handleStatusChange}
                  />
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No tasks assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Users size={16} />
              Members ({workspace.members.length})
            </h3>
            
            <div className="space-y-2">
              {/* Members */}
              {workspace.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 group">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{member.username}</span>
                  </div>
                  {isOwner && member.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.username)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-destructive hover:text-destructive"
                    >
                      <UserMinus size={14} />
                    </Button>
                  )}
                  {member.role === 'OWNER' && (
                    <Crown size={14} className="text-warning" />
                  )}
                </div>
              ))}

              {isOwner && (
                <div className="pt-2 mt-2 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter username to add"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                    <Button onClick={handleAddMember}>Add</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="glass rounded-xl overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <span className="text-sm font-semibold">Team Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderUsername === user?.username;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isMe ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <span className="text-xs text-muted-foreground mb-1">
                        {isMe ? 'You' : msg.senderUsername}
                      </span>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm",
                          isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No messages yet
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSendingMessage}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSuccess={handleTaskCreated}
        workspaceId={workspaceId!}
        members={workspace.members || []}
      />
    </div>
  );
};

export default WorkspaceDetail;
