import React, { useEffect, useState } from "react";
import { Plus, Users, Crown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { workspaceApi } from "@/services/api";
import { CreateWorkspaceModal } from "@/components/workspaces/CreateWorkspaceModal";

interface Workspace {
  id: number;
  name: string;
  role: string;
  memberCount: number;
}

const Workspaces: React.FC = () => {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"member" | "admin">("member");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const res = await workspaceApi.getAll();
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    } finally {
      setIsLoading(false);
    }
  };

  const adminWorkspaces = workspaces.filter(
    (ws) => ws.role === 'OWNER'
  );

  const memberWorkspaces = workspaces.filter(
    (ws) => ws.role !== 'OWNER'
  );

  const filteredWorkspaces = (
    activeTab === "admin" ? adminWorkspaces : memberWorkspaces
  ).filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkspaceClick = (id: number) => {
    navigate(`/workspaces/${id}`);
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
          <p className="text-muted-foreground">
            Manage and collaborate on your projects
          </p>
        </div>

        {activeTab === "admin" && (
          <Button
            variant="gradient"
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Workspace
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("member")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            activeTab === "member"
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
          onClick={() => setActiveTab("admin")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            activeTab === "admin"
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
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Search workspaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkspaces.map((ws) => {
          const isOwner = ws.role === 'OWNER';

          return (
            <div
              key={ws.id}
              onClick={() => handleWorkspaceClick(ws.id)}
              className="glass rounded-xl p-5 card-hover cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-primary/50 to-secondary/50">
                  {ws.name.charAt(0).toUpperCase()}
                </div>

                {isOwner && (
                  <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
                    Owner
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {ws.name}
              </h3>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Users size={12} />
                {ws.memberCount} member{ws.memberCount === 1 ? '' : 's'}
              </div>
            </div>
          );
        })}

        {filteredWorkspaces.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="glass rounded-xl p-8 max-w-md mx-auto">
              <p className="text-muted-foreground">No workspaces found</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleWorkspaceCreated}
      />
    </div>
  );
};

export default Workspaces;
