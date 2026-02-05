package com.teamtaskers.teamtaskers.service;

import com.teamtaskers.teamtaskers.dto.CreateTaskRequest;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.*;
import com.teamtaskers.teamtaskers.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public TaskService(
            TaskRepository taskRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            AuditLogService auditLogService
    ) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // ----------------------------------------------------
    // 1️⃣ GET TASKS BY WORKSPACE
    // ----------------------------------------------------
    public List<Task> getTasksByWorkspace(Long workspaceId, User user) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, user.getId());

        if (!isMember) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        return taskRepository.findByWorkspace(workspace);
    }

    // ----------------------------------------------------
    // 2️⃣ CREATE TASK
    // ----------------------------------------------------
    public Task createTask(CreateTaskRequest request, User user) {

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspace.getId(), user.getId());

        if (!isMember) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setWorkspace(workspace);
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(request.getDueDate());

        Task savedTask = taskRepository.save(task);

        // ✅ FIXED AUDIT LOG
        auditLogService.log(
                workspace,
                user,
                "CREATE_TASK",
                "TASK",
                savedTask.getId()
        );

        return savedTask;
    }

    // ----------------------------------------------------
    // 3️⃣ UPDATE TASK STATUS
    // ----------------------------------------------------
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus, User user) {

        if (newStatus == null) {
            throw new IllegalArgumentException("Task status cannot be null");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Workspace workspace = task.getWorkspace();

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspace.getId(), user.getId());

        if (!isMember) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        task.setStatus(newStatus);
        Task updatedTask = taskRepository.save(task);

        // ✅ FIXED AUDIT LOG
        auditLogService.log(
                workspace,
                user,
                "UPDATE_TASK_STATUS",
                "TASK",
                updatedTask.getId()
        );

        return updatedTask;
    }

    // ----------------------------------------------------
    // 4️⃣ ASSIGN TASK
    // ----------------------------------------------------
    public Task assignTask(Long taskId, Long userId, User currentUser) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        User userToAssign = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User to assign not found"));

        Workspace workspace = task.getWorkspace();

        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());

        if (!isOwner) {
            throw new AccessDeniedException("Only workspace owner can assign tasks");
        }

        task.setAssignedTo(userToAssign);
        Task updatedTask = taskRepository.save(task);

        // ✅ FIXED AUDIT LOG
        auditLogService.log(
                workspace,
                currentUser,
                "ASSIGN_TASK",
                "TASK",
                updatedTask.getId()
        );

        return updatedTask;
    }

    // ----------------------------------------------------
    // 5️⃣ GET MY TASKS
    // ----------------------------------------------------
    public List<Task> getMyTasks(User user) {
        return taskRepository.findByAssignedTo(user);
    }

    // ----------------------------------------------------
    // 6️⃣ DELETE TASK
    // ----------------------------------------------------
    public void deleteTask(Long taskId, User currentUser) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Workspace workspace = task.getWorkspace();

        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());

        if (!isOwner) {
            throw new AccessDeniedException("Only workspace owner can delete tasks");
        }

        taskRepository.delete(task);

        // ✅ FIXED AUDIT LOG
        auditLogService.log(
                workspace,
                currentUser,
                "DELETE_TASK",
                "TASK",
                taskId
        );
    }

    // ====================================================
    // 📅 CALENDAR METHODS
    // ====================================================

    // 7️⃣ UPDATE TASK DUE DATE
    public Task updateTaskDueDate(Long taskId, LocalDate dueDate, User user) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Workspace workspace = task.getWorkspace();

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspace.getId(), user.getId());

        if (!isMember) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        task.setDueDate(dueDate);
        Task updatedTask = taskRepository.save(task);

        // ✅ FIXED AUDIT LOG
        auditLogService.log(
                workspace,
                user,
                "UPDATE_TASK_DUE_DATE",
                "TASK",
                updatedTask.getId()
        );

        return updatedTask;
    }

    // 8️⃣ GET TASKS BY WORKSPACE + DATE
    public List<Task> getTasksByWorkspaceAndDate(
            Long workspaceId,
            LocalDate date,
            User user
    ) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, user.getId());

        if (!isMember) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        return taskRepository.findTasksByWorkspaceAndDueDate(workspace, date);
    }

    // 9️⃣ GET TASKS BY WORKSPACE + DATE RANGE
    public List<Task> getTasksByWorkspaceAndDueDateRange(
            Long workspaceId,
            LocalDate startDate,
            LocalDate endDate,
            User user
    ) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, user.getId());

        if (!isMember) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        return taskRepository.findTasksByWorkspaceAndDueDateRange(
                workspace,
                startDate,
                endDate
        );
    }

    // ====================================================
    // ✅ 10️⃣ CALENDAR (GLOBAL)
    // ====================================================
    public List<Task> getTasksForUserBetweenDates(
            User user,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return taskRepository.findTasksForUserBetweenDates(
                user.getId(),
                startDate,
                endDate
        );
    }
}
