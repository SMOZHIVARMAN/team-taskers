package com.teamtaskers.teamtaskers.model;

import jakarta.persistence.*;

@Entity
@Table(name = "workspace_members")
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private WorkspaceRole role;

    // ✅ REQUIRED GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public User getUser() {
        return user;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }
}
