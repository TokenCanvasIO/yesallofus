// lib/web3auth.ts
// Web3Auth must be imported dynamically due to SSR issues
// See: https://web3auth.io/docs/troubleshooting/different-methods#nextjs

export const WEB3AUTH_CLIENT_ID = "BJammoKWeysr0S4Nk7J0WxyYHnfFw1Jscfgwx3iuvwI4GEMJCCz1iQ_wtbd40MDLrcf_xaXbi7AVif0MCv19Fk4";

export async function getWeb3Auth() {
  if (typeof window === 'undefined') return null;
  
  const { Web3Auth } = await import("@web3auth/modal");
  const { XrplPrivateKeyProvider } = await import("@web3auth/xrpl-provider");
  const { WEB3AUTH_NETWORK } = await import("@web3auth/base");
  
  const chainConfig = {
    chainNamespace: "xrpl" as const,
    chainId: "0x1",
    rpcTarget: "wss://xrplcluster.com",
    wsTarget: "wss://xrplcluster.com",
    ticker: "XRP",
    tickerName: "XRPL",
    displayName: "XRPL Mainnet",
    blockExplorerUrl: "https://livenet.xrpl.org",
  };

  const privateKeyProvider = new XrplPrivateKeyProvider({
    config: { chainConfig }
  });

  const web3auth = new Web3Auth({
    clientId: WEB3AUTH_CLIENT_ID,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider: privateKeyProvider as any,
  });

  await web3auth.init();
  return web3auth;
}

export async function loginWithWeb3Auth(): Promise<string | null> {
  try {
    const web3auth = await getWeb3Auth();
    if (!web3auth) return null;
    
    const provider = await web3auth.connect();
    if (!provider) return null;
    
    const accounts = await provider.request({ method: "xrpl_getAccounts" }) as string[];
    return accounts?.[0] || null;
  } catch (error) {
    console.error("Web3Auth login error:", error);
    return null;
  }
}

export async function logoutWeb3Auth() {
  const web3auth = await getWeb3Auth();
  if (web3auth?.connected) {
    await web3auth.logout();
  }
}