package com.ishan.agent.backend.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.ishan.agent.backend.service.ChatService;

class ChatControllerTest {

    private MockMvc mockMvc;
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = mock(ChatService.class);
        ChatController chatController = new ChatController(chatService);
        ChatViewController chatViewController = new ChatViewController();
        mockMvc = MockMvcBuilders.standaloneSetup(chatController, chatViewController).build();
    }

    @Test
    void shouldRenderChatViewOnRoot() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("chat"));
    }

    @Test
    void shouldHandlePostChatJson() throws Exception {
        when(chatService.chat("What is the status of order 1042?"))
                .thenReturn("Order 1042 is Shipped - arriving tomorrow");

        mockMvc.perform(post("/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"What is the status of order 1042?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.response").value("Order 1042 is Shipped - arriving tomorrow"));
    }

    @Test
    void shouldHandleGetChatMessage() throws Exception {
        when(chatService.chat("Total orders"))
                .thenReturn("There are 4 orders.");

        mockMvc.perform(get("/chat").param("message", "Total orders"))
                .andExpect(status().isOk())
                .andExpect(content().string("There are 4 orders."));
    }
}
