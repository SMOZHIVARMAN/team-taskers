package com.teamtaskers.teamtaskers.dto.response;

public class WorkspaceMemberResponse {

    private Long userId;
    private String username;
    private String role;

    public WorkspaceMemberResponse(Long userId, String username, String role) {
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
