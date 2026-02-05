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

    private LocalDate dueDate;

    // ✅ Assigned user (from dropdown)
    private Long assignedUserId;

    // ===============================
    // Getters
    // ===============================
    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Long getAssignedUserId() {
        return assignedUserId;
    }

    // ===============================
    // Setters
    // ===============================
    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void setAssignedUserId(Long assignedUserId) {
        this.assignedUserId = assignedUserId;
    }
}
