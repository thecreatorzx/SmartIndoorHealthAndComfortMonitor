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
  const userData = useRef(null);
  

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      onLogin(userData.current);
      navigate("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      userData.current = res.data;
      setMessage("Login successful!");
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] text-white px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.15),transparent_40%)]" />
      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 pt-4 shadow-2xl">
        <div className="w-full text-right">
          <button onClick={() => navigate('/')} className="p-0.5 text-top text-2xl cursor-pointer rounded-xl border border-transparent hover:text-gray-300 hover:border-white">
            <TbArrowBackUp color="white" />
          </button>
        </div>
        <h1 className="text-3xl font-light mb-2 text-center">Welcome back</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Sign in to your ComfortAI account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={success}
            className="mt-2 bg-linear-to-br from-blue-500 to-violet-600 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <span className="text-blue-400 cursor-pointer" onClick={() => navigate("/signup")}>Sign up</span>
        </p>

        {message && (
          <div className={`mt-3 text-center text-sm ${success ? "text-green-400" : "text-red-400"}`}>
            {message}{success && " Redirecting..."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;