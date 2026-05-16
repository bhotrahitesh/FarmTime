package com.farmtime.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class KeepAliveService {

    @Value("${server.port:8080}")
    private String serverPort;

    private final RestTemplate restTemplate;

    @Scheduled(fixedRate = 300000)
    public void keepAlive() {
        try {
            String url = "http://localhost:" + serverPort + "/api/health/ping";
            
            log.info("Keep-alive ping initiated at: {}", LocalDateTime.now());
            
            Map<String, String> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && "alive".equals(response.get("status"))) {
                log.info("Keep-alive ping successful. Server is active.");
            } else {
                log.warn("Keep-alive ping returned unexpected response: {}", response);
            }
            
        } catch (Exception e) {
            log.error("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
