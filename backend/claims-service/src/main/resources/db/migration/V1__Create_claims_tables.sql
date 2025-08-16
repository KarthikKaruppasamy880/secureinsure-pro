-- Claims Service Database Migration V1
-- Create claims-related tables

-- Claims table
CREATE TABLE claims (
    id BIGSERIAL PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    policy_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    claim_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    incident_date DATE NOT NULL,
    reported_date DATE NOT NULL,
    claim_amount DECIMAL(15,2) NOT NULL,
    approved_amount DECIMAL(15,2),
    paid_amount DECIMAL(15,2),
    deductible_amount DECIMAL(15,2),
    description TEXT,
    incident_location VARCHAR(255),
    police_report_number VARCHAR(100),
    witness_details TEXT,
    damage_description TEXT,
    estimated_repair_cost DECIMAL(15,2),
    actual_repair_cost DECIMAL(15,2),
    medical_expenses DECIMAL(15,2),
    legal_expenses DECIMAL(15,2),
    other_expenses DECIMAL(15,2),
    fraud_score INTEGER,
    fraud_detection_result VARCHAR(255),
    risk_level VARCHAR(20),
    priority_level VARCHAR(20),
    assigned_to BIGINT,
    assigned_date TIMESTAMP,
    investigation_required BOOLEAN DEFAULT FALSE,
    investigation_start_date DATE,
    investigation_end_date DATE,
    investigation_notes TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by BIGINT,
    approval_date TIMESTAMP,
    approval_notes TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_date DATE,
    payment_reference VARCHAR(100),
    recovery_amount DECIMAL(15,2),
    recovery_date DATE,
    recovery_notes TEXT,
    closure_date DATE,
    closure_reason VARCHAR(255),
    reopened_date DATE,
    reopened_reason VARCHAR(255),
    escalation_level INTEGER DEFAULT 0,
    escalation_date TIMESTAMP,
    escalation_reason VARCHAR(255),
    customer_satisfaction_score INTEGER,
    customer_feedback TEXT,
    internal_notes TEXT,
    external_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim documents table
CREATE TABLE claim_documents (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    document_id VARCHAR(100) UNIQUE NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by BIGINT NOT NULL,
    verified_by BIGINT,
    verified_date TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verification_notes TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim notes table
CREATE TABLE claim_notes (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    note_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(255),
    is_internal BOOLEAN DEFAULT TRUE,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by BIGINT,
    resolved_date TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim payments table
CREATE TABLE claim_payments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_date DATE,
    payment_reference VARCHAR(100),
    payment_notes TEXT,
    processed_by BIGINT,
    processed_date TIMESTAMP,
    bank_account_number VARCHAR(50),
    routing_number VARCHAR(50),
    check_number VARCHAR(50),
    card_last_four VARCHAR(4),
    transaction_id VARCHAR(100),
    fee_amount DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim activities table
CREATE TABLE claim_activities (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT NOT NULL,
    performed_by BIGINT NOT NULL,
    performed_by_name VARCHAR(255),
    activity_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    is_system_activity BOOLEAN DEFAULT FALSE,
    is_audit_trail BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim assignments table
CREATE TABLE claim_assignments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    assigned_to BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    assignment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assignment_reason VARCHAR(255),
    assignment_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    unassigned_date TIMESTAMP,
    unassigned_by BIGINT,
    unassigned_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim escalations table
CREATE TABLE claim_escalations (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    escalation_level INTEGER NOT NULL,
    escalated_by BIGINT NOT NULL,
    escalated_to BIGINT NOT NULL,
    escalation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    escalation_reason VARCHAR(255) NOT NULL,
    escalation_notes TEXT,
    resolution_date TIMESTAMP,
    resolved_by BIGINT,
    resolution_notes TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim investigations table
CREATE TABLE claim_investigations (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    investigator_id BIGINT NOT NULL,
    investigation_type VARCHAR(50) NOT NULL,
    investigation_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    investigation_notes TEXT,
    findings TEXT,
    recommendations TEXT,
    cost DECIMAL(15,2),
    is_required BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by BIGINT,
    completed_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim fraud detection table
CREATE TABLE claim_fraud_detection (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    fraud_score INTEGER NOT NULL,
    fraud_indicators TEXT,
    risk_factors TEXT,
    detection_method VARCHAR(100),
    detection_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by BIGINT,
    review_date TIMESTAMP,
    review_notes TEXT,
    is_fraudulent BOOLEAN DEFAULT FALSE,
    fraud_type VARCHAR(100),
    fraud_amount DECIMAL(15,2),
    prevention_measures TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_claims_policy_id ON claims(policy_id);
CREATE INDEX idx_claims_customer_id ON claims(customer_id);
CREATE INDEX idx_claims_status ON claims(claim_status);
CREATE INDEX idx_claims_type ON claims(claim_type);
CREATE INDEX idx_claims_incident_date ON claims(incident_date);
CREATE INDEX idx_claims_reported_date ON claims(reported_date);
CREATE INDEX idx_claims_assigned_to ON claims(assigned_to);
CREATE INDEX idx_claims_created_at ON claims(created_at);
CREATE INDEX idx_claims_updated_at ON claims(updated_at);

CREATE INDEX idx_claim_documents_claim_id ON claim_documents(claim_id);
CREATE INDEX idx_claim_documents_type ON claim_documents(document_type);
CREATE INDEX idx_claim_documents_status ON claim_documents(verification_status);
CREATE INDEX idx_claim_documents_uploaded_by ON claim_documents(uploaded_by);

CREATE INDEX idx_claim_notes_claim_id ON claim_notes(claim_id);
CREATE INDEX idx_claim_notes_type ON claim_notes(note_type);
CREATE INDEX idx_claim_notes_author ON claim_notes(author_id);
CREATE INDEX idx_claim_notes_created_at ON claim_notes(created_at);

CREATE INDEX idx_claim_payments_claim_id ON claim_payments(claim_id);
CREATE INDEX idx_claim_payments_status ON claim_payments(payment_status);
CREATE INDEX idx_claim_payments_date ON claim_payments(payment_date);
CREATE INDEX idx_claim_payments_method ON claim_payments(payment_method);

CREATE INDEX idx_claim_activities_claim_id ON claim_activities(claim_id);
CREATE INDEX idx_claim_activities_type ON claim_activities(activity_type);
CREATE INDEX idx_claim_activities_performed_by ON claim_activities(performed_by);
CREATE INDEX idx_claim_activities_date ON claim_activities(activity_date);

CREATE INDEX idx_claim_assignments_claim_id ON claim_assignments(claim_id);
CREATE INDEX idx_claim_assignments_assigned_to ON claim_assignments(assigned_to);
CREATE INDEX idx_claim_assignments_active ON claim_assignments(is_active);

CREATE INDEX idx_claim_escalations_claim_id ON claim_escalations(claim_id);
CREATE INDEX idx_claim_escalations_level ON claim_escalations(escalation_level);
CREATE INDEX idx_claim_escalations_resolved ON claim_escalations(is_resolved);

CREATE INDEX idx_claim_investigations_claim_id ON claim_investigations(claim_id);
CREATE INDEX idx_claim_investigations_status ON claim_investigations(investigation_status);
CREATE INDEX idx_claim_investigations_investigator ON claim_investigations(investigator_id);

CREATE INDEX idx_claim_fraud_detection_claim_id ON claim_fraud_detection(claim_id);
CREATE INDEX idx_claim_fraud_detection_score ON claim_fraud_detection(fraud_score);
CREATE INDEX idx_claim_fraud_detection_fraudulent ON claim_fraud_detection(is_fraudulent);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_documents_updated_at BEFORE UPDATE ON claim_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_notes_updated_at BEFORE UPDATE ON claim_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_payments_updated_at BEFORE UPDATE ON claim_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_assignments_updated_at BEFORE UPDATE ON claim_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_escalations_updated_at BEFORE UPDATE ON claim_escalations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_investigations_updated_at BEFORE UPDATE ON claim_investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_fraud_detection_updated_at BEFORE UPDATE ON claim_fraud_detection
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 