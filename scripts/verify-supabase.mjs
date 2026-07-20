#!/usr/bin/env node
/** Verify Briefing Studio Supabase (separate project only). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRADE_DESK_REF = "uzbsuyknfnzqwdpzspfs";

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) {
    console.error("Missing .env.local — see SUPABASE-SETUP.md");
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq)] = t.slice(eq + 1);
  }
  return env;
}

function projectRef(env) {
  const match = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(
    /https:\/\/([^.]+)\.supabase\.co/
  );
  return env.SUPABASE_PROJECT_REF || match?.[1] || null;
}

async function loadSupabase() {
  const modPath = path.join(
    ROOT,
    "node_modules",
    "@supabase",
    "supabase-js",
    "dist",
    "module",
    "index.js"
  );
  if (!fs.existsSync(modPath)) {
    throw new Error("Run npm install first");
  }
  return import(pathToFileURL(modPath).href);
}

async function main() {
  const env = loadEnv();
  const ref = projectRef(env);

  if (ref === TRADE_DESK_REF) {
    console.error("ERROR: .env.local points at Trade Desk. Use a separate Briefing Studio project.");
    process.exit(1);
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase URL or service role key in .env.local");
    process.exit(1);
  }

  const { createClient } = await loadSupabase();
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const tables = ["briefings", "briefing_jobs", "sources"];
  for (const table of tables) {
    const { error } = await admin.from(table).select("id").limit(1);
    if (error) {
      console.error(`  ✗ ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ ${table}`);
    }
  }

  const { count, error } = await admin
    .from("briefings")
    .select("*", { count: "exact", head: true });

  if (!error) {
    console.log(`\nBriefings: ${count ?? 0} rows`);
  }

  console.log(`Project: ${ref || env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log("Ingest secret:", env.BRIEFING_INGEST_SECRET ? "set" : "missing");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
