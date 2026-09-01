package com.machopulse.exception;

public class WebsiteNotFoundException extends RuntimeException {
    public WebsiteNotFoundException(String message) {
        super(message);
    }
}
