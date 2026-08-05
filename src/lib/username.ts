export function validateUsernameFormat(username: string): string | null {
  if (username.length < 3 || username.length > 30) return "auth.usernameInvalidFormat";
  return null;
}
