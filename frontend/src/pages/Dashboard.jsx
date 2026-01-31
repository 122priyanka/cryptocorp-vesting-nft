import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Contract } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { useWallet } from "@/contexts/WalletContext";
import { api } from "@/api/client";
import { config } from "@/config/env";
import { VESTING_ABI } from "@/abis/Vesting";
import { ipfsUrl } from "@/utils/ipfs";

const formatAmount = (bigIntAmount) => {
  try {
    return Number(BigInt(bigIntAmount) / BigInt(1e18));
  } catch {
    return String(bigIntAmount);
  }
};

const formatTime = (ts) => {
  const d = new Date(ts * 1000);
  return d.toLocaleString();
};

const isUnlocked = (releaseTime) => Date.now() / 1000 >= releaseTime;

export default function Dashboard() {
  const navigate = useNavigate();
  const { address, signer, connect, disconnect, switchNetwork, error } = useWallet();
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [nftMetadata, setNftMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimingIndex, setClaimingIndex] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (!signer) {
      setChainId(null);
      return;
    }
    signer.provider.getNetwork().then((n) => setChainId(Number(n.chainId))).catch(() => setChainId(null));
  }, [signer]);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .login(address)
      .then((u) => {
        setUser(u);
        if (u.nftTokenURI) {
          const url = ipfsUrl(u.nftTokenURI);
          fetch(url)
            .then((r) => r.json())
            .then(setNftMetadata)
            .catch(() => setNftMetadata(null));
        }
      })
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [address, navigate]);

  useEffect(() => {
    if (!address || !config.vestingContractAddress) return;
    if (signer) {
      const contract = new Contract(config.vestingContractAddress, VESTING_ABI, signer);
      contract
        .getSchedules(address)
        .then((raw) => {
          setSchedules(
            raw.map((s, i) => ({
              index: i,
              amount: s.amount,
              releaseTime: Number(s.releaseTime),
              claimed: s.claimed,
            }))
          );
        })
        .catch(() => setSchedules([]));
    }
  }, [address, signer]);

  const handleClaim = async (index) => {
    if (!signer || !config.vestingContractAddress) return;
    setClaimingIndex(index);
    try {
      const contract = new Contract(config.vestingContractAddress, VESTING_ABI, signer);
      const tx = await contract.claim(index);
      await tx.wait();
      toast.success("Tokens claimed successfully!");
      setSchedules((prev) =>
        prev.map((s) => (s.index === index ? { ...s, claimed: true } : s))
      );
    } catch (e) {
      console.error(e);
      toast.error("Claim failed. Check console for details.");
    } finally {
      setClaimingIndex(null);
    }
  };


  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">CryptoCorp Dashboard</h1>
          <p className="text-slate-600 mb-6">Connect your wallet to view your dashboard.</p>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={connect}
            className="py-3 px-6 rounded-xl font-medium bg-brand-500 text-white hover:bg-brand-600"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <Toaster position="bottom-right" />
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">CryptoCorp Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-mono text-sm truncate max-w-[180px]">
              {address}
            </span>
            <button
              type="button"
              onClick={disconnect}
              className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm"
            >
              Disconnect
            </button>
          </div>
        </header>

        {user && (
          <p className="text-slate-600 mb-6">
            Welcome, {user.name} ({user.email})
          </p>
        )}

        {chainId != null && chainId !== config.chainId && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">
              Wrong network. Switch to Localhost to view vesting and claim tokens.
            </p>
            <button
              type="button"
              onClick={switchNetwork}
              className="py-2 px-4 rounded-lg bg-amber-500 text-white font-medium text-sm shrink-0"
            >
              Switch to Local Network
            </button>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My NFT</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm shadow-sm">
            {nftMetadata ? (
              <>
                <img
                  src={ipfsUrl(nftMetadata.image || "")}
                  alt={nftMetadata.name || "Member Badge"}
                  className="w-full aspect-square object-cover rounded-xl mb-4"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <h3 className="font-semibold text-slate-900">{nftMetadata.name || "Member Badge"}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  {nftMetadata.description || "Welcome to CryptoCorp"}
                </p>
              </>
            ) : (
              <p className="text-slate-500">No NFT metadata loaded.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Vesting Schedules</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {schedules.length === 0 ? (
              <p className="p-6 text-slate-500">No vesting schedules.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-4 text-slate-600 font-medium">Amount (CCT)</th>
                      <th className="p-4 text-slate-600 font-medium">Unlock time</th>
                      <th className="p-4 text-slate-600 font-medium">Status</th>
                      <th className="p-4 text-slate-600 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.index} className="border-b border-slate-100">
                        <td className="p-4 text-slate-900 font-mono">{formatAmount(s.amount)}</td>
                        <td className="p-4 text-slate-600 text-sm">{formatTime(s.releaseTime)}</td>
                        <td className="p-4">
                          {s.claimed ? (
                            <span className="text-brand-600">Claimed</span>
                          ) : isUnlocked(s.releaseTime) ? (
                            <span className="text-amber-600">Unlocked</span>
                          ) : (
                            <span className="text-slate-500">Locked</span>
                          )}
                        </td>
                        <td className="p-4">
                          {!s.claimed && isUnlocked(s.releaseTime) && (
                            <button
                              type="button"
                              onClick={() => handleClaim(s.index)}
                              disabled={claimingIndex !== null}
                              className="py-2 px-4 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 text-sm"
                            >
                              {claimingIndex === s.index ? "Claiming…" : "Claim"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
