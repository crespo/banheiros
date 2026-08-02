export type Lang = "pt" | "en";

const pt: Record<string, string> = {
  "auth.welcomeTitle": "Bem-vindo ao Banheiros",
  "review.hideUsernameNote": "Padrão da sua conta: {{default}}. Você pode mudar isso em Perfil.",
};

const en: Record<string, string> = {
  "auth.welcomeTitle": "Welcome to Banheiros",
};

const dicts = { pt, en };

let currentLang: Lang = "pt";

export function setLanguage(lang: Lang): void {
  currentLang = lang;
}

export function t(key: string, vars?: Record<string, string>): string {
  let out = dicts[currentLang][key];
  if (vars) Object.keys(vars).forEach((k) => { out = out.replace(`{{${k}}}`, vars[k]); });
  return out;
}
