package com.teamtaskers.teamtaskers.repository;

import com.teamtaskers.teamtaskers.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 🔑 REQUIRED FOR AUTH, JWT, WORKSPACE, COMMENTS
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
