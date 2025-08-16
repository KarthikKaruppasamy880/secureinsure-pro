package com.secureinsure.notification.entity;

public enum DeliveryMethod {
    EMAIL("Email"),
    SMS("SMS"),
    PUSH("Push Notification"),
    WEBHOOK("Webhook"),
    IN_APP("In-App"),
    SLACK("Slack"),
    TEAMS("Microsoft Teams"),
    DISCORD("Discord"),
    WHATSAPP("WhatsApp"),
    TELEGRAM("Telegram"),
    VOICE("Voice Call"),
    FAX("Fax"),
    POSTAL("Postal Mail");

    private final String displayName;

    DeliveryMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isDigital() {
        return this == EMAIL || this == SMS || this == PUSH || this == WEBHOOK || 
               this == IN_APP || this == SLACK || this == TEAMS || this == DISCORD ||
               this == WHATSAPP || this == TELEGRAM;
    }

    public boolean isInstant() {
        return this == EMAIL || this == SMS || this == PUSH || this == WEBHOOK ||
               this == IN_APP || this == SLACK || this == TEAMS || this == DISCORD ||
               this == WHATSAPP || this == TELEGRAM || this == VOICE;
    }

    public boolean requiresTemplate() {
        return this == EMAIL || this == SMS || this == PUSH || this == IN_APP;
    }
} 