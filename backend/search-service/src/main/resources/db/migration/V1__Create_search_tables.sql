-- Search Service Database Migration V1
-- Create search-related tables

CREATE TABLE search_index (
    id BIGSERIAL PRIMARY KEY,
    index_id VARCHAR(50) UNIQUE NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    keywords TEXT,
    category VARCHAR(100),
    tags TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    priority INTEGER DEFAULT 5,
    user_id BIGINT,
    username VARCHAR(100),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    metadata JSONB,
    search_score DOUBLE PRECISION DEFAULT 0.0,
    last_indexed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_search_index_entity_type ON search_index(entity_type);
CREATE INDEX idx_search_index_entity_id ON search_index(entity_id);
CREATE INDEX idx_search_index_status ON search_index(status);
CREATE INDEX idx_search_index_category ON search_index(category);
CREATE INDEX idx_search_index_user_id ON search_index(user_id);
CREATE INDEX idx_search_index_username ON search_index(username);
CREATE INDEX idx_search_index_priority ON search_index(priority);
CREATE INDEX idx_search_index_search_score ON search_index(search_score);
CREATE INDEX idx_search_index_created_at ON search_index(created_at);
CREATE INDEX idx_search_index_updated_at ON search_index(updated_at);
CREATE INDEX idx_search_index_last_indexed_at ON search_index(last_indexed_at);

-- Composite indexes
CREATE INDEX idx_search_index_entity_type_entity_id ON search_index(entity_type, entity_id);
CREATE INDEX idx_search_index_status_priority ON search_index(status, priority);
CREATE INDEX idx_search_index_category_status ON search_index(category, status);
CREATE INDEX idx_search_index_user_id_status ON search_index(user_id, status);

-- Full-text search indexes
CREATE INDEX idx_search_index_title_gin ON search_index USING gin(to_tsvector('english', title));
CREATE INDEX idx_search_index_content_gin ON search_index USING gin(to_tsvector('english', content));
CREATE INDEX idx_search_index_keywords_gin ON search_index USING gin(to_tsvector('english', keywords));
CREATE INDEX idx_search_index_tags_gin ON search_index USING gin(to_tsvector('english', tags));

-- Combined full-text search index
CREATE INDEX idx_search_index_full_text ON search_index USING gin(
    to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(content, '') || ' ' || 
        COALESCE(keywords, '') || ' ' || 
        COALESCE(tags, '')
    )
);

-- JSONB indexes for metadata
CREATE INDEX idx_search_index_metadata_gin ON search_index USING gin(metadata);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_search_index_updated_at 
    BEFORE UPDATE ON search_index 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO search_index (index_id, entity_type, entity_id, title, content, keywords, category, tags, status, priority, user_id, username, created_by, search_score, last_indexed_at) VALUES
('IDX-POL-001', 'POLICY', 'POL-001', 'Auto Insurance Policy', 'Comprehensive auto insurance policy covering liability, collision, and comprehensive coverage for a 2020 Honda Civic.', 'auto,insurance,comprehensive,coverage,liability,collision', 'POLICY', 'auto,comprehensive,premium', 'ACTIVE', 8, 100, 'john.doe', 'admin', 0.95, CURRENT_TIMESTAMP),
('IDX-CLM-001', 'CLAIM', 'CLM-001', 'Auto Accident Claim', 'Claim for auto accident involving rear-end collision on Highway 101. Vehicle damage estimated at $5,000.', 'claim,accident,auto,collision,damage', 'CLAIM', 'accident,damage,urgent', 'ACTIVE', 9, 100, 'john.doe', 'admin', 0.92, CURRENT_TIMESTAMP),
('IDX-USER-001', 'USER', 'USR-001', 'John Doe Profile', 'User profile for John Doe with contact information and account details.', 'user,profile,contact,account', 'USER', 'profile,active', 'ACTIVE', 6, 100, 'john.doe', 'admin', 0.85, CURRENT_TIMESTAMP),
('IDX-DOC-001', 'DOCUMENT', 'DOC-001', 'Policy Document', 'Official policy document containing terms and conditions for auto insurance coverage.', 'document,policy,terms,conditions', 'DOCUMENT', 'policy,official', 'ACTIVE', 7, 100, 'john.doe', 'admin', 0.88, CURRENT_TIMESTAMP),
('IDX-NOT-001', 'NOTIFICATION', 'NOT-001', 'Policy Renewal Reminder', 'Notification reminding customer about upcoming policy renewal date and premium payment.', 'notification,renewal,reminder,payment', 'NOTIFICATION', 'renewal,reminder', 'ACTIVE', 5, 100, 'john.doe', 'admin', 0.75, CURRENT_TIMESTAMP);

-- Create search statistics view
CREATE VIEW search_statistics AS
SELECT 
    COUNT(*) as total_indexes,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_indexes,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_indexes,
    COUNT(CASE WHEN status = 'DELETED' THEN 1 END) as deleted_indexes,
    AVG(priority) as average_priority,
    AVG(search_score) as average_search_score,
    MAX(priority) as max_priority,
    MIN(priority) as min_priority,
    MAX(search_score) as max_search_score,
    MIN(search_score) as min_search_score,
    COUNT(DISTINCT entity_type) as unique_entity_types,
    COUNT(DISTINCT category) as unique_categories,
    COUNT(DISTINCT user_id) as unique_users
FROM search_index;

-- Create search performance view
CREATE VIEW search_performance AS
SELECT 
    entity_type,
    COUNT(*) as index_count,
    AVG(priority) as avg_priority,
    AVG(search_score) as avg_search_score,
    MAX(updated_at) as last_updated
FROM search_index 
GROUP BY entity_type;

-- Create search activity view
CREATE VIEW search_activity AS
SELECT 
    DATE(created_at) as activity_date,
    COUNT(*) as indexes_created,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as indexes_activated,
    COUNT(CASE WHEN status = 'DELETED' THEN 1 END) as indexes_deleted
FROM search_index 
GROUP BY DATE(created_at)
ORDER BY activity_date DESC; 