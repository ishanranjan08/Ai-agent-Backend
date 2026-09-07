package com.ishan.agent.backend.model;

import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Component
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Flight {
    private String airline;
    private String source;
    private String destination;
    private String date;
    private Integer price;

}
