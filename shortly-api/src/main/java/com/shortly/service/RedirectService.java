package com.shortly.service;

import com.shortly.config.CacheConstants;
import com.shortly.exception.GoneException;
import com.shortly.exception.NotFoundException;
import com.shortly.model.Url;
import com.shortly.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedirectService {

    private final UrlRepository urlRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ClickService clickService;

    public String getOriginalUrl(String shortCode, HttpServletRequest request) {
        String cacheKey = CacheConstants.URL_PREFIX + shortCode;

        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            String[] parts = cached.split("\\|", 3);
            if (parts.length < 3) {
                redisTemplate.delete(cacheKey); // delete broken cache entry
            } else {
                boolean isActive = Boolean.parseBoolean(parts[1]);
                if (!isActive) throw new GoneException("This link has been deactivated");
                Long urlId = Long.parseLong(parts[0]);
                String originalUrl = parts[2];
                clickService.recordClick(urlId, request);
                return originalUrl;
            }
        }

        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new NotFoundException("Short URL not found: " + shortCode));

        if (!url.isActive() || (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now()))) {
            throw new GoneException("This link has expired or been deactivated");
        }

        // cache as "id|isActive|originalUrl"
        String cacheValue = url.getId() + "|" + url.isActive() + "|" + url.getOriginalUrl();
        redisTemplate.opsForValue().set(cacheKey, cacheValue, CacheConstants.URL_TTL_HOURS, TimeUnit.HOURS);

        clickService.recordClick(url.getId(), request);
        return url.getOriginalUrl();
    }
}
