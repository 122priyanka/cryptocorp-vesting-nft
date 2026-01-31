import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { api } from "@/api/client";

export default function Signup() {
  const navigate = useNavigate();
  const { address, isConnecting, error, connect } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) return;
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      await api.signup({ name: name.trim(), email: email.trim(), walletAddress: address });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const canSubmit = name.trim() && email.trim() && address && !submitLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            CryptoCorp
          </h1>
          <p className="text-slate-600 mt-2">
            Create your account and receive your Member Badge NFT + signup bonus
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Sign up</h2>
          <p className="text-slate-600 text-sm mb-6">
            You’ll receive a Member Badge NFT and 1000 CCT tokens (vested for 1 day).
          </p>

          {!address ? (
            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="w-full py-3.5 px-4 rounded-xl font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Wallet
                </label>
                <p className="text-slate-600 text-sm font-mono truncate px-4 py-2 bg-slate-50 rounded-lg border border-slate-300">
                  {address}
                </p>
              </div>

              {(error || submitError) && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error ?? submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3.5 px-4 rounded-xl font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitLoading ? "Registering…" : "Register"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
          >
            ← Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
