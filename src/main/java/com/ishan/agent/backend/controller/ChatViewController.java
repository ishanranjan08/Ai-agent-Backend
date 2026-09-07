package com.ishan.agent.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChatViewController {

    @GetMapping({"/", "/chat-ui", "/ui"})
    public String chatPage(Model model) {
        model.addAttribute("title", "Ishan's AI Console");
        model.addAttribute("agentName", "Ishan's AI");
        model.addAttribute("subtitle", "Personal Assistant • Order & Knowledge System");
        return "chat";
    }
}
