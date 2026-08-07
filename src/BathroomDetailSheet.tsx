import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Bathroom = { address: string };

export default function BathroomDetailSheet({ bathroomId }: { bathroomId: string }) {
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  useEffect(() => {
    supabase.from("bathrooms").select().eq("id", bathroomId).single().then(({ data }: { data: Bathroom | null }) => setBathroom(data));
  }, [bathroomId]);
  if (!bathroom) return null;
  return <>{bathroom.address}</>;
}
