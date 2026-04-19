package com.shortly.service;

import com.shortly.dto.AnalyticsResponse;
import com.shortly.model.Url;
import com.shortly.model.User;
import com.shortly.repository.ClickRepository;
import com.shortly.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;

    /**
     * Get aggregated click statistics for a URL owned by the user.
     *
     * Steps:
     * 1. Find URL by shortCode, verify ownership
     * 2. Count total clicks
     * 3. Group clicks by date (last 30 days)
     * 4. Group clicks by country
     * 5. Group clicks by device type
     * 6. Group clicks by browser
     * 7. Return AnalyticsResponse DTO
     */
    public AnalyticsResponse getStats(String shortCode, User user) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "URL not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        long totalClicks = clickRepository.countByUrlId(url.getId());
        Map<String, Long> clicksByDate = toMap(clickRepository.countGroupByDate(url.getId()));
        Map<String, Long> clicksByCountry = toMap(clickRepository.countGroupByCountry(url.getId()));
        Map<String, Long> clicksByDevice = toMap(clickRepository.countGroupByDevice(url.getId()));
        Map<String, Long> clicksByBrowser = toMap(clickRepository.countGroupByBrowser(url.getId()));

        return new AnalyticsResponse(totalClicks, clicksByDate, clicksByCountry, clicksByDevice, clicksByBrowser);
    }

    private Map<String, Long> toMap(List<Object[]> rows) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String key = row[0] != null ? row[0].toString() : "Unknown";
            Long value = ((Number) row[1]).longValue();
            map.put(key, value);
        }
        return map;
    }
}
