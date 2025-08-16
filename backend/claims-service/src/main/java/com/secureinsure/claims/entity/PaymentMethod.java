package com.secureinsure.claims.entity;

public enum PaymentMethod {
    BANK_TRANSFER("Bank Transfer"),
    CHECK("Check"),
    CASH("Cash"),
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    ELECTRONIC_FUNDS_TRANSFER("Electronic Funds Transfer"),
    WIRE_TRANSFER("Wire Transfer"),
    ACH("ACH"),
    PAYPAL("PayPal"),
    VENMO("Venmo"),
    ZELLE("Zelle"),
    CASH_APP("Cash App"),
    APPLE_PAY("Apple Pay"),
    GOOGLE_PAY("Google Pay"),
    SAMSUNG_PAY("Samsung Pay"),
    CRYPTO("Cryptocurrency"),
    INSURANCE_CHECK("Insurance Check"),
    THIRD_PARTY_PAYMENT("Third Party Payment"),
    SUBROGATION_PAYMENT("Subrogation Payment"),
    RECOVERY_PAYMENT("Recovery Payment"),
    SETTLEMENT_PAYMENT("Settlement Payment"),
    COURT_ORDERED_PAYMENT("Court Ordered Payment"),
    ARBITRATION_PAYMENT("Arbitration Payment"),
    MEDIATION_PAYMENT("Mediation Payment"),
    OTHER("Other");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isElectronic() {
        return this == BANK_TRANSFER || this == ELECTRONIC_FUNDS_TRANSFER || 
               this == WIRE_TRANSFER || this == ACH || this == PAYPAL ||
               this == VENMO || this == ZELLE || this == CASH_APP ||
               this == APPLE_PAY || this == GOOGLE_PAY || this == SAMSUNG_PAY ||
               this == CRYPTO;
    }
    
    public boolean isTraditional() {
        return this == CHECK || this == CASH || this == INSURANCE_CHECK;
    }
    
    public boolean isDigital() {
        return this == PAYPAL || this == VENMO || this == ZELLE || 
               this == CASH_APP || this == APPLE_PAY || this == GOOGLE_PAY ||
               this == SAMSUNG_PAY || this == CRYPTO;
    }
    
    public boolean isCard() {
        return this == CREDIT_CARD || this == DEBIT_CARD;
    }
    
    public boolean isTransfer() {
        return this == BANK_TRANSFER || this == ELECTRONIC_FUNDS_TRANSFER ||
               this == WIRE_TRANSFER || this == ACH;
    }
} 