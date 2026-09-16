// Display caches never establish identity or substitute for database results.
const values = new Map<string, string>();
let generation = 0;
export const privateDataVersion = () => generation;
export function assertPrivateDataVersion(version: number) {
  if (version !== generation) throw new Error('Your account changed. Please retry the request.');
}
export const privateStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); },
  removeItem: (key: string) => { values.delete(key); },
};
export function clearPrivateData() {
  generation++;
  values.clear();
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('pxc_') && key !== 'pxc_customer_session_v2' && !key.startsWith('pxc_customer_session_v2-')) localStorage.removeItem(key);
    }
  } catch { /* Storage may be disabled. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('pxc-private-data-cleared'));
}
