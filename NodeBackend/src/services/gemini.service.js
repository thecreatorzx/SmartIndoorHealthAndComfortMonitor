import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

function parseGeminiResponse(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    return { summary: text.trim(), recommendation: "See summary above." };
  }
}

// ─── Breach Insight ───────────────────────────────────────────────────────────

export async function generateBreachInsight(deviceCode, reading, breaches) {
  const breachedFields = Object.entries(breaches)
    .filter(([, v]) => v !== null)
    .map(([field, severity]) => `${field} (${severity})`);

  const prompt = `
You are an indoor environment health assistant analyzing sensor data from device "${deviceCode}".

Current sensor readings:
- Temperature: ${reading.temperature ?? "N/A"}°C
- Humidity: ${reading.humidity ?? "N/A"}%
- Air Quality Index: ${reading.air_quality ?? "N/A"} (approx ppm, MQ135 sensor)
- Noise Level: ${reading.noise ?? "N/A"} (30–100 scale)
- Light: ${reading.light ?? "N/A"} lux
- UV Index: ${reading.uv ?? "N/A"}
- Pressure: ${reading.pressure ?? "N/A"} hPa

Threshold breaches detected: ${breachedFields.join(", ")}

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "summary": "One sentence describing what is wrong and potential health impact",
  "recommendation": "One or two actionable sentences the user can do right now",
  "severity": "warning" or "critical"
}
`.trim();

  const raw = await callGemini(prompt);
  const parsed = parseGeminiResponse(raw);

  return {
    triggerType: "breach",
    breachedFields: Object.keys(breaches).filter((k) => breaches[k] !== null),
    summary: parsed.summary,
    recommendation: parsed.recommendation,
    severity: parsed.severity ?? "warning",
    sensorSnapshot: reading,
  };
}

// ─── Daily Digest ─────────────────────────────────────────────────────────────

export async function generateDailyDigest(deviceCode, readings) {
  if (!readings || readings.length === 0) return null;

  // Compute averages for the digest summary
  const avg = (field) => {
    const vals = readings.map((r) => r[field]).filter((v) => v != null);
    return vals.length
      ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
      : "N/A";
  };

  const prompt = `
You are an indoor environment health assistant generating a daily summary for device "${deviceCode}".

Average readings over the past 24 hours (${readings.length} samples):
- Temperature: ${avg("temperature")}°C
- Humidity: ${avg("humidity")}%
- Air Quality Index: ${avg("air_quality")} (approx ppm, MQ135 sensor)
- Noise Level: ${avg("noise")} (30–100 scale)
- Light: ${avg("light")} lux
- UV Index: ${avg("uv")}
- Pressure: ${avg("pressure")} hPa

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "summary": "2-3 sentences describing overall air quality and comfort trends for the day",
  "recommendation": "1-2 actionable suggestions to improve the environment tomorrow"
}
`.trim();

  const raw = await callGemini(prompt);
  const parsed = parseGeminiResponse(raw);

  return {
    triggerType: "digest",
    breachedFields: null,
    summary: parsed.summary,
    recommendation: parsed.recommendation,
    severity: null,
    sensorSnapshot: {
      averages: {
        temperature: avg("temperature"),
        humidity: avg("humidity"),
        air_quality: avg("air_quality"),
        noise: avg("noise"),
      },
    },
  };
}
