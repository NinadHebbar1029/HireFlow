-- Add more professional fields to recruiter_profiles table
USE hireflow_db;

ALTER TABLE recruiter_profiles
ADD COLUMN industry VARCHAR(100) AFTER location,
ADD COLUMN company_size VARCHAR(50) AFTER industry,
ADD COLUMN founded_year INT AFTER company_size,
ADD COLUMN contact_email VARCHAR(255) AFTER founded_year,
ADD COLUMN contact_phone VARCHAR(20) AFTER contact_email,
ADD COLUMN linkedin_url VARCHAR(255) AFTER contact_phone,
ADD COLUMN twitter_url VARCHAR(255) AFTER linkedin_url,
ADD COLUMN headquarters VARCHAR(255) AFTER twitter_url,
ADD COLUMN employee_benefits TEXT AFTER headquarters,
ADD COLUMN company_culture TEXT AFTER employee_benefits;
