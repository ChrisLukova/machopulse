package com.machopulse.exception;

public class DuplicateWebsiteUrlException extends RuntimeException {
    public DuplicateWebsiteUrlException(String message) {
        super(message);
    }
}
