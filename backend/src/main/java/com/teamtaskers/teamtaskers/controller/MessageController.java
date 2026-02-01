package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.CreateMessageRequest;
import com.teamtaskers.teamtaskers.dto.response.MessageResponse;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.Message;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.model.Workspace;
import com.teamtaskers.teamtaskers.repository.MessageRepository;
import com.teamtaskers.teamtaskers.repository.WorkspaceMemberRepository;
import com.teamtaskers.teamtaskers.repository.WorkspaceRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/messages")
public class MessageController {

    private final MessageRepository messageRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public MessageController(
            MessageRepository messageRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.messageRepository = messageRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    // ===============================
    // GET messages of workspace
    // ===============================
    @GetMapping
    public List<MessageResponse> getWorkspaceMessages(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Workspace workspace = getWorkspaceOrThrow(workspaceId);

        validateWorkspaceMembership(workspaceId, user.getId());

        return messageRepository
                .findMessagesWithSenderByWorkspace(workspace) // ✅ FIXED METHOD
                .stream()
                .map(message -> new MessageResponse(
                        message.getId(),
                        message.getSender().getId(),
                        message.getSender().getEmail(),
                        message.getContent(),
                        message.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // ===============================
    // SEND message
    // ===============================
    @PostMapping
    public MessageResponse sendMessage(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateMessageRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Workspace workspace = getWorkspaceOrThrow(workspaceId);

        validateWorkspaceMembership(workspaceId, user.getId());

        Message message = new Message();
        message.setWorkspace(workspace);
        message.setSender(user);
        message.setContent(request.getContent());

        Message savedMessage = messageRepository.save(message);

        return new MessageResponse(
                savedMessage.getId(),
                user.getId(),
                user.getEmail(),
                savedMessage.getContent(),
                savedMessage.getCreatedAt()
        );
    }

    // ===============================
    // Helpers
    // ===============================

    private Workspace getWorkspaceOrThrow(Long workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
    }

    private void validateWorkspaceMembership(Long workspaceId, Long userId) {
        boolean isMember =
                workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);

        if (!isMember) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }
    }
}
