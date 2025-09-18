package com.secureinsure.policy.dto;

import com.secureinsure.policy.entity.Party;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyDto {

    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String middleName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String ssn;

    @Email(message = "Email must be valid")
    private String email;

    private String phone;
    private String mobilePhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String occupation;
    private Double annualIncome;
    private String employerName;
    private String employerPhone;
    private String driversLicenseNumber;
    private String driversLicenseState;
    private LocalDate driversLicenseExpiry;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private String fullName;
    private Integer age;
    private Set<PartyRoleDto> roles;

    public static PartyDto fromEntity(Party party) {
        if (party == null) {
            return null;
        }

        return PartyDto.builder()
                .id(party.getId())
                .firstName(party.getFirstName())
                .lastName(party.getLastName())
                .middleName(party.getMiddleName())
                .dateOfBirth(party.getDateOfBirth())
                .gender(party.getGender().name())
                .ssn(party.getSsn())
                .email(party.getEmail())
                .phone(party.getPhone())
                .mobilePhone(party.getMobilePhone())
                .addressLine1(party.getAddressLine1())
                .addressLine2(party.getAddressLine2())
                .city(party.getCity())
                .state(party.getState())
                .zipCode(party.getZipCode())
                .country(party.getCountry())
                .occupation(party.getOccupation())
                .annualIncome(party.getAnnualIncome())
                .employerName(party.getEmployerName())
                .employerPhone(party.getEmployerPhone())
                .driversLicenseNumber(party.getDriversLicenseNumber())
                .driversLicenseState(party.getDriversLicenseState())
                .driversLicenseExpiry(party.getDriversLicenseExpiry())
                .isActive(party.getIsActive())
                .createdAt(party.getCreatedAt())
                .updatedAt(party.getUpdatedAt())
                .fullName(party.getFullName())
                .age(party.getAge())
                .roles(party.getRoles() != null ? 
                    party.getRoles().stream()
                        .map(PartyRoleDto::fromEntity)
                        .collect(Collectors.toSet()) : null)
                .build();
    }

    public Party toEntity() {
        return Party.builder()
                .id(this.id)
                .firstName(this.firstName)
                .lastName(this.lastName)
                .middleName(this.middleName)
                .dateOfBirth(this.dateOfBirth)
                .gender(Party.Gender.valueOf(this.gender))
                .ssn(this.ssn)
                .email(this.email)
                .phone(this.phone)
                .mobilePhone(this.mobilePhone)
                .addressLine1(this.addressLine1)
                .addressLine2(this.addressLine2)
                .city(this.city)
                .state(this.state)
                .zipCode(this.zipCode)
                .country(this.country)
                .occupation(this.occupation)
                .annualIncome(this.annualIncome)
                .employerName(this.employerName)
                .employerPhone(this.employerPhone)
                .driversLicenseNumber(this.driversLicenseNumber)
                .driversLicenseState(this.driversLicenseState)
                .driversLicenseExpiry(this.driversLicenseExpiry)
                .isActive(this.isActive)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}
