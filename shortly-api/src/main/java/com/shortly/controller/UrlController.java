package com.shortly.controller;

import com.shortly.dto.ShortenRequest;
import com.shortly.dto.UrlResponse;
import com.shortly.model.User;
import com.shortly.repository.UserRepository;
import com.shortly.service.QrCodeService;
import com.shortly.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;
    private final QrCodeService qrCodeService;
    private final UserRepository userRepository;

    /**
     * POST /api/urls/shorten
     * Shorten a URL. Works anonymously (no JWT) or with a logged-in user.
     */
    @PostMapping("/shorten")
    public ResponseEntity<UrlResponse> shorten(
            @Valid @RequestBody ShortenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        UrlResponse response = urlService.shorten(request, user);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/urls
     * Get all URLs for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<UrlResponse>> getUserUrls(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(urlService.getUserUrls(user));
    }

    /**
     * DELETE /api/urls/{id}
     * Delete a URL if it belongs to the logged-in user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        urlService.delete(id, user);
        return ResponseEntity.ok().build();
    }

    /**
     * PATCH /api/urls/{id}/toggle
     * Toggle a URL's active/inactive status.
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleActive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        urlService.toggleActive(id, user);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/urls/{id}/qr
     * Generate and return a QR code PNG image for the shortened URL.
     */
    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCode(
            @PathVariable Long id,
            @RequestParam(defaultValue = "250") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        byte[] qrImage = qrCodeService.generateQr(id, user, size);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrImage);
    }

    /**
     * Helper: resolve the User entity from Spring Security's UserDetails.
     * Returns null if not authenticated (anonymous shortening).
     */
    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
