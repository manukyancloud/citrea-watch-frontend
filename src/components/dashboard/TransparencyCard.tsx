"use client";

import { useState } from "react";
import { GlassCard } from "./glass-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, ExternalLink, Globe, Shield } from "lucide-react";

const truncateMiddle = (value: string, head = 6, tail = 4) => {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

interface AddressItem {
  label: string;
  address: string;
  href: string;
  note?: string;
}

const vaultAddresses: AddressItem[] = [
  {
    label: "Clementine Vault (Bitcoin L1)",
    address: "bc1pl7grnght2uhp75wm03djde5a56syp06ssdjf7ucm4wkq0tetpqas5e20e9",
    href: "https://mempool.space/address/bc1pl7grnght2uhp75wm03djde5a56syp06ssdjf7ucm4wkq0tetpqas5e20e9",
    note: "Locked BTC on Bitcoin Network",
  },
];

const tokenAddresses: AddressItem[] = [
  {
    label: "WBTC.e",
    address: "0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d",
    href: "https://explorer.mainnet.citrea.xyz/address/0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d",
  },
  {
    label: "USDC.e",
    address: "0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839",
    href: "https://explorer.mainnet.citrea.xyz/address/0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839",
  },
  {
    label: "ctUSD",
    address: "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D",
    href: "https://explorer.mainnet.citrea.xyz/address/0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D",
    note: "Issued by MoonPay via M0",
  },
  {
    label: "USDT.e",
    address: "0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4",
    href: "https://explorer.mainnet.citrea.xyz/address/0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4",
  },
];

const ethereumBridgeAddresses: AddressItem[] = [
  {
    label: "USDC Bridge (Ethereum)",
    address: "0xdaa289CC487Cf95Ba99Db62f791c7E2d2a4b868E",
    href: "https://etherscan.io/address/0xdaa289CC487Cf95Ba99Db62f791c7E2d2a4b868E",
  },
  {
    label: "USDT Bridge (Ethereum)",
    address: "0x6925ccD29e3993c82a574CED4372d8737C6dbba6",
    href: "https://etherscan.io/address/0x6925ccD29e3993c82a574CED4372d8737C6dbba6",
  },
  {
    label: "WBTC Bridge (Ethereum)",
    address: "0x2c01390E10e44C968B73A7BcFF7E4b4F50ba76Ed",
    href: "https://etherscan.io/address/0x2c01390E10e44C968B73A7BcFF7E4b4F50ba76Ed",
  },
];

function AddressRow({ item }: { item: AddressItem }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white font-medium">{item.label}</span>
          {item.note && (
            <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20 ml-2 uppercase tracking-wider">
              {item.note}
            </span>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-xs text-gray-400 font-mono hover:text-orange-400 transition-colors"
              >
                <span>{truncateMiddle(item.address)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs glass-card border-[rgba(239,143,54,0.2)] text-xs text-foreground whitespace-pre-line text-left text-pretty break-all"
            >
              <p>{item.address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[rgba(239,143,54,0.2)] text-muted-foreground hover:text-[#EF8F36] hover:border-[rgba(239,143,54,0.4)] transition-colors"
              aria-label={`Copy ${item.label} address`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs glass-card border-[rgba(239,143,54,0.2)] text-xs text-foreground whitespace-pre-line text-left text-pretty"
          >
            <p>{copied ? "Copied" : "Copy address"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function TransparencyCard() {
  const [activeTab, setActiveTab] = useState<"bitcoin" | "ethereum" | "citrea">(
    "bitcoin"
  );

  return (
    <GlassCard
      title="On-Chain Verification"
      icon={<Shield className="w-4 h-4" />}
      tooltip="Canonical addresses to independently verify TVL and reserves."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-6 border-b border-[rgba(239,143,54,0.15)]">
          <button
            type="button"
            onClick={() => setActiveTab("bitcoin")}
            className={`pb-2 text-xs font-semibold tracking-wider transition-colors ${
              activeTab === "bitcoin"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Bitcoin L1
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ethereum")}
            className={`pb-2 text-xs font-semibold tracking-wider transition-colors ${
              activeTab === "ethereum"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Ethereum L1
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("citrea")}
            className={`pb-2 text-xs font-semibold tracking-wider transition-colors ${
              activeTab === "citrea"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Citrea
          </button>
        </div>

        <div className="min-h-[320px]">
          {activeTab === "bitcoin" && (
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider mb-3">
                Bitcoin L1 Vault
              </p>
              <div className="divide-y divide-[rgba(239,143,54,0.08)]">
                {vaultAddresses.map((item) => (
                  <AddressRow key={item.address} item={item} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "ethereum" && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-gray-500 tracking-wider">
                  ETHEREUM L1 SOURCE BRIDGES (LOCKED ASSETS)
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-500/10 text-slate-300 px-2 py-0.5 rounded border border-slate-400/20 uppercase tracking-wider">
                  <Globe className="w-3 h-3" />
                  Ethereum Mainnet
                </span>
              </div>
              <div className="divide-y divide-[rgba(239,143,54,0.08)]">
                {ethereumBridgeAddresses.map((item) => (
                  <AddressRow key={item.address} item={item} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "citrea" && (
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider mb-3">
                Canonical Token Contracts (Citrea)
              </p>
              <div className="divide-y divide-[rgba(239,143,54,0.08)]">
                {tokenAddresses.map((item) => (
                  <AddressRow key={item.address} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
