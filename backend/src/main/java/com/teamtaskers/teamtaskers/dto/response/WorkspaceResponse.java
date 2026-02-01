package com.teamtaskers.teamtaskers.dto.response;

public class WorkspaceResponse {

    private Long id;
    private String name;
    private String owner;

    public WorkspaceResponse(Long id, String name, String owner) {
        this.id = id;
        this.name = name;
        this.owner = owner;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getOwner() { return owner; }
}
