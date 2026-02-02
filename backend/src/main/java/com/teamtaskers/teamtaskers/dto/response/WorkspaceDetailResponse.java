package com.teamtaskers.teamtaskers.dto.response;

import com.teamtaskers.teamtaskers.model.Workspace;
import java.util.List;

public class WorkspaceDetailResponse {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerUsername;
    private List<WorkspaceMemberResponse> members;

    public WorkspaceDetailResponse(Workspace workspace, List<WorkspaceMemberResponse> memberResponses) {
        this.id = workspace.getId();
        this.name = workspace.getName();
        this.description = workspace.getDescription();
        this.ownerId = workspace.getOwner().getId();
        this.ownerUsername = workspace.getOwner().getUsername();
        this.members = memberResponses;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }
    public List<WorkspaceMemberResponse> getMembers() { return members; }
    public void setMembers(List<WorkspaceMemberResponse> members) { this.members = members; }
}
