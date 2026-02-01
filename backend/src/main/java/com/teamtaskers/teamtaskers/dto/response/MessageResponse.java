package com.teamtaskers.teamtaskers.dto.response;

import java.time.LocalDateTime;

public class MessageResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime createdAt;

    // ===== Constructor =====
    public MessageResponse(Long id, Long senderId, String senderName, String content, LocalDateTime createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.createdAt = createdAt;
    }

    // ===== Getters =====

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
