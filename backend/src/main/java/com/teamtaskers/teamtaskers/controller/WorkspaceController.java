package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.AddMemberRequest;
import com.teamtaskers.teamtaskers.dto.CreateWorkspaceRequest;
import com.teamtaskers.teamtaskers.dto.response.TaskResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceMemberResponse;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.*;
import com.teamtaskers.teamtaskers.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public WorkspaceController(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            TaskRepository taskRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    // ----------------------------------------------------
    // 1️⃣ CREATE WORKSPACE
    // ----------------------------------------------------
    @PostMapping
    public WorkspaceResponse createWorkspace(
            @RequestBody CreateWorkspaceRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setOwner(user);
        workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(user);
        member.setRole(WorkspaceRole.OWNER);
        workspaceMemberRepository.save(member);

        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                user.getUsername()
        );
    }

    // ----------------------------------------------------
    // 2️⃣ GET MY WORKSPACES
    // ----------------------------------------------------
    @GetMapping("/my")
    public List<WorkspaceResponse> getMyWorkspaces(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return workspaceMemberRepository.findByUser(user)
                .stream()
                .map(m -> new WorkspaceResponse(
                        m.getWorkspace().getId(),
                        m.getWorkspace().getName(),
                        m.getWorkspace().getOwner().getUsername()
                ))
                .toList();
    }

    // ----------------------------------------------------
    // 3️⃣ ADD MEMBER (OWNER ONLY)
    // ----------------------------------------------------
    @PostMapping("/{workspaceId}/members")
    public String addMember(
            @PathVariable Long workspaceId,
            @RequestBody AddMemberRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can add members");
        }

        User newUser = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean alreadyMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, newUser.getId());

        if (alreadyMember) {
            return "User already exists in workspace";
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(newUser);
        member.setRole(request.getRole());

        workspaceMemberRepository.save(member);

        return "Member added successfully";
    }

    // ----------------------------------------------------
    // 4️⃣ GET TASKS OF WORKSPACE
    // ----------------------------------------------------
    @GetMapping("/{workspaceId}/tasks")
    public List<TaskResponse> getWorkspaceTasks(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId());

        if (!isMember) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        return taskRepository.findByWorkspace(workspace)
                .stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    // ----------------------------------------------------
    // 5️⃣ GET MEMBERS OF WORKSPACE
    // ----------------------------------------------------
    @GetMapping("/{workspaceId}/members")
    public List<WorkspaceMemberResponse> getWorkspaceMembers(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        boolean isMember = workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId());

        if (!isMember) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        return workspaceMemberRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(m -> new WorkspaceMemberResponse(
                        m.getUser().getId(),
                        m.getUser().getUsername(),
                        m.getRole().name()
                ))
                .toList();
    }

    // ----------------------------------------------------
    // 6️⃣ DELETE MEMBER FROM WORKSPACE (OWNER ONLY)
    // ----------------------------------------------------
    @DeleteMapping("/{workspaceId}/members/{userId}")
    public String removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can remove members");
        }

        if (currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Owner cannot remove himself");
        }

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceId(workspaceId)
                .stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));

        workspaceMemberRepository.delete(member);

        return "Member removed successfully";
    }

    // ----------------------------------------------------
    // 7️⃣ DELETE WORKSPACE (OWNER ONLY) 🔥 OPTION A
    // ----------------------------------------------------
    @DeleteMapping("/{workspaceId}")
    public String deleteWorkspace(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        // Only OWNER can delete workspace
        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can delete workspace");
        }

        // 1️⃣ Delete all members
        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);

        // 2️⃣ Delete all tasks
        taskRepository.deleteByWorkspace(workspace);

        // 3️⃣ Delete workspace
        workspaceRepository.delete(workspace);

        return "Workspace deleted successfully";
    }
}
