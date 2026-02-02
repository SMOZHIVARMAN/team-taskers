package com.teamtaskers.teamtaskers.dto.response;

public class WorkspaceResponse {

    private Long id;
    private String name;
    private String role;       // OWNER | MEMBER
    private int memberCount;

    public WorkspaceResponse(Long id, String name, String role, int memberCount) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.memberCount = memberCount;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public int getMemberCount() { return memberCount; }
}
