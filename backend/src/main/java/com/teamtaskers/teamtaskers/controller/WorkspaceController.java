package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.AddMemberRequest;
import com.teamtaskers.teamtaskers.dto.CreateWorkspaceRequest;
import com.teamtaskers.teamtaskers.dto.response.TaskResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceMemberResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceResponse;
import com.teamtaskers.teamtaskers.dto.response.WorkspaceDetailResponse;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.exception.ResourceNotFoundException;
import com.teamtaskers.teamtaskers.model.*;
import com.teamtaskers.teamtaskers.repository.*;
import com.teamtaskers.teamtaskers.service.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceService workspaceService;

    public WorkspaceController(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            TaskRepository taskRepository,
            WorkspaceService workspaceService
    ) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.taskRepository = taskRepository;
        this.workspaceService = workspaceService;
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
        workspaceService.createWorkspace(request, user);
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
    public ResponseEntity<String> addMember(
            @PathVariable Long workspaceId,
            @RequestBody AddMemberRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        try {
            workspaceService.addMember(workspaceId, request, currentUser);
            return ResponseEntity.ok("Member added successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{workspaceId}/members/{username}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable String username,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        try {
            workspaceService.removeMember(workspaceId, username, currentUser);
            return ResponseEntity.ok("Member removed successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
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
        workspaceService.deleteWorkspace(workspaceId, currentUser);
        return "Workspace deleted successfully";
    }
}
