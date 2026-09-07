package com.ishan.agent.backend.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ishan.agent.backend.dto.ChatRequest;
import com.ishan.agent.backend.dto.ChatResponse;
import com.ishan.agent.backend.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    /**
     * Handles JSON POST requests from Chat UI or REST clients.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ChatResponse> chatJson(@RequestBody(required = false) ChatRequest request) {
        String prompt = (request != null && request.message() != null) ? request.message().trim() : "";
        if (prompt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Please provide a valid prompt or question.", false, currentTimestamp()));
        }

        try {
            String response = chatService.chat(prompt);
            return ResponseEntity.ok(new ChatResponse(response, true, currentTimestamp()));
        } catch (Exception ex) {
            log.error("Error processing chat request: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(new ChatResponse("Error communicating with AI model: " + ex.getMessage(), false, currentTimestamp()));
        }
    }

    /**
     * Handles plain text / fallback POST requests.
     */
    @PostMapping(consumes = {MediaType.TEXT_PLAIN_VALUE, MediaType.ALL_VALUE}, produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE})
    public ResponseEntity<String> chatPlain(@RequestBody(required = false) String message) {
        String prompt = (message != null) ? message.trim() : "";
        if (prompt.isEmpty()) {
            return ResponseEntity.badRequest().body("Please provide a valid message.");
        }
        try {
            return ResponseEntity.ok(chatService.chat(prompt));
        } catch (Exception ex) {
            log.error("Error processing plain chat request: {}", ex.getMessage(), ex);
            return ResponseEntity.ok("Error: " + ex.getMessage());
        }
    }

    /**
     * Handles GET requests with query params or fallback body for backward compatibility.
     */
    @GetMapping
    public ResponseEntity<String> getorderString(
            @RequestParam(value = "message", required = false) String messageParam,
            @RequestParam(value = "param", required = false) String paramQuery,
            @RequestParam(value = "query", required = false) String queryParam,
            @RequestBody(required = false) String bodyParam) {

        String prompt = messageParam != null ? messageParam
                : (queryParam != null ? queryParam
                : (paramQuery != null ? paramQuery
                : (bodyParam != null ? bodyParam : "")));

        prompt = prompt.trim();
        if (prompt.isEmpty()) {
            return ResponseEntity.badRequest().body("Please provide a query or message parameter.");
        }

        try {
            return ResponseEntity.ok(chatService.chat(prompt));
        } catch (Exception ex) {
            log.error("Error processing GET chat request: {}", ex.getMessage(), ex);
            return ResponseEntity.ok("Error: " + ex.getMessage());
        }
    }

    private String currentTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));
    }
}
