package com.teamtaskers.teamtaskers.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UpdateTaskDueDateRequest {

    @NotNull(message = "Due date cannot be null")
    private LocalDate dueDate;

    // ===== Getter & Setter =====

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
