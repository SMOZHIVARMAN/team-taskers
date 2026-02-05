package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TaskService taskService;

    public DashboardController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Map<String, Long> stats = Map.of(
                "todayTasks", taskService.getTodayTasksCount(user),
                "pendingTasks", taskService.getPendingTasksCount(user),
                "completedTasks", taskService.getCompletedTasksCount(user)
        );

        return ResponseEntity.ok(stats);
    }
}
