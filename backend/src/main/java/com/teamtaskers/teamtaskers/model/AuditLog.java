package com.teamtaskers.teamtaskers.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // who did the action
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    // what happened
    @Column(nullable = false)
    private String action;        // TASK_CREATED, MEMBER_ADDED, etc.

    @Column(nullable = false)
    private String entityType;    // TASK, WORKSPACE, MEMBER

    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // workspace scope
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    protected AuditLog() {}

    public AuditLog(
            Workspace workspace,
            Long userId,
            String username,
            String action,
            String entityType,
            Long entityId
    ) {
        this.workspace = workspace;
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.createdAt = LocalDateTime.now();
    }

    // =====================
    // GETTERS (IMMUTABLE)
    // =====================

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getAction() {
        return action;
    }

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Workspace getWorkspace() {
        return workspace;
    }
}
