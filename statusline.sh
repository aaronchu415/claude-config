#!/usr/bin/env bash
# Claude Code statusline dispatcher.
# In copilot-backed sessions (claudex / claude-copilot set CLAUDEX_COPILOT=1),
# show the model/effort indicator plus GitHub Copilot quota from the local proxy.
# Otherwise fall back to ccusage unchanged.
input=$(cat)

if [[ -z "$CLAUDEX_COPILOT" ]]; then
  echo "$input" | bun x ccusage statusline
  exit 0
fi

cache=/tmp/copilot-usage-cache.json
now=$(date +%s)
mtime=$(stat -f %m "$cache" 2>/dev/null || echo 0)
if [[ ! -s "$cache" ]] || (( now - mtime > 60 )); then
  if curl -sf --max-time 2 http://localhost:4141/usage -o "$cache.tmp" 2>/dev/null; then
    mv "$cache.tmp" "$cache"
  fi
fi

CLAUDEX_INPUT="$input" python3 - "$cache" "$HOME/.claude/settings.json" <<'PY'
import os, sys, json, datetime

inp = json.loads(os.environ.get("CLAUDEX_INPUT", "{}"))
cache_path, settings_path = sys.argv[1], sys.argv[2]

m = inp.get("model", {})
model = m.get("display_name") or m.get("id") or "model"
effort = inp.get("effort") or inp.get("reasoningEffort") or ""
if not effort:
    try:
        effort = json.load(open(settings_path)).get("effortLevel", "")
    except Exception:
        effort = ""
label = f"\U0001f916 {model}" + (f" ({effort})" if effort else "")

credits = "\U0001f7e3 usage unavailable"
try:
    d = json.load(open(cache_path))
    p = d.get("quota_snapshots", {}).get("premium_interactions", {})
    ent, rem = p.get("entitlement", 0), p.get("remaining", 0)
    used = ent - rem
    reset = d.get("quota_reset_date", "")
    try:
        rd = datetime.date.fromisoformat(reset)
        days = (rd - datetime.date.today()).days
        when = f"resets {days}d ({rd.strftime('%b %-d')})"
    except Exception:
        when = f"resets {reset}"
    credits = f"\U0001f7e3 {used:,} / {ent:,} credits · {when}"
except Exception:
    pass

print(f"{label}  ·  {credits}")
PY
