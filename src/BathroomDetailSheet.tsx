import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { bathroomDisplayName } from "./lib/bathroomName";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { t } from "./i18n/i18n";

type Bathroom = { name: string | null; address: string; kind: string; paid: boolean };

export default function BathroomDetailSheet({ bathroomId }: { bathroomId: string }) {
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  useEffect(() => {
    supabase.from("bathrooms").select().eq("id", bathroomId).single().then(({ data }: { data: Bathroom | null }) => setBathroom(data));
  }, [bathroomId]);
  if (!bathroom) return null;
  return (
    <>
      <span>{bathroomDisplayName(bathroom.name, t("bathroom.unnamed"))}</span>
      <span>{bathroom.address}</span>
      <span>{t(`category.${categorizeBathroom(bathroom.kind, bathroom.paid).id}`)}</span>
      <span>{bathroom.paid ? t("common.paid") : t("common.free")}</span>
    </>
  );
}
