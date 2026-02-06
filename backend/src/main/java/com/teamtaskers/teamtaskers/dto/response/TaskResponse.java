package com.teamtaskers.teamtaskers.dto.response;

import com.teamtaskers.teamtaskers.model.Task;
import com.teamtaskers.teamtaskers.model.TaskStatus;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TaskResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final TaskStatus status;
    private final Long workspaceId;
    private final Long assignedToUserId;
    private final LocalDate dueDate; // ✅ ADD THIS

    public TaskResponse(Task task) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.workspaceId = task.getWorkspace().getId();
        this.assignedToUserId =
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;

        this.dueDate = task.getDueDate(); // ✅ ADD THIS
    }
}
