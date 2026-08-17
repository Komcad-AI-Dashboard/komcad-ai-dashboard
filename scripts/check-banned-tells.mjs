// Flags literal AI tells in displayed UI copy after every Edit/Write.
//
// Wired to a PostToolUse hook in .claude/settings.json so it runs without anyone
// remembering to. It only flags; it never blocks, and it always exits 0.
//
// Patterns come from docs/INITIAL_GUIDE_FOR_CLAUDE/banned_tells.txt. That file is the
// single source of truth. Extend it there, not here.
//
// Written in Node rather than shell because hooks run under whatever shell the OS
// provides. Bash syntax and $VAR expansion both break on Windows, and this repo is
// developed on Windows. Node is already a hard dependency of the project.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TELLS_FILE = join(ROOT, "docs", "INITIAL_GUIDE_FOR_CLAUDE", "banned_tells.txt");
const SCAN_DIR = join(ROOT, "app", "src");
const EXTENSIONS = [".ts", ".tsx"];

/**
 * The em-dash is in banned_tells.txt but is deliberately NOT checked here.
 * A sweep of app/src returns 184 hits, all of them this one character, and all of them
 * legitimate: it separates clauses throughout the Indonesian UI copy, and
 * DENSIFY_SPRINKLE_PLAYBOOK.md explicitly permits a literal em-dash as a no-data
 * placeholder in tables. Checking it would fire on every edit and train everyone to
 * ignore the hook, which costs more than the rule gains.
 *
 * Em-dash-as-texture is still discouraged. It is a judgment call for review, not a grep.
 */
const NOT_MECHANICALLY_CHECKABLE = new Set(["—"]);

function loadPatterns() {
  return readFileSync(TELLS_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !NOT_MECHANICALLY_CHECKABLE.has(line));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.some((ext) => full.endsWith(ext))) out.push(full);
  }
  return out;
}

function main() {
  let patterns;
  try {
    patterns = loadPatterns();
  } catch {
    // Guide folder missing (shallow checkout, or the folder was moved). Stay silent
    // rather than nagging about a file the developer may not have.
    return;
  }

  const findings = [];
  for (const file of walk(SCAN_DIR)) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((text, i) => {
      const lower = text.toLowerCase();
      for (const pattern of patterns) {
        if (lower.includes(pattern.toLowerCase())) {
          findings.push({
            location: `${relative(ROOT, file).replace(/\\/g, "/")}:${i + 1}`,
            pattern,
            text: text.trim().slice(0, 120),
          });
        }
      }
    });
  }

  if (findings.length === 0) return;

  console.error(`GUIDE CHECK: ${findings.length} possible AI tell(s) in displayed copy.`);
  for (const f of findings) {
    console.error(`  ${f.location}  ["${f.pattern}"]  ${f.text}`);
  }
  console.error("Source list: docs/INITIAL_GUIDE_FOR_CLAUDE/banned_tells.txt");
}

main();
