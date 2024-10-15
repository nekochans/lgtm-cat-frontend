import type { NextRequest } from 'next/server';
import { get } from '@vercel/edge-config';

export async function isBanCountry(req: NextRequest): Promise<boolean> {
  const bannedCountryCodeList = await get<string[]>('bannedCountryCodeList');
  if (bannedCountryCodeList) {
    const country = req.geo?.country?.toUpperCase();
    if (country != null) {
      return bannedCountryCodeList.includes(country);
    }
  }

  return false;
}
