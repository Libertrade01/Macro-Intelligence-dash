import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const text = readFileSync(".env.local", "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/delete-episode.mjs <slug>");
  process.exit(1);
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { error } = await supabase.from("briefings").delete().eq("slug", slug);

if (error) {
  console.error("Delete failed:", error.message);
  process.exit(1);
}

console.log("Deleted:", slug);
