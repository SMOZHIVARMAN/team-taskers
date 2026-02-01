package com.teamtaskers.teamtaskers.dto;

public class AddWorkspaceMemberRequest {

    private Long workspaceId;
    private String username; // user to be added
    private String role;     // ADMIN or MEMBER

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
