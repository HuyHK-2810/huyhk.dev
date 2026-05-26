# Daily AI publishing — launchd setup (macOS)

The recommended way to schedule `scripts/daily-publish-cli.mjs` on macOS is a
**LaunchAgent**, not crontab. Reason: `claude` CLI reads its OAuth token from
Keychain, which requires a user-session security context. `crontab` jobs run
without that context and fail with `Not logged in · Please run /login`.

A LaunchAgent in `~/Library/LaunchAgents/` runs in the user's GUI session and
has Keychain access automatically.

## 1. Install

The plist is already at `~/Library/LaunchAgents/dev.huyhk.daily-publish.plist`.
It fires every day at 09:00 local time.

```bash
launchctl load ~/Library/LaunchAgents/dev.huyhk.daily-publish.plist
launchctl list | grep dev.huyhk       # → 'dev.huyhk.daily-publish' should appear
```

## 2. Test fire (manual trigger)

```bash
launchctl start dev.huyhk.daily-publish
tail -f /tmp/huyhk-publish.log
```

Expect ~80–120s. On success: `✓ Draft created.` with the admin review URL.

## 3. Customize

Edit `~/Library/LaunchAgents/dev.huyhk.daily-publish.plist`:

| Knob | Where to change |
|---|---|
| Schedule | `StartCalendarInterval` block — `Hour`/`Minute` are local time. Use multiple `dict` entries in an `array` for multiple times per day. |
| Node path | `ProgramArguments[2]` — if you change Node versions (NVM), update this path. |
| Site URL | `EnvironmentVariables.AI_PUBLISH_SITE` — set to `https://huyhk.dev` for prod cron. |
| Locale | Append `--locale=en` or `--locale=vi` after `daily-publish-cli.mjs` in `ProgramArguments[2]` to pin language. Default alternates by day-of-epoch. |
| Run-on-load | Set `RunAtLoad` to `true` to also run once when the plist loads (e.g. after reboot). |

After editing, reload:

```bash
launchctl unload ~/Library/LaunchAgents/dev.huyhk.daily-publish.plist
launchctl load   ~/Library/LaunchAgents/dev.huyhk.daily-publish.plist
```

## 4. Disable / remove

```bash
# Temporarily disable
launchctl unload ~/Library/LaunchAgents/dev.huyhk.daily-publish.plist

# Permanently remove
rm ~/Library/LaunchAgents/dev.huyhk.daily-publish.plist
```

## 5. Logs

`/tmp/huyhk-publish.log` — combined stdout + stderr (script uses `console.error`
for status, so all output lands here). `/tmp/` is cleared on each reboot;
move to `~/Library/Logs/huyhk-publish.log` in the plist if you want persistent
logs.

## 6. Prerequisites

- `claude` CLI authenticated **once** as your user (run `claude` interactively,
  complete OAuth in browser, then exit). The Keychain stores the token; the
  LaunchAgent inherits the session.
- Node.js installed (path hardcoded in plist — adjust if Node moves).
- Dev server running at `AI_PUBLISH_SITE` OR plist updated to point at prod
  (`https://huyhk.dev`).
- `.env.local` in the project directory with `ADMIN_TOKEN` set.

## 7. Why not crontab?

Crontab on macOS:

- Runs without Keychain session → `claude` says "Not logged in"
- Needs Full Disk Access for the `cron` binary in System Settings → Privacy
- Stripped `$PATH` — must use absolute paths everywhere
- No native sleep-wake handling — missed runs while machine is asleep are lost

LaunchAgent handles all of these.

## 8. Dev server vs production

The plist currently points at `http://localhost:3000`. The cron job only works
**while `npm run dev` is running locally**. Two paths for real daily cron:

**Option A — keep dev server alive:** add a second LaunchAgent that starts
`npm run dev` at login:

```xml
<!-- ~/Library/LaunchAgents/dev.huyhk.dev-server.plist -->
<key>Label</key><string>dev.huyhk.dev-server</string>
<key>ProgramArguments</key>
<array>
  <string>/bin/bash</string><string>-lc</string>
  <string>cd /Users/huyhk/dev/huyhk2810/huyhk.dev &amp;&amp; npm run dev</string>
</array>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
```

**Option B — point at production:** once deployed to Vercel, edit the publish
plist's `AI_PUBLISH_SITE` env var to `https://huyhk.dev`. The cron then runs
against prod and `npm run dev` is not required. Drafts land in the prod
Supabase via the prod API endpoint.

## 9. Sleeping Mac caveat

LaunchAgents don't run while the Mac is asleep. If you close the laptop at
night and reopen at 10:00, the 09:00 fire is **missed**, not deferred. Two
options if this matters:

- Use `pmset` to schedule wake — `sudo pmset repeat wakeorpoweron MTWRFSU 8:55:00`
- Move the cron to a 24/7 host (Vercel cron, GitHub Actions, small VPS) using
  the API-key variant of the script — see the comment in
  `scripts/daily-publish-cli.mjs` for the alternative entrypoint
