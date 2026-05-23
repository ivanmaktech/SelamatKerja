import { Pool } from 'pg';

// If no DATABASE_URL is provided, we default to a local standard postgres url
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/selamatkerja';

const pool = new Pool({
  connectionString,
  // Add SSL if we're connecting to the remote NovaCloud server but allow unauthorized certificates for demo purposes
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
