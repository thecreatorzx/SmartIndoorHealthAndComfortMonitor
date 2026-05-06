// middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  const message = err.message ?? "Internal Server Error";

  // Zod validation errors — structured per-field response
  if (err.errors) {
    return res.status(status).json({
      error: message,
      errors: err.errors,
    });
  }

  // Postgres unique violation — catch here too so routes don't need to
  if (err.code === "23505") {
    return res.status(409).json({ error: "Resource already exists" });
  }

  // Generic fallback
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
