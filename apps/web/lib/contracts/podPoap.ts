import { Keypair, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getConfig } from "@/lib/config";

type PodPoapModule = typeof import("@stellar/stellar-sdk/contract");

let modulePromise: Promise<PodPoapModule & { Client: any; networks?: Record<string, any> }> | null =
  null;

function getBindingModuleId(): string {
  const moduleId =
    process.env.POD_POAP_BINDING || process.env.NEXT_PUBLIC_POD_POAP_BINDING || "pod_poap";

  // For bare module specifiers (like "pod_poap"), return as-is
  // Next.js will resolve it via the package.json dependency
  if (!moduleId.startsWith(".") && !moduleId.startsWith("/") && !moduleId.startsWith("file://")) {
    const isWindowsPath = /^[a-zA-Z]:\\/.test(moduleId);
    if (!isWindowsPath) {
      return moduleId;
    }
  }

  // For path-like specifiers, resolve them
  return resolveModuleSpecifier(moduleId);
}

function resolveModuleSpecifier(specifier: string): string {
  const isWindowsPath = /^[a-zA-Z]:\\/.test(specifier);
  const isPathLike = specifier.startsWith(".") || specifier.startsWith("/") || isWindowsPath;

  if (!isPathLike) {
    return specifier;
  }

  const absolutePath = path.isAbsolute(specifier)
    ? specifier
    : path.resolve(process.cwd(), specifier);

  let stats: fs.Stats;
  try {
    stats = fs.statSync(absolutePath);
  } catch (error) {
    throw new Error(
      `Unable to resolve POD POAP binding path "${specifier}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (stats.isDirectory()) {
    const packageJsonPath = path.join(absolutePath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        const entry = pkg?.exports?.["."]?.default ?? pkg?.module ?? pkg?.main;
        if (entry) {
          const entryPath = path.resolve(absolutePath, entry);
          if (fs.existsSync(entryPath)) {
            return pathToFileURL(entryPath).href;
          }
        }
      } catch (error) {
        throw new Error(
          `Failed to read binding package.json at "${packageJsonPath}": ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    const fallbackDist = path.join(absolutePath, "dist", "index.js");
    if (fs.existsSync(fallbackDist)) {
      return pathToFileURL(fallbackDist).href;
    }

    throw new Error(
      `Could not locate an entry file for POD POAP binding directory "${specifier}".`
    );
  }

  return pathToFileURL(absolutePath).href;
}

async function loadModule() {
  if (!modulePromise) {
    modulePromise = (async () => {
      const moduleId = getBindingModuleId();
      try {
        // Use dynamic import for both server and client
        // This works better with Next.js bundling than nodeRequire
        if (typeof window === "undefined") {
          // Server-side: use regular dynamic import
          return (await import(moduleId)) as PodPoapModule & {
            Client: any;
            networks?: Record<string, any>;
          };
        } else {
          // Client-side: use eval-based dynamic import
          // biome-ignore lint/security/noGlobalEval: Required for dynamic import in browser
          const dynamicImport: (s: string) => Promise<any> = (0, eval)("import");
          return (await dynamicImport(moduleId)) as Promise<
            PodPoapModule & { Client: any; networks?: Record<string, any> }
          >;
        }
      } catch (error) {
        // If module not found, provide a helpful error message
        console.error("Failed to load POD POAP module:", error);
        throw new Error(
          `Failed to load POD POAP binding module "${moduleId}". ` +
            `Make sure POD_POAP_BINDING is set correctly and the package is installed. ` +
            `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })();
  }
  return modulePromise;
}

function isBareModuleSpecifier(specifier: string): boolean {
  return (
    !specifier.startsWith("file://") &&
    !specifier.startsWith("./") &&
    !specifier.startsWith("../") &&
    !path.isAbsolute(specifier)
  );
}

type ClientOptions = {
  networkPassphrase?: string;
  contractId?: string;
  rpcUrl?: string;
  secretKey?: string;
  publicKey?: string;
  [key: string]: unknown;
};

export async function createPodPoapClient(overrides: ClientOptions = {}) {
  const mod = await loadModule();
  if (typeof mod.Client !== "function") {
    throw new Error("POD POAP binding is missing a Client export.");
  }
  const cfg = getConfig();
  const networks = mod.networks ?? {};
  const preferredNetwork =
    networks[cfg.stellarNetwork as keyof typeof networks] ?? networks.testnet ?? {};

  const contractId = process.env.POD_POAP_CONTRACT_ID ?? preferredNetwork?.contractId;
  if (!contractId) {
    throw new Error(
      "Contract ID not found. Set POD_POAP_CONTRACT_ID or ensure the bindings include networks.testnet.contractId."
    );
  }

  const networkPassphrase =
    overrides.networkPassphrase ??
    preferredNetwork?.networkPassphrase ??
    (cfg.stellarNetwork === "testnet" ? "Test SDF Network ; September 2015" : undefined);

  if (!networkPassphrase) {
    throw new Error(
      "Network passphrase not configured. Set POD_POAP_CONTRACT_ID and POD_POAP_NETWORK_PASSPHRASE or ensure bindings include the passphrase."
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
      xdrInput: string | xdr.TransactionEnvelope,
      opts?: { networkPassphrase?: string }
    ) => {
      // Convert to string if it's an envelope, otherwise use as-is
      const xdrString = typeof xdrInput === "string" ? xdrInput : xdrInput.toXDR("base64");

      // Use TransactionBuilder.fromXDR which handles both classic and Soroban transactions
      const tx = TransactionBuilder.fromXDR(
        xdrString,
        opts?.networkPassphrase ?? networkPassphrase
      );
      tx.sign(signer);

      return {
        signedTxXdr: tx.toXDR(),
        signerAddress: signer.publicKey(),
      };
    };
  }

  const client = new mod.Client(clientOptions);
  Object.defineProperty(client, "__podPoapResolvedOptions", {
    value: clientOptions,
    enumerable: false,
    configurable: true,
    writable: false,
  });
  return client;
}

export function getPodPoapAdminKeypair() {
  const secret = process.env.POD_POAP_ADMIN_SECRET;
  if (!secret) {
    throw new Error(
      "POD_POAP_ADMIN_SECRET is not set. Deploying or minting requires the contract owner secret key."
    );
  }
  const keypair = Keypair.fromSecret(secret);
  return { secret, keypair, publicKey: keypair.publicKey() };
}
