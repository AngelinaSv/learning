-- Migration: create initial admin user
-- Prerequisites: PostgreSQL with pgcrypto extension available for crypt()
INSERT INTO "user" ("username", "email", "password", "role", "is_banned", "is_deleted", "created_at", "updated_at")
VALUES ('admin', 'admin@example.com', crypt('admin123', gen_salt('bf')), 0, false, false, NOW(), NOW());
