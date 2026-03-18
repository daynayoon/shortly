package com.shortly.security;

import com.shortly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    // Used by JwtAuthFilter to load user after token validation
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.shortly.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // No password needed — authentication is via Google OAuth + JWT
        return User.builder()
                .username(user.getEmail())
                .password("")
                .roles("USER")
                .build();
    }
}
