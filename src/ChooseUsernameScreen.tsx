import { t } from "./i18n/i18n";

export default function ChooseUsernameScreen({ onCreated }: { onCreated: () => void }) {
  void onCreated;
  return (
    <div>
      <label htmlFor="username">{t("auth.usernameLabel")}</label>
      <input id="username" type="text" />
    </div>
  );
}
