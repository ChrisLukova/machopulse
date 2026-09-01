package com.machopulse.repository;

import com.machopulse.entity.MonitoredWebsite;
import com.machopulse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MonitoredWebsiteRepository extends JpaRepository<MonitoredWebsite, Long> {
    List<MonitoredWebsite> findByUser(User user);
    Optional<MonitoredWebsite> findByIdAndUser(Long id, User user);
    boolean existsByUserAndUrlIgnoreCase(User user, String url);

    long countByUser(User user);
}
