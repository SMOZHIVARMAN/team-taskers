package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.CreateTaskRequest;
import com.teamtaskers.teamtaskers.dto.UpdateTaskDueDateRequest;
import com.teamtaskers.teamtaskers.dto.UpdateTaskStatusRequest;
import com.teamtaskers.teamtaskers.dto.response.TaskResponse;
import com.teamtaskers.teamtaskers.model.Task;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ====================================================
    // 1️⃣ GET TASKS BY WORKSPACE
    // ====================================================
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<TaskResponse>> getTasksByWorkspace(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        List<TaskResponse> tasks = taskService
                .getTasksByWorkspace(workspaceId, user)
                .stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tasks);
    }

    // ====================================================
    // 2️⃣ CREATE TASK
    // ====================================================
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody @Valid CreateTaskRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Task task = taskService.createTask(request, user);
        return ResponseEntity.ok(new TaskResponse(task));
    }

    // ====================================================
    // 3️⃣ UPDATE TASK STATUS
    // ====================================================
    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody @Valid UpdateTaskStatusRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Task updatedTask = taskService.updateTaskStatus(
                taskId,
                request.getStatus(),
                user
        );

        return ResponseEntity.ok(new TaskResponse(updatedTask));
    }

    // ====================================================
    // 4️⃣ ASSIGN TASK
    // ====================================================
    @PutMapping("/{taskId}/assign/{userId}")
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable Long taskId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Task task = taskService.assignTask(taskId, userId, user);
        return ResponseEntity.ok(new TaskResponse(task));
    }

    // ====================================================
    // 5️⃣ GET MY TASKS
    // ====================================================
    @GetMapping("/my")
    public ResponseEntity<List<TaskResponse>> getMyTasks(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        List<TaskResponse> tasks = taskService
                .getMyTasks(user)
                .stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tasks);
    }

    // ====================================================
    // 6️⃣ DELETE TASK
    // ====================================================
    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        taskService.deleteTask(taskId, currentUser);
        return ResponseEntity.ok("Task deleted successfully");
    }

    // ====================================================
    // 7️⃣ UPDATE TASK DUE DATE
    // ====================================================
    @PutMapping("/{taskId}/due-date")
    public ResponseEntity<TaskResponse> updateTaskDueDate(
            @PathVariable Long taskId,
            @RequestBody @Valid UpdateTaskDueDateRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Task updatedTask = taskService.updateTaskDueDate(
                taskId,
                request.getDueDate(),
                user
        );

        return ResponseEntity.ok(new TaskResponse(updatedTask));
    }

    // ====================================================
    // ✅ 8️⃣ CALENDAR API (GLOBAL – FIXES 500 ERROR)
    // ====================================================
    @GetMapping("/calendar")
    public ResponseEntity<List<TaskResponse>> getTasksForCalendar(
            @RequestParam("start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam("end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        List<TaskResponse> tasks = taskService
                .getTasksForUserBetweenDates(user, startDate, endDate)
                .stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tasks);
    }

    // ====================================================
    // 9️⃣ WORKSPACE DATE RANGE (UNCHANGED)
    // ====================================================
    @GetMapping("/workspace/{workspaceId}/range")
    public ResponseEntity<List<TaskResponse>> getTasksByDateRange(
            @PathVariable Long workspaceId,
            @RequestParam("start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam("end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        List<TaskResponse> tasks = taskService.getTasksByWorkspaceAndDueDateRange(
                workspaceId,
                startDate,
                endDate,
                user
        )

                .stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tasks);
    }
}
