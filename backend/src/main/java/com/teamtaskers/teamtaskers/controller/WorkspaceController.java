package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.AddMemberRequest;
import com.teamtaskers.teamtaskers.dto.CreateWorkspaceRequest;
import com.teamtaskers.teamtaskers.dto.response.TaskResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceMemberResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceResponse;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.*;
import com.teamtaskers.teamtaskers.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceDetailResponse;


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
    public void createWorkspace(
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
    }

    // ----------------------------------------------------
    // 2️⃣ GET MY WORKSPACES ✅ FIXED ENDPOINT
    // ----------------------------------------------------
    @GetMapping
    public List<WorkspaceResponse> getMyWorkspaces(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return workspaceMemberRepository.findByUser(user)
                .stream()
                .map(member -> new WorkspaceResponse(
                        member.getWorkspace().getId(),
                        member.getWorkspace().getName(),
                        member.getRole().name(),
                        workspaceMemberRepository
                                .findByWorkspaceId(member.getWorkspace().getId())
                                .size()
                ))
                .collect(Collectors.toList());
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

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, newUser.getId())) {
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

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

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

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        return workspaceMemberRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(m -> new WorkspaceMemberResponse(
                        m.getUser().getId(),
                        m.getUser().getUsername(),
                        m.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/{workspaceId}")
    public WorkspaceDetailResponse getWorkspaceById(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        List<WorkspaceMemberResponse> members = workspaceMemberRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(m -> new WorkspaceMemberResponse(
                        m.getUser().getId(),
                        m.getUser().getUsername(),
                        m.getRole().name()
                ))
                .collect(Collectors.toList());

        return new WorkspaceDetailResponse(workspace, members);
    }

    // ----------------------------------------------------
    // 6️⃣ DELETE WORKSPACE (OWNER ONLY)
    // ----------------------------------------------------
    @DeleteMapping("/{workspaceId}")
    public String deleteWorkspace(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only workspace owner can delete workspace");
        }

        workspaceMemberRepository.deleteByWorkspaceId(workspaceId);
        taskRepository.deleteByWorkspace(workspace);
        workspaceRepository.delete(workspace);

        return "Workspace deleted successfully";
    }
}
