package com.teamtaskers.teamtaskers.service;

import com.teamtaskers.teamtaskers.dto.UpdateProfileRequest;
import com.teamtaskers.teamtaskers.dto.ChangePasswordRequest;
import com.teamtaskers.teamtaskers.model.User;
import com.teamtaskers.teamtaskers.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ===============================
    // UPDATE USER PROFILE (UNCHANGED)
    // ===============================
    public User updateProfile(User currentUser, UpdateProfileRequest request) {

        // 🔒 Update username (if changed)
        if (!currentUser.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already taken");
            }
            currentUser.setUsername(request.getUsername());
        }

        // 🔒 Update email (if changed)
        if (!currentUser.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already taken");
            }
            currentUser.setEmail(request.getEmail());
        }

        // 🔹 Optional fields
        currentUser.setBio(request.getBio());
        currentUser.setSkills(request.getSkills());
        currentUser.setJobTitle(request.getJobTitle());
        currentUser.setExperience(request.getExperience());

        return userRepository.save(currentUser);
    }

    // ===============================
    // CHANGE PASSWORD (NEW FEATURE)
    // ===============================
    public void changePassword(User currentUser, ChangePasswordRequest request) {

        // ❌ current password mismatch
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                currentUser.getPassword()
        )) {
            throw new RuntimeException("Current password is incorrect");
        }

        // ❌ new password mismatch
        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // ✅ encode and save new password
        currentUser.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(currentUser);
    }
}
