package com.farmtime.repository;

import com.farmtime.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsername(String username);
    List<Admin> findByIsApproved(Boolean isApproved);
    List<Admin> findByRole(Admin.AdminRole role);
}
