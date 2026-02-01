package com.teamtaskers.teamtaskers.dto;

import com.teamtaskers.teamtaskers.model.WorkspaceRole;

public class AddMemberRequest {

    private String username;
    private WorkspaceRole role;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }
}
