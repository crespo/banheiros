import { useState } from "react";
import { t } from "./i18n/i18n";

type Props = {
  onClose: () => void;
};

const CATEGORIES = ["public", "instore", "public_paid", "instore_paid"] as const;

export default function AddPinModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("public");

  return (
    <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        <label htmlFor="addpin-name">{t("addPin.nameLabel")}</label>
        <input id="addpin-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <fieldset>
          <legend>{t("addPin.categoryLabel")}</legend>
          {CATEGORIES.map((c) => (
            <label key={c}>
              <input type="radio" name="addpin-category" checked={category === c} onChange={() => setCategory(c)} aria-label={t(`category.${c}`)} />
              {t(`category.${c}`)}
            </label>
          ))}
        </fieldset>
        <label htmlFor="addpin-address">{t("addPin.addressLabel")}</label>
        <input id="addpin-address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
    </div>
  );
}
