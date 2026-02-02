package com.teamtaskers.teamtaskers.dto.response;

import com.teamtaskers.teamtaskers.model.Workspace;
import com.teamtaskers.teamtaskers.model.WorkspaceMember;

import java.util.List;
import java.util.stream.Collectors;

public class WorkspaceDetailResponse {
    private String id;
    private String name;
    private String description;
    private String ownerUsername;
    private List<String> members;

    public WorkspaceDetailResponse(Workspace workspace, List<WorkspaceMemberResponse> memberResponses) {
        this.id = workspace.getId().toString();
        this.name = workspace.getName();
        this.description = workspace.getDescription();
        this.ownerUsername = workspace.getOwner().getUsername();
        this.members = memberResponses.stream()
                .map(WorkspaceMemberResponse::getUsername)
                .filter(username -> !username.equals(ownerUsername))
                .collect(Collectors.toList());
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public List<String> getMembers() {
        return members;
    }

    public void setMembers(List<String> members) {
        this.members = members;
    }
}
