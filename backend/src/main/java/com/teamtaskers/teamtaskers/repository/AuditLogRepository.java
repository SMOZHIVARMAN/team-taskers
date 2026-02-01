package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Get all logs of a user (optional, future use)
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Get logs by entity type (TASK, WORKSPACE, MESSAGE, etc.)
    List<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);
}
