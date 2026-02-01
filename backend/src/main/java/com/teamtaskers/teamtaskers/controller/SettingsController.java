package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.ChangePasswordRequest;
import com.teamtaskers.teamtaskers.dto.UpdateProfileRequest;
import com.teamtaskers.teamtaskers.exception.AccessDeniedException;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SettingsController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ----------------------------------------------------
    // 1️⃣ GET MY PROFILE (EXTENDED)
    // ----------------------------------------------------
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                new ProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getBio(),
                        user.getSkills(),
                        user.getJobTitle(),
                        user.getExperience()
                )
        );
    }

    // ----------------------------------------------------
    // 2️⃣ UPDATE MY PROFILE (EXTENDED)
    // ----------------------------------------------------
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody @Valid UpdateProfileRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        // 🔐 Prevent duplicate username
        if (!user.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new AccessDeniedException("Username already exists");
        }

        // 🔐 Prevent duplicate email
        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new AccessDeniedException("Email already exists");
        }

        // Core profile
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // 🔹 Extended profile fields (OPTIONAL)
        user.setBio(request.getBio());
        user.setSkills(request.getSkills());
        user.setJobTitle(request.getJobTitle());
        user.setExperience(request.getExperience());

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }

    // ----------------------------------------------------
    // 3️⃣ CHANGE PASSWORD (UNCHANGED)
    // ----------------------------------------------------
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody @Valid ChangePasswordRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new AccessDeniedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    // ----------------------------------------------------
    // 🔹 INTERNAL RESPONSE DTO
    // ----------------------------------------------------
    private static class ProfileResponse {

        private Long id;
        private String username;
        private String email;
        private String role;

        private String bio;
        private String skills;
        private String jobTitle;
        private String experience;

        public ProfileResponse(
                Long id,
                String username,
                String email,
                String role,
                String bio,
                String skills,
                String jobTitle,
                String experience
        ) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
            this.bio = bio;
            this.skills = skills;
            this.jobTitle = jobTitle;
            this.experience = experience;
        }

        public Long getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }

        public String getBio() {
            return bio;
        }

        public String getSkills() {
            return skills;
        }

        public String getJobTitle() {
            return jobTitle;
        }

        public String getExperience() {
            return experience;
        }
    }
}
