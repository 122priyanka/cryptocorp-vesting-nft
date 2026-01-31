import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { api } from "@/api/client";

export default function Login() {
  const navigate = useNavigate();
  const { address, isConnecting, error, connect } = useWallet();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!address) return;
    setAuthError(null);
    setAuthLoading(true);
    api
      .login(address)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Login failed";
        if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
          navigate("/signup", { replace: true });
          return;
        }
        setAuthError(msg);
      })
      .finally(() => setAuthLoading(false));
  }, [address, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            CryptoCorp
          </h1>
          <p className="text-slate-600 mt-2">
            Vesting & Member NFT — sign in with your wallet
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-600 text-sm mb-6">
            Connect your wallet to continue. New users will be directed to sign up.
          </p>

          {(error || authError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error ?? authError}
            </div>
          )}

          <button
            type="button"
            onClick={connect}
            disabled={isConnecting || !!address}
            className="w-full py-3.5 px-4 rounded-xl font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting || (address && authLoading)
              ? "Connecting…"
              : address
                ? "Checking account…"
                : "Connect Wallet"}
          </button>

          {address && !authError && (
            <p className="mt-4 text-center text-slate-500 text-sm">
              {authLoading ? "Verifying…" : "Redirecting…"}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Use a Web3 wallet (e.g. MetaMask) on the correct network.
        </p>
      </div>
    </div>
  );
}
