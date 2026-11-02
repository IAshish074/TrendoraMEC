package com.ashish.ecommerce.order.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressDto {

    @NotBlank(message = "Recipient name is required")
    @JsonAlias({"recipientName", "name", "fullName", "userName"})
    private String recipientName;

    @NotBlank(message = "Phone number is required")
    @JsonAlias({"phone", "phoneNumber", "mobile"})
    private String phone;

    @NotBlank(message = "Street is required")
    @JsonAlias({"street", "address", "streetAddress"})
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    @JsonAlias({"state", "province", "region"})
    private String state;

    @NotBlank(message = "Zip code is required")
    @JsonAlias({"zipCode", "postalCode", "zip", "pincode"})
    private String zipCode;

    @NotBlank(message = "Country is required")
    private String country;

    public String getState() {
        return (state != null && !state.trim().isEmpty()) ? state : "N/A";
    }
}
