package com.secureinsure.pro.auth.repository;

import com.secureinsure.pro.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String username, @Param("usernameOrEmail") String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    boolean existsByUsernameOrEmail(@Param("usernameOrEmail") String username, @Param("usernameOrEmail") String email);
    
    Optional<User> findByUsernameAndStatus(String username, com.secureinsure.pro.auth.entity.UserStatus status);
    
    Optional<User> findByEmailAndStatus(String email, com.secureinsure.pro.auth.entity.UserStatus status);
} 