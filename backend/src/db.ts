import { Pool } from 'pg';

// If no DATABASE_URL is provided, we default to a local standard postgres url
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/selamatkerja';

// Use a global pool to avoid creating new pools on every serverless invocation
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __selamatkerja_pg_pool__: Pool | undefined;
}

if (!global.__selamatkerja_pg_pool__) {
  global.__selamatkerja_pg_pool__ = new Pool({
    connectionString,
    // Add SSL if we're connecting to a remote DB; allow unauthorized for demo environments
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  global.__selamatkerja_pg_pool__.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
  });
}

const pool = global.__selamatkerja_pg_pool__ as Pool;

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
