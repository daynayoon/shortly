package com.shortly.service;

import com.shortly.dto.AuthResponse;
import com.shortly.dto.GoogleAuthRequest;
import com.shortly.model.User;
import com.shortly.repository.UserRepository;
import com.shortly.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${google.client-id}")
    private String googleClientId;

    /**
     * Verify Google ID token, find or create user, return JWT.
     *
     * Steps:
     * 1. Verify the Google ID token using GoogleIdTokenVerifier
     * 2. Extract email, name, googleId (sub), picture from the payload
     * 3. Find existing user by googleId, or create a new one
     * 4. Generate JWT token
     * 5. Return AuthResponse
     */
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
