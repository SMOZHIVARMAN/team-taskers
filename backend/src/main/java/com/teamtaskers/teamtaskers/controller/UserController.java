package com.teamtaskers.teamtaskers.controller;

import com.teamtaskers.teamtaskers.dto.response.UserResponse;
import com.teamtaskers.teamtaskers.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()   // ✅ PASS ROLE, NOT STRING
        );
    }
}
