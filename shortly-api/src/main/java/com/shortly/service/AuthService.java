package com.shortly.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.shortly.dto.AuthResponse;
import com.shortly.dto.GoogleAuthRequest;
import com.shortly.model.User;
import com.shortly.repository.UserRepository;
import com.shortly.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

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
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(request.getCredential());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }

        if (idToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
            User newUser = new User();
            newUser.setGoogleId(googleId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProfilePicture(picture);
            return userRepository.save(newUser);
        });

        String jwt = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(jwt, user.getEmail(), user.getName(), user.getProfilePicture());
    }
}
