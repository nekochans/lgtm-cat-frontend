import { get } from '@vercel/edge-config';
import { type NextRequest } from 'next/server';

export const isBanCountry = async (req: NextRequest): Promise<boolean> => {
  const bannedCountryCodeList = await get<string[]>('bannedCountryCodeList');
  if (bannedCountryCodeList) {
    const country = req.geo?.country?.toUpperCase();
    if (country != null) {
      return bannedCountryCodeList.includes(country);
    }
  }

  return false;
};
