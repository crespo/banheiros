const pt: Record<string, string> = {
  "auth.welcomeTitle": "Bem-vindo ao Banheiros",
};

export function t(key: string): string {
  return pt[key];
}
