const THRESHOLDS = {
  temperature: {
    warning: { min: 18, max: 30 },
    critical: { min: 10, max: 38 },
  },
  humidity: {
    warning: { min: 30, max: 70 },
    critical: { min: 20, max: 85 },
  },
  air_quality: {
    warning: { max: 1000 },
    critical: { max: 2500 },
  },
  noise: {
    warning: { max: 75 },
    critical: { max: 90 },
  },
  uv: {
    warning: { max: 6 },
    critical: { max: 8 },
  },
  light: {
    warning: { max: 1000 },
    critical: { max: 2000 },
  },
  pressure: {
    warning: { min: 990, max: 1025 },
    critical: { min: 970, max: 1040 },
  },
};

export function getSeverity(field, value) {
  const t = THRESHOLDS[field];
  if (!t) return null;

  const breaches = (level) => {
    const b = t[level];
    if (!b) return false;
    return (
      (b.max !== undefined && value > b.max) ||
      (b.min !== undefined && value < b.min)
    );
  };

  if (breaches("critical")) return "critical";
  if (breaches("warning")) return "warning";
  return null;
}

export function checkThresholds(reading) {
  const result = {};

  for (const field of [
    "temperature",
    "humidity",
    "air_quality",
    "noise",
    "uv",
    "light",
    "pressure",
  ]) {
    const value = reading[field];
    result[field] = value != null ? getSeverity(field, value) : null;
  }

  return result;
}
