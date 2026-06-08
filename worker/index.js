/* =====================================================================
   Cloudflare Worker – Login-Schutz für "Mattis Mathe"
   - Alle Anfragen laufen zuerst durch diesen Worker (run_worker_first).
   - SSO: gültiges hk_session-Cookie (Familienportal, PIN-Login) → direkt
     weiter, ganz ohne eigenes Passwort.
   - Fallback: eigenes mm_auth-Cookie oder Passwort-Login (SITE_PASSWORD).
   - Nach richtigem Passwort: signiertes Cookie (HMAC-SHA256), 30 Tage gültig.
   - Mit gültigem Cookie werden die statischen Dateien aus public/ serviert.

   Benötigte Secrets / Variablen (per wrangler secret put):
     SESSION_SECRET    gemeinsam mit dem Portal (SSO!) – MUSS in allen
                       Familien-Workern denselben Wert haben.
     SITE_PASSWORD     Fallback-Passwort für den direkten Zugang
     AUTH_SECRET       signiert das eigene mm_auth-Cookie
     ANTHROPIC_API_KEY API-Schlüssel für die Foto-Korrektur (optional;
                       ohne ihn ist nur das Üben/Drucken aktiv)
   ===================================================================== */

const COOKIE = "mm_auth";
const HK_COOKIE = "hk_session"; // SSO-Cookie des Familienportals
const MAX_AGE = 60 * 60 * 24 * 30; // 30 Tage in Sekunden
const enc = new TextEncoder();

/* =====================================================================
   Lösungsschlüssel pro Arbeitsblatt.
   Matti füllt ein Blatt aus, fotografiert es, und die KI vergleicht
   seine handschriftlichen Antworten mit diesen Musterlösungen.

   NEUES THEMA HINZUFÜGEN:
   1. Hier einen neuen Eintrag ergänzen (id muss zu js/topics.js passen).
   2. Die Aufgaben mit kurzer Frage und richtiger Lösung auflisten.
   Mehr ist im Worker nicht nötig.
   ===================================================================== */
const WORKSHEETS = {
  flaeche: {
    titel: "Flächenberechnung",
    tasks: [
      { nr: "1", frage: "a) Rechteck a=9 cm, b=5 cm  b) Quadrat a=7 cm  c) Dreieck g=12 cm, h=6 cm",
        loesung: "a) 45 cm²  b) 49 cm²  c) 36 cm²" },
      { nr: "2", frage: "Parallelogramm g=11 cm, h=4 cm: a) Fläche  b) Fläche bei doppelter Höhe",
        loesung: "a) 44 cm²  b) 88 cm² (verdoppelt sich)" },
      { nr: "3", frage: "Trapez parallele Seiten a=14 cm und c=6 cm, Höhe h=5 cm: Fläche",
        loesung: "½·(14+6)·5 = 50 cm²" },
      { nr: "4", frage: "Kreis r=6 cm (π≈3,14): a) Fläche  b) Umfang",
        loesung: "a) π·36 ≈ 113,1 cm²  b) 2·π·6 ≈ 37,7 cm" },
      { nr: "5", frage: "Viertelkreis-Sektor α=90°, r=8 cm (π≈3,14): Fläche",
        loesung: "¼·π·64 = 16π ≈ 50,3 cm²" },
      { nr: "6", frage: "⭐ Rechteck 20×12 cm, Quadrat 5 cm herausgeschnitten: a) Rechteck  b) Quadrat  c) Restfläche",
        loesung: "a) 240 cm²  b) 25 cm²  c) 215 cm²" },
    ],
  },
  funktionen: {
    titel: "Funktionen",
    tasks: [
      { nr: "1", frage: "Gerade durch P(0|3) und Q(4|11): a) Steigung  b) y-Achsenabschnitt  c) Gleichung",
        loesung: "a) m = 2  b) b = 3  c) y = 2x + 3" },
      { nr: "2", frage: "y = −2x + 6: a) steigend/fallend  b) Schnittpunkt y-Achse  c) liegt P(1|4) darauf?",
        loesung: "a) fallend  b) (0|6)  c) ja (−2·1+6 = 4)" },
      { nr: "3", frage: "Öffnung der Parabel: a) y=3x²  b) y=−x²+2  c) y=½x²−4",
        loesung: "a) nach oben  b) nach unten  c) nach oben" },
      { nr: "4", frage: "Scheitelpunkt ablesen: a) y=(x−3)²+2  b) y=(x+5)²−1  c) y=−(x−2)²+4",
        loesung: "a) S(3|2)  b) S(−5|−1)  c) S(2|4)" },
      { nr: "5", frage: "Nullstellen durch Ausklammern: x² − 6x = 0",
        loesung: "x·(x−6)=0 → x₁=0, x₂=6" },
      { nr: "6", frage: "⭐ p-q-Formel: x² − 7x + 12 = 0",
        loesung: "x = 3,5 ± 0,5 → x₁=3, x₂=4" },
    ],
  },
};

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch (err) {
      // Statt eines nichtssagenden Cloudflare-1101 die echte Ursache zeigen.
      console.log("Worker-Fehler:", err && (err.stack || err.message || String(err)));
      return new Response(
        "Es ist ein interner Fehler aufgetreten. Bitte lade die Seite neu.\n\n" +
          (err && (err.stack || err.message || String(err))),
        { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
      );
    }
  }
};

async function handle(request, env) {
    const url = new URL(request.url);

    // --- Logout ---
    if (url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "/",
          "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
        }
      });
    }

    // --- Login absenden ---
    if (url.pathname === "/login" && request.method === "POST") {
      const form = await request.formData();
      const pw = (form.get("password") || "").toString();
      if (env.SITE_PASSWORD && timingSafeEqual(pw, env.SITE_PASSWORD)) {
        if (!env.AUTH_SECRET) {
          // Ohne AUTH_SECRET lässt sich kein signiertes Cookie erstellen.
          // Lieber eine klare Meldung als ein kryptischer Crypto-Crash.
          return new Response(
            "Konfigurationsfehler: Das Secret AUTH_SECRET ist nicht gesetzt. " +
              "Bitte setzen: wrangler secret put AUTH_SECRET --name matti-mathe",
            { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
          );
        }
        const token = await makeToken(env.AUTH_SECRET, MAX_AGE);
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/",
            "Set-Cookie": `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`
          }
        });
      }
      return loginResponse(true);
    }

    // --- Auth prüfen ---
    const cookies = parseCookie(request.headers.get("Cookie") || "");

    // SSO: gültiges Portal-Cookie (hk_session) reicht – kein eigenes Login.
    let ok = false;
    const hkToken = cookies[HK_COOKIE];
    if (hkToken && env.SESSION_SECRET) {
      ok = !!(await verifyPortalToken(hkToken, env));
    }

    // Fallback: eigenes mm_auth-Cookie (Passwort-Login).
    // Nur prüfen, wenn AUTH_SECRET gesetzt ist – sonst wirft die HMAC-Importe
    // bei leerem Schlüssel einen DataError (Crash statt Login-Seite).
    if (!ok) {
      const cookie = cookies[COOKIE];
      ok = !!(cookie && env.AUTH_SECRET && (await verifyToken(env.AUTH_SECRET, cookie)));
    }

    // --- Foto-Korrektur (nur eingeloggt) ---
    if (url.pathname === "/api/check-worksheet" && request.method === "POST") {
      if (!ok) return jsonResponse({ error: "Du bist nicht (mehr) angemeldet. Bitte lade die Seite neu und melde dich an." }, 401);
      return handleCheckWorksheet(request, env);
    }

    if (!ok) {
      return loginResponse(false);
    }

    // --- Eingeloggt: statische Datei ausliefern ---
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response(
        "Konfigurationsfehler: Das ASSETS-Binding fehlt. Die statischen Dateien wurden nicht mitdeployt.",
        { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
      );
    }
    return env.ASSETS.fetch(request);
}

/* ---------- Foto-Korrektur per Claude Vision ---------- */
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function handleCheckWorksheet(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: "Die Foto-Korrektur ist noch nicht eingerichtet. (Es fehlt der API-Schlüssel ANTHROPIC_API_KEY.)" }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: "Die Anfrage konnte nicht gelesen werden." }, 400); }

  const sheet = WORKSHEETS[body && body.worksheet];
  if (!sheet) return jsonResponse({ error: "Dieses Arbeitsblatt kenne ich nicht." }, 400);

  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s.exec((body && body.image) || "");
  if (!match) return jsonResponse({ error: "Ich habe kein gültiges Foto bekommen. Bitte versuch es noch einmal." }, 400);
  const mediaType = match[1];
  const imageData = match[2];

  const loesungsschluessel = sheet.tasks
    .map((t) => `Aufgabe ${t.nr}: ${t.frage}\n  → Richtige Lösung: ${t.loesung}`)
    .join("\n\n");

  const systemPrompt =
    "Du bist eine freundliche, motivierende Mathe-Lernhilfe für Matti, einen Schüler der 9. Klasse am Gymnasium (NRW). " +
    "Du korrigierst ein Foto eines von Hand ausgefüllten Arbeitsblatts. " +
    "Lies seine handschriftlichen Antworten so gut wie möglich und vergleiche sie mit den vorgegebenen Musterlösungen. " +
    "Wichtige Regeln: " +
    "1) Akzeptiere gleichwertige Schreibweisen als richtig (z. B. 1/2 = 0,5 = 50 %; gekürzt oder ungekürzt; mit oder ohne Einheit; " +
    "bei gerundeten Werten kleine Abweichungen durch Runden zulassen). " +
    "2) Sei ermutigend und sachlich, niemals abwertend. Benenne klar, was richtig ist. " +
    "3) Bei Fehlern: erkläre den richtigen Rechenweg in einem kurzen, klaren Satz – ohne ihn zu kritisieren. " +
    "4) Wenn ein Feld leer ist, setze status \"leer\". Wenn du die Handschrift nicht sicher lesen kannst, setze status \"unklar\" und frag freundlich nach. " +
    "5) Schreibe alles auf Deutsch, in klarer, altersgerechter Sprache mit „du“. Kurze Sätze.";

  const userText =
    `Das Foto zeigt das ausgefüllte Arbeitsblatt „${sheet.titel}“.\n\n` +
    `Hier sind die Aufgaben mit den richtigen Lösungen:\n\n${loesungsschluessel}\n\n` +
    `Gehe jede Aufgabe einzeln durch und gib für jede eine kurze, motivierende Rückmeldung. ` +
    `Schreibe am Ende ein Lob (was hat er gut gemacht?) und einen konkreten Tipp fürs Weiterüben.`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      aufgaben: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            nr: { type: "string" },
            status: { type: "string", enum: ["richtig", "fast", "falsch", "leer", "unklar"] },
            rueckmeldung: { type: "string" },
          },
          required: ["nr", "status", "rueckmeldung"],
        },
      },
      lob: { type: "string" },
      tipp: { type: "string" },
    },
    required: ["aufgaben", "lob", "tipp"],
  };

  let apiResp;
  try {
    apiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 3000,
        system: systemPrompt,
        output_config: { effort: "low", format: { type: "json_schema", schema } },
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
              { type: "text", text: userText },
            ],
          },
        ],
      }),
    });
  } catch {
    return jsonResponse({ error: "Die Korrektur ist gerade nicht erreichbar. Bitte versuch es gleich noch einmal." }, 502);
  }

  if (!apiResp.ok) {
    const detail = await apiResp.text().catch(() => "");
    console.log("Anthropic-Fehler", apiResp.status, detail.slice(0, 500));
    return jsonResponse({ error: "Die Korrektur hat nicht geklappt. Bitte versuch es gleich noch einmal." }, 502);
  }

  const data = await apiResp.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) return jsonResponse({ error: "Ich konnte das Foto leider nicht auswerten. Versuch es mit einem helleren, geraden Foto noch einmal." }, 502);

  let result;
  try { result = JSON.parse(textBlock.text); } catch {
    return jsonResponse({ error: "Ich konnte das Foto leider nicht auswerten. Versuch es mit einem helleren, geraden Foto noch einmal." }, 502);
  }

  return jsonResponse(result);
}

/* ---------- Portal-SSO (hk_session) ---------- */
// Verifiziert das vom Familienportal gesetzte Token:
//   base64url(JSON({u,n,d,a,c,e})) + "." + HMAC-SHA256(SESSION_SECRET)
async function verifyPortalToken(token, env) {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig     = token.slice(dot + 1);
  const expected = await hmacPortal(payload, env);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    let b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data.u || !data.e || Date.now() > data.e) return null;
    return data;
  } catch { return null; }
}
async function hmacPortal(data, env) {
  const secret = env.SESSION_SECRET || "dev-secret-hoffknecht-familie";
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ---------- Cookie-Token (HMAC) ---------- */
async function makeToken(secret, maxAgeSec) {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const sig = await hmac(secret, String(exp));
  return `${exp}.${sig}`;
}
async function verifyToken(secret, token) {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false; // abgelaufen
  const expected = await hmac(secret, exp);
  return timingSafeEqual(sig, expected);
}
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret || ""),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function parseCookie(str) {
  const out = {};
  str.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

/* ---------- Login-Seite ---------- */
function loginResponse(fehler) {
  return new Response(loginHtml(fehler), {
    status: fehler ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function loginHtml(fehler) {
  return `<!DOCTYPE html>
<html lang="de"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Anmelden – Mattis Mathe</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FBF8F3;
    font-family:"Atkinson Hyperlegible",Verdana,system-ui,sans-serif;color:#2A2E35}
  .karte{background:#fff;border:2px solid #E4DED3;border-radius:16px;padding:30px;
    width:min(360px,90vw);box-shadow:0 2px 10px rgba(60,50,30,.08);text-align:center}
  h1{font-size:1.5rem;margin:.2em 0}
  p{color:#5A6270}
  input{font:inherit;font-size:1.1rem;padding:12px 14px;width:100%;box-sizing:border-box;
    border:2px solid #E4DED3;border-radius:12px;margin:10px 0}
  button{font:inherit;font-weight:700;background:#0E7490;color:#fff;border:none;
    border-radius:12px;padding:12px 20px;width:100%;cursor:pointer}
  .fehler{color:#D14343;font-weight:700}
  .emoji{font-size:2.4rem}
  .portal-link{display:block;margin-top:1.2rem;color:#4338ca;font-weight:600;font-size:.95rem}
</style></head><body>
  <form class="karte" method="POST" action="/login">
    <div class="emoji">🔒📈</div>
    <h1>Mattis Mathe</h1>
    <p>Bitte das Passwort eingeben.</p>
    ${fehler ? '<p class="fehler">Passwort falsch – versuch es nochmal.</p>' : ""}
    <input type="password" name="password" placeholder="Passwort" autofocus autocomplete="current-password" required>
    <button type="submit">Anmelden</button>
    <a class="portal-link" href="https://familie.hoffknecht.de">🏠 Über Familienportal anmelden</a>
  </form>
</body></html>`;
}
