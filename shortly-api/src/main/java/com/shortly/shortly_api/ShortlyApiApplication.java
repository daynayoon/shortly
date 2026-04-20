package com.shortly.shortly_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@EnableJpaRepositories(basePackages = "com.shortly.repository")
@EntityScan(basePackages = "com.shortly.model")
@SpringBootApplication(scanBasePackages = "com.shortly")
public class ShortlyApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShortlyApiApplication.class, args);
	}

}
