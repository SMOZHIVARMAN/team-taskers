package com.teamtaskers.teamtaskers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateTaskRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Long workspaceId;

    // 📅 Calendar feature (OPTIONAL)
    private LocalDate dueDate;

    // ===============================
    // Getters & Setters
    // ===============================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    // 📅 Due Date
    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
