import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Lock, UserPlus, ArrowRight, AlertCircle, Eye } from "lucide-react";

export default function AuthTerminal() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, register, loginMutation, registerMutation } = useAuth();

  const activeMutation = mode === "login" ? loginMutation : registerMutation;
  const isPending = activeMutation.isPending;

  const serverError = activeMutation.error?.response?.data?.message;
  const fallbackError =
    mode === "login"
      ? "Unable to sign in. Please check your credentials."
      : "Account creation failed. Please try again.";

  const errorMessage = activeMutation.isError
    ? serverError || fallbackError
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login(usernameOrEmail, password);
      } else {
        await register(username, email, password);
      }
    } catch {
      // Retain identifier on error for easy user corrections
      setPassword("");
    }
  };

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    loginMutation.reset();
    registerMutation.reset();
  };

  const handleInputChange = (setter) => (e) => {
    if (activeMutation.isError) {
      activeMutation.reset();
    }
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-mono">
      <div className="relative z-10 w-full max-w-md border border-[#EAEAEA] bg-white p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#EAEAEA] pb-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-neutral-900 text-white px-3 py-1.5 shadow-xs">
            <Eye className="w-5 h-5 text-[#FF5500]" />
            <span className="text-base font-extrabold tracking-tight uppercase">
              Macho<span className="text-[#FF5500]">Pulse</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse ml-1" />
          </div>
          <p className="text-[11px] uppercase tracking-wider text-[#666]">
            Real-time Uptime & Status Monitoring
          </p>
        </div>

        {/* Mode Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {mode === "login" ? (
              <Lock className="w-4 h-4 text-[#FF5500]" />
            ) : (
              <UserPlus className="w-4 h-4 text-[#FF5500]" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-black">
              {mode === "login" ? "Sign In to Terminal" : "Register Account"}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 gap-2 border border-[#EAEAEA] p-1 bg-neutral-50">
          <button
            type="button"
            onClick={() => handleTabSwitch("login")}
            className={`py-1.5 text-xs font-bold uppercase transition-colors ${
              mode === "login"
                ? "bg-black text-white"
                : "text-[#666] hover:text-black cursor-pointer"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("register")}
            className={`py-1.5 text-xs font-bold uppercase transition-colors ${
              mode === "register"
                ? "bg-black text-white"
                : "text-[#666] hover:text-black cursor-pointer"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="border border-red-500 bg-red-50 p-2.5 flex items-start space-x-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "login" ? (
            <div>
              <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={handleInputChange(setUsernameOrEmail)}
                placeholder="alex or alex@example.com"
                className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
                  Username
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  value={username}
                  onChange={handleInputChange(setUsername)}
                  placeholder="alex_mercer"
                  className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  placeholder="alex@example.com"
                  className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] uppercase text-[#666] mb-1 font-semibold">
              Password
            </label>
            <input
              type="password"
              required
              minLength={mode === "register" ? 8 : 1}
              value={password}
              onChange={handleInputChange(setPassword)}
              placeholder="••••••••••••"
              className="w-full border border-[#EAEAEA] bg-neutral-50 px-3 py-2 text-xs text-black focus:border-[#FF5500] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FF5500] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>
              {isPending
                ? mode === "login"
                  ? "Authenticating..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign In to Terminal"
                  : "Create Account"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
