import { NextRequest } from 'next/server';

const bannedCountryCodeList = [
  'BE',
  'BG',
  'CZ',
  'DK',
  'DD',
  'DE',
  'EE',
  'GB',
  'IE',
  'GR',
  'ES',
  'FR',
  'FX',
  'GF',
  'HR',
  'IT',
  'CY',
  'LV',
  'LT',
  'LU',
  'HU',
  'MT',
  'NL',
  'AT',
  'PL',
  'PT',
  'RO',
  'SI',
  'SK',
  'FI',
  'SE',
];

export const isBanCountry = (req: NextRequest): boolean => {
  const country = req.geo?.country?.toUpperCase();
  if (country != null) {
    return bannedCountryCodeList.includes(country);
  }

  return false;
};
