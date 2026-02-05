package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // activity feed for workspace
    List<AuditLog> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);

    // optional (future)
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);
}
