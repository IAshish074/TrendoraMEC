package com.ashish.ecommerce.order.config;

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
    public Queue orderInventoryReservedQueue() {
        return new Queue("order.inventory-reserved.queue", true);
    }

    @Bean
    public Binding orderInventoryReservedBinding(Queue orderInventoryReservedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderInventoryReservedQueue).to(eventExchange).with("inventory.reserved");
    }

    @Bean
    public Queue orderInventoryRejectedQueue() {
        return new Queue("order.inventory-rejected.queue", true);
    }

    @Bean
    public Binding orderInventoryRejectedBinding(Queue orderInventoryRejectedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderInventoryRejectedQueue).to(eventExchange).with("inventory.rejected");
    }

    @Bean
    public Queue orderPaymentCompletedQueue() {
        return new Queue("order.payment-completed.queue", true);
    }

    @Bean
    public Binding orderPaymentCompletedBinding(Queue orderPaymentCompletedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderPaymentCompletedQueue).to(eventExchange).with("payment.completed");
    }

    @Bean
    public Queue orderPaymentFailedQueue() {
        return new Queue("order.payment-failed.queue", true);
    }

    @Bean
    public Binding orderPaymentFailedBinding(Queue orderPaymentFailedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderPaymentFailedQueue).to(eventExchange).with("payment.failed");
    }

    @Bean
    public Queue orderConfirmedEmailQueue() {
        return new Queue("order.order-confirmed.email.queue", true);
    }

    @Bean
    public Binding orderConfirmedEmailBinding(Queue orderConfirmedEmailQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderConfirmedEmailQueue).to(eventExchange).with("order.confirmed");
    }

    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}

