package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
}
