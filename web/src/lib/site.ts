/** Production URL (Vercel). Used as fallback when env is unset — set NEXT_PUBLIC_* on Vercel anyway. */
export const productionSiteUrl =
  'https://simon-says-plum-zeta.vercel.app' as const;

/** From Base developer dashboard — meta base:app_id verification. */
export const productionBaseAppId = '6a0571cc8f636ba200aa022d' as const;
