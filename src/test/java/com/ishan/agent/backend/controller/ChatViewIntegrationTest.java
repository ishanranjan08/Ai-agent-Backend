package com.ishan.agent.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@SpringBootTest
class ChatViewIntegrationTest {

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Test
    void shouldSuccessfullyProcessThymeleafTemplateWithoutErrors() {
        Context context = new Context();
        context.setVariable("title", "Ishan's AI Console");
        context.setVariable("agentName", "Ishan's AI");
        context.setVariable("subtitle", "Personal Assistant • Connected to /chat");

        String renderedHtml = templateEngine.process("chat", context);

        assertThat(renderedHtml).isNotNull();
        assertThat(renderedHtml).contains("Ishan's AI Console");
        assertThat(renderedHtml).contains("Ishan's AI");
        assertThat(renderedHtml).contains("theme-toggle-btn");
        assertThat(renderedHtml).contains("chat-messages");
    }

    @Test
    void shouldSuccessfullyProcessThymeleafTemplateWithNullModel() {
        Context context = new Context();
        String renderedHtml = templateEngine.process("chat", context);

        assertThat(renderedHtml).isNotNull();
        assertThat(renderedHtml).contains("Ishan AI Console");
    }
}
