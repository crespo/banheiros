import { useState } from "react";
import { t } from "./i18n/i18n";

type Props = {
  onClose: () => void;
};

export default function AddPinModal({ onClose }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        <label htmlFor="addpin-name">{t("addPin.nameLabel")}</label>
        <input id="addpin-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </div>
  );
}
