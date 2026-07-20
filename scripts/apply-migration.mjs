#!/usr/bin/env node
/** Apply a SQL migration file via Supabase Management API. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRADE_DESK_REF = "uzbsuyknfnzqwdpzspfs";

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let val = t.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[t.slice(0, eq)] = val;
  }
  return env;
}

function projectRef(env) {
  const match = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(
    /https:\/\/([^.]+)\.supabase\.co/
  );
  return env.SUPABASE_PROJECT_REF || match?.[1] || null;
}

async function runQuery(projectRef, token, query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${text.slice(0, 800)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: node scripts/apply-migration.mjs <migration.sql>");
    process.exit(1);
  }

  const env = loadEnv();
  const ref = projectRef(env);
  const token = env.SUPABASE_ACCESS_TOKEN;

  if (ref === TRADE_DESK_REF) {
    console.error("Refusing: points at Trade Desk project.");
    process.exit(1);
  }

  if (!ref || !token) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ACCESS_TOKEN");
    process.exit(1);
  }

  const sqlPath = path.isAbsolute(fileArg) ? fileArg : path.join(ROOT, fileArg);
  const sql = fs.readFileSync(sqlPath, "utf8");

  await runQuery(ref, token, sql);
  console.log(`Applied: ${path.relative(ROOT, sqlPath)}`);
  console.log(`Project: ${ref}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
