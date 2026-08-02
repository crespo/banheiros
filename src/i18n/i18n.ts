const LANGS = ["pt", "en"] as const;
export type Lang = (typeof LANGS)[number];

const pt: Record<string, string> = {
  "auth.welcomeTitle": "Bem-vindo ao Banheiros",
  "review.hideUsernameNote": "Padrão da sua conta: {{default}}. Você pode mudar isso em Perfil.",
};

const en: Record<string, string> = {
  "auth.welcomeTitle": "Welcome to Banheiros",
};

const dicts = { pt, en };

const isLang = (value: string): value is Lang => (LANGS as readonly string[]).includes(value);

let currentLang: Lang = "pt";
const stored = localStorage.getItem("banheiros_lang");
if (stored !== null && isLang(stored)) currentLang = stored;

export function setLanguage(lang: Lang): void {
  currentLang = lang;
  localStorage.setItem("banheiros_lang", lang);
}

export function t(key: string, vars?: Record<string, string>): string {
  let out = dicts[currentLang][key];
  if (vars) Object.keys(vars).forEach((k) => { out = out.replace(`{{${k}}}`, vars[k]); });
  return out;
}
