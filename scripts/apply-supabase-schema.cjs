#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseEnv(file) {
  const env = {};
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function main() {
  const projectDir = process.cwd();
  const envFile = process.argv[2] || path.join(projectDir, '.env.local');
  const schemaFile = process.argv[3] || path.join(projectDir, 'supabase/schema.sql');
  const env = parseEnv(envFile);
  const rawConn = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
  if (!rawConn) throw new Error(`Missing POSTGRES_URL_NON_POOLING/POSTGRES_URL in ${envFile}`);

  const connUrl = new URL(rawConn);
  connUrl.searchParams.set('sslmode', 'no-verify');
  const conn = connUrl.toString();

  const sql = fs.readFileSync(schemaFile, 'utf8');
  const client = new Client({ connectionString: conn });
  await client.connect();
  await client.query(sql);
  const result = await client.query("select to_regclass('public.orders') as orders_table");
  await client.end();
  console.log(`schema_applied=${Boolean(result.rows[0].orders_table)}`);
}

main().catch((err) => {
  console.error('schema_apply_failed=' + err.message);
  process.exit(1);
});
