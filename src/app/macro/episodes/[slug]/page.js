import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Redirect — ${slug}` };
}

export default async function LegacyEpisodePage({ params }) {
  const { slug } = await params;
  redirect(`/macro/inputs/${slug}`);
}
