#!/usr/bin/env node
/**
 * Create Briefing Studio Supabase project via Management API.
 * Reads SUPABASE_ACCESS_TOKEN from briefing-studio/.env.local
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRADE_DESK_REF = "uzbsuyknfnzqwdpzspfs";
const PROJECT_NAME = "briefing-studio";

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
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

function saveEnvLocal(values) {
  const body = [
    "# Briefing Studio — separate Supabase project (NOT Trade Desk)",
    `NEXT_PUBLIC_SUPABASE_URL=${values.url}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${values.anon}`,
    `SUPABASE_SERVICE_ROLE_KEY=${values.serviceRole}`,
    `SUPABASE_PROJECT_REF=${values.ref}`,
    values.accessToken ? `SUPABASE_ACCESS_TOKEN=${values.accessToken}` : "",
    `BRIEFING_INGEST_SECRET=${values.ingestSecret}`,
    "",
  ]
    .filter((line, i, arr) => line || i < arr.length - 1)
    .join("\n");
  fs.writeFileSync(path.join(ROOT, ".env.local"), body, "utf8");
}

async function api(token, method, pathSuffix, body) {
  let res;
  try {
    res = await fetch(`https://api.supabase.com/v1${pathSuffix}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(
      `Network error (try NODE_OPTIONS=--use-system-ca): ${error?.cause?.message || error.message}`
    );
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

async function runSql(token, projectRef, query) {
  return api(token, "POST", `/projects/${projectRef}/database/query`, { query });
}

async function waitForHealthy(token, projectRef, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const health = await api(token, "GET", `/projects/${projectRef}/health`);
      const db = Array.isArray(health)
        ? health.find((h) => h.name === "db")
        : null;
      if (db?.status === "ACTIVE_HEALTHY" || db?.healthy === true) {
        return;
      }
    } catch {
      // project still provisioning
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 15000));
  }
  console.warn("\nProject may still be provisioning — continuing anyway.");
}

async function main() {
  const local = loadEnvFile(path.join(ROOT, ".env.local"));
  const token = local.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN.");
    console.error("Create one at https://supabase.com/dashboard/account/tokens");
    console.error("Add to briefing-studio/.env.local and re-run: npm run create:project");
    process.exit(1);
  }

  const orgs = await api(token, "GET", "/organizations");
  if (!orgs?.length) {
    throw new Error("No Supabase organizations found on this account");
  }

  const org = orgs[0];
  const orgSlug = org.slug || org.id;
  console.log(`Organization: ${org.name} (${orgSlug})`);

  const existing = await api(token, "GET", "/projects");
  let project = existing.find(
    (p) => p.name === PROJECT_NAME || p.ref?.includes("briefing")
  );

  if (project) {
    console.log(`Using existing project: ${project.name} (${project.ref})`);
  } else {
    const dbPass = crypto.randomBytes(24).toString("base64url");
    console.log(`Creating project "${PROJECT_NAME}"...`);
    project = await api(token, "POST", "/projects", {
      name: PROJECT_NAME,
      organization_slug: orgSlug,
      db_pass: dbPass,
      region: "us-west-2",
    });
    console.log(`Created: ${project.ref}`);
    console.log("Waiting for database (up to ~10 min)");
    await waitForHealthy(token, project.ref);
    console.log("\nProject healthy.");
  }

  if (project.ref === TRADE_DESK_REF) {
    throw new Error("Refusing to use Trade Desk project ref");
  }

  const keys = await api(token, "GET", `/projects/${project.ref}/api-keys`);
  const anon = keys.find((k) => k.name === "anon")?.api_key;
  const serviceRole = keys.find((k) => k.name === "service_role")?.api_key;

  if (!anon || !serviceRole) {
    throw new Error("Could not fetch API keys for new project");
  }

  const ingestSecret =
    local.BRIEFING_INGEST_SECRET || crypto.randomBytes(32).toString("hex");

  saveEnvLocal({
    url: `https://${project.ref}.supabase.co`,
    anon,
    serviceRole,
    ref: project.ref,
    accessToken: token,
    ingestSecret,
  });
  console.log("Wrote .env.local");

  const sql = fs.readFileSync(path.join(ROOT, "supabase", "schema.sql"), "utf8");
  await runSql(token, project.ref, sql);
  console.log("Applied supabase/schema.sql");

  console.log("\nDone.");
  console.log(`Dashboard: https://supabase.com/dashboard/project/${project.ref}`);
  console.log(`Save BRIEFING_INGEST_SECRET on Hermes VPS for ingest API.`);
}

main().catch((err) => {
  if (String(err.message).includes("401")) {
    console.error("Supabase access token expired or invalid (401).");
    console.error("Create a new token: https://supabase.com/dashboard/account/tokens");
    console.error("Add SUPABASE_ACCESS_TOKEN to briefing-studio/.env.local");
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
