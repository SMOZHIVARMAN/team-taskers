package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Task;
import com.teamtaskers.teamtaskers.model.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTask(Task task);
}
