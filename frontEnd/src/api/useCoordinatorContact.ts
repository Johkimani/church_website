import { useEffect, useState } from 'react';
import { BASE_URL } from './config';

export interface CoordinatorContact {
  name: string | null;
  phone: string;
}

/** E.164 normaliser for Kenyan phone numbers.
 *  Handles: 07xx (10 digits), +254xx, 7xx (9 digits) → 254xxxxxxxxx */
export const toWaPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) digits = '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  return digits;
};

/**
 * Fetches the current active Jumuiya Coordinator contact from the public API.
 *
 * Returns:
 *  - `undefined`  while loading (use to suppress rendering)
 *  - `null`       when no coordinator is found (hide the contact line)
 *  - `{ name, phone, waLink }` when a coordinator is found
 */
export const useCoordinatorContact = () => {
  const [coordinator, setCoordinator] = useState<
    (CoordinatorContact & { waLink: string }) | null | undefined
  >(undefined);

  useEffect(() => {
    fetch(`${BASE_URL}/officials/coordinator`)
      .then(r => r.json())
      .then(data => {
        const c = data?.coordinator;
        if (!c?.phone) {
          setCoordinator(null);
          return;
        }
        setCoordinator({
          name: c.name ?? null,
          phone: c.phone,
          waLink: `https://wa.me/${toWaPhone(c.phone)}`,
        });
      })
      .catch(() => setCoordinator(null));
  }, []);

  return coordinator;
};
