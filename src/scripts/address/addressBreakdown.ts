
export async function extractCityFromAddress(address: string): Promise<string | null> {
  if (!address) return null;
  else if (address === 'null null null') return null;

  // Normalize the address string
  address = normalizeString(address);
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'the-match-diary/1.0 (diego99rojo@gmail.com)',
    },
  });

  if (!res.ok) return fallbackExtractCity(address);

  const data = await res.json();
  if (!data || data.length === 0) return fallbackExtractCity(address);

  const addressDetails = data[0].address;
  if (!addressDetails) return fallbackExtractCity(address);

  return (
    addressDetails.city ||
    addressDetails.town ||
    addressDetails.village ||
    addressDetails.hamlet ||
    addressDetails.county ||
    null
  );
}

export async function extractCityAndCountryFromAddress(address: string): Promise<{ city: string | null; country: string | null } | null> {
  // Normalize the address string
  address = normalizeString(address);
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'the-match-diary/1.0 (diego99rojo@gmail.com)',
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data || data.length === 0) return null;

  const addressDetails = data[0].address;
  if (!addressDetails) return null;

  return {
    city: addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.hamlet || addressDetails.county || null,
    country: addressDetails.country || null,
  }
}

export function fallbackExtractCity(address: string): string | null {
  if (!address) return null;
  else if (address === 'null null null') return null;

  // Normalize the address string
  address = normalizeString(address);
  
  // Try to extract the word before the postcode or number at the end
  const addressMatch = address.match(/([\w\s\-']+)\s+\d{4,6}$/) || address.match(/([\w\s\-']+)\s+[A-Z]{1,2}\d{1,2}\s*\d?[A-Z]{2}$/i);
  if (addressMatch) return addressMatch[1].trim().split(' ').slice(-1)[0];

  // Try comma-separated fallback
  const parts = address.split(',');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    if (lastPart.length > 2) {
      return lastPart.split(' ').slice(-1)[0];
    }
  }
  
  // Try to extract the last word
  const noNullAddress = address.replaceAll('null', '').trim();
  if(noNullAddress.split(' ').length === 1) {
    return noNullAddress;
  }
  
  return null;
}

function normalizeString(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
}