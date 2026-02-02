package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Workspace;
import com.teamtaskers.teamtaskers.model.WorkspaceMember;
import com.teamtaskers.teamtaskers.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    // Get all workspace memberships of a user
    List<WorkspaceMember> findByUser(User user);

    // Get all members of a workspace
    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    void deleteByWorkspace(Workspace workspace);


    // Membership existence check (authorization)
    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
}
