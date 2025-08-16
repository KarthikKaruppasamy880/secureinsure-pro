-- Notification Service Database Migration V1
-- Create notification-related tables

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    notification_category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    content TEXT,
    template_id VARCHAR(100),
    template_data JSONB,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    email_address VARCHAR(255),
    phone_number VARCHAR(20),
    device_token VARCHAR(500),
    webhook_url VARCHAR(500),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB,
    related_entity_type VARCHAR(100),
    related_entity_id BIGINT,
    source_service VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_delivery_methods (
    notification_id BIGINT NOT NULL,
    delivery_method VARCHAR(50) NOT NULL,
    PRIMARY KEY (notification_id, delivery_method),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

CREATE TABLE notification_templates (
    id BIGSERIAL PRIMARY KEY,
    template_id VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    webhook_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

CREATE TABLE notification_logs (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    delivery_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    response_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

CREATE TABLE notification_batches (
    id BIGSERIAL PRIMARY KEY,
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    batch_name VARCHAR(255) NOT NULL,
    template_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_batch_items (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    notification_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES notification_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_category ON notifications(notification_category);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX idx_notifications_delivered_at ON notifications(delivered_at);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_acknowledged_at ON notifications(acknowledged_at);
CREATE INDEX idx_notifications_retry_count ON notifications(retry_count);
CREATE INDEX idx_notifications_next_retry_at ON notifications(next_retry_at);
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX idx_notifications_source_service ON notifications(source_service);
CREATE INDEX idx_notifications_email_address ON notifications(email_address);
CREATE INDEX idx_notifications_phone_number ON notifications(phone_number);
CREATE INDEX idx_notifications_device_token ON notifications(device_token);

CREATE INDEX idx_notification_delivery_methods_notification_id ON notification_delivery_methods(notification_id);
CREATE INDEX idx_notification_delivery_methods_method ON notification_delivery_methods(delivery_method);

CREATE INDEX idx_notification_templates_template_id ON notification_templates(template_id);
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);

CREATE INDEX idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX idx_notification_logs_delivered_at ON notification_logs(delivered_at);

CREATE INDEX idx_notification_batches_batch_id ON notification_batches(batch_id);
CREATE INDEX idx_notification_batches_status ON notification_batches(status);
CREATE INDEX idx_notification_batches_scheduled_at ON notification_batches(scheduled_at);

CREATE INDEX idx_notification_batch_items_batch_id ON notification_batch_items(batch_id);
CREATE INDEX idx_notification_batch_items_notification_id ON notification_batch_items(notification_id);
CREATE INDEX idx_notification_batch_items_status ON notification_batch_items(status);

-- Composite indexes for common queries
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, notification_type);
CREATE INDEX idx_notifications_user_category ON notifications(user_id, notification_category);
CREATE INDEX idx_notifications_user_priority ON notifications(user_id, priority);
CREATE INDEX idx_notifications_status_priority ON notifications(status, priority);
CREATE INDEX idx_notifications_type_category ON notifications(notification_type, notification_category);
CREATE INDEX idx_notifications_scheduled_status ON notifications(scheduled_at, status);
CREATE INDEX idx_notifications_retry_status ON notifications(next_retry_at, status, retry_count);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_batches_updated_at BEFORE UPDATE ON notification_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification templates
INSERT INTO notification_templates (template_id, template_name, template_type, subject, body, variables) VALUES
('policy_created_email', 'Policy Created Email', 'EMAIL', 'Policy Created Successfully', 
 'Dear {{customerName}},\n\nYour policy {{policyNumber}} has been created successfully with coverage starting from {{startDate}}.\n\nPolicy Details:\n- Policy Number: {{policyNumber}}\n- Coverage Type: {{coverageType}}\n- Premium Amount: {{premiumAmount}}\n- Effective Date: {{startDate}}\n- Expiry Date: {{endDate}}\n\nThank you for choosing SecureInsure Pro!\n\nBest regards,\nSecureInsure Pro Team',
 '{"customerName": "string", "policyNumber": "string", "coverageType": "string", "premiumAmount": "string", "startDate": "date", "endDate": "date"}'),

('policy_created_sms', 'Policy Created SMS', 'SMS', NULL,
 'Your policy {{policyNumber}} has been created successfully. Coverage starts {{startDate}}. Premium: {{premiumAmount}}',
 '{"policyNumber": "string", "startDate": "date", "premiumAmount": "string"}'),

('claim_submitted_email', 'Claim Submitted Email', 'EMAIL', 'Claim Submitted Successfully',
 'Dear {{customerName}},\n\nYour claim {{claimNumber}} has been submitted successfully and is under review.\n\nClaim Details:\n- Claim Number: {{claimNumber}}\n- Policy Number: {{policyNumber}}\n- Claim Type: {{claimType}}\n- Estimated Amount: {{estimatedAmount}}\n- Incident Date: {{incidentDate}}\n\nWe will keep you updated on the progress of your claim.\n\nBest regards,\nSecureInsure Pro Team',
 '{"customerName": "string", "claimNumber": "string", "policyNumber": "string", "claimType": "string", "estimatedAmount": "string", "incidentDate": "date"}'),

('claim_submitted_sms', 'Claim Submitted SMS', 'SMS', NULL,
 'Claim {{claimNumber}} submitted successfully. Estimated amount: {{estimatedAmount}}. We will contact you soon.',
 '{"claimNumber": "string", "estimatedAmount": "string"}'),

('payment_due_email', 'Payment Due Email', 'EMAIL', 'Payment Due Reminder',
 'Dear {{customerName}},\n\nThis is a reminder that your payment of {{amount}} for policy {{policyNumber}} is due on {{dueDate}}.\n\nPayment Details:\n- Policy Number: {{policyNumber}}\n- Amount Due: {{amount}}\n- Due Date: {{dueDate}}\n- Payment Method: {{paymentMethod}}\n\nPlease make your payment to avoid any service interruptions.\n\nBest regards,\nSecureInsure Pro Team',
 '{"customerName": "string", "policyNumber": "string", "amount": "string", "dueDate": "date", "paymentMethod": "string"}'),

('payment_due_sms', 'Payment Due SMS', 'SMS', NULL,
 'Payment reminder: {{amount}} due for policy {{policyNumber}} on {{dueDate}}.',
 '{"amount": "string", "policyNumber": "string", "dueDate": "date"}'),

('password_reset_email', 'Password Reset Email', 'EMAIL', 'Password Reset Request',
 'Dear {{customerName}},\n\nYou have requested a password reset for your SecureInsure Pro account.\n\nTo reset your password, please click the link below:\n{{resetLink}}\n\nThis link will expire in {{expiryTime}}.\n\nIf you did not request this reset, please ignore this email.\n\nBest regards,\nSecureInsure Pro Team',
 '{"customerName": "string", "resetLink": "string", "expiryTime": "string"}'),

('welcome_email', 'Welcome Email', 'EMAIL', 'Welcome to SecureInsure Pro',
 'Dear {{customerName}},\n\nWelcome to SecureInsure Pro! Your account has been created successfully.\n\nAccount Details:\n- Username: {{username}}\n- Email: {{email}}\n\nPlease verify your email address by clicking the link below:\n{{verificationLink}}\n\nWe look forward to providing you with excellent insurance services.\n\nBest regards,\nSecureInsure Pro Team',
 '{"customerName": "string", "username": "string", "email": "string", "verificationLink": "string"}'); 