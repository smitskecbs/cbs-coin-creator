export function getWalletProvider(wallet: string) {

  if (wallet === 'phantom') {
    return window.phantom?.solana;
  }

  if (wallet === 'solflare') {
    return window.solflare;
  }

  if (wallet === 'backpack') {
    return window.backpack?.solana;
  }

  if (wallet === 'jupiter') {
    return window.jupiter?.solana;
  }

  return undefined;
}