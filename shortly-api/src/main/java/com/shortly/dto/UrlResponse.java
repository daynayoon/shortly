package com.shortly.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UrlResponse {
    private Long id;
    private String shortUrl;      // whole URL: https://shortly-api.onrender.com/aX3kP
    private String originalUrl;
    private String title;
    private boolean isActive;
    private LocalDateTime createdAt;
    private long clickCount;
}
