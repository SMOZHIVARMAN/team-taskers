package com.teamtaskers.teamtaskers.service;

import com.teamtaskers.teamtaskers.dto.AddMemberRequest;
import com.teamtaskers.teamtaskers.dto.CreateWorkspaceRequest;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.*;
import com.teamtaskers.teamtaskers.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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

    // ✅ CREATE WORKSPACE (OWNER ALWAYS ADMIN)
    public void createWorkspace(CreateWorkspaceRequest request, User user) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(managedUser);

        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = new WorkspaceMember();
        ownerMember.setWorkspace(saved);
        ownerMember.setUser(managedUser);
        ownerMember.setRole(WorkspaceRole.OWNER);

        workspaceMemberRepository.save(ownerMember);
    }

    // 🔥 THIS METHOD FIXES ADMIN / MEMBER TAB FOREVER
    public List<Workspace> getUserWorkspaces(User user) {

        // 1️⃣ OWNER workspaces
        List<Workspace> owned = workspaceRepository.findByOwnerId(user.getId());

        // 2️⃣ MEMBER workspaces
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUser(user);
        List<Workspace> memberWorkspaces = memberships.stream()
                .map(WorkspaceMember::getWorkspace)
                .toList();

        // 3️⃣ MERGE WITHOUT DUPLICATES
        Set<Workspace> result = new LinkedHashSet<>();
        result.addAll(owned);
        result.addAll(memberWorkspaces);

        return new ArrayList<>(result);
    }

    public void addMember(Long workspaceId, AddMemberRequest request, User currentUser) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only owner can add members");
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
            throw new AccessDeniedException("Only owner can remove members");
        }

        User userToRemove = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (workspace.getOwner().getId().equals(userToRemove.getId())) {
            throw new AccessDeniedException("Cannot remove owner");
        }

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userToRemove.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        workspaceMemberRepository.delete(member);
    }

    public void deleteWorkspace(Long workspaceId, User currentUser) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only owner can delete workspace");
        }

        messageRepository.deleteByWorkspace(workspace);
        taskRepository.deleteByWorkspace(workspace);
        workspaceMemberRepository.deleteByWorkspace(workspace);
        workspaceRepository.delete(workspace);
    }
}
