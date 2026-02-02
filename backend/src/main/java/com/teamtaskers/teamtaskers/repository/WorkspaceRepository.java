package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    // 🔥 CRITICAL: fetch workspaces where user is OWNER
    List<Workspace> findByOwnerId(Long ownerId);
}
