"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const pg_1 = require("pg");
// If no DATABASE_URL is provided, we default to a local standard postgres url
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/selamatkerja';
const pool = new pg_1.Pool({
    connectionString,
    // Add SSL if we're connecting to the remote NovaCloud server but allow unauthorized certificates for demo purposes
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});
const query = (text, params) => pool.query(text, params);
exports.query = query;
exports.default = pool;
