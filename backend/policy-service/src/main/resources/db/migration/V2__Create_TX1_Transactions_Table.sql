-- Create TX1 Transactions table
CREATE TABLE tx1_transactions (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    zinnia_case_id VARCHAR(100),
    policy_number VARCHAR(100),
    application_date DATE NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    face_amount DECIMAL(15,2) NOT NULL,
    premium_mode VARCHAR(50) NOT NULL,
    agent_name VARCHAR(200),
    branch VARCHAR(200),
    
    -- Insured Information
    insured_first_name VARCHAR(100) NOT NULL,
    insured_last_name VARCHAR(100) NOT NULL,
    insured_date_of_birth DATE NOT NULL,
    insured_age INTEGER,
    insured_gender VARCHAR(20),
    insured_ssn VARCHAR(20),
    insured_email VARCHAR(200),
    insured_phone VARCHAR(20),
    insured_address VARCHAR(500),
    insured_city VARCHAR(100),
    insured_state VARCHAR(50),
    insured_zip VARCHAR(20),
    insured_occupation VARCHAR(200),
    insured_annual_income DECIMAL(15,2),
    
    -- Owner Information
    owner_first_name VARCHAR(100),
    owner_last_name VARCHAR(100),
    owner_date_of_birth DATE,
    owner_ssn VARCHAR(20),
    owner_email VARCHAR(200),
    owner_phone VARCHAR(20),
    owner_address VARCHAR(500),
    owner_city VARCHAR(100),
    owner_state VARCHAR(50),
    owner_zip VARCHAR(20),
    owner_relationship VARCHAR(100),
    
    -- Payor Information
    payor_first_name VARCHAR(100),
    payor_last_name VARCHAR(100),
    payor_date_of_birth DATE,
    payor_ssn VARCHAR(20),
    payor_email VARCHAR(200),
    payor_phone VARCHAR(20),
    payor_address VARCHAR(500),
    payor_city VARCHAR(100),
    payor_state VARCHAR(50),
    payor_zip VARCHAR(20),
    payor_relationship VARCHAR(100),
    
    -- Beneficiary Information
    primary_beneficiary_name VARCHAR(200),
    primary_beneficiary_relationship VARCHAR(100),
    primary_beneficiary_percentage VARCHAR(10),
    primary_beneficiary_date_of_birth DATE,
    primary_beneficiary_ssn VARCHAR(20),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    processing_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tx1_case_number ON tx1_transactions(case_number);
CREATE INDEX idx_tx1_zinnia_case_id ON tx1_transactions(zinnia_case_id);
CREATE INDEX idx_tx1_policy_number ON tx1_transactions(policy_number);
CREATE INDEX idx_tx1_status ON tx1_transactions(status);
CREATE INDEX idx_tx1_application_date ON tx1_transactions(application_date);
CREATE INDEX idx_tx1_insured_name ON tx1_transactions(insured_first_name, insured_last_name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tx1_transactions_updated_at 
    BEFORE UPDATE ON tx1_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
