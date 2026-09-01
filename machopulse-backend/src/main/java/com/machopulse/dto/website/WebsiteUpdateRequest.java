package com.machopulse.dto.website;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public record WebsiteUpdateRequest(
        @NotBlank(message = "Website name is required")
        String name,

        @NotBlank(message = "Target URL is required")
        @URL(message = "Invalid URL format (must start with http:// or https://)")
        String url,

        @Min(value = 60, message = "Check interval must be at least 60 seconds")
        Integer checkIntervalSeconds
) {
    public WebsiteUpdateRequest {
        if (checkIntervalSeconds == null) {
            checkIntervalSeconds = 60;
        }
    }
}
