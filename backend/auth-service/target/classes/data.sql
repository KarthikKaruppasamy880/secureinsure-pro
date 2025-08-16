-- Default users for SecureInsure Pro
-- Password for all users: Admin123!

-- Admin User
INSERT INTO users (username, email, password, first_name, last_name, user_type, status, email_verified, phone_verified, mfa_enabled, created_at, updated_at) 
VALUES ('admin', 'admin@secureinsure.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'System', 'Administrator', 'ADMIN', 'ACTIVE', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Agent User
INSERT INTO users (username, email, password, first_name, last_name, user_type, status, email_verified, phone_verified, mfa_enabled, created_at, updated_at) 
VALUES ('agent', 'agent@secureinsure.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'John', 'Agent', 'AGENT', 'ACTIVE', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Underwriter User
INSERT INTO users (username, email, password, first_name, last_name, user_type, status, email_verified, phone_verified, mfa_enabled, created_at, updated_at) 
VALUES ('underwriter', 'underwriter@secureinsure.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Sarah', 'Underwriter', 'UNDERWRITER', 'ACTIVE', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Customer User
INSERT INTO users (username, email, password, first_name, last_name, user_type, status, email_verified, phone_verified, mfa_enabled, created_at, updated_at) 
VALUES ('customer', 'customer@secureinsure.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Mike', 'Customer', 'CUSTOMER', 'ACTIVE', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Insert roles for users
INSERT INTO user_roles (user_id, role) 
SELECT u.id, 'ADMIN' FROM users u WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role) 
SELECT u.id, 'AGENT' FROM users u WHERE u.username = 'agent'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role) 
SELECT u.id, 'UNDERWRITER' FROM users u WHERE u.username = 'underwriter'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role) 
SELECT u.id, 'CUSTOMER' FROM users u WHERE u.username = 'customer'
ON CONFLICT DO NOTHING;
