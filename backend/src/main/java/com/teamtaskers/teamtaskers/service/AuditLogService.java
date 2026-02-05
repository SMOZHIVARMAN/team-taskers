package com.teamtaskers.teamtaskers.service;

import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.model.AuditLog;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.model.Workspace;
import com.teamtaskers.teamtaskers.repository.AuditLogRepository;
import com.teamtaskers.teamtaskers.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.auditLogRepository = auditLogRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    // ====================================================
    // SAVE AUDIT LOG
    // ====================================================
    public void log(
            Workspace workspace,
            User user,
            String action,
            String entityType,
            Long entityId
    ) {
        AuditLog log = new AuditLog(
                workspace,
                user.getId(),
                user.getUsername(),
                action,
                entityType,
                entityId
        );

        auditLogRepository.save(log);
    }

    // ====================================================
    // GET ACTIVITY FEED
    // ====================================================
    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByWorkspace(Long workspaceId, User user) {

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, user.getId());

        if (!isMember) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        return auditLogRepository
                .findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }
}
