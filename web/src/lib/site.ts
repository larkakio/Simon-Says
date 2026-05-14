/** Production URL (Vercel). Used as fallback when env is unset — set NEXT_PUBLIC_* on Vercel anyway. */
export const productionSiteUrl =
  'https://simon-says-plum-zeta.vercel.app' as const;

/** From Base developer dashboard — meta base:app_id verification. */
export const productionBaseAppId = '6a0571cc8f636ba200aa022d' as const;

/** Base App store / OG — max 180 chars on dashboard. */
export const productionAppDescription =
  'Cyberpunk Simon Says for the Base App. Full-field swipes, synthetic audio cues, streak-friendly daily check-in on Base mainnet, and ERC-8021 Builder Code tagging when you check in.' as const;
