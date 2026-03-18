package com.shortly.controller;

import com.shortly.dto.AnalyticsResponse;
import com.shortly.model.User;
import com.shortly.repository.UserRepository;
import com.shortly.service.AnalyticsService;
import com.shortly.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ExportService exportService;
    private final UserRepository userRepository;

    /**
     * GET /api/analytics/{shortCode}
     * Get click statistics for a shortened URL.
     */
    @GetMapping("/{shortCode}")
    public ResponseEntity<AnalyticsResponse> getStats(
            @PathVariable String shortCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        AnalyticsResponse response = analyticsService.getStats(shortCode, user);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/analytics/{shortCode}/export
     * Download all click data as a CSV file.
     */
    @GetMapping("/{shortCode}/export")
    public ResponseEntity<byte[]> exportCsv(
            @PathVariable String shortCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        byte[] csvData = exportService.exportCsv(shortCode, user);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + shortCode + "-analytics.csv\"")
                .body(csvData);
    }

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
