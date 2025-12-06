/**
 * Wallet connection context for global state management
 */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  connectWallet as connectWeb3Wallet,
  disconnectWallet as disconnectWeb3Wallet,
  getCurrentWallet,
  onAccountsChanged,
  onChainChanged,
  WalletState,
} from "@/lib/web3";

interface WalletContextType {
  wallet: WalletState | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const currentWallet = await getCurrentWallet();
      if (currentWallet) {
        setWallet(currentWallet);
      }
    };
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setWallet(null);
        disconnectWeb3Wallet();
      } else {
        // Account changed, refresh wallet state
        const currentWallet = await getCurrentWallet();
        setWallet(currentWallet);
      }
    };

    const handleChainChanged = async (chainId: string) => {
      // Network changed, refresh wallet state
      const currentWallet = await getCurrentWallet();
      setWallet(currentWallet);
    };

    onAccountsChanged(handleAccountsChanged);
    onChainChanged(handleChainChanged);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletState = await connectWeb3Wallet();
      setWallet(walletState);

      // Store in session storage
      if (walletState.address) {
        sessionStorage.setItem("walletAddress", walletState.address);
        sessionStorage.setItem("walletConnected", "true");
      }
    } catch (err: any) {
      setError(err.message);
      setWallet(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    disconnectWeb3Wallet();
    setWallet(null);
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
