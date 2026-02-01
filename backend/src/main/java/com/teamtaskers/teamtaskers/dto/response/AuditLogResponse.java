package com.teamtaskers.teamtaskers.dto.response;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private Long userId;
    private LocalDateTime createdAt;

    public AuditLogResponse(
            Long id,
            String action,
            String entityType,
            Long entityId,
            Long userId,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
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

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
