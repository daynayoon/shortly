package com.shortly.service;

import com.shortly.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedirectService {

    private final UrlRepository urlRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ClickService clickService;

    /**
     * Look up the original URL for a given short code and trigger async click recording.
     *
     * Steps:
     * 1. Check Redis cache for shortCode
     * 2. If cache miss → query DB by shortCode
     * 3. If not found → throw NotFoundException (404)
     * 4. If expired or inactive → throw GoneException (410)
     * 5. Call clickService.recordClick() asynchronously
     * 6. Return the original URL string
     */
    public String getOriginalUrl(String shortCode, HttpServletRequest request) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
