package com.ishan.agent.backend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import com.ishan.agent.backend.tools.FlightTools;
import com.ishan.agent.backend.tools.HotelTools;
import com.ishan.agent.backend.tools.OrderTools;
import com.ishan.agent.backend.tools.WeatherTools;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProjectConfig {

    private final OrderTools orderTools;
    private final FlightTools flightTools;
    private final HotelTools hotelTools;
    private final WeatherTools weatherTools;

    @Bean
    public ChatClient ChatClient(ChatClient.Builder builder) {
        return builder

                .defaultOptions(OpenAiChatOptions.builder()
                .maxTokens(100))
                .defaultSystem(
                        """
                        You are Ishan's AI, a helpful, courteous, and intelligent personal AI assistant built for Ishan.
                        You have access to tools for managing customer orders (looking up order status, cancelling orders, and order metrics),
                        hotel searches, weather forecast queries, and general knowledge.
                        Always respond in a refined, helpful, and concise manner.
                        """)
                .defaultTools(orderTools, flightTools, hotelTools, weatherTools)
                
                .build();
                

    }

}
