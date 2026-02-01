package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.response.AuditLogResponse;
import com.teamtaskers.teamtaskers.model.AuditLog;
import com.teamtaskers.teamtaskers.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // ----------------------------------------------------
    // 📊 GET RECENT AUDIT LOGS (Dashboard)
    // ----------------------------------------------------
    @GetMapping
    public List<AuditLogResponse> getAuditLogs() {

        return auditLogRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getUserId(),          // ✅ FIXED
                        log.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
