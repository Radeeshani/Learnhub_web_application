package com.homework.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Test Configuration for providing test-specific beans
 */
@TestConfiguration
public class TestConfig {

    /**
     * Provides RestTemplate bean for E2E and Performance tests
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
