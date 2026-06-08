#!/usr/bin/env bash
# Veröffentlicht "Mattis Mathe" auf Cloudflare unter matti.hoffknecht.de.
#
# Erwartet folgende Umgebungsvariablen (z. B. als Session-Secrets):
#   CLOUDFLARE_API_TOKEN   API-Token mit Rechten "Edit Cloudflare Workers"
#   CLOUDFLARE_ACCOUNT_ID  die Account-ID
#   SITE_PASSWORD          das Login-Passwort für Matti
#   AUTH_SECRET            optional; wird sonst zufällig erzeugt
#   ANTHROPIC_API_KEY      optional; aktiviert die 📸 Foto-Korrektur
#
# Aufruf:  bash tools/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

fehlt=0
for v in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID SITE_PASSWORD; do
  if [ -z "${!v:-}" ]; then echo "❌ $v fehlt"; fehlt=1; fi
done
[ "$fehlt" = "1" ] && { echo "Bitte fehlende Variablen setzen und erneut starten."; exit 1; }

# AUTH_SECRET erzeugen, falls nicht gesetzt
if [ -z "${AUTH_SECRET:-}" ]; then
  AUTH_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  echo "🔑 AUTH_SECRET automatisch erzeugt."
fi

echo "📦 Worker + Dateien hochladen ..."
npx wrangler deploy

echo "🔒 Secrets setzen ..."
printf '%s' "$SITE_PASSWORD" | npx wrangler secret put SITE_PASSWORD
printf '%s' "$AUTH_SECRET"  | npx wrangler secret put AUTH_SECRET

if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  printf '%s' "$ANTHROPIC_API_KEY" | npx wrangler secret put ANTHROPIC_API_KEY
  echo "📸 Foto-Korrektur aktiviert (ANTHROPIC_API_KEY gesetzt)."
else
  echo "ℹ️  ANTHROPIC_API_KEY nicht gesetzt – Foto-Korrektur bleibt inaktiv."
fi

echo "✅ Fertig. Aufrufbar unter: https://matti.hoffknecht.de"
echo "   (Beim ersten Besuch nach dem Passwort gefragt.)"
