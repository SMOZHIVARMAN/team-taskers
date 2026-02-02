package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.Message;
import com.teamtaskers.teamtaskers.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Fetch all messages of a workspace with sender eagerly loaded
     * (Prevents LazyInitializationException)
     */
    @Query("""
        SELECT m
        FROM Message m
        JOIN FETCH m.sender
        WHERE m.workspace = :workspace
        ORDER BY m.createdAt ASC
    """)
    List<Message> findMessagesWithSenderByWorkspace(
            @Param("workspace") Workspace workspace
    );

    void deleteByWorkspace(Workspace workspace);
}
