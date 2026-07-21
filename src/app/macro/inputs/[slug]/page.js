import { notFound } from "next/navigation";
import BriefingReader from "../../../../components/BriefingReader";
import { BRIEFING_TYPES } from "../../../../lib/briefing-types";
import { getBriefingBySlug } from "../../../../lib/briefings";

export const dynamic = "force-dynamic";

const INPUT_TYPES = new Set([BRIEFING_TYPES.PODCAST, BRIEFING_TYPES.NEWSLETTER]);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const briefing = await getBriefingBySlug(slug);
  if (!briefing) return { title: "Not found — Macro Signal Room" };
  return { title: `${briefing.title} — Macro Signal Room` };
}

export default async function MacroInputPage({ params }) {
  const { slug } = await params;
  const briefing = await getBriefingBySlug(slug);

  if (!briefing || !INPUT_TYPES.has(briefing.type)) {
    notFound();
  }

  return <BriefingReader briefing={briefing} />;
}
