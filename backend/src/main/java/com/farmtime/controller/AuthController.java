package com.farmtime.controller;

import com.farmtime.dto.LoginRequest;
import com.farmtime.dto.LoginResponse;
import com.farmtime.model.Admin;
import com.farmtime.repository.AdminRepository;
import com.farmtime.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Admin admin = adminRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Check if access control columns exist
            boolean hasAccessControl = true;
            try {
                admin.getRole();
                admin.getIsApproved();
            } catch (Exception e) {
                hasAccessControl = false;
            }
            
            // If access control is enabled, check approval status
            if (hasAccessControl) {
                // Auto-approve the default 'admin' user if not already approved
                if (admin.getUsername().equals("admin") && (admin.getIsApproved() == null || !admin.getIsApproved())) {
                    admin.setIsApproved(true);
                    admin.setRole(Admin.AdminRole.SUPER_ADMIN);
                    admin.setApprovedAt(java.time.LocalDateTime.now());
                    adminRepository.save(admin);
                }
                
                // Check if user is approved
                if (admin.getIsApproved() == null || !admin.getIsApproved()) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Your account is pending approval. Please contact the super admin.");
                    error.put("status", "PENDING_APPROVAL");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
                
                // Check if user is active
                if (!admin.getIsActive()) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Your account has been deactivated. Please contact the super admin.");
                    error.put("status", "DEACTIVATED");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }
            
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            
            String token = jwtUtil.generateToken(loginRequest.getUsername());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", admin.getUsername());
            response.put("name", admin.getName());
            
            if (hasAccessControl) {
                response.put("role", admin.getRole() != null ? admin.getRole().toString() : "ADMIN");
                response.put("isApproved", admin.getIsApproved() != null ? admin.getIsApproved() : false);
            } else {
                response.put("role", "ADMIN");
                response.put("isApproved", true);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {
        try {
            if (adminRepository.findByUsername(admin.getUsername()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Username already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            admin.setIsActive(true);
            admin.setIsApproved(false);  // Requires approval
            admin.setRole(Admin.AdminRole.PENDING);  // Pending role
            
            Admin saved = adminRepository.save(admin);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration successful! Your account is pending approval by the super admin.");
            response.put("username", saved.getUsername());
            response.put("status", "PENDING_APPROVAL");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error registering admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            
            if (username == null || username.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Username is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Generate a temporary password (in production, use email/SMS)
            String tempPassword = generateTemporaryPassword();
            admin.setPassword(passwordEncoder.encode(tempPassword));
            adminRepository.save(admin);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successful");
            response.put("temporaryPassword", tempPassword);
            response.put("note", "Please change this password after login");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Username not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error resetting password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            
            if (username == null || oldPassword == null || newPassword == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "All fields are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Verify old password
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, oldPassword)
                );
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error changing password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    private String generateTemporaryPassword() {
        // Generate a random 8-character password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * chars.length());
            password.append(chars.charAt(index));
        }
        return password.toString();
    }
}
