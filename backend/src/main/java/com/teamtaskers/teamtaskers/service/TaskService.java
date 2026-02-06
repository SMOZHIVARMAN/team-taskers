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

    // ====================================================
    // 1️⃣ GET TASKS BY WORKSPACE
    // ====================================================
    public List<Task> getTasksByWorkspace(Long workspaceId, User user) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        return taskRepository.findByWorkspace(workspace);
    }

    // ====================================================
    // 2️⃣ CREATE TASK (🔥 FIXED ASSIGNMENT)
    // ====================================================
    public Task createTask(CreateTaskRequest request, User user) {

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), user.getId())) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setWorkspace(workspace);
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(request.getDueDate());

        // 🔥 FIX: GUARANTEE ASSIGNMENT
        User assignee;

        if (request.getAssignedUserId() != null) {
            assignee = userRepository.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));

            if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                    workspace.getId(), assignee.getId())) {
                throw new AccessDeniedException("Assigned user is not a workspace member");
            }
        } else {
            // default: assign to creator
            assignee = user;
        }

        task.setAssignedTo(assignee);

        Task savedTask = taskRepository.save(task);

        auditLogService.log(
                workspace,
                user,
                "CREATE_TASK",
                "TASK",
                savedTask.getId()
        );

        return savedTask;
    }

    // ====================================================
    // 3️⃣ UPDATE TASK STATUS
    // ====================================================
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus, User user) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), user.getId())) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        task.setStatus(newStatus);
        Task updated = taskRepository.save(task);

        auditLogService.log(
                task.getWorkspace(),
                user,
                "UPDATE_TASK_STATUS",
                "TASK",
                updated.getId()
        );

        return updated;
    }

    // ====================================================
    // 4️⃣ ASSIGN TASK (OWNER ONLY)
    // ====================================================
    public Task assignTask(Long taskId, Long userId, User currentUser) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can assign tasks");
        }

        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        task.setAssignedTo(assignee);
        Task updated = taskRepository.save(task);

        auditLogService.log(
                task.getWorkspace(),
                currentUser,
                "ASSIGN_TASK",
                "TASK",
                updated.getId()
        );

        return updated;
    }

    // ====================================================
    // 5️⃣ GET MY TASKS
    // ====================================================
    public List<Task> getMyTasks(User user) {
        return taskRepository.findByAssignedTo(user);
    }

    // ====================================================
    // 6️⃣ DELETE TASK
    // ====================================================
    public void deleteTask(Long taskId, User currentUser) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!task.getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can delete tasks");
        }

        taskRepository.delete(task);

        auditLogService.log(
                task.getWorkspace(),
                currentUser,
                "DELETE_TASK",
                "TASK",
                taskId
        );
    }

    // ====================================================
    // 📅 CALENDAR & DATE APIs
    // ====================================================
    public Task updateTaskDueDate(Long taskId, LocalDate dueDate, User user) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), user.getId())) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        task.setDueDate(dueDate);
        return taskRepository.save(task);
    }

    public List<Task> getTasksByWorkspaceAndDueDateRange(
            Long workspaceId,
            LocalDate startDate,
            LocalDate endDate,
            User user
    ) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new AccessDeniedException("Not a member of this workspace");
        }

        return taskRepository.findTasksByWorkspaceAndDueDateBetween(
                workspace,
                startDate,
                endDate
        );
    }

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

    // ====================================================
    // 📊 DASHBOARD STATS
    // ====================================================
    public long getTodayTasksCount(User user) {
        return taskRepository.countByAssignedToAndDueDate(user, LocalDate.now());
    }

    public long getPendingTasksCount(User user) {
        return taskRepository.countByAssignedToAndStatus(user, TaskStatus.TODO);
    }

    public long getCompletedTasksCount(User user) {
        return taskRepository.countByAssignedToAndStatus(user, TaskStatus.COMPLETED);
    }
}
