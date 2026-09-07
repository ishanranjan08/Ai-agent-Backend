package com.ishan.agent.backend.dto;

public record ChatResponse(
        String response,
        boolean success,
        String timestamp
) {
}
