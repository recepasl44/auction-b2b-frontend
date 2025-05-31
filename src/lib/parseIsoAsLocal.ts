export const parseIsoAsLocal = (iso: string): number => {
  // sonundaki ‘Z’  ya da ‘+03:00’  kısmını at
  const localIso = iso.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
  return Date.parse(localIso);          // yerel epoch (ms)
};