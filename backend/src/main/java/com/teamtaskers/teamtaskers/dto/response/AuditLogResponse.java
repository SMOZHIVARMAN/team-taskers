package com.teamtaskers.teamtaskers.dto.response;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String username,
        String action,
        String entityType,
        Long entityId,
        LocalDateTime createdAt
) {}
