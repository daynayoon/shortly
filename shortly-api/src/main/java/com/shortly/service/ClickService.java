package com.shortly.service;

import com.shortly.repository.ClickRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClickService {

    private final ClickRepository clickRepository;

    /**
     * Record a click asynchronously — does NOT block the redirect response.
     *
     * Steps:
     * 1. Extract IP from request (handle X-Forwarded-For header)
     * 2. Parse User-Agent header → device type (mobile/desktop/tablet), browser
     * 3. Parse Referer header
     * 4. (Optional) GeoIP lookup → country, city
     * 5. Save Click entity to DB
     */
    @Async
    public void recordClick(Long urlId, HttpServletRequest request) {
        // TODO: implement
    }
}
