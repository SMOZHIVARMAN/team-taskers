package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Task;
import com.teamtaskers.teamtaskers.model.TaskStatus;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Workspace tasks
    List<Task> findByWorkspace(Workspace workspace);

    // Assigned tasks
    List<Task> findByAssignedTo(User assignedTo);

    // Dashboard counts
    long countByAssignedToAndDueDate(User assignedTo, LocalDate dueDate);

    long countByAssignedToAndStatus(User assignedTo, TaskStatus status);

    // Calendar (user-based)
    @Query("""
        SELECT t FROM Task t
        WHERE t.assignedTo.id = :userId
        AND t.dueDate BETWEEN :start AND :end
    """)
    List<Task> findTasksForUserBetweenDates(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    // Workspace + date range ✅ FIXED
    List<Task> findTasksByWorkspaceAndDueDateBetween(
            Workspace workspace,
            LocalDate startDate,
            LocalDate endDate
    );

    // Workspace + exact date
    List<Task> findTasksByWorkspaceAndDueDate(
            Workspace workspace,
            LocalDate date
    );

    // Delete tasks when workspace is deleted
    void deleteByWorkspace(Workspace workspace);
}
