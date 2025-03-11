#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  database: process.env.DB_NAME || 'cicd_demo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  max: 10, // Max number of clients in the pool
  idleTimeoutMillis: 30000
};

// Create connection pool
const pool = new Pool(config);

// Path to migration files
const migrationsDir = path.join(__dirname, '..', 'migrations');

async function runMigrations() {
  let client;
  
  try {
    console.error('Starting database migrations...');
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Ensure we're in a transaction for safety
    await client.query('BEGIN');
    
    // Get list of already applied migrations
    const result = await client.query(
      'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = "schema_migrations")'
    );
    
    // If schema_migrations table doesn't exist yet, we won't have any applied migrations
    let appliedMigrations = [];
    if (result.rows[0].exists) {
      const { rows } = await client.query('SELECT version FROM schema_migrations');
      appliedMigrations = rows.map(row => row.version);
    }
    
    console.error(`Found ${appliedMigrations.length} previously applied migrations`);
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure we apply migrations in order
    
    console.error(`Found ${migrationFiles.length} migration files`);
    
    // Apply migrations that haven't been applied yet
    let appliedCount = 0;
    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      
      if (appliedMigrations.includes(migrationName)) {
        console.error(`Skipping already applied migration: ${file}`);
        continue;
      }
      
      console.error(`Applying migration: ${file}`);
      
      // Read and execute the migration
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      appliedCount++;
      
      console.error(`Successfully applied migration: ${file}`);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.error(`Applied ${appliedCount} new migrations`);
    console.error('Database migrations completed successfully');
    
  } catch (err) {
    // Rollback the transaction in case of error
    if (client) {
      await client.query('ROLLBACK');
    }
    
    console.error('Error applying migrations:', err);
    process.exit(1);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    
    // Close the pool
    await pool.end();
  }
}

// Run the migrations
runMigrations();