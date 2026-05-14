package com.farmtime.controller;

import com.farmtime.model.Admin;
import com.farmtime.repository.AdminRepository;
import com.farmtime.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-management")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminManagementController {
    
    private final AdminRepository adminRepository;
    private final JwtUtil jwtUtil;
    
    /**
     * Get all admins (Super Admin only)
     */
    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Check if user is super admin
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<Admin> admins = adminRepository.findAll();
            return ResponseEntity.ok(admins);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching admins: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get pending admins (Super Admin only)
     */
    @GetMapping("/admins/pending")
    public ResponseEntity<?> getPendingAdmins(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<Admin> pendingAdmins = adminRepository.findByIsApproved(false);
            return ResponseEntity.ok(pendingAdmins);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching pending admins: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Approve an admin (Super Admin only)
     */
    @PostMapping("/admins/{id}/approve")
    public ResponseEntity<?> approveAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Admin adminToApprove = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            String roleStr = request.get("role");
            Admin.AdminRole role = Admin.AdminRole.valueOf(roleStr != null ? roleStr : "ADMIN");
            
            adminToApprove.setIsApproved(true);
            adminToApprove.setRole(role);
            adminToApprove.setApprovedBy(currentAdmin.getId());
            adminToApprove.setApprovedAt(LocalDateTime.now());
            
            adminRepository.save(adminToApprove);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin approved successfully");
            response.put("username", adminToApprove.getUsername());
            response.put("role", role.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error approving admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Reject/Delete pending admin (Super Admin only)
     */
    @DeleteMapping("/admins/{id}/reject")
    public ResponseEntity<?> rejectAdmin(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Admin adminToReject = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            adminRepository.delete(adminToReject);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin registration rejected and deleted");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error rejecting admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Deactivate an admin (Super Admin only)
     */
    @PutMapping("/admins/{id}/deactivate")
    public ResponseEntity<?> deactivateAdmin(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Admin adminToDeactivate = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Prevent deactivating yourself
            if (adminToDeactivate.getId().equals(currentAdmin.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "You cannot deactivate your own account");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            adminToDeactivate.setIsActive(false);
            adminRepository.save(adminToDeactivate);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin deactivated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deactivating admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Activate an admin (Super Admin only)
     */
    @PutMapping("/admins/{id}/activate")
    public ResponseEntity<?> activateAdmin(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Admin adminToActivate = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            adminToActivate.setIsActive(true);
            adminRepository.save(adminToActivate);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin activated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error activating admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Change admin role (Super Admin only)
     */
    @PutMapping("/admins/{id}/role")
    public ResponseEntity<?> changeAdminRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            if (currentAdmin.getRole() != Admin.AdminRole.SUPER_ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. Super admin privileges required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            Admin adminToUpdate = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Prevent changing your own role
            if (adminToUpdate.getId().equals(currentAdmin.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "You cannot change your own role");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            String roleStr = request.get("role");
            Admin.AdminRole newRole = Admin.AdminRole.valueOf(roleStr);
            
            adminToUpdate.setRole(newRole);
            adminRepository.save(adminToUpdate);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin role updated successfully");
            response.put("newRole", newRole.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error changing admin role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    private String extractUsernameFromToken(String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.extractUsername(token);
    }
}
