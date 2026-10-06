package com.ashish.ecommerce.user.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.user.dto.AddressResponse;
import com.ashish.ecommerce.user.dto.CreateAddressRequest;
import com.ashish.ecommerce.user.entity.Address;
import com.ashish.ecommerce.user.entity.UserProfile;
import com.ashish.ecommerce.user.repository.AddressRepository;
import com.ashish.ecommerce.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserProfileRepository userProfileRepository;

    public AddressService(AddressRepository addressRepository, UserProfileRepository userProfileRepository) {
        this.addressRepository = addressRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserProfileUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(Long userId, String email, CreateAddressRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> userProfileRepository.save(
                        UserProfile.builder()
                                .userId(userId)
                                .email(email != null ? email : "user" + userId + "@example.com")
                                .name("User")
                                .role("ROLE_USER")
                                .build()
                ));

        if (request.isDefault()) {
            List<Address> existing = addressRepository.findByUserProfileUserId(userId);
            existing.forEach(a -> a.setDefault(false));
            addressRepository.saveAll(existing);
        }

        Address address = Address.builder()
                .userProfile(profile)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .isDefault(request.isDefault())
                .build();

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserProfileUserId(addressId, userId)
                .orElseThrow(() -> new ApiException("Address not found", 404));
        addressRepository.delete(address);
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .build();
    }
}
