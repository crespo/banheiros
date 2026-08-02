const pt: Record<string, string> = {
  "auth.welcomeTitle": "Bem-vindo ao Banheiros",
  "review.hideUsernameNote": "Padrão da sua conta: {{default}}. Você pode mudar isso em Perfil.",
};

export function t(key: string, vars?: Record<string, string>): string {
  let out = pt[key];
  if (vars) Object.keys(vars).forEach((k) => { out = out.replace(`{{${k}}}`, vars[k]); });
  return out;
}
