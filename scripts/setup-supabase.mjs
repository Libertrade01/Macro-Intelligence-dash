#!/usr/bin/env node
/**
 * Apply supabase/schema.sql to the Briefing Studio Supabase project.
 * Uses only briefing-studio/.env.local — never Trade Desk.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
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

function projectRefFromEnv(env) {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || null;
}

function assertNotTradeDesk(env) {
  const ref = projectRefFromEnv(env);
  if (ref === "uzbsuyknfnzqwdpzspfs") {
    console.error(
      "Refusing to apply schema: NEXT_PUBLIC_SUPABASE_URL points at Trade Desk."
    );
    console.error("Create a separate Supabase project for Briefing Studio.");
    console.error("See SUPABASE-SETUP.md");
    process.exit(1);
  }
}

async function runQuery(projectRef, token, query, readOnly = false) {
  const suffix = readOnly ? "/read-only" : "";
  let res;
  try {
    res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query${suffix}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );
  } catch (error) {
    throw new Error(
      `Network error (try NODE_OPTIONS=--use-system-ca on Windows): ${error?.cause?.message || error.message}`
    );
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${text.slice(0, 800)}`);
  }
  return text ? JSON.parse(text) : null;
}

function sqlEditorUrl(projectRef) {
  return `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
}

async function main() {
  const envPath = path.join(ROOT, ".env.local");
  const env = loadEnvFile(envPath);

  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local — copy .env.example and fill in your Briefing Studio project.");
    process.exit(1);
  }

  assertNotTradeDesk(env);

  const projectRef = projectRefFromEnv(env);
  if (!projectRef) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_REF in .env.local");
    process.exit(1);
  }

  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
    console.error("Create one at https://supabase.com/dashboard/account/tokens");
    console.error("\nOr paste supabase/schema.sql manually:");
    console.error(`  ${sqlEditorUrl(projectRef)}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(ROOT, "supabase", "schema.sql"), "utf8");
  try {
    await runQuery(projectRef, token, sql);
  } catch (error) {
    if (String(error.message).includes("401")) {
      console.error("Supabase Management API token expired (401).");
      console.error("Refresh at https://supabase.com/dashboard/account/tokens");
      console.error("\nOr paste supabase/schema.sql manually:");
      console.error(`  ${sqlEditorUrl(projectRef)}`);
      process.exit(1);
    }
    throw error;
  }

  console.log(`Applied schema to Briefing Studio project: ${projectRef}`);

  const rows = await runQuery(
    projectRef,
    token,
    `select table_name from information_schema.tables where table_schema = 'public' and table_name in ('briefings', 'briefing_jobs', 'sources') order by table_name`,
    true
  );
  console.log("Tables:", rows.map((r) => r.table_name).join(", ") || "(none)");

  console.log("\nNext: npm run verify:db");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
