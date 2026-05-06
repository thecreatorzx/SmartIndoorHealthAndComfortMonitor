import { useState, useEffect, useRef } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const userData = useRef(null);

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
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/login", { email, password });
      userData.current = res.data;
      setMessage("Login successful!");
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white px-4 sm:px-6">
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
        <h1 className="text-2xl sm:text-3xl font-light mb-2 text-center">Welcome back</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Sign in to your ComfortAI account</p>

        {/* form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 transition placeholder:text-slate-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 transition placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={success || loading}
            className="mt-2 bg-linear-to-br from-blue-500 to-violet-600 py-3 rounded-xl text-sm sm:text-base font-medium hover:opacity-90 active:opacity-70 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : success ? "Signed in!" : "Sign in"}
          </button>
        </form>

        {/* switch to signup */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:text-blue-300 transition"
            onClick={() => navigate("/signup")}
          >
            Sign up
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

export default Login;