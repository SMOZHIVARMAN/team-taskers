package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.response.AuditLogResponse;
import com.teamtaskers.teamtaskers.model.AuditLog;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.service.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // ====================================================
    // ACTIVITY PAGE API
    // ====================================================
    @GetMapping("/workspace/{workspaceId}")
    public List<AuditLogResponse> getAuditLogsByWorkspace(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        List<AuditLog> logs =
                auditLogService.getLogsByWorkspace(workspaceId, user);

        return logs.stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getUsername(),
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getCreatedAt()
                ))
                .toList();
    }
}
