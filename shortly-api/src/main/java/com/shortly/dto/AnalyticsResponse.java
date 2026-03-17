package com.shortly.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalClicks;
    private Map<String, Long> clicksByDate;      // "2024-01-15" → 42
    private Map<String, Long> clicksByCountry;   // "South Korea" → 100
    private Map<String, Long> clicksByDevice;    // "mobile" → 60
    private Map<String, Long> clicksByBrowser;   // "Chrome" → 80
}
