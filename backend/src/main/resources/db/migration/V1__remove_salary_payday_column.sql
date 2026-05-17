-- Remove salary_payday column from employee table as it's now a global configuration
ALTER TABLE employee DROP COLUMN IF EXISTS salary_payday;
