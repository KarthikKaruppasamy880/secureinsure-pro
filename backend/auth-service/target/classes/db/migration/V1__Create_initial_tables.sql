-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    user_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    biometric_enabled BOOLEAN DEFAULT FALSE,
    face_data TEXT,
    voice_data TEXT,
    fingerprint_data TEXT,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    lock_expires_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    password_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    type VARCHAR(20) NOT NULL,
    resource VARCHAR(100),
    action VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_type ON permissions(type);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('MANAGER', 'Manager with elevated permissions'),
('AGENT', 'Insurance Agent'),
('CUSTOMER', 'Regular customer'),
('UNDERWRITER', 'Insurance Underwriter'),
('CLAIMS_ADJUSTER', 'Claims Adjuster'),
('SYSTEM_ADMIN', 'System Administrator');

-- Insert default permissions
INSERT INTO permissions (name, description, type, resource, action) VALUES
-- User management permissions
('USER_CREATE', 'Create new users', 'CREATE', 'users', 'create'),
('USER_READ', 'Read user information', 'READ', 'users', 'read'),
('USER_UPDATE', 'Update user information', 'UPDATE', 'users', 'update'),
('USER_DELETE', 'Delete users', 'DELETE', 'users', 'delete'),

-- Policy management permissions
('POLICY_CREATE', 'Create new policies', 'CREATE', 'policies', 'create'),
('POLICY_READ', 'Read policy information', 'READ', 'policies', 'read'),
('POLICY_UPDATE', 'Update policy information', 'UPDATE', 'policies', 'update'),
('POLICY_DELETE', 'Delete policies', 'DELETE', 'policies', 'delete'),
('POLICY_APPROVE', 'Approve policies', 'APPROVE', 'policies', 'approve'),

-- Claims management permissions
('CLAIM_CREATE', 'Create new claims', 'CREATE', 'claims', 'create'),
('CLAIM_READ', 'Read claim information', 'READ', 'claims', 'read'),
('CLAIM_UPDATE', 'Update claim information', 'UPDATE', 'claims', 'update'),
('CLAIM_DELETE', 'Delete claims', 'DELETE', 'claims', 'delete'),
('CLAIM_APPROVE', 'Approve claims', 'APPROVE', 'claims', 'approve'),
('CLAIM_REJECT', 'Reject claims', 'REJECT', 'claims', 'reject'),

-- Admin permissions
('ADMIN_ACCESS', 'Access admin panel', 'ADMIN', 'admin', 'access'),
('SYSTEM_CONFIG', 'Configure system settings', 'ADMIN', 'system', 'config'),
('AUDIT_LOG', 'View audit logs', 'READ', 'audit', 'read'),

-- Report permissions
('REPORT_GENERATE', 'Generate reports', 'CREATE', 'reports', 'generate'),
('REPORT_READ', 'Read reports', 'READ', 'reports', 'read'),
('REPORT_EXPORT', 'Export reports', 'EXPORT', 'reports', 'export');

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- Manager gets most permissions except system admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'MANAGER' AND p.name != 'SYSTEM_CONFIG';

-- Agent gets policy and claim permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'AGENT' AND (
    p.name LIKE 'POLICY_%' OR 
    p.name LIKE 'CLAIM_%' OR 
    p.name = 'REPORT_READ'
);

-- Customer gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'CUSTOMER' AND (
    p.name = 'POLICY_READ' OR 
    p.name = 'CLAIM_CREATE' OR 
    p.name = 'CLAIM_READ'
);

-- Underwriter gets policy permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'UNDERWRITER' AND p.name LIKE 'POLICY_%';

-- Claims adjuster gets claim permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'CLAIMS_ADJUSTER' AND p.name LIKE 'CLAIM_%';

-- System admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SYSTEM_ADMIN';

-- Create a default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, status, user_type, email_verified)
VALUES ('admin', 'admin@secureinsure.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'System', 'Administrator', 'ACTIVE', 'SYSTEM_ADMIN', true);

-- Assign admin role to default admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'ADMIN'; 