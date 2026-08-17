# Guardrails playbook: making the guide enforced, not just intended

A guide you read once does not shape output; a rule that is loaded every turn
and a check that runs on every edit do. This folder's other files state the
standards (`session_guide.md`, `anti_ai_generated_guide_v3.md`,
`DENSIFY_SPRINKLE_PLAYBOOK.md`). This file is how you make a session actually
hold them. Project-agnostic: pair with the target repo.

## Why this exists

The standards lived only in this folder. The harness does not auto-load a
subfolder, so the rules applied only when the agent remembered to open them, and
it drifted (e.g. shipped em-dashes the guide bans). Fix: put the non-negotiables
where they load every session, and make the literal tells fail a check that does
not depend on anyone's attention.

## Two tiers

- **Mechanical** (literal, grep-able): em-dash, "welcome to", "oops", filler
  words. Caught by a hook + a banned-tells list. No judgment required.
- **Judgment** (not grep-able): claims-not-categories, every-number-anchored,
  cap 5-9, group-by-proximity-not-boxes, hedge budget, lede-the-surprise. These
  live in the loaded `CLAUDE.md` and the 30-second smell test in
  `anti_ai_generated_guide_v3.md`. No tool substitutes for running that test.

## The five steps (do these at project start)

1. **Root `CLAUDE.md`.** A compact list of non-negotiables at the repo root, so
   the harness loads it into context every session. Point to the full guides;
   do not duplicate them. (See this repo's `CLAUDE.md` for the shape.)

2. **`banned_tells.txt`** in this folder: one grep pattern per line (the literal
   AI tells). Extend it as new tells show up.

3. **Commit a `PostToolUse` hook** to `.claude/settings.json` (TRACKED, not
   `settings.local.json`) so every clone and session inherits it. Use a portable
   `$CLAUDE_PROJECT_DIR` path and point it at the repo's displayed-copy file
   (here `app/src/copy.ts`):

   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Edit|Write|MultiEdit",
           "hooks": [
             {
               "type": "command",
               "command": "m=$(grep -niEf \"$CLAUDE_PROJECT_DIR/INITIAL_GUIDE_FOR_CLAUDE/banned_tells.txt\" \"$CLAUDE_PROJECT_DIR/app/src/copy.ts\" 2>/dev/null); if [ -n \"$m\" ]; then printf 'GUIDE CHECK: possible AI tell(s) in app/src/copy.ts. Review and fix:\\n%s\\n' \"$m\"; fi"
             }
           ]
         }
       ]
     }
   }
   ```

   The hook prints matches into context after any edit and stays silent when
   copy is clean. It does not block; it flags.

4. **Verify step.** Add to the repo `CLAUDE.md`: after any copy edit, run
   `grep -niEf INITIAL_GUIDE_FOR_CLAUDE/banned_tells.txt <displayed-copy-file>`
   and clear every hit before committing. Belt to the hook's suspenders.

5. **Run the smell test** for the judgment tier before shipping any page.

## Committing the hook for other sessions (the important part)

The hook only travels to teammates and fresh clones if it is committed. Two
moves make that work:

- Put the hook in `.claude/settings.json` (project, tracked), NOT
  `.claude/settings.local.json` (which is per-user and gitignored). Local is for
  personal permissions; shared is for team behavior.
- If the repo gitignores `.claude/` wholesale, un-ignore just the shared file so
  it can be committed while local settings stay private:

  ```gitignore
  .claude/*
  !.claude/settings.json
  ```

- Use `$CLAUDE_PROJECT_DIR` in the command, never an absolute home path, so the
  hook works on any machine.

After that, `git add .claude/settings.json INITIAL_GUIDE_FOR_CLAUDE/banned_tells.txt`
and commit. A new session on a clone gets the hook automatically; a new project
copies this folder, follows steps 1-5, and points the paths at its own
displayed-copy file.

Note: a hook change usually takes effect on the next session reload.
