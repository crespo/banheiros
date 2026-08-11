import { useState } from "react";
import { t } from "./i18n/i18n";
import { decomposeCategory } from "./lib/bathroomCategory";
import { COVERAGE_BOUNDS } from "./lib/mapCoverage";
import { supabase } from "./lib/supabase";

type Props = {
  onClose: () => void;
};

const CATEGORIES = ["public", "instore", "public_paid", "instore_paid"] as const;

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  const viewbox = `${COVERAGE_BOUNDS.minLng},${COVERAGE_BOUNDS.maxLat},${COVERAGE_BOUNDS.maxLng},${COVERAGE_BOUNDS.minLat}`;
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&viewbox=${viewbox}&bounded=0`);
  const results: { lat: string; lon: string }[] = await response.json();
  const first = results[0];
  return first ? { lat: parseFloat(first.lat), lon: parseFloat(first.lon) } : null;
}

export default function AddPinModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("public");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [geocodeError, setGeocodeError] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = name.trim().length > 2 && address.trim().length > 3;

  async function handleSubmit() {
    setGeocodeError(false);
    const point = await geocode(address);
    if (!point) {
      setGeocodeError(true);
      return;
    }
    const { kind, paid } = decomposeCategory(category);
    const { data } = await supabase.functions.invoke("moderate-submit", {
      body: { type: "pin", name, address, kind, paid, open_time: openTime, close_time: closeTime, lat: point.lat, lon: point.lon },
    });
    if (data?.verdict === "approved" || data?.verdict === "pending") setSent(true);
  }

  return (
    <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        {sent ? (
          <p className="success-banner">{t("addPin.successNote")}</p>
        ) : (
          <>
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
            <fieldset>
              <legend>{t("addPin.hoursLabel")}</legend>
              <input type="time" name="addpin-open" className="input" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
              <input type="time" name="addpin-close" className="input" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </fieldset>
            {geocodeError && <p>{t("addPin.geocodeError")}</p>}
            <button disabled={!valid} onClick={handleSubmit}>{t("addPin.submit")}</button>
          </>
        )}
      </div>
    </div>
  );
}
