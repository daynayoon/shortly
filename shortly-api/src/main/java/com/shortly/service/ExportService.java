package com.shortly.service;

import com.shortly.model.User;
import com.shortly.repository.ClickRepository;
import com.shortly.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;

    /**
     * Export all click data for a URL as a CSV byte array.
     *
     * Steps:
     * 1. Find URL by shortCode, verify ownership
     * 2. Fetch all Click records ordered by clickedAt descending
     * 3. Write CSV header: clicked_at,ip_address,country,country_code,city,device_type,browser,referrer
     * 4. Write each Click as a CSV row
     * 5. Return CSV as byte[]
     *
     * @param shortCode the URL's short code
     * @param user      the authenticated user (for ownership check)
     * @return CSV file content as byte array
     */
    public byte[] exportCsv(String shortCode, User user) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
