package com.shortly.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.shortly.model.Url;
import com.shortly.model.User;
import com.shortly.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final UrlRepository urlRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Generate a QR code PNG image for a shortened URL.
     *
     * @param urlId the URL's database ID
     * @param user  the authenticated user (for ownership check)
     * @param size  QR image width/height in pixels (default 250)
     * @return PNG image as byte array
     */
    public byte[] generateQr(Long urlId, User user, int size) {
        Url url = urlRepository.findById(urlId)
            .orElseThrow(() -> new IllegalArgumentException("URL not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }

        // Build the full short URL
        String shortUrl = baseUrl + "/" + url.getShortCode();

        try {
            BitMatrix matrix = new QRCodeWriter().encode(shortUrl, BarcodeFormat.QR_CODE, size, size);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}