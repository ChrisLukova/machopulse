package com.machopulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ping_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "response_time_ms")
    private Long responseTimeMs;

    @Column(nullable = false)
    private Boolean isUp;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false)
    private MonitoredWebsite website;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
