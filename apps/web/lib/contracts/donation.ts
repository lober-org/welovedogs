import { Keypair, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { getConfig } from "@/lib/config";

type DonationModule = typeof import("@stellar/stellar-sdk/contract");

let modulePromise: Promise<
  (DonationModule & { Client: any; networks?: Record<string, any> }) | null
> | null = null;

function getBindingModuleId(): string {
  const moduleId =
    process.env.DONATION_BINDING || process.env.NEXT_PUBLIC_DONATION_BINDING || "donation"; // Default to package name

  // For simplicity, always use the package name "donation"
  // The package should be installed via npm and resolvable by Node.js module resolution
  // If a path is provided, we'll try to use it, but fallback to package name
  if (moduleId.startsWith(".") || moduleId.startsWith("/")) {
    // For relative paths, use package name instead (simpler and more reliable)
    return "donation";
  }

  return moduleId;
}

async function loadModule() {
  if (!modulePromise) {
    modulePromise = (async () => {
      const moduleId = getBindingModuleId();
      try {
        // Use proper dynamic import for both client and server
        if (typeof window === "undefined") {
          // Server-side: use regular dynamic import
          return (await import(moduleId)) as DonationModule & {
            Client: any;
            networks?: Record<string, any>;
          };
        } else {
          // Client-side: use eval-based dynamic import
          // biome-ignore lint/security/noGlobalEval: Required for dynamic import in browser
          const dynamicImport: (s: string) => Promise<any> = (0, eval)("import");
          return (await dynamicImport(moduleId)) as Promise<
            DonationModule & { Client: any; networks?: Record<string, any> }
          >;
        }
      } catch (error) {
        // If module not found, return null to allow graceful degradation
        console.warn(
          "Donation contract bindings not found, contract recording will be skipped:",
          error
        );
        return null;
      }
    })();
  }
  return modulePromise;
}

type ClientOptions = {
  networkPassphrase?: string;
  contractId?: string;
  rpcUrl?: string;
  secretKey?: string;
  publicKey?: string;
  signTransaction?: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string }
  ) => Promise<{ signedTxXdr: string; signerAddress?: string }>;
  [key: string]: unknown;
};

export async function createDonationClient(overrides: ClientOptions = {}) {
  const mod = await loadModule();
  if (!mod || typeof mod.Client !== "function") {
    throw new Error("DONATION binding is not available. Contract recording will be skipped.");
  }
  const cfg = getConfig();
  const networks = mod.networks ?? {};
  const preferredNetwork =
    networks[cfg.stellarNetwork as keyof typeof networks] ?? networks.testnet ?? {};

  const contractId = process.env.DONATION_CONTRACT_ID ?? preferredNetwork?.contractId;
  if (!contractId) {
    throw new Error(
      "Contract ID not found. Set DONATION_CONTRACT_ID or ensure the bindings include networks.testnet.contractId."
    );
  }

  const networkPassphrase =
    overrides.networkPassphrase ??
    preferredNetwork?.networkPassphrase ??
    (cfg.stellarNetwork === "testnet" ? "Test SDF Network ; September 2015" : undefined);

  if (!networkPassphrase) {
    throw new Error(
      "Network passphrase not configured. Set DONATION_CONTRACT_ID and DONATION_NETWORK_PASSPHRASE or ensure bindings include the passphrase."
    );
  }

  const clientOptions: Record<string, unknown> = {
    ...preferredNetwork,
    contractId,
    networkPassphrase,
    rpcUrl: cfg.sorobanRpcUrl,
    ...overrides,
  };

  if (typeof overrides.secretKey === "string" && !("signTransaction" in overrides)) {
    const signer = Keypair.fromSecret(overrides.secretKey);
    clientOptions.publicKey = overrides.publicKey ?? signer.publicKey();
    clientOptions.signTransaction = async (
      xdr: string | xdr.TransactionEnvelope,
      opts: { networkPassphrase: any }
    ) => {
      const tx = TransactionBuilder.fromXDR(
        xdr,
        opts?.networkPassphrase ?? (networkPassphrase as string)
      );
      tx.sign(signer);
      return {
        signedTxXdr: tx.toXDR(),
        signerAddress: signer.publicKey(),
      };
    };
  }

  const client = new mod.Client(clientOptions);
  Object.defineProperty(client, "__donationResolvedOptions", {
    value: clientOptions,
    enumerable: false,
    configurable: true,
    writable: false,
  });
  return client;
}
