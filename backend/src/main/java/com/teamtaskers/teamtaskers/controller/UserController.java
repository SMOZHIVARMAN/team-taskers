package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.UpdateProfileRequest;
import com.teamtaskers.teamtaskers.dto.ChangePasswordRequest;
import com.teamtaskers.teamtaskers.dto.response.UserResponse;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =========================
    // GET CURRENT USER
    // =========================
    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getBio(),
                user.getSkills(),
                user.getJobTitle(),
                user.getExperience()
        );
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    @PutMapping("/profile")
    public UserResponse updateProfile(
            @RequestBody @Valid UpdateProfileRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        User updatedUser = userService.updateProfile(currentUser, request);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getBio(),
                updatedUser.getSkills(),
                updatedUser.getJobTitle(),
                updatedUser.getExperience()
        );
    }

    // =========================
    // CHANGE PASSWORD
    // =========================
    @PutMapping("/change-password")
    public void changePassword(
            @RequestBody @Valid ChangePasswordRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        userService.changePassword(currentUser, request);
    }
}
