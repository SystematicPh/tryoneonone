export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@kuyaron-store.local`;
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/\s+/g, "");
}
