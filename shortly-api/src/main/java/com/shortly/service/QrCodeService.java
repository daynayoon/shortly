package com.shortly.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.shortly.exception.AccessDeniedException;
import com.shortly.exception.NotFoundException;
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

    private static final int MIN_SIZE = 100;
    private static final int MAX_SIZE = 1000;

    @Value("${app.base-url}")
    private String baseUrl;

    public byte[] generateQr(Long urlId, User user, int size) {
        if (size < MIN_SIZE || size > MAX_SIZE) {
            throw new IllegalArgumentException("QR size must be between " + MIN_SIZE + " and " + MAX_SIZE);
        }

        Url url = urlRepository.findById(urlId)
            .orElseThrow(() -> new NotFoundException("URL not found"));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

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
