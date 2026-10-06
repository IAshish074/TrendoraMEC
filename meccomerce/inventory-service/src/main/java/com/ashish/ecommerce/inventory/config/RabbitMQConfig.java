package com.ashish.ecommerce.inventory.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange:ecommerce.events}")
    private String exchangeName;

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(exchangeName, true, false);
    }

    @Bean
    public Queue inventoryOrderCreatedQueue() {
        return new Queue("inventory.order-created.queue", true);
    }

    @Bean
    public Binding inventoryOrderCreatedBinding(Queue inventoryOrderCreatedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(inventoryOrderCreatedQueue).to(eventExchange).with("order.created");
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}

