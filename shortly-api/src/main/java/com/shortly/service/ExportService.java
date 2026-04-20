package com.shortly.service;

import com.shortly.model.Click;
import com.shortly.model.Url;
import com.shortly.model.User;
import com.shortly.repository.ClickRepository;
import com.shortly.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;


    /**
     * Export all click data for a URL as a CSV byte array.
     * @param shortCode the URL's short code
     * @param user      the authenticated user (for ownership check)
     * @return CSV file content as byte array
     */
    public byte[] exportCsv(String shortCode, User user) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new IllegalArgumentException("URL not found"));


        // verify ownership
        if (!url.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }

        List<Click> clicks = clickRepository.findByUrlId(url.getId());

        StringBuilder csv = new StringBuilder();
        csv.append("clicked_at,ip_address,country,country_code,city,device_type,browser,referrer\n");

        for (Click c : clicks) {
            csv.append(escape(c.getClickedAt() != null ? c.getClickedAt().toString() : "")).append(',')
               .append(escape(c.getIpAddress())).append(',')
               .append(escape(c.getCountry())).append(',')
               .append(escape(c.getCountryCode())).append(',')
               .append(escape(c.getCity())).append(',')
               .append(escape(c.getDeviceType())).append(',')
               .append(escape(c.getBrowser())).append(',')
               .append(escape(c.getReferrer())).append('\n');
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escape(String value) {
        if (value == null) return "";
        // say "hi"   ->   "say ""hi"""
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
