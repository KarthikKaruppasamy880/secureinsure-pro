-- Create policies table
CREATE TABLE policies (
    id BIGSERIAL PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    policy_type VARCHAR(50) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    coverage_amount DECIMAL(15,2) NOT NULL,
    premium_amount DECIMAL(15,2) NOT NULL,
    deductible_amount DECIMAL(15,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 10),
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    agent_id BIGINT,
    agent_name VARCHAR(100),
    underwriter_id BIGINT,
    underwriter_name VARCHAR(100),
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policy_documents table
CREATE TABLE policy_documents (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_extension VARCHAR(20),
    document_status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED',
    uploaded_by BIGINT,
    uploaded_by_name VARCHAR(100),
    verified_by BIGINT,
    verified_by_name VARCHAR(100),
    verification_date TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policy_endorsements table
CREATE TABLE policy_endorsements (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    endorsement_number VARCHAR(50) UNIQUE NOT NULL,
    endorsement_type VARCHAR(100) NOT NULL,
    description TEXT,
    effective_date DATE NOT NULL,
    premium_adjustment DECIMAL(15,2) DEFAULT 0.00,
    coverage_adjustment DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_by_name VARCHAR(100),
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policy_payments table
CREATE TABLE policy_payments (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    gateway_reference VARCHAR(100),
    payment_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_policies_customer_id ON policies(customer_id);
CREATE INDEX idx_policies_policy_number ON policies(policy_number);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_start_date ON policies(start_date);
CREATE INDEX idx_policies_end_date ON policies(end_date);
CREATE INDEX idx_policies_agent_id ON policies(agent_id);
CREATE INDEX idx_policies_underwriter_id ON policies(underwriter_id);

CREATE INDEX idx_policy_documents_policy_id ON policy_documents(policy_id);
CREATE INDEX idx_policy_documents_document_type ON policy_documents(document_type);
CREATE INDEX idx_policy_documents_status ON policy_documents(document_status);

CREATE INDEX idx_policy_endorsements_policy_id ON policy_endorsements(policy_id);
CREATE INDEX idx_policy_endorsements_endorsement_number ON policy_endorsements(endorsement_number);
CREATE INDEX idx_policy_endorsements_status ON policy_endorsements(status);

CREATE INDEX idx_policy_payments_policy_id ON policy_payments(policy_id);
CREATE INDEX idx_policy_payments_payment_number ON policy_payments(payment_number);
CREATE INDEX idx_policy_payments_status ON policy_payments(status);
CREATE INDEX idx_policy_payments_payment_date ON policy_payments(payment_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_documents_updated_at BEFORE UPDATE ON policy_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_endorsements_updated_at BEFORE UPDATE ON policy_endorsements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_payments_updated_at BEFORE UPDATE ON policy_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 