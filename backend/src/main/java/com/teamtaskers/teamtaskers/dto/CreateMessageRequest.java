package com.teamtaskers.teamtaskers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateMessageRequest {

    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 1000, message = "Message content cannot exceed 1000 characters")
    private String content;

    // ===== Getter & Setter =====

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
