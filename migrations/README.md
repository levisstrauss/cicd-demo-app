# Database Migrations

This directory contains database migration scripts that are automatically applied during the CI/CD process.

## Migration Naming Convention

Migration files should follow the pattern: `YYYYMMDD_HHMMSS_description.sql`

For example: `20230615_143000_create_users_table.sql`

## Migration Process

Migrations are applied in order based on the timestamp prefix. Each migration is tracked in the `schema_migrations` table to ensure it's only applied once.

## Writing Migrations

- Each migration should be idempotent when possible
- Include both `up` and `down` migrations for rollback capability
- Use transactions when appropriate
- Comment your migrations well