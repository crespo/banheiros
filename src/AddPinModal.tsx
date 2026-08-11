import { useState } from "react";
import { t } from "./i18n/i18n";
import { decomposeCategory } from "./lib/bathroomCategory";
import { COVERAGE_BOUNDS } from "./lib/mapCoverage";
import { supabase } from "./lib/supabase";
import Icon from "./Icon";

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
  const [rejected, setRejected] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const valid = name.trim().length > 2 && address.trim().length > 3;

  async function handlePrefill() {
    const point = await geocode(address);
    if (!point) return;
    const { data } = await supabase.rpc("nearby_osm_bathroom", { in_lat: point.lat, in_lon: point.lon });
    const match = data?.[0];
    if (!match) return;
    if (name === "" && match.name) setName(match.name);
    if (openTime === "08:00" && closeTime === "18:00" && match.open_time && match.close_time) {
      setOpenTime(match.open_time.slice(0, 5));
      setCloseTime(match.close_time.slice(0, 5));
    }
  }

  async function handleSubmit() {
    setGeocodeError(false);
    setRejected(false);
    setSubmitError(false);
    const point = await geocode(address);
    if (!point) {
      setGeocodeError(true);
      return;
    }
    const { kind, paid } = decomposeCategory(category);
    const { data, error } = await supabase.functions.invoke("moderate-submit", {
      body: { type: "pin", name, address, kind, paid, open_time: openTime, close_time: closeTime, lat: point.lat, lon: point.lon },
    });
    if (error) {
      setSubmitError(true);
    } else if (data?.verdict === "approved" || data?.verdict === "pending") {
      setSent(true);
      setTimeout(onClose, 1800);
    } else if (data?.verdict === "rejected") {
      setRejected(true);
    }
  }

  return (
    <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        <button className="sheet-close" aria-label={t("common.close")} onClick={onClose}><Icon name="x" /></button>
        {sent ? (
          <p className="success-banner"><Icon name="check" />{t("addPin.successNote")}</p>
        ) : (
          <>
            <div className="field">
              <label htmlFor="addpin-name">{t("addPin.nameLabel")}</label>
              <input id="addpin-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <fieldset>
              <legend>{t("addPin.categoryLabel")}</legend>
              <div className="seg">
                {CATEGORIES.map((c) => (
                  <label key={c} className="seg-opt">
                    <input type="radio" name="addpin-category" checked={category === c} onChange={() => setCategory(c)} aria-label={t(`category.${c}`)} />
                    {t(`category.${c}`)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="addpin-address">{t("addPin.addressLabel")}</label>
              <input id="addpin-address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} onBlur={handlePrefill} />
            </div>
            <fieldset>
              <legend>{t("addPin.hoursLabel")}</legend>
              <input type="time" name="addpin-open" className="input" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
              <input type="time" name="addpin-close" className="input" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </fieldset>
            {geocodeError && <p className="field-note warn">{t("addPin.geocodeError")}</p>}
            {rejected && <p className="mod-warning"><Icon name="alertTriangle" />{t("review.moderationWarning")}</p>}
            {submitError && <p className="field-note warn">{t("addPin.submitError")}</p>}
            <div className="dialog-actions">
              <button className="btn btn-primary btn-block" disabled={!valid} onClick={handleSubmit}>{t("addPin.submit")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
