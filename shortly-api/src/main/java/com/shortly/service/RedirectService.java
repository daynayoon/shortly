package com.shortly.service;
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


/**
shortCode put
     ↓
Redis check
     ├─ hit → (DB check has bug) → ClickRecord → return
     └─ miss → DB check
               ├─ none → 404
               ├─ expired/not active → 410
               └─ good → Redis caching → ClickRecord → return
*/
@Service
@RequiredArgsConstructor
public class RedirectService {

    private final UrlRepository urlRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ClickService clickService;

    private static final String CACHE_PREFIX = "url:";
    private static final long CACHE_TTL_HOURS = 24;

    public String getOriginalUrl(String shortCode, HttpServletRequest request) {
        String cacheKey = CACHE_PREFIX + shortCode;

        // opsForValue() -> key-value method of Redis -> value: original URL or null
        String cached = redisTemplate.opsForValue().get(cacheKey);
        // If cache miss → query DB by shortCode
        /** 
        if (cached != null) {
            Url url = urlRepository.findByShortCode(shortCode).orElse(null);
            if (url != null) clickService.recordClick(url.getId(), request); // BUG: cache hit but checking DB
            return cached;
        }
            */
        if (cached != null) {
            String[] parts = cached.split("\\|", 2);
            if (parts.length < 2) {
                redisTemplate.delete(cacheKey); // delete broken cache
            } else {
                Long urlId = Long.parseLong(parts[0]);
                String originalUrl = parts[1];
                clickService.recordClick(urlId, request);
                return originalUrl;
            }
        }

        // If not found → throw NotFoundException (404)
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new NotFoundException("Short URL not found: " + shortCode));

        // If expired or inactive → throw GoneException (410)
        if (!url.isActive() || (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now()))) {
            throw new GoneException("This link has expired or been deactivated");
        }

        // redisTemplate.opsForValue().set(cacheKey, url.getOriginalUrl(), CACHE_TTL_HOURS, TimeUnit.HOURS);
        // store urlId too
        redisTemplate.opsForValue().set(cacheKey, url.getId() + "|" + url.getOriginalUrl(), CACHE_TTL_HOURS, TimeUnit.HOURS);

        // Call clickService.recordClick() asynchronously
        clickService.recordClick(url.getId(), request);

        // Return the original URL string
        return url.getOriginalUrl();
    }
}
