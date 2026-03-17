package com.shortly.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShortenRequest {

    @NotBlank
    private String originalUrl;

    private String title; // optional, title of the Url (e.g, "Google")
}
