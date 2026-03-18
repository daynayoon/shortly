package com.shortly.service;

import com.shortly.dto.ShortenRequest;
import com.shortly.dto.UrlResponse;
import com.shortly.model.User;
import com.shortly.repository.UrlRepository;
import com.shortly.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Shorten a URL using Base62 encoding of the DB ID.
     *
     * Steps:
     * 1. Validate URL format
     * 2. Save Url entity to DB (shortCode is initially null)
     * 3. Encode the saved ID using Base62 → shortCode
     * 4. Update the entity with the generated shortCode
     * 5. Cache in Redis: shortCode → originalUrl (TTL 24h)
     * 6. Return UrlResponse DTO
     */
    public UrlResponse shorten(ShortenRequest request, User user) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Get all URLs created by a user, ordered by creation date descending.
     */
    public List<UrlResponse> getUserUrls(User user) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Delete a URL if it belongs to the user.
     * Also remove from Redis cache.
     */
    public void delete(Long id, User user) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Toggle the active/inactive status of a URL if it belongs to the user.
     */
    public void toggleActive(Long id, User user) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
