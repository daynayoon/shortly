package com.shortly.service;

import com.shortly.model.User;
import com.shortly.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final UrlRepository urlRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Generate a QR code PNG image for a shortened URL.
     *
     * Steps:
     * 1. Find URL by ID, verify ownership
     * 2. Build the full short URL: baseUrl + "/" + shortCode
     * 3. Use ZXing BarcodeWriter to encode as QR_CODE format
     * 4. Render BitMatrix to BufferedImage
     * 5. Write BufferedImage as PNG byte array
     * 6. Return byte[]
     *
     * @param urlId the URL's database ID
     * @param user  the authenticated user (for ownership check)
     * @param size  QR image width/height in pixels (default 250)
     * @return PNG image as byte array
     */
    public byte[] generateQr(Long urlId, User user, int size) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
