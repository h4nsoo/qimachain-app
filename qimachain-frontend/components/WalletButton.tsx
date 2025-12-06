"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress, getChainName, isMetaMaskInstalled } from "@/lib/web3";
import {
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function WalletButton() {
  const { wallet, isConnecting, error, connectWallet, disconnectWallet } =
    useWallet();
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    // DEVELOPMENT MODE: Direct connection without MetaMask check
    await connectWallet();

    /* PRODUCTION CODE: Uncomment when ready for real Web3 integration
    if (!isMetaMaskInstalled()) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    await connectWallet();
    */
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (wallet?.address) {
      const explorerUrl =
        wallet.chainId === 1
          ? `https://etherscan.io/address/${wallet.address}`
          : `https://sepolia.etherscan.io/address/${wallet.address}`;
      window.open(explorerUrl, "_blank");
    }
  };

  if (!wallet) {
    return (
      <>
        <Button
          variant="luxury"
          size="sm"
          className="text-xs px-4 py-2"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2" size={14} />
              Connect Wallet
            </>
          )}
        </Button>

        {error && (
          <Dialog open={!!error} onOpenChange={() => connectWallet()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-400">
                  <AlertCircle className="mr-2" size={20} />
                  Connection Failed
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {error}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3">
                {!isMetaMaskInstalled() && (
                  <Button
                    variant="luxury"
                    onClick={() =>
                      window.open("https://metamask.io/download/", "_blank")
                    }
                    className="flex-1"
                  >
                    Install MetaMask
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleConnect}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant="luxury"
        size="sm"
        className="text-xs px-4 py-2"
        onClick={() => setShowDialog(true)}
      >
        <Wallet className="mr-2" size={14} />
        {formatAddress(wallet.address || "")}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Connected</DialogTitle>
            <DialogDescription>
              Your wallet is connected to QīmaChain
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Address */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Address</div>
              <div className="flex items-center justify-between">
                <code className="text-sm text-white">
                  {formatAddress(wallet.address || "")}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="text-green-400" size={16} />
                  ) : (
                    <Copy className="text-gray-400" size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Balance</div>
              <div className="text-lg font-semibold text-white">
                {parseFloat(wallet.balance || "0").toFixed(4)} ETH
              </div>
            </div>

            {/* Network */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Network</div>
              <div className="text-sm text-white">
                {getChainName(wallet.chainId || 1)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={openExplorer}
                className="flex-1"
              >
                <ExternalLink className="mr-2" size={14} />
                View on Explorer
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  disconnectWallet();
                  setShowDialog(false);
                }}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
