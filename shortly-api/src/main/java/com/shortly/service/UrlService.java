package com.shortly.service;

import com.shortly.config.CacheConstants;
import com.shortly.dto.ShortenRequest;
import com.shortly.dto.UrlClickCount;
import com.shortly.dto.UrlResponse;
import com.shortly.exception.AccessDeniedException;
import com.shortly.exception.NotFoundException;
import com.shortly.model.Url;
import com.shortly.model.User;
import com.shortly.repository.ClickRepository;
import com.shortly.repository.UrlRepository;
import com.shortly.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.base-url}")
    private String baseUrl;

    public UrlResponse shorten(ShortenRequest request, User user) {
        Url url = new Url();
        url.setOriginalUrl(request.getOriginalUrl());
        url.setTitle(request.getTitle());
        url.setUser(user);
        url.setActive(true);

        // save first to get the generated ID
        Url saved = urlRepository.save(url);

        String shortCode = Base62Encoder.encode(saved.getId());
        saved.setShortCode(shortCode);
        saved = urlRepository.save(saved);

        // cache as "id|originalUrl" (RedirectService format)
        String cacheKey = CacheConstants.URL_PREFIX + shortCode;
        redisTemplate.opsForValue().set(cacheKey, saved.getId() + "|" + saved.isActive() + "|" + saved.getOriginalUrl(), CacheConstants.URL_TTL_HOURS, TimeUnit.HOURS);

        return toResponse(saved, 0L);
    }

    // Get all URLs created by a user, ordered by creation date descending.
    public List<UrlResponse> getUserUrls(User user) {
        List<Url> urls = urlRepository.findByUserId(user.getId());
        if (urls.isEmpty()) return List.of();

        List<Long> urlIds = urls.stream().map(Url::getId).toList();
        Map<Long, Long> clickCounts = clickRepository.countByUrlIdIn(urlIds).stream()
                .collect(Collectors.toMap(UrlClickCount::getUrlId, UrlClickCount::getClickCount));

        return urls.stream()
                .sorted(Comparator.comparing(Url::getCreatedAt).reversed())
                .map(url -> toResponse(url, clickCounts.getOrDefault(url.getId(), 0L)))
                .toList();
    }

    // Delete a URL if it belongs to the user. Also remove from Redis cache.
    public void delete(Long id, User user) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("URL not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        redisTemplate.delete(CacheConstants.URL_PREFIX + url.getShortCode());
        urlRepository.delete(url);
    }

    // Toggle the active/inactive status of a URL if it belongs to the user.
    public void toggleActive(Long id, User user) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("URL not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        url.setActive(!url.isActive());
        urlRepository.save(url);

        // invalidate cache so RedirectService re-checks active status
        redisTemplate.delete(CacheConstants.URL_PREFIX + url.getShortCode());
    }

    private UrlResponse toResponse(Url url, long clickCount) {
        return new UrlResponse(
                url.getId(),
                baseUrl + "/" + url.getShortCode(),
                url.getOriginalUrl(),
                url.getTitle(),
                url.isActive(),
                url.getCreatedAt(),
                clickCount
        );
    }
}
