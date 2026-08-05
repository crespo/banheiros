export function validateUsernameFormat(username: string): string | null {
  if (username.length < 3) return "auth.usernameInvalidFormat";
  return null;
}
