package com.teamtaskers.teamtaskers.dto.response;

import com.teamtaskers.teamtaskers.model.Role;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Role role;

    // 🔹 Profile fields
    private String bio;
    private String skills;
    private String jobTitle;
    private String experience;

    public UserResponse(
            Long id,
            String username,
            String email,
            Role role,
            String bio,
            String skills,
            String jobTitle,
            String experience
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.bio = bio;
        this.skills = skills;
        this.jobTitle = jobTitle;
        this.experience = experience;
    }

    // ===============================
    // Getters
    // ===============================
    public Long getId() { return id; }

    public String getUsername() { return username; }

    public String getEmail() { return email; }

    public Role getRole() { return role; }

    public String getBio() { return bio; }

    public String getSkills() { return skills; }

    public String getJobTitle() { return jobTitle; }

    public String getExperience() { return experience; }
}
