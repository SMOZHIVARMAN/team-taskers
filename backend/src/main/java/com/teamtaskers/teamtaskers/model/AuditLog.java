package com.teamtaskers.teamtaskers.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who performed the action
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    // What action
    @Column(nullable = false)
    private String action;

    // On what entity
    @Column(nullable = false)
    private String entityType;

    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // ===============================
    // Constructors
    // ===============================

    public AuditLog() {}

    public AuditLog(
            Long userId,
            String username,
            String action,
            String entityType,
            Long entityId
    ) {
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.createdAt = LocalDateTime.now();
    }

    // ===============================
    // Getters
    // ===============================

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
}
