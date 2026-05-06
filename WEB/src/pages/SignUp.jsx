import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowBackUp } from "react-icons/tb";
import api from "../api/axios.js";

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const nameRegex = /^[a-zA-Z\s-]{2,}$/;

// ─── password strength ───────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/\d/.test(pw))              score++;
  if (/[@$!%*?&]/.test(pw))       score++;

  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500"    };
  if (score === 2) return { score, label: "Fair",   color: "bg-yellow-400" };
  if (score === 3) return { score, label: "Good",   color: "bg-blue-400"   };
  return           { score, label: "Strong", color: "bg-green-500"  };
}

const SignUp = ({ onLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const userData = useRef(null);

  const strength = getStrength(password);
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;
  const passwordMismatch = confirmPassword !== "" && password !== confirmPassword;

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      onLogin(userData.current);
      navigate("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameRegex.test(name)) {
      setMessage("Please enter a valid name (letters only, 2+ characters)");
      return;
    }
    if (!passRegex.test(password)) {
      setMessage("Password must be 8+ characters with an uppercase letter, a number, and a symbol");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/register", { name, email, password });
      userData.current = { id: res.data.id, name: res.data.name, email: res.data.email };
      setMessage(res.data.message);
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white px-4 sm:px-6 py-10">
      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.15),transparent_40%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 pt-4 shadow-2xl">

        {/* back button */}
        <div className="w-full text-right mb-1">
          <button
            onClick={() => navigate("/")}
            className="p-1 text-2xl cursor-pointer rounded-xl border border-transparent hover:text-gray-300 hover:border-white transition"
            aria-label="Go back"
          >
            <TbArrowBackUp color="white" />
          </button>
        </div>

        {/* heading */}
        <h1 className="text-2xl sm:text-3xl font-light mb-2 text-center">Create account</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Start monitoring your environment</p>

        {/* form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 transition placeholder:text-slate-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 transition placeholder:text-slate-500"
          />

          {/* password + strength bar */}
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`bg-white/5 border rounded-xl px-4 py-3 text-sm sm:text-base outline-none transition placeholder:text-slate-500 ${
                !password
                  ? "border-white/10 focus:border-blue-500"
                  : passRegex.test(password)
                  ? "border-green-500/50 focus:border-green-500"
                  : "border-red-500/40 focus:border-red-500"
              }`}
            />
            {/* strength bar */}
            {password && (
              <div className="flex items-center gap-2 px-1">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium ${
                  strength.score <= 1 ? "text-red-400" :
                  strength.score === 2 ? "text-yellow-400" :
                  strength.score === 3 ? "text-blue-400" : "text-green-400"
                }`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* confirm password */}
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`bg-white/5 border rounded-xl px-4 py-3 text-sm sm:text-base outline-none transition placeholder:text-slate-500 ${
              confirmPassword === ""
                ? "border-white/10 focus:border-blue-500"
                : passwordMismatch
                ? "border-red-500/50 focus:border-red-500"
                : "border-green-500/50 focus:border-green-500"
            }`}
          />

          {/* match hint */}
          {confirmPassword && (
            <p className={`-mt-2 text-xs px-1 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
              {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}

          <button
            type="submit"
            disabled={success || loading}
            className="mt-1 bg-linear-to-br from-blue-500 to-violet-600 py-3 rounded-xl text-sm sm:text-base font-medium hover:opacity-90 active:opacity-70 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </>
            ) : success ? "Account created!" : "Create account"}
          </button>
        </form>

        {/* switch to login */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>

        {/* status message */}
        {message && (
          <div className={`mt-3 text-center text-sm ${success ? "text-green-400" : "text-red-400"}`}>
            {message}{success && " Redirecting…"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;