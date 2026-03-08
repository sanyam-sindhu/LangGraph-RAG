-- Run this as the postgres superuser:
-- psql -U postgres -f setup_local_postgres.sql

-- 1. Create user and database
CREATE USER raguser WITH PASSWORD 'ragpassword';
CREATE DATABASE ragdb OWNER raguser;

-- 2. Connect to ragdb and enable extensions
\c ragdb

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ragdb TO raguser;
GRANT ALL ON SCHEMA public TO raguser;
