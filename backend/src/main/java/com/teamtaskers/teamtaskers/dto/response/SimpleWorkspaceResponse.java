package com.teamtaskers.teamtaskers.dto.response;

public class SimpleWorkspaceResponse {
    private Long id;
    private String name;
    private Long ownerId;
    private String ownerUsername;
    private int memberCount;

    public SimpleWorkspaceResponse(Long id, String name, Long ownerId, String ownerUsername, int memberCount) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
        this.memberCount = memberCount;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }
}
