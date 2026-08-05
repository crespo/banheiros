export function validateUsernameFormat(username: string): string | null {
  if (username.length < 3 || username.length > 30) return "auth.usernameInvalidFormat";
  if (!/^[a-z0-9._]+$/.test(username)) return "auth.usernameInvalidFormat";
  return null;
}
