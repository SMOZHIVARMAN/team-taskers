package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.CreateCommentRequest;
import com.teamtaskers.teamtaskers.model.*;
import com.teamtaskers.teamtaskers.repository.*;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskCommentController {

    private final TaskRepository taskRepository;
    private final TaskCommentRepository commentRepository;
    private final UserRepository userRepository;

    public TaskCommentController(
            TaskRepository taskRepository,
            TaskCommentRepository commentRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    // ADD COMMENT
    @PostMapping("/{taskId}/comments")
    public TaskComment addComment(
            @PathVariable Long taskId,
            @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskComment comment = new TaskComment();
        comment.setContent(request.getContent());
        comment.setTask(task);
        comment.setUser(user);

        return commentRepository.save(comment);
    }

    // GET COMMENTS
    @GetMapping("/{taskId}/comments")
    public List<TaskComment> getComments(@PathVariable Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return commentRepository.findByTask(task);
    }
}
