-- Database initialization script for SecureInsure Pro
-- Creates all required databases for microservices

-- Create databases for all services
CREATE DATABASE IF NOT EXISTS secureinsure_auth;
CREATE DATABASE IF NOT EXISTS secureinsure_policy;
CREATE DATABASE IF NOT EXISTS secureinsure_claims;
CREATE DATABASE IF NOT EXISTS secureinsure_notifications;
CREATE DATABASE IF NOT EXISTS secureinsure_admin;
CREATE DATABASE IF NOT EXISTS secureinsure_search;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE secureinsure_auth TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_policy TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_claims TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_notifications TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_admin TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_search TO postgres;

-- Switch to each database and create extensions if needed
\c secureinsure_auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c secureinsure_policy;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c secureinsure_claims;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c secureinsure_notifications;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c secureinsure_admin;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c secureinsure_search;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";