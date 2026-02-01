package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.WorkspaceMember;
import com.teamtaskers.teamtaskers.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    // Get all workspace memberships of a user
    List<WorkspaceMember> findByUser(User user);

    // Get all members of a workspace
    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    // ✅ Used in DELETE WORKSPACE (manual cascade)
    void deleteByWorkspaceId(Long workspaceId);

    // Membership existence check (authorization)
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);
}
