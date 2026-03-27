import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowBackUp } from "react-icons/tb";
import api from "../api/axios.js";

const SignUp = ({ onLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const userData = useRef(null);
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const nameRegex = /^[a-zA-Z\s-]{2,}$/;


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
    if (!nameRegex.test(name)) {
      setMessage("Please enter a valid name (2-50 characters)");
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

    try {
      const res = await api.post('/auth/register', { name, email, password });
      userData.current = { id: res.data.id, name: res.data.name, email: res.data.email };
      setMessage(res.data.message);
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.15),transparent_40%)]" />

      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 pt-4 shadow-2xl">
        <div className="w-full text-right">
          <button
            onClick={() => navigate('/')}
            className="p-0.5 text-2xl cursor-pointer rounded-xl border border-transparent hover:text-gray-300 hover:border-white"
          >
            <TbArrowBackUp color="white" />
          </button>
        </div>

        <h1 className="text-3xl font-light mb-2 text-center">Create account</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Start monitoring your environment</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 ${password && !passRegex.test(password) && "focus:border-red-500"}`}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none ${
              confirmPassword === ""
                ? "focus:border-blue-500"
                : password !== confirmPassword
                ? "focus:border-red-500 border-red-500/50"
                : "focus:border-green-500 border-green-500/50"
            }`}
          />

          <button
            type="submit"
            disabled={success}
            className="mt-2 bg-linear-to-br from-blue-500 to-violet-600 py-3 rounded-xl hover:opacity-90 active:opacity-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <span className="text-blue-400 cursor-pointer" onClick={() => navigate("/login")}>
            Sign in
          </span>
        </p>

        {message && (
          <div className={`mt-3 text-center text-sm ${success ? "text-green-400" : "text-red-400"}`}>
            {message}{success && " Redirecting..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;