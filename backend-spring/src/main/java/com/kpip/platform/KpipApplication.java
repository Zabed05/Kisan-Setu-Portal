package com.kpip.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

// Exclude default Spring Security config to boot up easily before mapping specific filters
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class KpipApplication {

    public static void main(String[] args) {
        SpringApplication.run(KpipApplication.class, args);
    }
}
