package com.kpip.platform.repository;

import com.kpip.platform.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, String> {
    Optional<Farmer> findByPhone(String phone);
}
