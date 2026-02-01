package com.teamtaskers.teamtaskers.service;

import com.teamtaskers.teamtaskers.model.AuditLog;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Save an audit log entry.
     * This method is intentionally simple and safe.
     */
    public void log(
            User user,
            String action,
            String entityType,
            Long entityId
    ) {
        AuditLog log = new AuditLog(
                user.getId(),
                user.getUsername(),
                action,
                entityType,
                entityId
        );

        auditLogRepository.save(log);
    }
}
