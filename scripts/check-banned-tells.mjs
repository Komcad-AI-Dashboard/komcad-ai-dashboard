// Flags literal AI tells in prose and displayed UI copy after every Edit/Write.
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

const EM_DASH = "—";

/**
 * Two areas, deliberately different rules.
 *
 * `app/src` is UI copy, and the em-dash is NOT checked there. A sweep returns 184 hits, all of
 * them this one character and all legitimate: it separates clauses throughout the Indonesian
 * copy, and DENSIFY_SPRINKLE_PLAYBOOK.md explicitly permits a literal em-dash as a no-data
 * placeholder in tables. Checking it would fire on every edit and train everyone to ignore the
 * hook, which costs more than the rule gains.
 *
 * `docs` is prose a person reads: reports, comments sent to the client, handover notes. There the
 * em-dash IS the tell the guide means, so it is checked in full.
 *
 * The split was added after a document of comments written for the QA reviewer shipped with 15
 * em-dashes in it. The hook stayed silent not because the rule was lenient but because `docs` was
 * never scanned at all — the scan covered only `app/src`.
 */
const SCAN_TARGETS = [
  { dir: join(ROOT, "app", "src"), extensions: [".ts", ".tsx"], skipEmDash: true },
  { dir: join(ROOT, "docs"), extensions: [".md"], skipEmDash: false },
];

/** The guide itself quotes the very patterns it bans, so scanning it reports itself. */
const IGNORED_PATHS = ["docs/INITIAL_GUIDE_FOR_CLAUDE/"];

function loadPatterns() {
  return readFileSync(TELLS_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function walk(dir, extensions, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, extensions, out);
    else if (extensions.some((ext) => full.endsWith(ext))) out.push(full);
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

  for (const target of SCAN_TARGETS) {
    let files;
    try {
      files = walk(target.dir, target.extensions);
    } catch {
      continue; // target folder absent in this checkout
    }

    const active = target.skipEmDash ? patterns.filter((p) => p !== EM_DASH) : patterns;

    for (const file of files) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (IGNORED_PATHS.some((p) => rel.startsWith(p))) continue;

      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((text, i) => {
        const lower = text.toLowerCase();
        for (const pattern of active) {
          if (lower.includes(pattern.toLowerCase())) {
            findings.push({ location: `${rel}:${i + 1}`, pattern, text: text.trim().slice(0, 120) });
          }
        }
      });
    }
  }

  if (findings.length === 0) return;

  console.error(`GUIDE CHECK: ${findings.length} possible AI tell(s).`);
  for (const f of findings) {
    console.error(`  ${f.location}  ["${f.pattern}"]  ${f.text}`);
  }
  console.error("Source list: docs/INITIAL_GUIDE_FOR_CLAUDE/banned_tells.txt");
}

main();
