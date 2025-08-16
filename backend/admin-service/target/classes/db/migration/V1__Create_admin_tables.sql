-- Admin Service Database Migration V1
-- Create admin-related tables

CREATE TABLE system_audit (
    id BIGSERIAL PRIMARY KEY,
    audit_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    response_status INTEGER,
    execution_time_ms BIGINT,
    success BOOLEAN,
    error_message TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_configuration (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(200) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50),
    description TEXT,
    category VARCHAR(100),
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    validation_regex VARCHAR(500),
    default_value TEXT,
    min_value VARCHAR(100),
    max_value VARCHAR(100),
    allowed_values TEXT,
    environment VARCHAR(50),
    version VARCHAR(20),
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_backup (
    id BIGSERIAL PRIMARY KEY,
    backup_id VARCHAR(50) UNIQUE NOT NULL,
    backup_name VARCHAR(200) NOT NULL,
    backup_type VARCHAR(50) NOT NULL,
    backup_path VARCHAR(500),
    backup_size BIGINT,
    backup_status VARCHAR(50) NOT NULL,
    backup_metadata TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    retention_days INTEGER DEFAULT 30
);

CREATE TABLE system_maintenance (
    id BIGSERIAL PRIMARY KEY,
    maintenance_id VARCHAR(50) UNIQUE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    maintenance_status VARCHAR(50) NOT NULL,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    description TEXT,
    affected_services TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_health_check (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    health_status VARCHAR(50) NOT NULL,
    response_time_ms BIGINT,
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    metadata TEXT
);

CREATE TABLE system_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20,4),
    metric_unit VARCHAR(20),
    metric_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    service_name VARCHAR(100),
    metadata TEXT
);

-- Indexes for performance
CREATE INDEX idx_system_audit_user_id ON system_audit(user_id);
CREATE INDEX idx_system_audit_action ON system_audit(action);
CREATE INDEX idx_system_audit_entity_type ON system_audit(entity_type);
CREATE INDEX idx_system_audit_created_at ON system_audit(created_at);
CREATE INDEX idx_system_audit_success ON system_audit(success);
CREATE INDEX idx_system_audit_ip_address ON system_audit(ip_address);

CREATE INDEX idx_system_config_key ON system_configuration(config_key);
CREATE INDEX idx_system_config_category ON system_configuration(category);
CREATE INDEX idx_system_config_environment ON system_configuration(environment);
CREATE INDEX idx_system_config_sensitive ON system_configuration(is_sensitive);

CREATE INDEX idx_system_backup_type ON system_backup(backup_type);
CREATE INDEX idx_system_backup_status ON system_backup(backup_status);
CREATE INDEX idx_system_backup_created_at ON system_backup(created_at);

CREATE INDEX idx_system_maintenance_type ON system_maintenance(maintenance_type);
CREATE INDEX idx_system_maintenance_status ON system_maintenance(maintenance_status);
CREATE INDEX idx_system_maintenance_scheduled_start ON system_maintenance(scheduled_start);

CREATE INDEX idx_system_health_service ON system_health_check(service_name);
CREATE INDEX idx_system_health_status ON system_health_check(health_status);
CREATE INDEX idx_system_health_last_check ON system_health_check(last_check);

CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(metric_timestamp);
CREATE INDEX idx_system_metrics_service ON system_metrics(service_name);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_audit_updated_at BEFORE UPDATE ON system_audit FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configuration_updated_at BEFORE UPDATE ON system_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_maintenance_updated_at BEFORE UPDATE ON system_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configurations
INSERT INTO system_configuration (config_key, config_value, config_type, description, category, is_encrypted, is_sensitive, is_readonly, environment, version) VALUES
('system.name', 'SecureInsure Pro', 'STRING', 'System name', 'GENERAL', false, false, false, 'ALL', '1.0'),
('system.version', '1.0.0', 'STRING', 'System version', 'GENERAL', false, false, true, 'ALL', '1.0'),
('system.environment', 'development', 'STRING', 'System environment', 'GENERAL', false, false, false, 'ALL', '1.0'),
('security.session.timeout', '3600', 'INTEGER', 'Session timeout in seconds', 'SECURITY', false, false, false, 'ALL', '1.0'),
('security.password.min_length', '8', 'INTEGER', 'Minimum password length', 'SECURITY', false, false, false, 'ALL', '1.0'),
('security.mfa.enabled', 'true', 'BOOLEAN', 'Enable MFA', 'SECURITY', false, false, false, 'ALL', '1.0'),
('notification.email.enabled', 'true', 'BOOLEAN', 'Enable email notifications', 'NOTIFICATION', false, false, false, 'ALL', '1.0'),
('notification.sms.enabled', 'false', 'BOOLEAN', 'Enable SMS notifications', 'NOTIFICATION', false, false, false, 'ALL', '1.0'),
('backup.retention.days', '30', 'INTEGER', 'Backup retention period in days', 'BACKUP', false, false, false, 'ALL', '1.0'),
('backup.auto.enabled', 'true', 'BOOLEAN', 'Enable automatic backups', 'BACKUP', false, false, false, 'ALL', '1.0'),
('monitoring.enabled', 'true', 'BOOLEAN', 'Enable system monitoring', 'MONITORING', false, false, false, 'ALL', '1.0'),
('monitoring.health_check.interval', '300', 'INTEGER', 'Health check interval in seconds', 'MONITORING', false, false, false, 'ALL', '1.0'),
('logging.level', 'INFO', 'STRING', 'Logging level', 'LOGGING', false, false, false, 'ALL', '1.0'),
('logging.retention.days', '90', 'INTEGER', 'Log retention period in days', 'LOGGING', false, false, false, 'ALL', '1.0'),
('api.rate_limit.enabled', 'true', 'BOOLEAN', 'Enable API rate limiting', 'API', false, false, false, 'ALL', '1.0'),
('api.rate_limit.requests_per_minute', '100', 'INTEGER', 'API requests per minute limit', 'API', false, false, false, 'ALL', '1.0'),
('database.connection.pool.size', '10', 'INTEGER', 'Database connection pool size', 'DATABASE', false, false, false, 'ALL', '1.0'),
('cache.redis.enabled', 'true', 'BOOLEAN', 'Enable Redis caching', 'CACHE', false, false, false, 'ALL', '1.0'),
('search.elasticsearch.enabled', 'true', 'BOOLEAN', 'Enable Elasticsearch search', 'SEARCH', false, false, false, 'ALL', '1.0'),
('payment.stripe.enabled', 'false', 'BOOLEAN', 'Enable Stripe payment processing', 'PAYMENT', false, false, false, 'ALL', '1.0'); 