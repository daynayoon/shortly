package com.shortly.service;
import com.shortly.model.Click;
import com.shortly.model.Url;
import com.shortly.repository.ClickRepository;
import com.shortly.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class ClickService {

    private final ClickRepository clickRepository;
    private final UrlRepository urlRepository;

    // async for not blocking redirect response
    @Async
    public void recordClick(Long urlId, HttpServletRequest request) {
        Url url = urlRepository.findById(urlId).orElse(null);
        if (url == null) return;

        String ip = extractIp(request);
        // Parse User-Agent header → device type (mobile/desktop/tablet), browser
        String userAgent = request.getHeader("User-Agent");
        String referrer = request.getHeader("Referer"); // Parse Referer header

        // save new click to db
        Click click = new Click();
        click.setUrl(url);
        click.setIpAddress(ip);
        click.setDeviceType(parseDeviceType(userAgent));
        click.setBrowser(parseBrowser(userAgent));
        click.setReferrer(referrer);

        clickRepository.save(click);
    }

    // get the first Ip
    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String parseDeviceType(String ua) {
        if (ua == null) return "Unknown";
        String lower = ua.toLowerCase();
        if (lower.contains("tablet") || lower.contains("ipad")) return "Tablet";
        if (lower.contains("mobile") || lower.contains("android") || lower.contains("iphone")) return "Mobile";
        return "Desktop";
    }

    private String parseBrowser(String ua) {
        if (ua == null) return "Unknown";
        if (ua.contains("Edg/")) return "Edge";
        if (ua.contains("OPR/") || ua.contains("Opera")) return "Opera";
        if (ua.contains("Chrome/")) return "Chrome";
        if (ua.contains("Safari/") && ua.contains("Version/")) return "Safari";
        if (ua.contains("Firefox/")) return "Firefox";
        return "Other";
    }
}
