package com.teamtaskers.teamtaskers.dto;

import com.teamtaskers.teamtaskers.model.Role;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;

    public UserResponse(Long id, String username, String email, Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
