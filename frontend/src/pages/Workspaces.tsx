import React, { useState, useEffect } from 'react';
import { Plus, Users, Crown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { workspaceApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { CreateWorkspaceModal } from '@/components/workspaces/CreateWorkspaceModal';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerUsername: string;
  memberCount?: number;
  deadline?: string;
}

const Workspaces: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const response = await workspaceApi.getAll();
      setWorkspaces(response.data || []);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const memberWorkspaces = workspaces.filter(ws => ws.ownerUsername !== user?.username);
  const adminWorkspaces = workspaces.filter(ws => ws.ownerUsername === user?.username);

  const filteredWorkspaces = (activeTab === 'member' ? memberWorkspaces : adminWorkspaces)
    .filter(ws => 
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleWorkspaceCreated = () => {
    setShowCreateModal(false);
    fetchWorkspaces();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">Manage and collaborate on your projects</p>
        </div>
        
        {activeTab === 'admin' && (
          <Button
            variant="gradient"
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus size={18} />
            Create Workspace
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('member')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'member'
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            <Users size={16} />
            Member ({memberWorkspaces.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'admin'
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            <Crown size={16} />
            Admin ({adminWorkspaces.length})
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search workspaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkspaces.map((workspace) => (
          <div
            key={workspace.id}
            onClick={() => handleWorkspaceClick(workspace.id)}
            className="glass rounded-xl p-5 card-hover cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div 
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                  "bg-gradient-to-br from-primary/50 to-secondary/50"
                )}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              {workspace.ownerUsername === user?.username && (
                <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
                  Owner
                </span>
              )}
            </div>

            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {workspace.name}
            </h3>
            
            {workspace.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {workspace.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users size={12} />
                {workspace.memberCount || 1} members
              </span>
            </div>
          </div>
        ))}

        {filteredWorkspaces.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="glass rounded-xl p-8 max-w-md mx-auto">
              {activeTab === 'admin' ? (
                <>
                  <Crown className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="font-semibold text-lg mb-2">No workspaces yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create your first workspace to start collaborating with your team.
                  </p>
                  <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} className="mr-2" />
                    Create Workspace
                  </Button>
                </>
              ) : (
                <>
                  <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="font-semibold text-lg mb-2">No workspaces found</h3>
                  <p className="text-muted-foreground text-sm">
                    You haven't been added to any workspaces yet.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleWorkspaceCreated}
      />
    </div>
  );
};

export default Workspaces;
