package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Task;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // ===============================
    // EXISTING METHODS (UNCHANGED)
    // ===============================

    // ✅ Get all tasks in a workspace
    List<Task> findByWorkspace(Workspace workspace);

    // ✅ Get all tasks assigned to a user (for /api/tasks/my)
    List<Task> findByAssignedTo(User user);

    // ✅ Used when deleting a workspace
    void deleteByWorkspace(Workspace workspace);

    // ===============================
    // 📅 WORKSPACE-BASED CALENDAR
    // ===============================

    // 📆 Get tasks for a specific due date (day view)
    @Query("""
        SELECT t
        FROM Task t
        WHERE t.workspace = :workspace
          AND t.dueDate = :date
    """)
    List<Task> findTasksByWorkspaceAndDueDate(
            @Param("workspace") Workspace workspace,
            @Param("date") LocalDate date
    );

    // 📅 Get tasks within a due date range (week / month view)
    @Query("""
        SELECT t
        FROM Task t
        WHERE t.workspace = :workspace
          AND t.dueDate BETWEEN :startDate AND :endDate
        ORDER BY t.dueDate ASC
    """)
    List<Task> findTasksByWorkspaceAndDueDateRange(
            @Param("workspace") Workspace workspace,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // ===============================
    // ✅ GLOBAL CALENDAR (FIXES 500)
    // ===============================

    @Query("""
        SELECT t
        FROM Task t
        WHERE (
              t.assignedTo.id = :userId
              OR t.workspace.owner.id = :userId
        )
        AND t.dueDate IS NOT NULL
        AND t.dueDate BETWEEN :startDate AND :endDate
        ORDER BY t.dueDate ASC
    """)
    List<Task> findTasksForUserBetweenDates(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
