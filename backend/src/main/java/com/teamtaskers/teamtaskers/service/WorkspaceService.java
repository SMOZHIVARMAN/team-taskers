package com.teamtaskers.teamtaskers.service;

import com.teamtaskers.teamtaskers.dto.AddMemberRequest;
import com.teamtaskers.teamtaskers.dto.CreateWorkspaceRequest;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.model.Workspace;
import com.teamtaskers.teamtaskers.model.WorkspaceMember;
import com.teamtaskers.teamtaskers.model.WorkspaceRole;
import com.teamtaskers.teamtaskers.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;


    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            MessageRepository messageRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    public void createWorkspace(CreateWorkspaceRequest request, User user) {
        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(user);
        workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(user);
        member.setRole(WorkspaceRole.OWNER);
        workspaceMemberRepository.save(member);
    }

    public void addMember(Long workspaceId, AddMemberRequest request, User currentUser) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can add members");
        }

        User newUser = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, newUser.getId())) {
            throw new IllegalStateException("User already exists in workspace");
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(newUser);
        member.setRole(request.getRole());

        workspaceMemberRepository.save(member);
    }

    public void removeMember(Long workspaceId, String username, User currentUser) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can remove members");
        }

        User userToRemove = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User to remove not found"));
        
        if (workspace.getOwner().getId().equals(userToRemove.getId())) {
            throw new AccessDeniedException("Cannot remove the workspace owner");
        }

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userToRemove.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));

        workspaceMemberRepository.delete(member);
    }

    public void deleteWorkspace(Long workspaceId, User currentUser) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can delete workspace");
        }

        // These operations now run within a single transaction
        messageRepository.deleteByWorkspace(workspace);
        taskRepository.deleteByWorkspace(workspace);
        workspaceMemberRepository.deleteByWorkspace(workspace);
        workspaceRepository.delete(workspace);
    }
}
